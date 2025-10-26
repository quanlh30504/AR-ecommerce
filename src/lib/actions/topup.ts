"use server";

import { auth } from "@/auth";
import connectToDB from "../db";
import User from "@/models/User";
import TopUpRequest from "@/models/TopUpRequest";
import PromoCode from "@/models/PromoCode";
import PromoCodeUsage from "@/models/PromoCodeUsage";

/**
 * Gọi đến API của VietQR bằng POST request để tạo mã QR.
 * @param amount - Số tiền cần nạp
 * @param requestCode - Mã định danh duy nhất cho giao dịch
 * @returns Một object chứa URL dữ liệu Base64 của ảnh QR.
 */
async function generateVietQR(amount: number, requestCode: string) {
  const endpoint =
    process.env.VIETQR_ENPOINT || "https://api.vietqr.io/v2/generate";

  if (!endpoint) {
    throw new Error(
      "VietQR endpoint is not configured in environment variables."
    );
  }

  // 1. Chuẩn bị dữ liệu để gửi đi trong body của POST request
  const requestBody = {
    accountNo: process.env.VIETQR_ACCOUNT_NO,
    accountName: process.env.VIETQR_ACCOUNT_NAME,
    acqId: process.env.VIETQR_BANK_ID,
    amount: amount,
    addInfo: requestCode,
    template: "compact",
  };

  if (
    !requestBody.accountNo ||
    !requestBody.accountName ||
    !requestBody.acqId
  ) {
    throw new Error("Thông tin tài khoản VietQR chưa được cấu hình trong .env");
  }

  try {
    // 2. Thực hiện POST request bằng fetch từ server
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Ghi lại lỗi chi tiết từ API
      const errorBody = await response.text();
      console.error("VietQR API Error:", errorBody);
      throw new Error(`VietQR API responded with status: ${response.status}`);
    }

    const responseData = await response.json();

    // 3. Kiểm tra response và lấy ra URL ảnh QR (dạng Base64 Data URL)
    if (responseData?.data?.qrDataURL) {
      return { qrImageUrl: responseData.data.qrDataURL };
    } else {
      throw new Error("Invalid response structure from VietQR API.");
    }
  } catch (error) {
    console.error("Failed to call VietQR API:", error);
    throw error;
  }
}

// --- Type Definition cho State ---
type InitialQrState =
  | {
    success?: boolean;
    message?: string;
    data?: {
      qrImageUrl: string;
      amount: number;
      requestCode: string;
      expiresAt: Date;
      bonusAmount: number;
    };
  }
  | undefined;

// --- Server Action chính ---
export async function initiateQrTopUp(
  prevState: InitialQrState,
  formData: FormData
): Promise<InitialQrState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { success: false, message: "Lỗi xác thực người dùng." };

  const amountString = formData.get("amount") as string;
  const promoCodeInput = formData.get("promoCode") as string | null;
  const baseAmount = parseInt(amountString, 10);

  if (isNaN(baseAmount) || baseAmount < 2000 || baseAmount > 50000000) {
    return {
      success: false,
      message: "Số tiền nạp phải từ 2.000đ đến 50.000.000đ.",
    };
  }

  try {
    await connectToDB();
    const user = await User.findById(userId);
    if (!user) return { success: false, message: "Không tìm thấy người dùng." };

    let bonusAmount = 0;
    let promoCodeId: string | undefined = undefined;

    // --- Logic xử lý Mã khuyến mãi ---
    if (promoCodeInput && promoCodeInput.trim() !== "") {
      const promo = await PromoCode.findOne({
        code: promoCodeInput.toUpperCase().trim(),
        isActive: true,
      });

      if (!promo)
        return { success: false, message: "Mã khuyến mãi không hợp lệ." };
      if (promo.expiresAt < new Date())
        return { success: false, message: "Mã khuyến mãi đã hết hạn." };
      if (promo.usageCount >= promo.usageLimit)
        return {
          success: false,
          message: "Mã khuyến mãi đã hết lượt sử dụng.",
        };
      if (baseAmount < promo.minTopUpAmount)
        return {
          success: false,
          message: `Cần nạp tối thiểu ${promo.minTopUpAmount.toLocaleString(
            "vi-VN"
          )}đ để dùng mã này.`,
        };

      const existingUsage = await PromoCodeUsage.findOne({
        userId: user._id,
        promoCodeId: promo._id,
      });
      if (existingUsage)
        return {
          success: false,
          message: "Bạn đã sử dụng mã khuyến mãi này rồi.",
        };

      promoCodeId = promo._id;
      if (promo.discountType === "PERCENTAGE") {
        let discount = (baseAmount * promo.discountValue) / 100;
        if (promo.maxDiscountAmount && discount > promo.maxDiscountAmount) {
          discount = promo.maxDiscountAmount;
        }
        bonusAmount = Math.round(discount);
      } else {
        bonusAmount = promo.discountValue;
      }
    }

    const totalAmount = baseAmount + bonusAmount;
    const requestCode = `MDLPAY${Date.now().toString().slice(-6)}${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const { qrImageUrl } = await generateVietQR(baseAmount, requestCode);

    // --- Cập nhật logic tạo bản ghi theo Schema mới nhất ---
    await TopUpRequest.create({
      userId: user._id,
      status: "PENDING",
      requestCode,
      expiresAt,
      promoCodeId: promoCodeId,

      // Sub-document 'amount'
      amount: {
        base: baseAmount,
        bonus: bonusAmount,
        total: totalAmount,
        currency: "VND",
      },

      // Sub-document 'payment'
      payment: {
        method: "VIETQR",
        provider: "vietqr_api", // Tên nhà cung cấp ví dụ
        qrImageUrl: qrImageUrl,
        // qrContent có thể được lưu ở đây nếu API trả về
      },
    });

    return {
      success: true,
      data: {
        qrImageUrl,
        amount: baseAmount,
        requestCode,
        expiresAt,
        bonusAmount,
      },
    };
  } catch (error: unknown) {
    console.error("Lỗi khi tạo yêu cầu nạp tiền:", error);
    if (error instanceof Error && typeof (error as { name?: unknown }).name === 'string' && (error as { name: string }).name === "ValidationError") {
      return { success: false, message: error.message };
    }
    return { success: false, message: "Lỗi hệ thống, không thể tạo mã QR." };
  }
}
