'use client';
import React from 'react';

interface ProductCounterProps {
    count: number;
    className?: string;
}

const ProductCounter: React.FC<ProductCounterProps> = ({ count, className = "" }) => {
    return (
        <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
            <svg className="w-4 h-4 mr-2 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="font-semibold">{count}</span>
            <span className="ml-1">sản phẩm</span>
        </div>
    );
};

export default ProductCounter;
