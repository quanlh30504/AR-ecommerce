import Header from "@/Components/mandala-pay/shared/Header";
import { getTopUpHistory } from "@/lib/actions/history";
import TransactionHistoryList from "@/Components/mandala-pay/history/TransactionHistoryList";

export default async function HistoryPage() {
  const history = await getTopUpHistory({ page: 1 });

  return (
    <div className="w-full max-w-md mx-auto">
      <Header />
      <main className="p-4">
        <h1 className="text-2xl font-bold mb-4">Lịch sử Giao dịch</h1>
        <TransactionHistoryList initialHistory={history} />
      </main>
    </div>
  );
}
