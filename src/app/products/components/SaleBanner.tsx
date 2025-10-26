'use client';

import React from 'react';
import SimpleBanner from '@/Components/banner/SimpleBanner';

const SaleBanner = () => {
  return (
    <SimpleBanner
      type="sale"
      className="w-full mb-6 lg:mb-8 shadow-lg h-48 md:h-64 lg:h-80 rounded"
    />
  );
};

export default React.memo(SaleBanner);
