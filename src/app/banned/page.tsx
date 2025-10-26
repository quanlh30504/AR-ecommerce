'use client'

import Lottie from "lottie-react";
import bannedAnimation from "@/assets/animations/banned.json";

export default function BannedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full flex justify-center mb-2">
        <div className="w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] drop-shadow-xl rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
          <Lottie animationData={bannedAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-bold text-red-600 dark:text-red-400 mb-4 text-center">Tài khoản của bạn đã bị khóa</h1>
      <p className="text-lg text-gray-700 dark:text-gray-200 mb-4 text-center">Bạn đã bị ban bởi quản trị viên và không thể sử dụng website này.</p>
      <p className="text-gray-500 dark:text-gray-400 text-center mb-6">Nếu bạn nghĩ đây là nhầm lẫn, vui lòng liên hệ bộ phận hỗ trợ.</p>
    </div>
  );
}
