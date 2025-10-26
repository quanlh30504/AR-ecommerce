
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAddresses } from "@/lib/actions/address";
import CartView from "@/app/cart/components/CartView";

export default async function CartPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?error=CartAuthRequired");
  }

  const addressResponse = await getAddresses();
  const initialAddresses = addressResponse.success ? addressResponse.data : [];

  // Fetch cart mới nhất từ server
  // Đã chuyển CartStateSyncer lên layout, không cần fetch cart ở đây nữa

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-primary">GIỎ HÀNG</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <CartView
            initialAddresses={JSON.parse(JSON.stringify(initialAddresses))}
          />
        </div>
      </div>
    </div>
  );
}
