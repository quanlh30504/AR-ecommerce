"use server";

import { auth } from "@/auth";
import connectToDB from "@/lib/db";
import Wallet from "@/models/Wallet";
import VerificationToken from "@/models/VerificationToken";
import bcrypt from "bcryptjs";
import { sendWalletActivationOtp } from "../email";
import { generateOtpCode } from "../utils";

// --- ACTION 1: GỬI MÃ OTP ---
export async function sendActivationOtp(prevState: unknown, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, message: "Lỗi xác thực." };
  }
  const captchaToken = formData.get("captchaToken") as string;

  // Xác thực CAPTCHA
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    });
    const captchaValidation = await res.json();

    // Điểm (score) của reCAPTCHA v3 > 0.5 được xem là người dùng thật
    if (!captchaValidation.success || captchaValidation.score < 0.5) {
      return {
        success: false,
        message: "Hệ thống phát hiện hoạt động đáng ngờ.",
      };
    }
  } catch (error) {
    // Ghi lại lỗi chi tiết ở phía server để debug
    console.error("Lỗi khi xác thực reCAPTCHA:", error);
    return {
      success: false,
      message: "Không thể xác thực reCAPTCHA. Vui lòng thử lại sau.",
    };
  }

  try {
    await connectToDB();
    const otp = generateOtpCode();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await VerificationToken.deleteMany({ userId: session.user.id });
    await VerificationToken.create({
      userId: session.user.id,
      token: hashedOtp,
      expires: new Date(Date.now() + 10 * 60 * 1000), // 10 phút
    });

    const userEmail = session.user.email;

    // Gửi mã otp đến email user
    await sendWalletActivationOtp(userEmail, otp);

    return { success: true, message: "Mã OTP đã được gửi." };
  } catch (error) {
    return { success: false, message: "Không thể gửi OTP. Vui lòng thử lại." };
  }
}

// --- ACTION 2: XÁC THỰC MÃ OTP ---
export async function verifyActivationOtp(prevState: unknown, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const otp = formData.get("otp") as string;

  if (!userId || !otp) {
    return { success: false, message: "Vui lòng nhập mã OTP." };
  }

  try {
    await connectToDB();
    const verificationToken = await VerificationToken.findOne({ userId });

    if (!verificationToken || verificationToken.expires < new Date()) {
      return {
        success: false,
        message: "Mã OTP không hợp lệ hoặc đã hết hạn.",
      };
    }

    const isOtpValid = await bcrypt.compare(otp, verificationToken.token);
    if (!isOtpValid) {
      return { success: false, message: "Mã OTP không chính xác." };
    }

    // OTP hợp lệ, xóa token và báo thành công
    await VerificationToken.findByIdAndDelete(verificationToken._id);
    return { success: true, message: "Xác thực thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi máy chủ." };
  }
}

// --- ACTION 3: TẠO VÍ VỚI MÃ PIN ---
export async function createWalletWithPin(prevState: unknown, formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  const pin = formData.get("pin") as string;
  const confirmPin = formData.get("confirmPin") as string;

  if (!userId) {
    return { success: false, message: "Lỗi xác thực." };
  }
  if (!pin || pin.length !== 6 || pin !== confirmPin) {
    return { success: false, message: "Mã PIN không hợp lệ." };
  }

  try {
    await connectToDB();
    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      return { success: false, message: "Bạn đã có ví rồi." };
    }

    const pinHash = await bcrypt.hash(pin, 10);
    await Wallet.create({ userId, balance: 0, pinHash });

    return { success: true, message: "Kích hoạt ví thành công!" };
  } catch (error) {
    return { success: false, message: "Lỗi máy chủ." };
  }
}

/**
 * Lấy thông tin ví của người dùng đang đăng nhập.
 * @returns Trả về document Wallet hoặc null nếu không tồn tại.
 */
export async function getWalletForCurrentUser() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return null; // Người dùng chưa đăng nhập
    }

    await connectToDB();

    const wallet = await Wallet.findOne({ userId }).lean();

    // .lean() trả về plain object
    return wallet;
  } catch (error) {
    console.error("Lỗi khi lấy thông tin ví:", error);
    return null;
  }
}

/**
 * GỬI LẠI MÃ OTP KÍCH HOẠT VÍ
 */
export async function resendActivationOtp() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return { success: false, message: "Lỗi xác thực." };
  }

  try {
    await connectToDB();
    const otp = generateOtpCode();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await VerificationToken.deleteMany({ userId: session.user.id });
    await VerificationToken.create({
      userId: session.user.id,
      token: hashedOtp,
      expires: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendWalletActivationOtp(session.user.email, otp);

    return { success: true, message: "Mã OTP mới đã được gửi." };
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP:", error);
    return {
      success: false,
      message: "Không thể gửi lại OTP. Vui lòng thử lại.",
    };
  }
}


// Định nghĩa kiểu dữ liệu trả về cho form state
type VerifyPinState = { 
    success?: boolean; 
    message: string; 
} | undefined;

/**
 * Xác thực mã PIN của người dùng đang đăng nhập.
 * Được gọi từ một form ở phía client.
 * @param prevState - Trạng thái trước đó từ useFormState (không dùng đến nhưng bắt buộc có).
 * @param formData - Dữ liệu form chứa mã PIN.
 * @returns Một object chứa trạng thái thành công/thất bại và thông báo.
 */
export async function verifyPin(
    prevState: VerifyPinState, 
    formData: FormData
): Promise<VerifyPinState> {
    // 1. Lấy session để xác định người dùng
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return { message: 'Lỗi xác thực. Vui lòng đăng nhập lại.' };
    }

    // 2. Lấy mã PIN từ form
    const pin = formData.get('pin') as string;

     // Kiểm tra mã PIN có đúng định dạng không

    if (!pin || pin.length !== 6) {
        return { message: 'Vui lòng nhập đủ 6 chữ số của mã PIN.' };
    }

    try {
        await connectToDB();
        
        // 3. Tìm ví của người dùng
        const wallet = await Wallet.findOne({ userId });

        if (!wallet || !wallet.pinHash) {
            // Trường hợp người dùng chưa kích hoạt ví hoặc ví không có mã PIN
            return { message: 'Lỗi: Không tìm thấy ví hoặc mã PIN chưa được thiết lập.' };
        }

        // 4. So sánh PIN người dùng nhập với hash trong database
        const isPinCorrect = await bcrypt.compare(pin, wallet.pinHash);

        if (!isPinCorrect) {
            // Thêm một chút độ trễ để chống lại các cuộc tấn công brute-force
            await new Promise(resolve => setTimeout(resolve, 500));
            return { message: 'Mã PIN không chính xác.' };
        }

        // 5. PIN chính xác, trả về thành công
        return { success: true, message: 'Xác thực thành công.' };
        
    } catch (error) {
        console.error("Lỗi khi xác thực mã PIN:", error);
        return { message: 'Đã có lỗi xảy ra ở phía máy chủ.' };
    }
}
