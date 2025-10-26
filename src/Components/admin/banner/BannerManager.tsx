'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import BannerList from './BannerList';
import BannerActiveStats from './BannerActiveStats';
import { IBanner } from '@/models/Banner';
import { getBanners } from '@/lib/actions/banner';
import toast from 'react-hot-toast';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { BANNER_TYPES } from '@/constants/bannerTypes';

export default function BannerManager() {
    const [banners, setBanners] = useState<IBanner[]>([]);
    const [filteredBanners, setFilteredBanners] = useState<IBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [bannerTypes, setBannerTypes] = useState(BANNER_TYPES);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const result = await getBanners();
            const bannersData: IBanner[] = Array.isArray(result.data) ? result.data : [];
            if (result.success) {
                setBanners(bannersData);
                updateBannerCounts(bannersData);
                filterBanners(bannersData, activeFilter);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Lỗi khi tải danh sách banner');
        } finally {
            setLoading(false);
        }
    };

    const updateBannerCounts = (bannerData: IBanner[]) => {
        const counts = {
            all: bannerData.length,
            sale: bannerData.filter(b => b.type === 'sale').length,
            advertisement: bannerData.filter(b => b.type === 'advertisement').length,
        };

        setBannerTypes(BANNER_TYPES.map(type => ({
            ...type,
            count: counts[type.value as keyof typeof counts] || 0
        })));
    };

    // Thống kê banner active
    const getActiveStats = () => {
        const saleBanners = banners.filter(b => b.type === 'sale');
        const advertisementBanners = banners.filter(b => b.type === 'advertisement');

        return {
            activeSale: saleBanners.filter(b => b.isActive).length,
            totalSale: saleBanners.length,
            activeAdvertisement: advertisementBanners.filter(b => b.isActive).length,
            totalAdvertisement: advertisementBanners.length,
            totalActive: banners.filter(b => b.isActive).length,
            totalBanners: banners.length
        };
    };

    const filterBanners = (bannerData: IBanner[], type: string) => {
        if (type === 'all') {
            setFilteredBanners(bannerData);
        } else {
            setFilteredBanners(bannerData.filter(banner => banner.type === type));
        }
    };

    const handleFilterChange = (value: string) => {
        setActiveFilter(value);
        filterBanners(banners, value);
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse" />
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            </div>
        );
    }

    return (
    <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Banner</h1>
                    <p className="font-bold text-gray-600 dark:text-gray-300 mt-1">
                        Quản lý các banner hiển thị trên website
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchBanners}
                        className="flex items-center gap-2"
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                    <Link href="/admin/banners/create">
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Tạo Banner
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {bannerTypes.map((type) => (
                    <Card key={type.value} className="text-center">
                        <CardContent className="pt-4">
                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                {type.count}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                {type.label}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Active Banner Status */}
            <BannerActiveStats {...getActiveStats()} />

            {/* Filter Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Lọc theo loại Banner</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {bannerTypes.map((type) => (
                            <Button
                                key={type.value}
                                variant={activeFilter === type.value ? "default" : "outline"}
                                onClick={() => handleFilterChange(type.value)}
                                className="flex items-center gap-2"
                            >
                                {type.label}
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${activeFilter === type.value
                                    ? 'bg-white dark:bg-gray-900 text-gray-800 dark:text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                    }`}>
                                    {type.count}
                                </span>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Banner List */}
            <BannerList banners={filteredBanners} onStatusChange={fetchBanners} />
        </div>
    );
}
