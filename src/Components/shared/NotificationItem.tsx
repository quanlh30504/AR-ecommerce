"use client";

import { INotification } from "@/models/Notification";
import Image from "next/image";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface NotificationItemProps {
  notif: INotification;
  onClick: (notificationId: string) => void;
}

export default function NotificationItem({
  notif,
  onClick,
}: NotificationItemProps) {
  const actor = notif.actor as any;
  const actorName = actor?.id?.name || "Hệ thống Mandala";
  const actorAvatar = actor?.id?.avatarUrl;

  const content = (
    <div
      className={cn(
        "p-3 flex items-start gap-3 transition-colors hover:bg-muted/50 w-full text-left",
        !notif.isRead && "bg-blue-50 dark:bg-blue-900/20"
      )}
    >
      <div className="relative w-10 h-10 flex-shrink-0">
        {actorAvatar ? (
          <Image
            src={actorAvatar}
            alt={actorName}
            layout="fill"
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>

      <div>
        <p
          className="text-sm"
          dangerouslySetInnerHTML={{ __html: notif.message }}
        ></p>
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(notif.createdAt).toLocaleString("vi-VN")}
        </p>
      </div>

      {!notif.isRead && (
        <div className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1 self-center ml-auto"></div>
      )}
    </div>
  );

  if (notif.link) {
    return (
      <Link
        href={notif.link}
        className="block"
        onClick={() => onClick(notif._id)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button onClick={() => onClick(notif._id)} className="w-full">
      {content}
    </button>
  );
}
