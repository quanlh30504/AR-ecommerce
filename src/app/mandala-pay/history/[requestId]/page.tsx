import { getTopUpRequestById } from "@/lib/actions/history";
import Header from "@/Components/mandala-pay/shared/Header";
import ShowQrStep from "@/Components/mandala-pay/top-up/ShowQrStep";
import TransactionNotFound from "@/Components/mandala-pay/history/TransactionNotFound";

interface DetailPageProps {
  params: {
    requestId: string;
  }
}

export default async function TopUpDetailPage({ params }: DetailPageProps) {
  const requestData = await getTopUpRequestById(params.requestId);

  return (
    <div className="w-full max-w-md mx-auto">
      <Header />
      <main className="p-4 flex justify-center mt-8">
        {requestData ? (
          <ShowQrStep qrData={{
            qrImageUrl: requestData.payment.qrImageUrl,
            amount: requestData.amount.base,
            requestCode: requestData.requestCode,
            expiresAt: new Date(requestData.expiresAt),
            bonusAmount: requestData.amount.bonus,
          }} />
        ) : (
          <TransactionNotFound />
        )}
      </main>
    </div>
  );
}
