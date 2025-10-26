"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, MapPin, CreditCard, Star, Eye, Heart } from "lucide-react";
import userImage from "@/assets/images/Users/user-image.jpg";
import { Package } from 'lucide-react';
import { IUser } from "@/models/User";

interface ProfileSidebarProps {
  user: IUser;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ user }) => {
  const pathname = usePathname();

  const menuItems = useMemo(() => [
    { name: "Thông tin tài khoản", href: "/profile", icon: User },
    { name: "Quản lý đơn hàng", href: "/profile/orders", icon: Package },
    { name: "Danh sách địa chỉ", href: "/profile/addresses", icon: MapPin },
    { name: "Thông tin thanh toán", href: "/profile/payment", icon: CreditCard },
    { name: "Đánh giá sản phẩm", href: "/profile/reviews", icon: Star },
    { name: "Sản phẩm bạn đã xem", href: "/profile/viewed", icon: Eye },
    { name: "Sản phẩm yêu thích", href: "/profile/wishlist", icon: Heart },
  ], []);

  return (
    <aside className="w-full md:w-1/4">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative w-12 h-12">
          <Image
            src={user.image || userImage.src}
            alt="User Avatar"
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Tài khoản của</p>
          <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
        </div>
      </div>
      <nav>
        <ul>
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default React.memo(ProfileSidebar);
