'use client';

import { useState, useTransition } from "react";
import { IOrder } from "@/models/Order";
import { buyAgain } from "@/lib/actions/cart";

import { Button } from "@/Components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui/dialog";
import { Checkbox } from "@/Components/ui/checkbox";
import { Input } from "@/Components/ui/input";
import SafeImage from "../SafeImage";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface RebuyItemState {
    productId: string;
    quantity: number;
    selected: boolean;
}

interface BuyAgainModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: IOrder;
}

export default function BuyAgainModal({ isOpen, onClose, order }: BuyAgainModalProps) {
    const [items, setItems] = useState<RebuyItemState[]>(
        order.items.map(item => ({
            productId: item.productId.toString(),
            quantity: item.quantity,
            selected: true // Mặc định chọn tất cả
        }))
    );
    const [isPending, startTransition] = useTransition();

    const handleQuantityChange = (productId: string, quantity: number) => {
        setItems(prev => prev.map(item => 
            item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        ));
    };

    const handleSelectionChange = (productId: string) => {
        setItems(prev => prev.map(item =>
            item.productId === productId ? { ...item, selected: !item.selected } : item
        ));
    };

    const handleConfirm = () => {
        const itemsToRebuy = items
            .filter(item => item.selected && item.quantity > 0)
            .map(({ productId, quantity }) => ({ productId, quantity }));

        if (itemsToRebuy.length === 0) {
            toast.error("Vui lòng chọn ít nhất một sản phẩm.");
            return;
        }

        startTransition(async () => {
            const result = await buyAgain(itemsToRebuy);
            if(result?.success === false) { // Chỉ xử lý khi có lỗi, thành công sẽ tự redirect
                toast.error(result.message);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Mua lại sản phẩm</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto space-y-4 p-1">
                    {order.items.map((orderItem, index) => {
                        const currentItemState = items.find(i => i.productId === orderItem.productId.toString());
                        if (!currentItemState) return null;

                        return (
                            <div key={orderItem.productId.toString()} className="flex items-center gap-4">
                                <Checkbox 
                                    id={orderItem.productId.toString()}
                                    checked={currentItemState.selected}
                                    onCheckedChange={() => handleSelectionChange(orderItem.productId.toString())}
                                />
                                <SafeImage src={orderItem.image} alt={orderItem.name} width={64} height={64} className="rounded-md border"/>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm">{orderItem.name}</p>
                                </div>
                                <Input 
                                    type="number" 
                                    className="w-20"
                                    value={currentItemState.quantity}
                                    min={1}
                                    onChange={(e) => handleQuantityChange(orderItem.productId.toString(), parseInt(e.target.value, 10))}
                                />
                            </div>
                        );
                    })}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Hủy</Button>
                    <Button onClick={handleConfirm} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Thêm vào giỏ hàng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
