import OrderTabs from "@/Components/order/OrderTabs";
import OrderList from "@/Components/order/OrderList";

export default function MyOrdersPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Đơn hàng của tôi</h1>
            <OrderTabs />
            <OrderList />
        </div>
    );
}
