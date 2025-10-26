"use client";

import Link from "next/link";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { usePathname } from "next/navigation";
import Lottie from "lottie-react";
import notFoundAnimation from "@/assets/animations/not-found.json";

const actionButtons = [
  {
    href: "/",
    text: "Quay về trang chủ",
    variant: "default" as const
  },
  {
    href: "/products", 
    text: "Xem sản phẩm",
    variant: "outline" as const
  }
];

const actionButtonAdmin = [
  {
    href: "/admin",
    text: "Quay về Dashboard Admin",
    variant: "default" as const
  },
  {
    href: "/",
    text: "Về trang chủ",
    variant: "outline" as const
  }
]

const NotFound = () => {
  const pathname = usePathname(); 
  const isAdminRoute = pathname?.startsWith('/admin');
  const buttonsToShow = isAdminRoute ? actionButtonAdmin : actionButtons;
  
  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <Card className="w-full max-w-xl bg-white dark:bg-gray-800 border-0 shadow-xl">
        <CardContent className="p-8 text-center flex flex-col items-center">
          <div className="w-full flex justify-center mb-2">
            <div className="w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] drop-shadow-xl rounded-xl overflow-hidden bg-transparent flex items-center justify-center">
              <Lottie animationData={notFoundAnimation} loop={true} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Trang không tìm thấy</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
          <div className="space-y-4 w-full">
            {buttonsToShow.map((button, index) => (
              <Button key={index} variant={button.variant} asChild className="w-full">
                <Link href={button.href}>
                  {button.text}
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
