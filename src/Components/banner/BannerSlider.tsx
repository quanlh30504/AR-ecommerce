'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getActiveBannersByType } from '@/lib/actions/banner';
import { IBanner } from '@/models/Banner';
import { BANNER_DISPLAY } from '@/constants/banner';
import styles from './BannerSlider.module.css';

interface BannerSliderProps {
    type: 'sale' | 'advertisement';
    className?: string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
}

export default function BannerSlider({
    type,
    className = '',
    autoPlay = false,
    autoPlayInterval = 8000,
    showControls = true,
    showIndicators = true
}: BannerSliderProps) {
    const [banners, setBanners] = useState<IBanner[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                setLoading(true);
                setError(null);

                // Giả sử chúng ta có function để lấy tất cả banner active theo type
                const response = await getActiveBannersByType(type);
                if (response.success && response.data) {
                    setBanners(response.data);
                } else {
                    setBanners([]);
                }
            } catch (error) {
                console.error('Error fetching banners:', error);
                setError('Lỗi khi tải banner');
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, [type]);

    // Auto play functionality
    useEffect(() => {
        if (!autoPlay || banners.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, banners.length, autoPlayInterval]);

    const goToSlide = useCallback((index: number) => {
        setCurrentIndex(index);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }, [banners.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    // Animation variants
    const slideVariants = {
        hidden: { opacity: 0, x: 100 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        },
        exit: {
            opacity: 0,
            x: -100,
            transition: {
                duration: 0.5,
                ease: "easeInOut"
            }
        }
    };

    if (loading) {
        return (
            <div className={`bg-gray-200 h-48 md:h-64 lg:h-80 rounded-lg flex items-center justify-center animate-pulse ${className}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-2"></div>
                    <p className="text-gray-500">Đang tải banner...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 h-48 md:h-64 lg:h-80 rounded-lg flex items-center justify-center ${className}`}>
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!banners || banners.length === 0) {
        return (
            <div className={`bg-gray-100 h-48 md:h-64 lg:h-80 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 ${className}`}>
                <div className="text-center space-y-2">
                    <p className="text-gray-500">Không có banner {type === 'sale' ? 'Sale' : 'Advertisement'} active</p>
                    <p className="text-xs text-gray-400">Vui lòng kích hoạt banner trong trang quản trị</p>
                </div>
            </div>
        );
    }

    const displayClass = type === 'advertisement' ? styles.advertisement : styles.sale;

    return (
        <div
            className={`${styles['banner-slider']} ${displayClass} group ${className}`}
        >
            {/* Main slider container */}
            <div className="relative w-full h-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute inset-0"
                    >
                        <Image
                            src={banners[currentIndex].imageUrl}
                            alt={banners[currentIndex].title}
                            fill
                            className="object-cover rounded-lg shadow bg-white"
                            sizes="100vw"
                            priority={currentIndex === 0}
                            quality={95}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Controls */}
                {showControls && banners.length > 1 && (
                    <>
                        <button
                            onClick={goToPrevious}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            onClick={goToNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 shadow"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {/* Indicators */}
            {showIndicators && banners.length > 1 && (
                <div className="absolute bottom-4 right-4 z-10 flex space-x-2">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`
                                w-2 h-2 rounded-full transition-all duration-200
                                ${index === currentIndex
                                    ? 'bg-white scale-125 shadow-lg'
                                    : 'bg-white/50 hover:bg-white/75'
                                }
                            `}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
