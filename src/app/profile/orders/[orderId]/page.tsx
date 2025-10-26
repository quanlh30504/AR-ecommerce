import { notFound } from "next/navigation";
import { getOrderDetails } from "@/lib/actions/order";
import OrderDetailsClient from "@/Components/order/OrderDetailsClient";
import type { IOrder } from "@/models/Order";

// render động để thấy dữ liệu mới nhất
export const dynamic = "force-dynamic";

export default async function OrderDetailPage(props: {
  params: { orderId: string } | Promise<{ orderId: string }>;
}) {
  const resolvedParams = await props.params;
  const orderId = resolvedParams.orderId;
  const response = await getOrderDetails(orderId);

  if (!response.success || !response.data) {
    notFound();
  }
  const order = response.data;

  return (
    <div>
      <OrderDetailsClient order={order as unknown as IOrder} />
    </div>
  );
}
