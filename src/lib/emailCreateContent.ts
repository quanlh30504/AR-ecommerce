export const createWalletActivationEmailContent = (otpCode: string): string => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .content {
            padding: 20px 0;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .otp-code {
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            background-color: #f0f0f0;
            padding: 10px 20px;
            border-radius: 6px;
            letter-spacing: 3px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div style="padding: 20px;">
        <div class="container">
            <div class="header">
                <a href="https://mandalastore.com" target="_blank" style="text-decoration: none; display: inline-block;">
                    <span style="display: inline-block; vertical-align: middle; width: 48px; height: 48px; border-radius: 9999px; background-color: #a4cc44; text-align: center;">
                        <span style="font-family: cursive, sans-serif; font-style: italic; font-weight: bold; font-size: 30px; color: #ffffff; line-height: 48px; margin-left: 8px; letter-spacing: -0.025em;">M</span>
                    </span>
                    <span style="display: inline-block; vertical-align: middle; font-family: cursive, sans-serif; font-style: italic; font-weight: bold; font-size: 30px; color: #000000; margin-left: 8px; letter-spacing: -0.025em;">andala</span>
                </a>
            </div>
            <div class="content" style="text-align: center;">
                <p>Xin chào,</p>
                <p>Cảm ơn bạn đã sử dụng dịch vụ của Mandala Pay. Vui lòng sử dụng mã xác thực dưới đây để kích hoạt ví của bạn.</p>
                <div class="otp-code">
                    ${otpCode}
                </div>
                <p>Mã này sẽ hết hạn trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Mandala Store. All rights reserved.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
            </div>
        </div>
    </div>
</body>
</html>
`;
};

/**
 * Tạo nội dung HTML cho email khôi phục mật khẩu.
 */
export const createPasswordResetEmailContent = (resetLink: string): string => {
  // Tái sử dụng CSS và cấu trúc tương tự
  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eeeeee;
        }
        .content {
            padding: 20px 0;
            font-size: 16px;
            line-height: 1.5;
            color: #333333;
        }
        .otp-code {
            display: inline-block;
            font-size: 24px;
            font-weight: bold;
            color: #1a1a1a;
            background-color: #f0f0f0;
            padding: 10px 20px;
            border-radius: 6px;
            letter-spacing: 3px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #888888;
            padding-top: 20px;
            border-top: 1px solid #eeeeee;
        }
        a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
    </head>
    <body>
      <div style="padding: 20px;">
        <div class="container" style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px;">
            <div class="header" style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                {/* Logo */}
            </div>
            <div class="content" style="padding: 20px 0; text-align: center;">
                <p>Xin chào,</p>
                <p>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút dưới đây để đặt lại mật khẩu.</p>
                <a href="${resetLink}" target="_blank" class="button">
                    Đặt lại mật khẩu
                </a>
                <p>Liên kết này sẽ hết hạn trong 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
            </div>
            <div class="footer" style="text-align: center; font-size: 12px; color: #888; padding-top: 20px; border-top: 1px solid #eee;">
                <p>&copy; ${new Date().getFullYear()} Mandala Store. All rights reserved.</p>
            </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
