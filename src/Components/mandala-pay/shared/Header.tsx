"use client";

import { History, QrCode } from "lucide-react";
import MandalaPayLogo from "./MandalaPayLogo";
import Link from "next/link";
import { Button } from "@/Components/ui/button";
import NotificationBell from "@/Components/shared/NotificationBell";

const HeaderActionIcon = ({
  href,
  icon: Icon,
}: {
  href: string;
  icon: React.ElementType;
}) => (
  <Button variant="ghost" size="icon" asChild>
    <Link href={href}>
      <Icon className="w-5 h-5" />
    </Link>
  </Button>
);

const Header = () => {
  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="w-full max-w-md mx-auto flex items-center justify-between h-16 px-4">
        <MandalaPayLogo />
        <div className="flex items-center space-x-2">
          <HeaderActionIcon href="/mandala-pay/history" icon={History} />
          <HeaderActionIcon href="/mandala-pay/scan-qr" icon={QrCode} />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};

export default Header;
