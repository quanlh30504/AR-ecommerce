'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/Components/ui/dialog";
import { Button } from "@/Components/ui/button";
import { IBanner } from "@/models/Banner";

interface DeleteBannerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner: IBanner | null;
    onConfirm: () => void;
    isPending: boolean;
}

export default function DeleteBannerDialog({
    open,
    onOpenChange,
    banner,
    onConfirm,
    isPending
}: DeleteBannerDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận xóa banner</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn xóa banner &quot;{banner?.title}&quot;?
                        Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? 'Đang xóa...' : 'Xóa'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
