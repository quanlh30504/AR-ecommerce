'use client';

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Wallet } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { UserHeaderData } from "@/lib/actions/user"; 
import PinVerificationModal from '@/Components/mandala-pay/PinVerificationModal'; 

interface MandalaPayButtonProps {
  userData: UserHeaderData | null;
}

export default function MandalaPayButton({ userData }: MandalaPayButtonProps) {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false); 
  const router = useRouter(); 

  if (!userData) {
    return null;
  }

  const hasWallet = userData.wallet !== undefined;

  return (
    <>
      <Link
        href="/mandala-pay"
        className="flex items-center gap-2 text-gray-700 dark:text-gray-200 p-2 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Wallet className="h-7 w-7 text-primary flex-shrink-0" />

        {hasWallet ? (
          <div className="flex flex-col text-left">
            <span className="text-xs text-muted-foreground">Ví Mandala</span>
            <span className="text-sm font-bold">
              {formatCurrency(userData.wallet!.balance ?? 0)}
            </span>
          </div>
        ) : (
          <div className="flex flex-col text-left">
            <span className="text-sm font-bold">Ví Mandala Pay</span>
            <span className="text-xs text-green-600 font-semibold">
              Kích hoạt ngay
            </span>
          </div>
        )}
      </Link>
    </>
  );
}
