"use client";

import { usePathname } from "next/navigation";
import React from "react";
import BottomNavBar from "@/Components/mandala-pay/shared/BottomNavBar";
import TawkToChat from "@/Components/chat/TawkToChat";
interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode; // Nhận Header từ props
  footer: React.ReactNode; // Nhận Footer từ props
}

export function ConditionalLayout({
  children,
  header,
  footer,
}: ConditionalLayoutProps) {
  const pathname = usePathname();

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return <main className="min-h-screen bg-gray-50">{children}</main>;
  }

  const isMandalaPay = pathname?.startsWith("/mandala-pay");
  if (isMandalaPay) {
    return (
      <>
        <main className="flex-1 pb-20">{children}</main>

        {/* Thanh điều hướng dưới cùng, cố định trên mọi trang */}
        <BottomNavBar />
      </>
    );
  }

  return (
    <>
      {header}
      <main className="min-h-screen">{children}</main>
      {footer}
      <TawkToChat />
    </>
  );
}
