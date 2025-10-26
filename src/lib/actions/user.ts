"use server";

import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import User from "@/models/User";
import Wallet from "@/models/Wallet";
import { revalidatePath } from "next/cache";

type ProfileUpdateState =
  | {
    success?: boolean;
    message: string;
  }
  | undefined;

/**
 * Cập nhật thông tin cá nhân của người dùng đang đăng nhập.
 * @param prevState - Trạng thái trước đó từ useFormState.
 * @param formData - Dữ liệu được gửi từ form.
 * @returns Một object chứa trạng thái thành công/thất bại và thông báo.
 */
export async function updateProfile(
  prevState: ProfileUpdateState,
  formData: FormData
): Promise<ProfileUpdateState> {
  const session = await auth();

  if (!session?.user?.id) {
    return { message: "Bạn phải đăng nhập để thực hiện hành động này." };
  }

  const fullName = formData.get("fullName") as string;
  const nickname = formData.get("nickname") as string;
  const gender = formData.get("gender") as string;
  const country = formData.get("country") as string;
  const birthDateString = formData.get("birthDate") as string;

  if (!fullName || fullName.trim().length < 3) {
    return { message: "Họ và tên phải có ít nhất 3 ký tự." };
  }

  const updateData: Record<string, string | Date> = {
    name: fullName,
  };

  if (nickname) updateData.nickname = nickname;
  if (gender) updateData.gender = gender;
  if (country) updateData.country = country;

  if (birthDateString) {
    const date = new Date(birthDateString);
    if (!isNaN(date.getTime())) {
      updateData.birthDate = date;
    }
  }

  try {
    await connectToDB();

    await User.findByIdAndUpdate(session.user.id, updateData);

    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Cập nhật thông tin thành công!",
    };
  } catch (error: unknown) {
    console.error("Lỗi cập nhật profile:", error);
    if (error instanceof Error && typeof (error as { name?: unknown }).name === 'string' && (error as { name: string }).name === "CastError") {
      return { message: `Lỗi định dạng dữ liệu: ${error.message}` };
    }
    return { message: "Đã có lỗi xảy ra phía máy chủ." };
  }
}

// Định nghĩa kiểu dữ liệu trả về cho Header
export interface UserHeaderData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  wallet?: {
    balance: number;
  };
}

/**
 * Lấy thông tin người dùng VÀ ví để hiển thị trên Header.
 */
export async function getUserForHeader(): Promise<UserHeaderData | null> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return null;
    }

    await connectToDB();

    // 2. Lấy thông tin user cơ bản
    const user = await User.findById(userId).select("name email image").lean() as { _id: unknown; name?: string; email?: string; image?: string } | null;

    if (!user || Array.isArray(user)) {
      return null;
    }

    // 3. Tìm ví tương ứng với user
    const wallet = await Wallet.findOne({ userId: user._id }).select("balance").lean() as { balance: number } | null;

    // 4. Tổng hợp dữ liệu
    const userData: UserHeaderData = {
      _id: typeof user._id === 'object' && user._id !== null && 'toString' in user._id
        ? (user._id as { toString: () => string }).toString()
        : String(user._id ?? ''),
      name: user.name || "User",
      email: user.email || "",
      image: user.image,
      // Nếu có wallet, gán object wallet, nếu không thì để undefined
      wallet: wallet ? { balance: wallet.balance } : undefined,
    };

    return userData;

  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu người dùng cho header:", error);
    return null;
  }
}
