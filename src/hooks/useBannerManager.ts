import { useState } from 'react';
import toast from 'react-hot-toast';
import { IBanner } from '@/models/Banner';
import { getBanners } from '@/lib/actions/banner';
import { BANNER_TYPES } from '@/constants/bannerTypes';

export function useBannerManager() {
    const [banners, setBanners] = useState<IBanner[]>([]);
    const [filteredBanners, setFilteredBanners] = useState<IBanner[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [bannerTypes, setBannerTypes] = useState(BANNER_TYPES);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const result = await getBanners();
            if (result.success && result.data) {
                setBanners(result.data);
                updateBannerCounts(result.data);
                filterBanners(result.data, activeFilter);
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

    return {
        banners,
        filteredBanners,
        loading,
        activeFilter,
        bannerTypes,
        fetchBanners,
        updateBannerCounts,
        filterBanners,
        handleFilterChange,
        setBanners,
        setFilteredBanners,
        setLoading,
        setActiveFilter,
        setBannerTypes
    };
}
