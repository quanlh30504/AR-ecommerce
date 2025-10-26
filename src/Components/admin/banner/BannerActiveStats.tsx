'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";

interface BannerActiveStatsProps {
    activeSale: number;
    totalSale: number;
    activeAdvertisement: number;
    totalAdvertisement: number;
    totalActive: number;
    totalBanners: number;
}

export default function BannerActiveStats({
    activeSale,
    totalSale,
    activeAdvertisement,
    totalAdvertisement,
    totalActive,
    totalBanners
}: BannerActiveStatsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <span>Trạng thái Banner Active</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                        <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">Sale Banner</div>
                        <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                            {activeSale}/{totalSale}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300 mt-1">Active/Tổng số</div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <div className="text-sm text-green-600 dark:text-green-300 font-medium">Advertisement</div>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                            {activeAdvertisement}/{totalAdvertisement}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300 mt-1">Active/Tổng số</div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Tổng Active</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                            {totalActive}/{totalBanners}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">Tất cả loại</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
