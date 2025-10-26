"use client";

import { useState, useEffect } from "react";
import { ITopUpRequest } from "@/models/TopUpRequest";
import { Card, CardContent } from "@/Components/ui/card";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowDownToLine, Landmark } from 'lucide-react';

type TransactionDetailMap = {
  icon: React.ReactNode;
  title: string;
  description: string;
}


const CountdownTimer = ({ expiryDate }: { expiryDate: string | Date }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(expiryDate) - +new Date();
    let timeLeft = { minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = `${timeLeft.minutes
    .toString()
    .padStart(2, "0")}:${timeLeft.seconds.toString().padStart(2, "0")}`;

  return (
    <span className="font-semibold text-red-500">
      {timeLeft.minutes > 0 || timeLeft.seconds > 0
        ? timerComponents
        : "Hết hạn"}
    </span>
  );
};

// object map
const transactionDetailsMap: Record<string, TransactionDetailMap> = {
  VIETQR: {
    icon: <ArrowDownToLine className="h-6 w-6 text-blue-500" />,
    title: `Nạp tiền`,
    description: "qua Chuyển khoản VietQR",
  },
  GATEWAY: {
    icon: <Landmark className="h-6 w-6 text-purple-500" />,
    title: `Nạp tiền`,
    description: "qua Cổng thanh toán",
  },
  default: {
    icon: <ArrowDownToLine className="h-6 w-6 text-gray-500" />,
    title: `Giao dịch nạp tiền`,
    description: "",
  }
};


export default function HistoryItem({ req }: { req: ITopUpRequest }) {
  const isPendingAndActive =
    req.status === "PENDING" && new Date(req.expiresAt) > new Date();
  const qrImageUrl = req.payment.qrImageUrl;

  // LẤY THÔNG TIN TỪ OBJECT MAP
  const details = transactionDetailsMap[req.payment.method] || transactionDetailsMap.default;

  let href = "";
  if (isPendingAndActive) {
      // Nếu đang chờ -> link đến trang quét lại QR
      href = `/mandala-pay/history/${req._id}`;
  } else if (req.status === "COMPLETED" && req.transactionId) {
      // Nếu đã thành công và có transactionId -> link đến chi tiết giao dịch
      href = `/mandala-pay/transactions/${req.transactionId}`;
  }
  
  const cardContent = (
    <Card
      className={cn(
        "overflow-hidden transition-all",
        isPendingAndActive
          ? "cursor-pointer hover:border-primary/50 hover:shadow-md"
          : "opacity-70 bg-muted/50"
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className="relative w-16 h-16 flex-shrink-0 flex items-center justify-center bg-muted rounded-lg">
          {isPendingAndActive && qrImageUrl ? (
            <Image
              src={qrImageUrl}
              alt={`QR Code for ${req.requestCode}`}
              layout="fill"
              className="rounded-lg"
            />
          ) : (
            details.icon
          )}

          {!isPendingAndActive && (
            <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center backdrop-blur-sm rounded-lg">
              <span className="text-xs font-bold text-destructive capitalize text-center px-1">
                {req.status === "PENDING" ? "Đã hết hạn" : req.status.toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-grow">
          <p className="font-semibold text-foreground">{details.title}</p>
          <p className="font-bold text-lg text-green-600">
            + {formatCurrency(req.amount.total)}
          </p>
          <p className="text-xs text-muted-foreground">{details.description}</p>
          {isPendingAndActive && (
            <p className="text-xs text-muted-foreground mt-1">
              Hết hạn sau: <CountdownTimer expiryDate={req.expiresAt} />
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
