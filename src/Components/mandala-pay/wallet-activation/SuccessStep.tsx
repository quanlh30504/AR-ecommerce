// src/components/wallet-activation/SuccessStep.tsx
"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SuccessStep() {
  const router = useRouter(); // 2. Khởi tạo router
  const handleStart = () => {
    router.refresh();
  };
  return (
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <CardTitle className="text-2xl text-green-600">
          🎉 Kích hoạt thành công!
        </CardTitle>
        <CardDescription>
          Ví Mandala Pay của bạn đã sẵn sàng để sử dụng.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleStart} className="w-full">
          Bắt đầu sử dụng ví
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
