'use client';
import React, { useState } from 'react';
import { useCompareStore } from '@/store/useCompareStore';
import { ICategory } from '@/models/Category';
import { IProduct } from '@/models/Product';
import CompareModal from '@/app/products/components/CompareModal';
import { Scale } from 'lucide-react';

interface FloatingCompareButtonProps {
    categories: ICategory[];
    onAddToCart?: (product: IProduct) => void;
}

const FloatingCompareButton: React.FC<FloatingCompareButtonProps> = ({ categories, onAddToCart }) => {
    const { compareProducts, removeFromCompare } = useCompareStore();
    const compareCount = useCompareStore((state) => state.compareProducts.length);
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (compareCount === 0) return null;

    return (
        <>
            {/* Floating Compare Button */}
            <div className="fixed bottom-4 right-4 z-40">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[#8ba63a] hover:bg-[#7a942c] text-white p-3 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2"
                >
                    <Scale className="text-lg" />
                    <span className="bg-white text-[#8ba63a] rounded-full px-2 py-1 text-xs font-bold">
                        {compareCount}
                    </span>
                </button>
            </div>

            {/* Compare Modal */}
            <CompareModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                products={compareProducts}
                categories={categories}
                onRemoveProduct={removeFromCompare}
                onAddToCart={onAddToCart}
            />
        </>
    );
};

export default FloatingCompareButton;
