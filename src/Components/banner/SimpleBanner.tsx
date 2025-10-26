'use client';

import React from 'react';
import BannerSlider from './BannerSlider';

interface SimpleBannerProps {
    type: 'sale' | 'advertisement';
    className?: string;
    showBadge?: boolean;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
}

export default function SimpleBanner({
    type,
    className = '',
    showBadge = false,
    autoPlay = true,
    autoPlayInterval = 5000,
    showControls = true,
    showIndicators = true
}: SimpleBannerProps) {
    return (
        <BannerSlider
            type={type}
            className={className}
            autoPlay={autoPlay}
            autoPlayInterval={autoPlayInterval}
            showControls={showControls}
            showIndicators={showIndicators}
        />
    );
}
