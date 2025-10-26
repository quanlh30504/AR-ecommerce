"use client";

import Link from "next/link";
import { IOrder, OrderStatus } from "@/models/Order";
import { Button } from "@/Components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import OrderStatusBadge from "@/Components/order/OrderStatusBadge";
import { Card } from "@/Components/ui/card";

// Hàm định dạng tiền tệ VND

const formatCurrency = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    price
  );

interface AdminOrderTableProps {
  orders: IOrder[];
}

export default function AdminOrderTable({ orders }: AdminOrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Không có đơn hàng nào trong mục này.</p>
      </div>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">Mã ĐH</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Ngày đặt</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
            <TableHead className="text-center">Trạng thái</TableHead>
            <TableHead className="text-left">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id?.toString?.() || String(order._id)}>
              <TableCell className="font-medium text-center">
                {order.orderId}
              </TableCell>
              <TableCell>{order.shippingAddress?.fullName}</TableCell>
              <TableCell>
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                  : "-"}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(order.totals?.grandTotal)}
              </TableCell>
              <TableCell className="text-center flex justify-center">
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-left">
                <Button asChild variant="ghost" size="sm">
                  <Link
                    href={`/admin/orders/${
                      order._id?.toString?.() || String(order._id)
                    }`}
                  >
                    Xem
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
