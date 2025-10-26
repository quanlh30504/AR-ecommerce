"use client";

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import ActivateWallet from "./wallet-activation/ActivateWallet";

export default function ActivateWalletFlow() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error("CRITICAL ERROR: NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not configured in environment variables.");
    return (
      <div className="text-red-500 text-center p-4 border border-dashed border-red-300 rounded-md">
        <p className="font-semibold">Hệ thống đang gặp sự cố</p>
        <p className="text-sm">Chức năng này tạm thời không khả dụng. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <ActivateWallet />
    </GoogleReCaptchaProvider>
  );
}
