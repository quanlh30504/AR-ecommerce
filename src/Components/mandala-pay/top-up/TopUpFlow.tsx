'use client';

import { useState } from "react";
import SelectMethodStep from "./SelectMethodStep";
import SelectAmountStep from "./SelectAmountStep";
import ShowQrStep from "./ShowQrStep"; 

type TopUpStep = 'select_method' | 'select_amount' | 'show_qr';

export default function TopUpFlow() {
  const [step, setStep] = useState<TopUpStep>('select_method');
  const [qrData, setQrData] = useState(null); 

 
  return (
    <div className="space-y-4">

      {step === 'select_method' && (
        <SelectMethodStep 
          onSelectMethod={(method) => {
            if (method === 'qr') setStep('select_amount');
            else alert('Chức năng đang được phát triển!');
          }} 
        />
      )}

      {step === 'select_amount' && (
        <SelectAmountStep 
          onQrGenerated={(data) => {
            setQrData(data); 
            setStep('show_qr'); 
          }}
        />
      )}

      {step === 'show_qr' && qrData && (
        <ShowQrStep qrData={qrData} />
      )}
    </div>
  );
}
