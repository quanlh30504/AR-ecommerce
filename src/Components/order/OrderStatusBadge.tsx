import { Badge } from "@/Components/ui/badge";
import { OrderStatus } from "@/models/Order";
import React from "react";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { className: string; text: string }> = {
    pending: {
        className: "bg-gray-100 text-gray-800 border border-gray-300",
        text: "Chờ xác nhận",
    },
    processing: {
        className: "bg-blue-100 text-blue-800 border border-blue-300",
        text: "Đang xử lý",
    },
    shipped: {
        className: "bg-orange-100 text-orange-800 border border-orange-300",
        text: "Đang vận chuyển",
    },
    delivered: {
        className: "bg-cyan-100 text-cyan-800 border border-cyan-300",
        text: "Đã giao",
    },
    completed: {
        className: "bg-green-100 text-green-800 border border-green-300",
        text: "Hoàn thành",
    },
    cancelled: {
        className: "bg-red-100 text-red-800 border border-red-300",
        text: "Đã hủy",
    },
    returned: {
        className: "bg-purple-100 text-purple-800 border border-purple-300",
        text: "Đã trả hàng",
    },
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
    // Lấy cấu hình tương ứng với trạng thái, nếu không có thì dùng một giá trị mặc định
    const config = statusConfig[status];

    if (!config) {
        return <Badge variant="outline">{status || "Không rõ"}</Badge>;
    }

    return <Badge className={config.className}>{config.text}</Badge>;
};

export default OrderStatusBadge;
