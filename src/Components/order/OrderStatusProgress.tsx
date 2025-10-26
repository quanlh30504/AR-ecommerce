"use client";

import { OrderStatus } from "@/models/Order";
import { cn } from "@/lib/utils";
import {
  Check,
  Package,
  ReceiptText,
  Truck,
  Star,
  XCircle,
  Undo2,
} from "lucide-react";

const steps = [
  { status: "pending", label: "Đã đặt hàng", icon: ReceiptText },
  { status: "processing", label: "Đã xác nhận", icon: Package },
  { status: "shipped", label: "Đang giao hàng", icon: Truck },
  { status: "delivered", label: "Đã nhận hàng", icon: Check },
  { status: "completed", label: "Đánh giá", icon: Star },
];

const statusOrderMap: Record<OrderStatus, number> = {
  pending: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  completed: 5,
  cancelled: -1,
  returned: -2,
};

export default function OrderStatusProgress({
  status,
}: {
  status: OrderStatus;
}) {
  const currentStepIndex = statusOrderMap[status] ?? 0;

  if (status === "cancelled" || status === "returned") {
    const isCancelled = status === "cancelled";
    return (
      <div
        className={cn(
          "flex items-center justify-center p-4 rounded-lg font-semibold gap-2",
          isCancelled ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"
        )}
      >
        {isCancelled ? (
          <XCircle className="w-5 h-5" />
        ) : (
          <Undo2 className="w-5 h-5" />
        )}
        {isCancelled ? "Đơn hàng đã bị hủy" : "Đơn hàng đã bị trả"}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        
        const hasPassed = stepNumber <= currentStepIndex; 
        const isActive = stepNumber === currentStepIndex;
        const isCompleted = stepNumber < currentStepIndex; 

        return (
          <div key={step.status} className="flex-1 flex items-center">
            {/* Icon và Label */}
            <div className="flex flex-col items-center text-center w-24">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                  hasPassed
                    ? "bg-green-500 border-green-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 border-transparent text-muted-foreground",
                  isActive && "scale-110 shadow-lg ring-2 ring-offset-2 ring-green-500 dark:ring-offset-background"
                )}
              >
                <step.icon className="w-6 h-6" />
              </div>
              <p
                className={cn(
                  "mt-2 text-xs font-semibold transition-colors w-full",
                  hasPassed ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>

            {/* Đường kẻ nối */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-1 transition-colors duration-500",
                  isCompleted ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                )}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
