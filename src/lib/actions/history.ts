'use server';

import { auth } from "@/auth";
import connectToDB from "../db";
import TopUpRequest from "@/models/TopUpRequest";

const ITEMS_PER_PAGE = 10; // Số lượng item mỗi lần tải

/**
 * Lấy danh sách lịch sử nạp tiền có phân trang.
 * @param page - Số trang cần lấy, bắt đầu từ 1.
 */
export async function getTopUpHistory({ page = 1 }: { page: number } = { page: 1 }) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return []; 

    await connectToDB();

    // Tính toán số lượng bản ghi cần bỏ qua (skip)
    const skipAmount = (page - 1) * ITEMS_PER_PAGE;

    const history = await TopUpRequest.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skipAmount) // Bỏ qua các trang trước
      .limit(ITEMS_PER_PAGE) // Giới hạn số lượng
      .lean();

    return JSON.parse(JSON.stringify(history));

  } catch (error) {
    console.error("Lỗi khi lấy lịch sử nạp tiền:", error);
    return [];
  }
}

/**
 * Lấy thông tin chi tiết của một yêu cầu nạp tiền bằng ID.
 * Đảm bảo yêu cầu này thuộc về người dùng đang đăng nhập.
 */
export async function getTopUpRequestById(requestId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return null;

    await connectToDB();

    const request = await TopUpRequest.findOne({ 
      _id: requestId, 
      userId: userId // Điều kiện bảo mật quan trọng
    }).lean();

    return JSON.parse(JSON.stringify(request));

  } catch (error) {
    console.error("Lỗi khi lấy chi tiết yêu cầu nạp tiền:", error);
    return null;
  }
}
