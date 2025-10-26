'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Ticket, QrCode, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/mandala-pay', label: 'Trang chủ', icon: Home },
  { href: '/mandala-pay/deals', label: 'Ưu đãi', icon: Ticket },
  { isCentral: true, href: '/mandala-pay/scan-qr', label: 'Quét QR', icon: QrCode },
  { href: '/mandala-pay/history', label: 'Lịch sử', icon: History },
  { href: '/mandala-pay/profile', label: 'Tôi', icon: User },
];

const BottomNavBar = () => {
  const pathname = usePathname();

  return (
    <footer className="w-1/3 fixed bottom-0 left-0 right-0 mx-auto z-50 bg-background border-t pb-[env(safe-area-inset-bottom)]">
      <nav className="flex items-center justify-around h-16">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;

          const Icon = link.icon;
          if (link.isCentral) {
            return (
              <Link
                key={link.href}
                href={link.href}
                className="relative flex items-center justify-center w-16 h-16 -mt-8 rounded-full shadow-lg flex-shrink-0
                           bg-green-600 hover:bg-green-700 transition-colors" 
              >
                <Icon className="w-8 h-8 text-white" />
              </Link>
            );
          }

          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex flex-1 flex-col items-center justify-center h-full space-y-1"
            >
              <Icon
                className={cn(
                  'w-6 h-6 transition-colors',
                  isActive ? 'text-green-500' : 'text-muted-foreground'
                )}
              />
              <span
                className={cn(
                  'text-xs transition-colors',
                  isActive ? 'text-green-500 font-semibold' : 'text-muted-foreground'
                )}
              >
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
};

export default BottomNavBar;
