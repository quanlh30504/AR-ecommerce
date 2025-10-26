"use client";

import { ITransaction } from "@/models/Transaction";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex justify-between items-center py-3 border-b border-dashed">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-right">{value}</span>
  </div>
);

export default function TransactionDetailCard({
  transaction,
}: {
  transaction: ITransaction;
}) {
  const router = useRouter();
  const topUpRequest = transaction.metadata?.topUpRequestId as any;
  const promoCode = topUpRequest?.promoCodeId as any;

  const isIncome = transaction.amount > 0;
  const statusVariant =
    transaction.status === "COMPLETED" ? "success" : "destructive";

  return (
    <Card className="w-full">
      <CardHeader className="text-center items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          {isIncome ? "Tiền nhận" : "Tiền chuyển"}
        </p>
        <p
          className={cn(
            "text-4xl font-bold tracking-tight",
            isIncome ? "text-green-600" : "text-foreground"
          )}
        >
          {isIncome ? "+" : "-"} {formatCurrency(Math.abs(transaction.amount))}
        </p>
        <Badge variant={statusVariant}>{transaction.status}</Badge>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="space-y-2">
          <DetailRow label="Loại giao dịch" value={transaction.type} />
          <DetailRow
            label="Thời gian"
            value={new Date(transaction.createdAt).toLocaleString("vi-VN")}
          />
          <DetailRow
            label="Mã giao dịch Mandala"
            value={transaction.metadata?.topUpRequestId?.requestCode || "N/A"}
          />{" "}
          {transaction.metadata?.bankTransactionId && (
            <DetailRow
              label="Mã giao dịch Ngân hàng"
              value={transaction.metadata.bankTransactionId}
            />
          )}
        </div>

        {/* --- Hiển thị chi tiết nạp tiền nếu có --- */}
        {topUpRequest && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="font-semibold mb-2">Chi tiết Nạp tiền</h3>
            <div className="space-y-2">
              <DetailRow
                label="Số tiền nạp"
                value={formatCurrency(topUpRequest.amount.base)}
              />
              {topUpRequest.amount.bonus > 0 && (
                <DetailRow
                  label={`Khuyến mãi (${promoCode?.code || "..."})`}
                  value={`+ ${formatCurrency(topUpRequest.amount.bonus)}`}
                />
              )}
              <DetailRow
                label="Tổng cộng"
                value={formatCurrency(topUpRequest.amount.total)}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button variant="destructive" className="w-full">
          Báo cáo sự cố
        </Button>
        <Button onClick={() => router.back()} className="w-full">
          Quay lại
        </Button>
      </CardFooter>
    </Card>
  );
}
