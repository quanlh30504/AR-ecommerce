"use client";

import { useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { IOrder } from "@/models/Order";
import { cancelOrderByUser } from "@/lib/actions/order";

import { Button } from "@/Components/ui/button";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
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

const cancelReasons = [
  "Thay đổi địa chỉ giao hàng",
  "Thay đổi sản phẩm/số lượng",
  "Phí vận chuyển quá cao",
  "Trùng đơn hàng/Đặt nhầm",
  "Chờ lâu quá",
  "Tìm thấy lựa chọn tốt hơn",
  "Không muốn mua nữa",
];

interface CancelOrderDialogProps {
  order: IOrder;
  onOrderUpdate: (updatedOrder: IOrder) => void;
}

export default function CancelOrderDialog({
  order,
  onOrderUpdate,
}: CancelOrderDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(cancelReasons[0]);
  const [otherReason, setOtherReason] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    const finalReason =
      selectedReason === "other" ? otherReason.trim() : selectedReason;
    if (!finalReason) {
      toast.error("Vui lòng chọn hoặc nhập lý do hủy đơn.");
      return;
    }

    startTransition(async () => {
      const result = await cancelOrderByUser(order._id.toString(), finalReason);
      if (result.success && result.data) {
        toast.success(result.message);
        onOrderUpdate(result.data);
        setIsOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={isPending}>
          Hủy đơn hàng
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Xác nhận Hủy Đơn hàng #{order.orderId}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {cancelReasons.map((reason) => (
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

          {selectedReason === "other" && (
            <Textarea
              placeholder="Vui lòng nhập lý do cụ thể..."
              value={otherReason}
              onChange={(e) => setOtherReason(e.target.value)}
              className="mt-2"
            />
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Quay lại</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Đang xử lý..." : "Xác nhận Hủy"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
