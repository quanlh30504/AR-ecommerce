
"use client";

import { Bell } from "lucide-react";
import Link from "next/link";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationItem from "@/Components/shared/NotificationItem";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/Components/DropdownMenu";
import { Button } from "@/Components/ui/button";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function NotificationBell({ size = 'md' }: NotificationBellProps) {
    const { notifications, unreadCount, markAllAsRead, markOneAsRead } = useNotificationStore();

     const iconSizeMap = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5', 
      lg: 'h-6 w-6',
    };

    const buttonSizeMap = {
      sm: 'h-8 w-8',    // 32px
      md: 'h-10 w-10',  // 40px (giống size="icon" mặc định)
      lg: 'h-12 w-12',  // 48px
    };

    return (
        <DropdownMenu onOpenChange={(open) => {
            if (!open && unreadCount > 0) {
                markAllAsRead();
            }
        }}>
            <DropdownMenuTrigger asChild>
               <Button 
                    variant="ghost" 
                    className={cn(
                        "relative rounded-full flex items-center justify-center",
                        buttonSizeMap[size] 
                    )}
                >
                    <Bell
                        key={unreadCount}
                        className={cn(iconSizeMap[size], unreadCount > 0 && "animate-tada")}
                    />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 md:w-96 p-0">
                <div className="p-2 font-semibold border-b">Thông báo</div>
                <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((notif) => (
                            <NotificationItem
                                key={notif._id}
                                notif={notif}
                                onClick={markOneAsRead}
                            />
                        ))
                    ) : (
                        <p className="text-sm text-center text-muted-foreground p-4">
                            Bạn không có thông báo nào.
                        </p>
                    )}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/mandala-pay/notifications" className="w-full justify-center text-sm text-primary cursor-pointer">
                        Xem tất cả thông báo
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
