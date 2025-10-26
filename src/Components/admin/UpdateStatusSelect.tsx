"use client";

import { useTransition } from 'react';
import { toast } from 'react-hot-toast';
import { updateOrderStatus } from '@/lib/actions/order';
import { OrderStatus } from '@/models/Order';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { cn } from '@/lib/utils';

// --- Cấu hình màu sắc và nhãn cho từng trạng thái ---
const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; dotClass: string }> = {
    pending:    { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-800 border-yellow-400 dark:bg-yellow-400/20 dark:text-yellow-200 dark:border-yellow-400 shadow-md", dotClass: "bg-yellow-400" },
    processing: { label: "Đang xử lý", className: "bg-blue-100 text-blue-800 border-blue-400 dark:bg-blue-400/20 dark:text-blue-200 dark:border-blue-400 shadow-md", dotClass: "bg-blue-400" },
    shipped:    { label: "Đang vận chuyển", className: "bg-indigo-100 text-indigo-800 border-indigo-400 dark:bg-indigo-400/20 dark:text-indigo-200 dark:border-indigo-400 shadow-md", dotClass: "bg-indigo-400" },
    delivered:  { label: "Đã giao", className: "bg-green-100 text-green-800 border-green-400 dark:bg-green-400/20 dark:text-green-200 dark:border-green-400 shadow-md", dotClass: "bg-green-400" },
    cancelled:  { label: "Đã hủy", className: "bg-red-100 text-red-800 border-red-400 dark:bg-red-400/20 dark:text-red-200 dark:border-red-400 shadow-md", dotClass: "bg-red-400" },
    completed:  { label: "Hoàn tất", className: "bg-teal-100 text-teal-800 border-teal-400 dark:bg-teal-400/20 dark:text-teal-200 dark:border-teal-400 shadow-md", dotClass: "bg-teal-400" },
    returned:   { label: "Đã trả hàng", className: "bg-gray-100 text-gray-800 border-gray-400 dark:bg-gray-400/20 dark:text-gray-200 dark:border-gray-400 shadow-md", dotClass: "bg-gray-400" },
};

// Lấy danh sách options từ config để tránh lặp lại code
const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
    label,
    value: value as OrderStatus,
}));

interface UpdateStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
    onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
}

export default function UpdateStatusSelect({ orderId, currentStatus, onStatusUpdate }: UpdateStatusSelectProps) {
    const [isPending, startTransition] = useTransition();

    const handleValueChange = (newStatus: OrderStatus) => {
        startTransition(async () => {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success(result.message);
                onStatusUpdate(orderId, newStatus);
            } else {
                toast.error(result.message);
            }
        });
    };

    // Lấy style của trạng thái hiện tại
    const currentStatusStyle = STATUS_CONFIG[currentStatus];

    return (
        <Select onValueChange={handleValueChange} defaultValue={currentStatus} disabled={isPending}>
            <SelectTrigger
                className={cn(
                    "w-[160px] h-8 text-xs font-semibold focus:ring-0 focus:ring-offset-0 border-2 transition-all duration-200",
                    currentStatusStyle.className,
                    "dark:shadow-lg dark:shadow-yellow-900/10"
                )}
            >
                <SelectValue placeholder="Cập nhật trạng thái" />
            </SelectTrigger>
            <SelectContent>
                {STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                            <span className={cn('w-2 h-2 rounded-full border border-white shadow', STATUS_CONFIG[option.value].dotClass)} />
                            <span>{option.label}</span>
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
