'use client';

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { initiateQrTopUp } from "@/lib/actions/topup";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { toast } from "react-hot-toast";

const defaultSuggestions = [50000, 100000, 200000, 500000];
const MIN_AMOUNT = 2000;
const MAX_AMOUNT = 50000000;

function SubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    return <Button type="submit" disabled={pending || disabled} className="w-full">{pending ? 'Đang tạo mã...' : 'Tạo mã QR'}</Button>;
}

interface SelectAmountStepProps {
  onQrGenerated: (data: { bonusAmount: number; [key: string]: unknown }) => void;
}

export default function SelectAmountStep({ onQrGenerated }: SelectAmountStepProps) {
  const [amount, setAmount] = useState(0); 
  const [inputValue, setInputValue] = useState(''); 
  const [suggestions, setSuggestions] = useState(defaultSuggestions);

  const [state, formAction] = useFormState(initiateQrTopUp, undefined);
  
  useEffect(() => {
    if (state?.success && state.data) {
        let successMessage = "Tạo mã QR thành công!";
        if(state.data.bonusAmount > 0) {
            successMessage += ` Bạn được thưởng ${state.data.bonusAmount.toLocaleString('vi-VN')}đ!`;
        }
        toast.success(successMessage);
        onQrGenerated(state.data);
    } else if (state?.message && !state.success) {
        toast.error(state.message);
    }
  }, [state, onQrGenerated]);

  // Hàm xử lý khi nhấn vào nút gợi ý
  const handleSuggestionClick = (value: number) => {
    setAmount(value);
    setInputValue(value.toLocaleString('vi-VN')); 
  };

  // Hàm validate data và xử lý khi người dùng nhập vào ô input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ''); 
    const numericValue = parseInt(rawValue, 10) || 0;
    
    if (numericValue > MAX_AMOUNT) return;

    setAmount(numericValue);
    setInputValue(numericValue > 0 ? numericValue.toLocaleString('vi-VN') : '');

    if (numericValue > 0) {
        const newSuggestions = new Set<number>();

        // Thêm các bội số của 10
        if (numericValue * 10 < MAX_AMOUNT) newSuggestions.add(numericValue * 10);
        if (numericValue * 100 < MAX_AMOUNT) newSuggestions.add(numericValue * 100);
        if (numericValue * 1000 < MAX_AMOUNT) newSuggestions.add(numericValue * 1000);
        
        // Thêm các số tròn gần nhất
        const magnitude = Math.pow(10, Math.floor(Math.log10(numericValue)));
        if (numericValue + magnitude < MAX_AMOUNT) newSuggestions.add(Math.ceil((numericValue + 1) / magnitude) * magnitude);

        const finalSuggestions = Array.from(newSuggestions)
            .sort((a,b) => a-b)
            .filter(v => v >= MIN_AMOUNT && v <= MAX_AMOUNT);
            
        setSuggestions(finalSuggestions.length >= 2 ? finalSuggestions.slice(0,4) : defaultSuggestions);

    } else {
        setSuggestions(defaultSuggestions);
    }
  };

  const isSubmitDisabled = amount < MIN_AMOUNT;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chọn số tiền cần nạp</CardTitle>
        <CardDescription>
          Nhấn vào gợi ý hoặc nhập số tiền bạn muốn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <input type="hidden" name="amount" value={amount} />
          
          <div className="grid grid-cols-2 gap-4">
            {suggestions.map(value => (
              <Button 
                key={value}
                type="button"
                variant={amount === value ? "default" : "outline"}
                onClick={() => handleSuggestionClick(value)}
              >
                {value.toLocaleString('vi-VN')}đ
              </Button>
            ))}
          </div>
          
          <div className="relative flex items-center justify-center">
            <span className="absolute left-4 text-muted-foreground">VNĐ</span>
            <Input 
              type="text"
              inputMode="numeric" // Hiển thị bàn phím số trên mobile
              placeholder="Hoặc nhập số tiền khác"
              value={inputValue}
              onChange={handleInputChange}
              className="text-center text-lg tracking-wider pl-12"
            />
          </div>

          <div className="space-y-2">
              <label htmlFor="promoCode" className="text-sm font-medium">Mã khuyến mãi (nếu có)</label>
              <Input name="promoCode" id="promoCode" placeholder="Nhập mã khuyến mãi" />
          </div>
          
          <SubmitButton disabled={isSubmitDisabled} />
        </form>
      </CardContent>
    </Card>
  );
}
