import nodemailer from 'nodemailer';
import { createWalletActivationEmailContent, createPasswordResetEmailContent } from './emailCreateContent';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

//  Tạo "transporter" -> chịu trách nhiệm gửi email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

/**
 * Hàm gửi email có thể tái sử dụng
 * @param options - Đối tượng chứa thông tin người nhận, tiêu đề, và nội dung HTML
 */
export async function sendEmail(options: EmailOptions) {
  // 2. Định nghĩa nội dung email
  const mailOptions = {
    from: `Mandala Store <${process.env.EMAIL_FROM}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    // 3. Gửi email
    const info = await transporter.sendMail(mailOptions);
    console.info('Email sent successfully! Message ID:', info.messageId);
    return { success: true, data: info };
  } catch (error) {
    console.error('Error sending email:', error);
    // Ném lỗi để block try-catch bên ngoài có thể bắt được
    throw new Error('Failed to send email.');
  }
}

/**
 * Gửi email chứa mã OTP để kích hoạt ví.
 * @param to Địa chỉ email người nhận.
 * @param otp Mã OTP gồm 6 chữ số.
 */
export async function sendWalletActivationOtp(to: string, otp: string) {
  const htmlContent = createWalletActivationEmailContent(otp);
  
  return await sendEmail({
    to,
    subject: 'Mã xác thực kích hoạt Ví Mandala Pay',
    html: htmlContent,
  });
}

/**
 * Gửi email chứa liên kết để khôi phục mật khẩu.
 * @param to Địa chỉ email người nhận.
 * @param resetLink Liên kết để reset mật khẩu.
 */
export async function sendPasswordResetEmail(to: string, resetLink: string) {
  const htmlContent = createPasswordResetEmailContent(resetLink);

  return await sendEmail({
    to,
    subject: 'Yêu cầu khôi phục mật khẩu Mandala Store',
    html: htmlContent,
  });
}

