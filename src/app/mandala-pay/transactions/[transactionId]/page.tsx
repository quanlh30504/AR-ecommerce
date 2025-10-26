import { getTransactionDetails } from "@/lib/actions/transaction";
import Header from "@/Components/mandala-pay/shared/Header";
import TransactionDetailCard from "@/Components/mandala-pay/transactions/TransactionDetailCard";
import { notFound } from "next/navigation";

interface DetailPageProps {
  params: {
    transactionId: string;
  }
}

export default async function TransactionDetailPage({ params }: DetailPageProps) {
  const transactionData = await getTransactionDetails(params.transactionId);

  // Nếu không tìm thấy, hiển thị trang 404
  if (!transactionData) {
    notFound();
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Header />
      <main className="p-4 flex justify-center">
        <TransactionDetailCard transaction={transactionData} />
      </main>
    </div>
  );
}
