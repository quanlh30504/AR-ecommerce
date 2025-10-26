"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getAdminOrderDetails } from "@/lib/actions/order";
import { IOrder } from "@/models/Order";

// Import các component từ shadcn/ui và lucide-react
import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import OrderStatusBadge from "@/Components/order/OrderStatusBadge";
import { Separator } from "@/Components/ui/separator";
import { ArrowLeft, Loader2, Info } from "lucide-react";
import CancelOrderButton from "@/Components/order/CancelOrderButton";
import SafeImage from "@/Components/SafeImage";
import { formatCurrency } from "@/lib/utils";
import { AdminLayout } from "@/Components/admin/AdminLayout";
import OrderStatusProgress from "@/Components/order/OrderStatusProgress";
import AdminOrderActions from "@/Components/admin/orders/AdminOrderActions";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setError(null);
    const response = await getAdminOrderDetails(orderId);
    if (response.success && response.data) {
      setOrder(response.data);
    } else {
      setError(response.message || "Không tìm thấy đơn hàng.");
    }
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Hàm callback để cập nhật state sau khi action thành công
  const handleStatusUpdate = (updatedOrder: IOrder) => {
    setOrder(updatedOrder);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error || !order) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-destructive">Lỗi</h2>
          <p className="text-muted-foreground mt-2">
            {error || "Không thể tải thông tin đơn hàng."}
          </p>
          <Button asChild variant="link" className="mt-4">
            <Link href="/admin/orders">Quay lại danh sách</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/admin/orders">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Đơn hàng #{order.orderId}</h1>
              <p className="text-sm text-muted-foreground">
                Ngày đặt hàng:{" "}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("vi-VN")
                  : "N/A"}
              </p>
            </div>
          </div>
          <AdminOrderActions
            order={order}
            onStatusUpdate={handleStatusUpdate}
          />
        </div>

        {/* 1. HIỂN THỊ TIẾN TRÌNH TRẠNG THÁI TRỰC QUAN */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Tiến trình Đơn hàng</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <OrderStatusProgress status={order.status} />
          </CardContent>
        </Card>

        {order.status === "cancelled" && order.cancellationDetails && (
          <Card className="mb-6 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-500/30">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <Info className="w-5 h-5 text-red-600" />
              <CardTitle className="text-base text-red-700 dark:text-red-300">
                Thông tin Hủy đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1 pl-12">
              <p>
                <span className="font-semibold">Người hủy:</span>{" "}
                {order.cancellationDetails.cancelledBy === "USER"
                  ? "Khách hàng"
                  : "Quản trị viên"}
              </p>
              <p>
                <span className="font-semibold">Thời gian:</span>{" "}
                {new Date(order.cancellationDetails.cancelledAt).toLocaleString(
                  "vi-VN"
                )}
              </p>
              <p>
                <span className="font-semibold">Lý do:</span>{" "}
                {order.cancellationDetails.reason}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Các Card thông tin */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Địa chỉ người nhận</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{order.shippingAddress.fullName}</p>
              <p className="text-muted-foreground">
                Địa chỉ:{" "}
                {`${order.shippingAddress.street}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.city}`}
              </p>
              <p className="text-muted-foreground">
                Điện thoại: {order.shippingAddress.phoneNumber}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hình thức giao hàng</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-semibold">{order.shipping.method}</p>
              <p className="text-muted-foreground">
                Phí vận chuyển: {formatCurrency(order.shipping.fee)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hình thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <p>
                {order.payment.method === "COD"
                  ? "Thanh toán tiền mặt khi nhận hàng"
                  : `Thanh toán qua ${order.payment.method}`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Card chi tiết sản phẩm */}
        <Card>
          <CardContent className="p-0">
            <div className="p-6">
              {order.items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 items-center gap-4 py-4"
                >
                  <div className="col-span-2">
                    <SafeImage
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="rounded-md border"
                    />
                  </div>
                  <div className="col-span-5">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      SKU: {item.sku}
                    </p>
                  </div>
                  <p className="col-span-2 text-sm text-center">
                    {formatCurrency(item.price)}
                  </p>
                  <p className="col-span-1 text-sm text-center">
                    x{item.quantity}
                  </p>
                  <p className="col-span-2 text-sm font-semibold text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <Separator />
            <div className="p-6 space-y-2 text-sm w-full max-w-sm ml-auto">
              <div className="flex justify-between">
                <p>Tạm tính</p>
                <p>{formatCurrency(order.totals.subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p>Phí vận chuyển</p>
                <p>{formatCurrency(order.totals.shippingTotal)}</p>
              </div>
              <div className="flex justify-between">
                <p>Giảm giá</p>
                <p>-{formatCurrency(order.totals.discount)}</p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold text-base">
                <p>Tổng cộng</p>
                <p className="text-red-600">
                  {formatCurrency(order.totals.grandTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
