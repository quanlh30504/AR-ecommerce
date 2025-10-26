'use client';

import { Card, CardContent } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface EmptyBannerStateProps {
    message?: string;
    buttonText?: string;
    createUrl?: string;
}

export default function EmptyBannerState({
    message = "Chưa có banner nào",
    buttonText = "Tạo Banner Đầu Tiên",
    createUrl = "/admin/banners/create"
}: EmptyBannerStateProps) {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center space-y-4">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">{message}</div>
                    <Link href={createUrl}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            {buttonText}
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
