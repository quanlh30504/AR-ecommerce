"use client";
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const BannerManager = dynamic(() => import('@/Components/admin/banner/BannerManager'), { ssr: false });

export default function BannerManagerClient() {
    return (
        <div className="space-y-6">
            <Suspense fallback={<div>Đang tải banner...</div>}>
                <BannerManager />
            </Suspense>
        </div>
    );
}
