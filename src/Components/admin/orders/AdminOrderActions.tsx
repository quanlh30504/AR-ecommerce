'use client';

import { useTransition } from 'react';
import { IOrder } from '@/models/Order';
import { Button } from '@/Components/ui/button';
import { toast } from 'react-hot-toast';

// Import các component con
import ShipOrderDialog from './ShipOrderDialog';
import CancelOrderDialog from './CancelOrderDialogAdmin';

// Import các server actions
import {
    confirmOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
    completeOrder
} from '@/lib/actions/admin/order';

interface AdminOrderActionsProps {
    order: IOrder;
    onStatusUpdate: (updatedOrder: IOrder) => void;
}

export default function AdminOrderActions({ order, onStatusUpdate }: AdminOrderActionsProps) {
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: Function, ...args: any[]) => {
        startTransition(async () => {
            const result = await action(order._id.toString(), ...args);
            if (result.success && result.data) {
                toast.success(result.message);
                onStatusUpdate(result.data);
            } else {
                toast.error(result.message);
            }
        });
    };

    // Render các nút hành động dựa trên trạng thái đơn hàng
    const renderActions = () => {
        const actionWrapperClasses = "flex flex-wrap justify-end gap-2 items-center";

        switch (order.status) {
            case 'pending':
                return (
                    <div className={actionWrapperClasses}>
                        {/* Hủy đơn là hành động phụ, dùng variant 'destructive' */}
                        <CancelOrderDialog
                            disabled={isPending}
                            onConfirm={(reason) => handleAction(cancelOrder, reason)}
                        />
                        {/* Xác nhận là hành động chính */}
                        <Button onClick={() => handleAction(confirmOrder)} disabled={isPending}>
                            Xác nhận Đơn hàng
                        </Button>
                    </div>
                );

            case 'processing':
                return (
                    <div className={actionWrapperClasses}>
                         {/* Hủy đơn là hành động phụ */}
                        <CancelOrderDialog
                            disabled={isPending}
                            onConfirm={(reason) => handleAction(cancelOrder, reason)}
                        />
                        {/* Giao hàng là hành động chính */}
                        <ShipOrderDialog
                            disabled={isPending}
                            onConfirm={(trackingCode) => handleAction(shipOrder, trackingCode)}
                        />
                    </div>
                );

            case 'shipped':
                return (
                    <div className={actionWrapperClasses}>
                        <Button onClick={() => handleAction(deliverOrder)} disabled={isPending}>
                            Đánh dấu Đã giao
                        </Button>
                    </div>
                );

            case 'delivered':
                return (
                    <div className={actionWrapperClasses}>
                        <Button onClick={() => handleAction(completeOrder)} disabled={isPending}>
                            Hoàn tất Đơn hàng
                        </Button>
                    </div>
                );

            default:
                // Các trạng thái như completed, cancelled, returned không có hành động
                return <p className="text-sm text-muted-foreground">Không có hành động nào khả dụng.</p>;
        }
    };

    return (
        <div className="mt-4 flex justify-end">
            {renderActions()}
        </div>
    );
}
