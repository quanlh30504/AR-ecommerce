import React, { useMemo } from "react";
import { Badge } from "@/Components/ui/badge";

interface StatusBadgeProps {
    status: string;
}

const statusMap: Record<string, { className?: string; text: string; variant?: string }> = {
    pending: { variant: "secondary", text: "Chờ xác nhận" },
    processing: { className: "bg-blue-100 text-blue-800", text: "Đang xử lý" },
    shipped: { className: "bg-yellow-100 text-yellow-800", text: "Đang vận chuyển" },
    delivered: { className: "bg-cyan-100 text-cyan-800", text: "Đã giao" },
    completed: { className: "bg-green-100 text-green-800", text: "Hoàn thành" }, 
    cancelled: { variant: "destructive", text: "Đã hủy" },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const { className, text, variant } = useMemo(() => {
        return statusMap[status] || { text: status };
    }, [status]);

    const validVariants = ["secondary", "destructive", "default", "outline"] as const;
    const safeVariant = validVariants.includes(variant as any) ? variant : undefined;

    return <Badge className={className} variant={safeVariant as "secondary" | "destructive" | "default" | "outline" | undefined}>{text}</Badge>;
};

export default StatusBadge;
