'use client';

import React from 'react';
import SimpleBanner from '@/Components/banner/SimpleBanner';

const Advertisement = () => {
    return (
        <div className="hidden lg:block">
            <SimpleBanner
                type="advertisement"
                className="rounded-lg overflow-hidden shadow-sm h-64"
            />
        </div>
    );
};

export default React.memo(Advertisement);
