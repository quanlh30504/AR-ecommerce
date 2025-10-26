import { NextResponse } from "next/server";
import { headers } from "next/headers";
import mongoose from "mongoose";
import crypto from "crypto";
import { createAndPublishNotification } from "@/lib/ably";

import connectToDB from "@/lib/db";
import TopUpRequest from "@/models/TopUpRequest";
import Wallet from "@/models/Wallet";
import Transaction from "@/models/Transaction";
import PromoCode from "@/models/PromoCode";
import PromoCodeUsage from "@/models/PromoCodeUsage";
import { extractRequestCode, formatCurrency } from "@/lib/utils";
import { NotificationEntity } from "@/models/Notification";

// disable body parser mặc định của Next.js -> đảm bảo tính toàn vẹn của body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Hàm tiện ích để đọc request body dưới dạng buffer thô
async function buffer(readable: ReadableStream<unknown> | null) {
  if (!readable) return Buffer.alloc(0);
  const reader = readable.getReader();
  const chunks: Buffer[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      // Nếu value là Uint8Array (thường là trường hợp stream binary), truyền trực tiếp
      if (value instanceof Uint8Array) {
        chunks.push(Buffer.from(value));
      } else if (Array.isArray(value)) {
        chunks.push(Buffer.from(Uint8Array.from(value)));
      } else {
        // fallback: bỏ qua chunk không hợp lệ
        // hoặc có thể throw error nếu muốn strict
      }
    }
  }
  return Buffer.concat(chunks);
}

/**
 * Hàm tiện ích để sắp xếp các key của một object theo alphabet (đệ quy).
 */
function sortObjectKeys(data: unknown): unknown {
  if (typeof data !== "object" || data === null) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sortObjectKeys);
  }
  const sortedObj: Record<string, unknown> = {};
  Object.keys(data as Record<string, unknown>)
    .sort()
    .forEach((key) => {
      sortedObj[key] = sortObjectKeys((data as Record<string, unknown>)[key]);
    });
  return sortedObj;
}

async function verifyCassoWebhook(req: Request): Promise<unknown | null> {
  const webhookSecret = process.env.CASSO_SECURE_TOKEN;
  if (!webhookSecret) {
    console.error("CASSO_SECURE_TOKEN is not set.");
    return null;
  }

  try {
    const cassoSignatureHeader = (await headers()).get("x-casso-signature");
    if (!cassoSignatureHeader) {
      console.error("Missing X-Casso-Signature header.");
      return null;
    }

    const bodyText = (await buffer(req.body)).toString("utf-8");
    const payload = JSON.parse(bodyText);

    const timestampMatch = cassoSignatureHeader.match(/t=([0-9]+)/);
    const signatureFromHeader =
      cassoSignatureHeader.match(/v1=([a-f0-9]+)/)?.[1];

    if (!timestampMatch || !signatureFromHeader) {
      console.error("Invalid signature header format.");
      return null;
    }
    const timestamp = timestampMatch[1];

    // 1. Sắp xếp lại các key của payload
    const sortedPayload = sortObjectKeys(payload);

    // 2. Tạo chuỗi để ký từ timestamp và payload đã được sắp xếp và stringify
    const signedPayload = `${timestamp}.${JSON.stringify(sortedPayload)}`;

    // 3. Tạo chữ ký dự kiến bằng sha512
    const expectedSignature = crypto
      .createHmac("sha512", webhookSecret)
      .update(signedPayload)
      .digest("hex");

    // 4. So sánh chữ ký
    const isVerified = crypto.timingSafeEqual(
      Buffer.from(signatureFromHeader),
      Buffer.from(expectedSignature)
    );

    if (!isVerified) {
      console.error("Webhook signature verification failed.");
      return null;
    }

    return payload; // Trả về payload gốc (chưa sắp xếp)
  } catch (error) {
    console.error("Error verifying Casso webhook:", error);
    return null;
  }
}

