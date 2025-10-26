"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { getMyOrders } from "@/lib/actions/order";
import { OrderStatus, IOrder } from "@/models/Order";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import dynamic from "next/dynamic";
const Button = dynamic(() =>
  import("@/Components/ui/button").then((mod) => mod.Button)
);
const Card = dynamic(() =>
  import("@/Components/ui/card").then((mod) => mod.Card)
);
const CardContent = dynamic(() =>
  import("@/Components/ui/card").then((mod) => mod.CardContent)
);
const CardFooter = dynamic(() =>
  import("@/Components/ui/card").then((mod) => mod.CardFooter)
);
const CardHeader = dynamic(() =>
  import("@/Components/ui/card").then((mod) => mod.CardHeader)
);
const Badge = dynamic(() =>
  import("@/Components/ui/badge").then((mod) => mod.Badge)
);
const Input = dynamic(() =>
  import("@/Components/ui/input").then((mod) => mod.Input)
);
import { Suspense } from "react";
import { Search } from "lucide-react";
import SafeImage from "@/Components/SafeImage";
import { formatCurrency } from "@/lib/utils";
import BuyAgainModal from "./BuyAgainModal";

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return <Badge variant="secondary">Chờ xác nhận</Badge>;
    case "processing":
      return <Badge className="bg-blue-100 text-blue-800">Đang xử lý</Badge>;
    case "shipped":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">Đang vận chuyển</Badge>
      );
    case "delivered":
      return <Badge className="bg-cyan-100 text-cyan-800">Đã giao</Badge>;
    case "completed":
      return <Badge className="bg-green-200 text-green-800">Hoàn thành</Badge>;
    case "returned":
      return <Badge variant="warning">Đã trả hàng</Badge>;
    case "cancelled":
      return <Badge variant="destructive">Đã hủy</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};

export default function OrderList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Đọc các tham số từ URL
  const status = searchParams.get("status") as OrderStatus | null;
  const searchQuery = searchParams.get("search") || "";

  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchQuery); // State cho ô input
  const [buyAgainOrder, setBuyAgainOrder] = useState<IOrder | null>(null);

  // useEffect để fetch dữ liệu khi URL thay đổi
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      // Gọi action với cả status và searchQuery
      const response = await getMyOrders({
        status: status ?? undefined,
        search: searchQuery,
      });
      if (response.success && response.data) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
      setIsLoading(false);
    };

    fetchOrders();
  }, [status, searchQuery]); // Thêm searchQuery vào dependency

  // useEffect cho debouncing việc tìm kiếm
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== searchQuery) {
        const params = new URLSearchParams(searchParams);
        if (searchTerm) {
          params.set("search", searchTerm);
        } else {
          params.delete("search");
        }
        router.push(`${pathname}?${params.toString()}`);
      }
    }, 200);

    return () => clearTimeout(handler);
  }, [searchTerm, searchQuery, pathname, router, searchParams]);
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<div>Đang tải danh sách đơn hàng...</div>}>
        <div className="space-y-6">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {orders && orders.length > 0 ? (
            orders.map((order: IOrder) => (
              <Card key={order._id?.toString?.() || String(order._id)}>
                <CardHeader className="flex flex-row justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">
                      Mã đơn hàng: {order.orderId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ngày đặt:{" "}
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </CardHeader>
                <CardContent>
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 py-4 border-t first:border-t-0"
                    >
                      <div className="relative w-16 h-16">
                        <SafeImage
                          src={item.image}
                          alt={item.name}
                          fill
                          className="rounded-md border object-cover"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SL: x{item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-end items-center gap-4">
                  <p className="text-sm">
                    Tổng tiền:{" "}
                    <span className="font-bold text-lg text-red-600">
                      {formatCurrency(order.totals.grandTotal)}
                    </span>
                  </p>
                  {(order.status === "completed" ||
                    order.status === "cancelled" ||
                    order.status === "returned") && (
                    <Button
                      variant="outline"
                      onClick={() => setBuyAgainOrder(order)}
                    >
                      Mua lại
                    </Button>
                  )}
                  <Button asChild>
                    <Link href={`/profile/orders/${order._id}`}>
                      Xem chi tiết
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">
                Bạn chưa có đơn hàng nào trong mục này.
              </p>
            </div>
          )}
        </div>
      </Suspense>

      {buyAgainOrder && (
        <BuyAgainModal
          isOpen={!!buyAgainOrder}
          onClose={() => setBuyAgainOrder(null)}
          order={buyAgainOrder}
        />
      )}
    </>
  );
}
