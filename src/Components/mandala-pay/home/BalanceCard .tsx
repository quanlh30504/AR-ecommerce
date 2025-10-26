'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';


interface BalanceCardProps {
  balance: number;
}

const BalanceCard = ({ balance }: BalanceCardProps) => {
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);

  const toggleVisibility = () => {
    setIsBalanceVisible((prev) => !prev);
  };

  return (
    <Card className="w-full bg-green-500 text-white shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-white/80">Tổng số dư</span>
            <span className="text-3xl font-bold tracking-tight">
              {isBalanceVisible ? formatCurrency(balance) : '****** ₫'}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleVisibility}
            className="text-white hover:bg-white/20 hover:text-white"
          >
            {isBalanceVisible ? (
              <EyeOff className="w-6 h-6" />
            ) : (
              <Eye className="w-6 h-6" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
