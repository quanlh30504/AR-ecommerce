'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card";
import { Button } from '@/Components/ui/button';
import Image from 'next/image';
import { formatCurrency } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CountdownTimer = ({ expiryDate }: { expiryDate: Date }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(expiryDate) - +new Date();
        if (difference > 0) {
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return "00:00";
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    return <span className="font-bold text-red-500">{timeLeft === "00:00" ? "Đã hết hạn" : timeLeft}</span>;
};

// --- Props cho component chính ---
interface ShowQrStepProps {
  qrData: {
    qrImageUrl: string;
    amount: number;
    requestCode: string;
    expiresAt: Date;
    bonusAmount: number;
  };
}

export default function ShowQrStep({ qrData }: ShowQrStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData.requestCode);
    setCopied(true);
    toast.success("Đã sao chép nội dung chuyển khoản!");
    setTimeout(() => setCopied(false), 2000); // Reset icon sau 2 giây
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Quét mã để nạp tiền</CardTitle>
        <CardDescription>
          Mở ứng dụng ngân hàng của bạn và quét mã QR dưới đây.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        {/* ---- Hiển thị ảnh QR Code ---- */}
        <div className="p-2 border rounded-lg bg-white">
          <Image 
            src={qrData.qrImageUrl} 
            alt="VietQR Code" 
            width={256} 
            height={256} 
            priority 
          />
        </div>

        {/* ---- Thông tin giao dịch ---- */}
        <div className="w-full space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Số tiền cần chuyển:</span>
            <span className="font-bold text-lg">{formatCurrency(qrData.amount)}</span>
          </div>
          {qrData.bonusAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span className="text-muted-foreground">Tiền thưởng:</span>
              <span className="font-bold text-lg">+ {formatCurrency(qrData.bonusAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Nội dung chuyển khoản:</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-primary">{qrData.requestCode}</span>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* ---- Thời gian hết hạn ---- */}
        <div className="w-full text-center bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 p-3 rounded-lg">
          <p className="text-sm font-medium">Mã sẽ hết hiệu lực sau: <CountdownTimer expiryDate={qrData.expiresAt} /></p>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
            Sau khi chuyển khoản thành công, ví của bạn sẽ được tự động cập nhật.
        </p>
      </CardContent>
    </Card>
  );
}
