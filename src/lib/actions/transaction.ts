'use server';

import { auth } from "@/auth";
import connectToDB from "../db";
import Transaction from "@/models/Transaction";
import TopUpRequest from "@/models/TopUpRequest"; 
import PromoCode from "@/models/PromoCode"; 
import Wallet from "@/models/Wallet";

/**
 * Lấy thông tin chi tiết của một giao dịch bằng ID.
 * Đảm bảo giao dịch thuộc về người dùng đang đăng nhập.
 */
export async function getTransactionDetails(transactionId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) throw new Error("Unauthorized");

    await connectToDB();

    // Tìm ví của người dùng để xác thực quyền sở hữu
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found");

    const transaction = await Transaction.findOne({
        _id: transactionId,
        walletId: wallet._id // Đảm bảo giao dịch này thuộc ví của user
    })
    .populate({
        path: 'metadata.topUpRequestId',
        model: TopUpRequest,
        populate: { // Populate lấy thông tin mã KM
            path: 'promoCodeId',
            model: PromoCode
        }
    })
    .lean();

    return JSON.parse(JSON.stringify(transaction));

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết giao dịch:", error);
    return null;
  }
}