// --- WEBHOOK ---
export async function POST(req: Request) {
  // Bước 1: Xác thực Webhook
  const payloadRaw = await verifyCassoWebhook(req.clone());
  if (!payloadRaw || typeof payloadRaw !== 'object' || payloadRaw === null) {
    return NextResponse.json(
      { message: "Webhook verification failed" },
      { status: 403 }
    );
  }
  // Ép kiểu payload để truy cập thuộc tính
  const payload = payloadRaw as { error: number; data?: Record<string, unknown> };
  // Bước 2: Xử lý Payload
  if (payload.error !== 0) {
    console.warn(
      `[CASSO_WEBHOOK] Received a payload with error: ${payload.error}. Ignoring.`
    );
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }
  const transactionData = payload.data as Record<string, unknown> | undefined;
  if (
    !transactionData ||
    typeof transactionData !== "object" ||
    Array.isArray(transactionData)
  ) {
    console.warn(
      "[CASSO_WEBHOOK] Valid webhook but transaction data is missing or invalid."
    );
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }
  const rawDescription = typeof transactionData?.description === 'string' ? transactionData.description : '';
  const requestCode = extractRequestCode(rawDescription);
  const amountReceived = typeof transactionData?.amount === 'number' ? transactionData.amount : 0;
  const bankTransactionId = (typeof transactionData?.tid === 'string' ? transactionData.tid : undefined)
    || (typeof transactionData?.reference === 'string' ? transactionData.reference : undefined);
  const transactionDateTime =
    typeof transactionData?.transactionDate === 'string'
      ? transactionData.transactionDate
      : new Date().toISOString();

  // Nếu không có requestCode thì không liên quan đến nạp tiền, bỏ qua
  if (!requestCode) {
    return NextResponse.json({ message: "OK" }, { status: 200 });
  }

  // --- BƯỚC 3: XỬ LÝ GIAO DỊCH TRONG DATABASE ---
  const session = await mongoose.startSession();

  try {
    await connectToDB();
    let processingResult = "Skipped";

    // Sử dụng Giao dịch (Transaction) của Mongoose để đảm bảo toàn vẹn dữ liệu
    await session.withTransaction(async () => {
      const topUpRequest = await TopUpRequest.findOne({
        requestCode: requestCode,
        status: "PENDING",
      }).session(session);

      // Chỉ xử lý nếu tìm thấy yêu cầu đang chờ và số tiền khớp
      if (!topUpRequest) {
        return;
      }

      const user = topUpRequest.userId as any;
      if (topUpRequest.amount.base !== amountReceived) {
        console.warn(`- Amount mismatch for ${requestCode}.`);
        topUpRequest.status = "FAILED"; // Cập nhật trạng thái thất bại
        if (topUpRequest.payment)
          topUpRequest.payment.bankTransactionId = bankTransactionId;
        await topUpRequest.save({ session });

        // 1. Thông báo cho người dùng
        await createAndPublishNotification({
          recipient: user._id.toString(),
          channel: "user",
          event: "topup.failed",
          // Actor là hệ thống vì đây là lỗi do hệ thống phát hiện
          actor: { id: user._id.toString(), model: NotificationEntity.User }, // Hoặc tạo một actor "System" riêng
          // Entity vẫn là yêu cầu nạp tiền này
          entity: {
            id: topUpRequest._id.toString(),
            model: NotificationEntity.Transaction,
          },
          data: {
            amountSent: amountReceived,
            amountExpected: topUpRequest.amount.base,
            requestCode: requestCode,
          },
          message: `Nạp tiền thất bại: Số tiền bạn chuyển (${formatCurrency(
            amountReceived
          )}) không khớp với yêu cầu.`,
          link: `/mandala-pay/history/${topUpRequest._id}`, // Dẫn đến trang chi tiết để họ xem lại
        });
        return; // Dừng xử lý cho giao dịch này
      }

      // 1. CỘNG TIỀN VÀO VÍ
      const updatedWallet = await Wallet.findOneAndUpdate(
        { userId: topUpRequest.userId },
        { $inc: { balance: topUpRequest.amount.total } },
        { new: true, session }
      );

      if (!updatedWallet)
        throw new Error(`Wallet not found for userId: ${topUpRequest.userId}`);

      // 2. TẠO LỊCH SỬ GIAO DỊCH
      const newTransactions = await Transaction.create(
        [
          {
            walletId: updatedWallet._id,
            amount: topUpRequest.amount.total,
            balanceBefore: updatedWallet.balance - topUpRequest.amount.total,
            balanceAfter: updatedWallet.balance,
            type: "TOPUP",
            status: "COMPLETED",
            description: `Nạp tiền qua VietQR. Mã: ${requestCode}`,
            metadata: { topUpRequestId: topUpRequest._id, bankTransactionId },
            transactionTimestamp: new Date(transactionDateTime),
          },
        ],
        { session }
      );

      const newTransaction = newTransactions[0];

      // 3. CẬP NHẬT TRẠNG THÁI YÊU CẦU NẠP TIỀN
      topUpRequest.status = "COMPLETED";
      if (topUpRequest.payment) {
        topUpRequest.payment.bankTransactionId = bankTransactionId;
      }
      topUpRequest.transactionId = newTransaction._id;
      await topUpRequest.save({ session });

      // 4. GHI NHẬN VIỆC DÙNG MÃ KHUYẾN MÃI (NẾU CÓ)
      if (topUpRequest.promoCodeId) {
        await PromoCodeUsage.create(
          [
            {
              userId: topUpRequest.userId,
              promoCodeId: topUpRequest.promoCodeId,
              topUpRequestId: topUpRequest._id,
            },
          ],
          { session }
        );

        await PromoCode.updateOne(
          { _id: topUpRequest.promoCodeId },
          { $inc: { usageCount: 1 } },
          { session }
        );
      }
      processingResult = "Success";
      if (processingResult === "Success") {
        const user = topUpRequest.userId as any;

        await createAndPublishNotification({
          recipient: user._id.toString(),
          channel: "user",
          event: "topup.success",
          actor: { id: user._id.toString(), model: NotificationEntity.User },
          entity: {
            id: newTransaction._id.toString(),
            model: NotificationEntity.Transaction,
          },
          data: {
            amount: topUpRequest.amount.total,
            newBalance: updatedWallet.balance,
            bankTimestamp: transactionDateTime,
          },
          message: `Bạn đã nạp thành công ${formatCurrency(
            topUpRequest.amount.total
          )}.`,
          link: `/mandala-pay/transactions/${newTransaction._id}`,
        });
      }
    });
  } catch (error) {
    console.error(`- Error processing transaction for ${requestCode}:`, error);
    // Không cần trả về lỗi 500 vì lỗi của 1 giao dịch không nên làm cả webhook thất bại
  } finally {
    await session.endSession();
  }

  // Luôn trả về 200 để báo cho Casso là đã nhận được, tránh gửi lại
  return NextResponse.json({ message: "Webhook processed." }, { status: 200 });
}
