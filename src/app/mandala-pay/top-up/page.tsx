import Header from "@/Components/mandala-pay/shared/Header";
import TopUpFlow from "@/Components/mandala-pay/top-up/TopUpFlow"; 
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function TopUpPage() {
  // đăng nhập để vào trang này
  const session = await auth();
  if (!session?.user) {
    redirect('/sign-in');
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Header />
      <main className="p-4">
        <TopUpFlow />
      </main>
    </div>
  );
}
