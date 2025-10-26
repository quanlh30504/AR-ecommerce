"use client";

import React from "react";
import Image from "next/image";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import QuantitySelector from "./QuantitySelector";
import { Trash2 } from "lucide-react";
import { useCartStore, PopulatedCartItem } from "@/store/useCartStore";
import { getImageUrl } from "@/lib/getImageUrl"
import { formatCurrency } from "@/lib/utils";
import { useCallback, useMemo } from "react";

interface CartItemProps {
  item: PopulatedCartItem;
}

const CartItem = React.memo(function CartItem({ item }: CartItemProps) {

  if (!item || !item.product) {
    console.error("CartItem received invalid data:", item);
    return (
      <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700 text-sm">
        Sản phẩm này không còn tồn tại và sẽ sớm được xóa khỏi giỏ hàng của bạn.
      </div>
    );
  }

  const { selectedItemIds, toggleItemSelected, removeItems, updateQuantity, isPending } = useCartStore();

  const isSelected = useMemo(() => {
    return selectedItemIds.includes(item._id);
  }, [selectedItemIds, item._id]);

  const handleRemove = useCallback(() => {
    removeItems([item._id]);
  }, [removeItems, item._id]);

  const handleToggleSelected = useCallback(() => {
    toggleItemSelected(item._id);
  }, [toggleItemSelected, item._id]);

  return (
    <div className="bg-card p-4 rounded-lg border border-border transition-colors">
      <div className="grid grid-cols-12 items-center gap-4 pt-4">
        <div className="col-span-1 flex justify-center">
          <Checkbox
            id={`item-${item._id}`}
            checked={isSelected}
            onCheckedChange={handleToggleSelected}
          />
        </div>
        <div className="col-span-2">
          <Image
            src={getImageUrl(item.product.images[0]) || "/products/placeholder.png"}
            alt={item.product.name}
            width={80}
            height={80}
            className="rounded-md object-cover"
          />
        </div>
        <div className="col-span-3">
          <p className="font-medium text-sm line-clamp-2 text-foreground">{item.product.name}</p>
        </div>
        <div className="col-span-2 text-center">
          <p className="font-semibold text-sm text-red-600 dark:text-red-400">
            {formatCurrency(item.product.salePrice || item.product.price)}
          </p>
          {item.product.salePrice && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(item.product.price)}
            </p>
          )}
        </div>
        <div className="col-span-2 flex flex-col items-center">
          <QuantitySelector
            cartItemId={item._id}
            initialQuantity={item.quantity}
            stock={item.product.stock}
            onQuantityChange={(newQuantity) => updateQuantity(item._id, newQuantity)}
          />
        </div>
        <div className="col-span-1 text-center font-semibold text-red-600 dark:text-red-400 text-sm">
          {formatCurrency((item.product.salePrice ?? item.product.price) * item.quantity)}
        </div>
        <div className="col-span-1 flex justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemove}
            disabled={isPending}
            className="hover:bg-destructive/10"
          >
            <Trash2 className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
          </Button>
        </div>
      </div>
    </div>
  );
});

export default CartItem;
