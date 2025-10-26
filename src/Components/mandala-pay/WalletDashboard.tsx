'use client';

import Header from '@/Components/mandala-pay/shared/Header';
import BalanceCard from '@/Components/mandala-pay/home/BalanceCard ';
import PrimaryActions from '@/Components/mandala-pay/home/PrimaryActions';
import LinkBankAccountCTA from '@/Components/mandala-pay/home/LinkBankAccountCTA';
import ServiceMenu from '@/Components/mandala-pay/home/ServiceMenu';
import { IWallet } from '@/models/Wallet'; // Import interface từ model

export default function WalletDashboard({ walletData }: { walletData: IWallet }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Header />
      <div className="p-4 space-y-6">
        <BalanceCard balance={walletData.balance} />
        <PrimaryActions />
        <LinkBankAccountCTA />
        <ServiceMenu />
      </div>
    </div>
  );
}
