"use client";

import React from "react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useDebouncedCallback } from "use-debounce";

interface QuantitySelectorProps {
  cartItemId: string;
  initialQuantity: number;
  stock: number;
  onQuantityChange: (newQuantity: number) => void;
}

const QuantitySelector = React.memo(function QuantitySelector({
  cartItemId,
  initialQuantity,
  stock,
  onQuantityChange,
}: QuantitySelectorProps) {
  const { isPending } = useCartStore();
  const [quantity, setQuantity] = useState(initialQuantity);

  const debouncedOnQuantityChange = useDebouncedCallback(
    (newQuantity: number) => {
      onQuantityChange(newQuantity);
    },
    500
  );

  // Đồng bộ state nội bộ với prop từ cha khi nó thay đổi
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleDecrement = useCallback(() => {
    const newQuantity = Math.max(1, quantity - 1);
    setQuantity(newQuantity); // Cập nhật UI ngay lập tức
    debouncedOnQuantityChange(newQuantity); // Gọi hàm debounced
  }, [quantity, debouncedOnQuantityChange]);

  const handleIncrement = useCallback(() => {
    const newQuantity = Math.min(stock, quantity + 1);
    setQuantity(newQuantity); // Cập nhật UI ngay lập tức
    debouncedOnQuantityChange(newQuantity); // Gọi hàm debounced
  }, [quantity, stock, debouncedOnQuantityChange]);

  return (
    <div className="flex items-center">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleDecrement}
        disabled={isPending || quantity <= 1}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        className="h-8 w-14 text-center border-x-0 rounded-none focus-visible:ring-0"
        value={quantity}
        readOnly
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={handleIncrement}
        disabled={isPending || quantity >= stock}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
});

export default QuantitySelector;
