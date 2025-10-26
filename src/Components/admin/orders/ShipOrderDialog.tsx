'use client';

import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

interface ShipOrderDialogProps {
    onConfirm: (trackingCode: string) => void;
    disabled?: boolean;
}

export default function ShipOrderDialog({ onConfirm, disabled }: ShipOrderDialogProps) {
    // State trackingCode giờ nằm trong component này
    const [trackingCode, setTrackingCode] = useState('');

    const handleConfirm = () => {
        // Chỉ gọi onConfirm nếu có mã vận đơn
        if (trackingCode.trim()) {
            onConfirm(trackingCode.trim());
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button disabled={disabled}>Bắt đầu Giao hàng</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xác nhận Giao hàng</AlertDialogTitle>
                    <AlertDialogDescription>
                        Vui lòng nhập mã vận đơn (tracking code) từ đơn vị vận chuyển.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    placeholder="Nhập mã vận đơn..."
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Xác nhận</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
