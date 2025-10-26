import React from "react";
import { Badge } from "@/Components/ui/badge";
import { OrderStatus } from "@/models/Order";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

const statusMap: Record<string, React.ReactNode> = {
    pending: <Badge variant="secondary">Chờ thanh toán</Badge>,
    processing: <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>,
    shipped: <Badge className="bg-yellow-100 text-yellow-800">Đang vận chuyển</Badge>,
    delivered: <Badge className="bg-green-100 text-green-800">Đã giao</Badge>,
    cancelled: <Badge variant="destructive">Đã hủy</Badge>,
};

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
    return statusMap[status] || <Badge>{status}</Badge>;
};

export default OrderStatusBadge;
