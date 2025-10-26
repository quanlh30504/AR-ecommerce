"use client";

import { useState } from "react";
import { IWallet } from "@/models/Wallet";
import PinVerificationForm from "./PinVerificationForm";
import WalletDashboard from "./WalletDashboard";

interface WalletGatekeeperProps {
  walletData: IWallet;
}

export default function WalletGatekeeper({
  walletData,
}: WalletGatekeeperProps) {
  const [isVerified, setIsVerified] = useState(false);

  if (isVerified) {
    return <WalletDashboard walletData={walletData} />;
  } else {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4">
        <PinVerificationForm onSuccess={() => setIsVerified(true)} />;
      </div>
    );
  }
}
