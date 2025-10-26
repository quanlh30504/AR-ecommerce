'use client';

import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TransactionNotFound() {
    const router = useRouter();

    return (
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-amber-100 rounded-full p-3 w-fit">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                </div>
                <CardTitle className="mt-4">Giao dịch không hợp lệ</CardTitle>
                <CardDescription>
                    Yêu cầu nạp tiền này có thể đã hết hạn, đã được hoàn thành, hoặc không tồn tại.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button onClick={() => router.back()} className="w-full">
                    Quay lại Lịch sử
                </Button>
            </CardContent>
        </Card>
    );
}
