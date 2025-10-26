"use client";
import React, { useState, useCallback, useMemo } from "react";
import { addItemToCart } from '@/lib/actions/cart';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'react-hot-toast';
import { IProduct } from "@/models/Product";
import { ICategory } from "@/models/Category";
import { useCompareStore } from "@/store/useCompareStore";
import { X, Scale } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import SafeImage from "@/Components/SafeImage";
import CompareModal from "./CompareModal";

interface CompareBoxProps {
  categories: ICategory[];
}

const CompareBox: React.FC<CompareBoxProps> = ({ categories }) => {
  const { compareProducts, removeFromCompare, clearCompare } = useCompareStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { syncCart } = useCartStore();

  const hasProducts = useMemo(() => compareProducts.length > 0, [compareProducts.length]);
  const canCompare = useMemo(() => compareProducts.length >= 2, [compareProducts.length]);

  const handleAddToCart = useCallback(async (product: IProduct) => {
    const res = await addItemToCart(String(product._id), 1);
    if (res.success) {
      toast.success('Đã thêm sản phẩm vào giỏ hàng!');
      // Chỉ đồng bộ cart nếu API trả về cart mới
      if (res.data && typeof res.data === 'object' && 'cart' in res.data && (res.data as any).cart) {
        syncCart((res.data as any).cart);
      }
      // Nếu không có cart trả về thì không gọi syncCart, tránh lỗi undefined
    } else {
      toast.error(res.message || 'Thêm vào giỏ hàng thất bại!');
    }
  }, [syncCart]);

  const handleClearCompare = useCallback(() => {
    clearCompare();
  }, [clearCompare]);

  const handleRemoveFromCompare = useCallback((productId: string) => {
    removeFromCompare(productId);
  }, [removeFromCompare]);

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
            SO SÁNH SẢN PHẨM ({compareProducts.length}/3)
          </h4>
          {hasProducts && (
            <button
              onClick={handleClearCompare}
              className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {!hasProducts ? (
          <div className="text-center py-8">
            <Scale className="mx-auto text-gray-300 dark:text-gray-600 text-2xl mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Bạn chưa có sản phẩm để so sánh
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Nhấp vào sản phẩm để thêm vào so sánh
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              {compareProducts.map((product) => (
                <div
                  key={String(product._id)}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <SafeImage
                      src={product.images?.[0] || ""}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                      fallbackClassName="w-10 h-10 rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">
                      {formatPrice(product.salePrice)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCompare(String(product._id))}
                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="text-xs" />
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleOpenModal}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white py-2 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Scale className="text-xs" />
                So sánh chi tiết
              </button>

              {canCompare && (
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Tối đa 3 sản phẩm
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Compare Modal */}
      <CompareModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        products={compareProducts}
        categories={categories}
        onRemoveProduct={handleRemoveFromCompare}
        onAddToCart={handleAddToCart}
      />
    </>
  );
};

export default React.memo(CompareBox);
