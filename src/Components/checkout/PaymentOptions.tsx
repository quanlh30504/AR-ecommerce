"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { placeOrder, placeOrderWithWallet } from "@/lib/actions/order";
import { Button } from "@/Components/ui/button";
import { Card, CardContent } from "@/Components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/Components/ui/radio-group";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Loader2 } from "lucide-react";
import type { PaymentMethod } from "@/models/Order";
import type { PopulatedCartItem } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils";
import PinVerificationModal from "@/Components/mandala-pay/PinVerificationModal";
import type { UserHeaderData } from "@/lib/actions/user";
import Link from "next/link";

interface PaymentOptionsProps {
  selectedAddressId: string | undefined;
  userData: UserHeaderData | null; // Thay thế mandalaPayBalance bằng userData
  checkoutItems: PopulatedCartItem[];
  shippingFee: number;
}

export default function PaymentOptions({
  selectedAddressId,
  userData,
  checkoutItems = [],
  shippingFee,
}: PaymentOptionsProps) {
  const { clearOrderedItems } = useCartStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");
  const [isPending, startTransition] = useTransition();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const hasWallet = !!userData?.wallet;
  const currentBalance = userData?.wallet?.balance ?? 0;

  const { totalOriginal, totalDiscount, grandTotal } = useMemo(() => {
    const original = checkoutItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    );
    const final = checkoutItems.reduce(
      (acc, item) =>
        acc + (item.product.salePrice ?? item.product.price) * item.quantity,
      0
    );

    return {
      totalOriginal: original,
      totalDiscount: original - final,
      grandTotal: final + shippingFee,
    };
  }, [checkoutItems, shippingFee]);

  
  const executePlaceOrder = (pin?: string) => {
    startTransition(async () => {
      const itemIds = checkoutItems.map((item) => item._id);
      const result = await placeOrder({
        selectedCartItemIds: itemIds,
        shippingAddressId: selectedAddressId!,
        paymentMethod: paymentMethod,
        pin: pin, // Truyền mã PIN vào action
      });

      if (result.success) {
        toast.success(result.message);
        clearOrderedItems(itemIds);
        router.push(`/profile/orders/${result.orderId}`);
      } else {
        toast.error(result.message);
      }
    });
  };

  // 3. HÀM XỬ LÝ NÚT ĐẶT HÀNG CHÍNH
  const handlePlaceOrderClick = () => {
    if (!selectedAddressId) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    if (paymentMethod === "MandalaPay") {
      // Nếu là MandalaPay, chỉ mở modal để lấy PIN
      setIsPinModalOpen(true);
    } else {
      // Với các phương thức khác, gọi thẳng action không cần PIN
      executePlaceOrder();
    }
  };

  return (
    <div className="space-y-6">
      <PinVerificationModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        // Khi xác nhận PIN, modal sẽ gọi lại hàm executePlaceOrder với mã PIN
        onSuccess={(pin) => {
            setIsPinModalOpen(false);
            executePlaceOrder(pin);
        }}
        title="Xác nhận Thanh toán"
        description={`Bạn sắp thanh toán ${formatCurrency(grandTotal)} cho đơn hàng.`}
      />
      {/* Card Tóm tắt đơn hàng */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <p>Tạm tính</p>
              <p>{formatCurrency(totalOriginal)}</p>
            </div>
            <div className="flex justify-between text-sm text-red-400">
              <p>Giảm giá</p>
              <p>- {formatCurrency(totalDiscount)}</p>
            </div>
            <div className="flex justify-between text-sm">
              <p>Phí vận chuyển</p>
              <p>{formatCurrency(shippingFee)}</p>
            </div>
          </div>
          <div className="border-t my-4"></div>
          <div className="flex justify-between font-semibold">
            <p>Tổng tiền</p>
            <p className="text-red-600 text-lg">{formatCurrency(grandTotal)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Card Lựa chọn thanh toán */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Chọn hình thức thanh toán</h3>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
          >
            <Label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
              <RadioGroupItem value="COD" id="cod" className="mr-3" />
              Thanh toán khi nhận hàng (COD)
            </Label>
            <Label
              // Luôn hiển thị Label, nhưng style và hành vi sẽ thay đổi
              className={`flex flex-col items-start p-4 border rounded-lg transition-colors
        ${
          !hasWallet || currentBalance < grandTotal
            ? "bg-muted/50 opacity-70" // Làm mờ nếu chưa có ví hoặc không đủ tiền
            : "cursor-pointer has-[:checked]:border-primary has-[:checked]:ring-1 has-[:checked]:ring-primary"
        }`}
            >
              <div className="flex items-center w-full">
                <RadioGroupItem
                  value="MandalaPay"
                  id="mandala"
                  className="mr-3"
                  // Vô hiệu hóa nút radio nếu chưa có ví hoặc không đủ tiền
                  disabled={!hasWallet || currentBalance < grandTotal}
                />
                Thanh toán bằng ví MandalaPay
              </div>

              {/* --- LOGIC HIỂN THỊ CÓ ĐIỀU KIỆN --- */}
              {hasWallet ? (
                // TRƯỜNG HỢP 1: ĐÃ CÓ VÍ
                <p
                  className={`text-sm ml-8 ${
                    currentBalance < grandTotal
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  Số dư: {formatCurrency(currentBalance)}
                  {currentBalance < grandTotal && " (Không đủ)"}
                </p>
              ) : (
                // TRƯỜNG HỢP 2: CHƯA CÓ VÍ
                <div className="text-sm ml-8">
                  <span className="text-muted-foreground">
                    Bạn chưa có ví Mandala Pay.
                  </span>
                  {/* Link sẽ mở trang kích hoạt trong một tab mới */}
                  <Link
                    href="/mandala-pay"
                    target="_blank"
                    className="font-semibold text-primary hover:underline ml-1"
                    onClick={(e) => e.stopPropagation()} // Ngăn không cho việc click vào link làm chọn radio button
                  >
                    Kích hoạt ngay
                  </Link>
                </div>
              )}
            </Label>
            <Label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:border-blue-500 has-[:checked]:ring-1 has-[:checked]:ring-blue-500">
              <RadioGroupItem value="CreditCard" id="card" className="mr-3" />
              Thẻ Tín dụng/Ghi nợ
            </Label>
            {paymentMethod === "CreditCard" && (
              <div className="p-4 border-t space-y-3">
                <p className="text-sm font-medium text-muted-foreground">
                  Giao diện demo
                </p>
                <Input placeholder="Số thẻ" disabled />
              </div>
            )}
          </RadioGroup>

          <Button
            className="w-full mt-6 text-lg h-12 bg-red-600 hover:bg-red-700"
            disabled={
              isPending ||
              checkoutItems.length === 0 ||
              !selectedAddressId ||
              (paymentMethod === "MandalaPay" && currentBalance < grandTotal)
            }
            onClick={handlePlaceOrderClick}
          >
            {isPending ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              "ĐẶT HÀNG"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
