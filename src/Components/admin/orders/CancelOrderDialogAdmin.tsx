'use client';

import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Label } from '@/Components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group';
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
import { toast } from 'react-hot-toast';

const cancelReasons = [
    "Khách hàng yêu cầu hủy",
    "Sai thông tin đơn hàng",
    "Hết hàng",
];

interface CancelOrderDialogProps {
    onConfirm: (reason: string) => void;
    disabled?: boolean;
}

export default function CancelOrderDialogAdmin({ onConfirm, disabled }: CancelOrderDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(cancelReasons[0]);
    const [otherReason, setOtherReason] = useState('');

    const handleConfirm = () => {
        const finalReason = selectedReason === 'other' ? otherReason.trim() : selectedReason;
        if (!finalReason) {
            toast.error("Vui lòng chọn hoặc nhập lý do hủy đơn.");
            return;
        }
        onConfirm(finalReason);
        setIsOpen(false); 
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={disabled}>Hủy đơn</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc chắn muốn hủy đơn hàng này?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Tiền sẽ được hoàn lại và tồn kho sẽ được cập nhật.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4 py-4">
                    <Label>Chọn lý do hủy</Label>
                    <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                        {cancelReasons.map(reason => (
                            <div key={reason} className="flex items-center space-x-2">
                                <RadioGroupItem value={reason} id={reason} />
                                <Label htmlFor={reason}>{reason}</Label>
                            </div>
                        ))}
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="other" id="other" />
                            <Label htmlFor="other">Lý do khác</Label>
                        </div>
                    </RadioGroup>

                    {selectedReason === 'other' && (
                        <Textarea 
                            placeholder="Vui lòng nhập lý do cụ thể..."
                            value={otherReason}
                            onChange={(e) => setOtherReason(e.target.value)}
                            className="mt-2"
                        />
                    )}
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel>Không</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirm}>Đồng ý Hủy</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
