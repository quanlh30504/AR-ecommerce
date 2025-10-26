"use client";
import React, { useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";
import { ShoppingCart, Scale } from "lucide-react";
import FavoriteButton from "@/Components/products/FavoriteButton";
import { useFavorite } from "@/hooks/useFavorite";
import toast from "react-hot-toast";
import { Button } from "@/Components/ui/button";
import SafeImage from "@/Components/SafeImage";
import StarRating from "@/Components/products/StarRating";
import { useCompareStore } from "@/store/useCompareStore";

interface ProductListItemProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}


import { getProductDiscount } from "@/lib/utils";

const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
}) => {
  const { favoriteIds, refreshFavorites, setFavoriteIds, toggleFavorite } = useFavorite();
  const router = useRouter();
  const { isInCompare, addToCompare, removeFromCompare } = useCompareStore();

  const discountInfo = useMemo(() => getProductDiscount(product), [product]);
  const { hasDiscount, discountPercent } = discountInfo;

  const isProductInCompare = isInCompare(String(product._id));

  const handleCompareClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const productId = String(product._id) || product.productId;

    const currentlyIn = isInCompare(String(product._id));
    if (currentlyIn) {
      removeFromCompare(productId);
    } else {
      addToCompare(product);
    }
  }, [isInCompare, removeFromCompare, addToCompare, product]);

  const handleProductClick = useCallback(() => {
    if (product.slug) {
      router.push(`/products/${product.slug}`);
    }
  }, [product.slug, router]);

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  }, [onAddToCart, product]);

  const handleToggleFavorite = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    // prefer parent handler
    if (onToggleFavorite) {
      onToggleFavorite(product);
      return;
    }

    (async () => {
      try {
  await toggleFavorite(product);
      } catch (err: any) {
  // handled in hook
      }
    })();
  }, [onToggleFavorite, product, favoriteIds, setFavoriteIds, refreshFavorites]);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden p-4 mb-4 ${isProductInCompare ? 'ring-2 ring-green-600/50' : ''}`}
      onClick={handleProductClick}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Product Image */}
        <div
          className="relative flex-shrink-0 w-full md:w-48 group/image cursor-pointer"
          onClick={handleProductClick}
        >
          <SafeImage
            src={product.images?.[0] || ""}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-48 md:h-32 object-cover rounded-lg transition-transform duration-300 group-hover/image:scale-105"
            fallbackClassName="w-full h-48 md:h-32 rounded-lg"
          />

          {/* Discount Badge */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
              -{discountPercent}%
            </div>
          )}

          {/* Button So sánh ở góc trên bên phải */}
          <Button
            size="icon"
            variant={isProductInCompare ? "default" : "secondary"}
            onClick={handleCompareClick}
            className={`absolute top-2 right-2 w-8 h-8 rounded-full transition-all duration-300 ${isProductInCompare
              ? "bg-green-600 text-white hover:bg-red-500"
              : "bg-white dark:bg-gray-700 bg-opacity-90 dark:bg-opacity-90 text-gray-600 dark:text-gray-300 hover:bg-green-600 hover:text-white"
              }`}
            title={
              isProductInCompare
                ? "Bỏ khỏi danh sách so sánh"
                : "Thêm vào so sánh"
            }
          >
            <Scale className="w-3 h-3" />
          </Button>
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col">
          {/* Product Details */}
          <div className="flex-1">
            {/* Brand */}
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {product.attributes?.brand || "Brand"}
            </p>

            {/* Product Name */}
            <h3
              className="font-semibold text-lg text-gray-800 dark:text-gray-200 mb-2 cursor-pointer hover:text-green-600 dark:hover:text-lime-400 transition-colors"
              onClick={handleProductClick}
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="mb-2">
              <StarRating
                rating={product.rating?.average || 0}
                size="sm"
                showValue={true}
                reviewCount={product.rating?.count || 0}
              />
            </div>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
              {product.shortDescription || product.description}
            </p>

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-green-600 dark:text-lime-400">
                  {product.salePrice.toLocaleString("vi-VN")}₫
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons - Now at bottom */}
          <div className="flex gap-2 mt-auto">
            <Button
              onClick={handleAddToCart}
              className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-lime-400 dark:hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              MUA HÀNG
            </Button>

            <FavoriteButton
              isFavorite={favoriteIds.includes(String(product._id))}
              onClick={handleToggleFavorite}
              title={favoriteIds.includes(String(product._id)) ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductListItem);
