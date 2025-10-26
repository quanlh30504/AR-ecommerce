"use client";

import { useTransition, useState } from "react";
import { IOrder } from "@/models/Order";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { confirmDelivery } from "@/lib/actions/order";
import CancelOrderDialog from "./CancelOrderDialog";
import BuyAgainModal from "./BuyAgainModal";

//  Thêm định nghĩa kiểu cho Tawk_API
// Điều này giúp TypeScript hiểu được Tawk_API tồn tại trên đối tượng window
declare global {
  interface Window {
    Tawk_API?: {
      maximize: () => void;
      // Thêm các hàm khác nếu bạn cần sử dụng trong tương lai
    };
  }
}

interface UserOrderActionsProps {
  order: IOrder;
  onOrderUpdate: (updatedOrder: IOrder) => void;
  reviewButtonSlot?: React.ReactNode; // "Slot" cho button đánh giá
}

export default function UserOrderActions({
  order,
  onOrderUpdate,
  reviewButtonSlot,
}: UserOrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [isBuyAgainModalOpen, setIsBuyAgainModalOpen] = useState(false);

  const handleContactClick = () => {
    // Kiểm tra xem Tawk_API đã được tải và sẵn sàng chưa
    if (window.Tawk_API && typeof window.Tawk_API.maximize === "function") {
      // Gọi hàm maximize() để mở to cửa sổ chat
      window.Tawk_API.maximize();
    } else {
      // Fallback trong trường hợp script chưa tải xong hoặc bị chặn
      toast.error("Không thể mở cửa sổ chat lúc này. Vui lòng thử lại sau.");
      console.error("Tawk.to API is not available or hasn't loaded yet.");
    }
  };

  const handleAction = (action: Function) => {
    startTransition(async () => {
      const result = await action(order._id.toString());
      if (result.success && result.data) {
        toast.success(result.message);
        onOrderUpdate(result.data);
      } else {
        toast.error(result.message);
      }
    });
  };

  // Button cho hành động chính (có màu nền)
  const PrimaryButton = ({
    children,
    ...props
  }: React.ComponentProps<typeof Button>) => (
    <Button className="w-full justify-center" {...props}>
      {children}
    </Button>
  );

  const SecondaryButton = ({
    children,
    ...props
  }: React.ComponentProps<typeof Button>) => (
    <Button variant="outline" className="w-full justify-center" {...props}>
      {children}
    </Button>
  );

  const renderActions = () => {
    const actionListClasses =
      "flex flex-col gap-3 w-full sm:w-auto sm:min-w-[200px]";

    switch (order.status) {
      case "pending":
        return (
          <div className={actionListClasses}>
            <CancelOrderDialog order={order} onOrderUpdate={onOrderUpdate} />
            <SecondaryButton onClick={handleContactClick}>
              Liên hệ Người bán
            </SecondaryButton>
          </div>
        );

      case "shipped":
        return (
          <div className={actionListClasses}>
            <PrimaryButton asChild>
              <Link href={`/tracking?code=${order.shipping.trackingNumber}`}>
                Theo dõi đơn hàng
              </Link>
            </PrimaryButton>
            <SecondaryButton onClick={handleContactClick}>
              Liên hệ Người bán
            </SecondaryButton>
          </div>
        );

      case "delivered":
        return (
          <div className={actionListClasses}>
            <PrimaryButton
              onClick={() => handleAction(confirmDelivery)}
              disabled={isPending}
            >
              Đã nhận được hàng
            </PrimaryButton>
            <SecondaryButton>Yêu cầu Trả hàng/Hoàn tiền</SecondaryButton>
          </div>
        );
      case "completed":
        return (
          <div className={actionListClasses}>
            <PrimaryButton onClick={() => setIsBuyAgainModalOpen(true)}>
              Mua lại
            </PrimaryButton>
            {reviewButtonSlot}
          </div>
        );
      case "cancelled":
      case "returned":
        return (
          <div className={actionListClasses}>
            <PrimaryButton onClick={() => setIsBuyAgainModalOpen(true)}>
              Mua lại
            </PrimaryButton>
          </div>
        );
      default:
        return (
          <div className={actionListClasses}>
            <PrimaryButton onClick={handleContactClick}>
              Liên hệ Người bán
            </PrimaryButton>
          </div>
        );
    }
  };

  return (
    <>
      <Card className="mt-6 bg-transparent border-none shadow-none">
        <CardContent className="p-0 flex justify-end">
          {renderActions()}
        </CardContent>
      </Card>

      <BuyAgainModal
        isOpen={isBuyAgainModalOpen}
        onClose={() => setIsBuyAgainModalOpen(false)}
        order={order}
      />
    </>
  );
}
