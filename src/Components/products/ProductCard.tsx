"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart } from "lucide-react";
import FavoriteButton from "./FavoriteButton";
import { useFavorite } from "@/hooks/useFavorite";
import StarRating from "@/Components/products/StarRating";
import { Button } from "@/Components/ui/button";
import { Badge } from "@/Components/ui/badge";
import { Card, CardContent } from "@/Components/ui/card";
import { useState, useTransition, useCallback, useMemo } from "react";
import { formatCurrency } from "@/lib/utils";
import { buyNowAndRedirect } from "@/lib/actions/cart";
import toast from "react-hot-toast";
interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image: string;
  rating: {
    average: number;
    count: number;
  };
  isHotTrend?: boolean;
  isFeatured?: boolean;
}

const ProductCard = React.memo(function ProductCard({
  id,
  name,
  slug,
  price,
  salePrice,
  image,
  rating,
  isHotTrend,
  isFeatured,
}: ProductCardProps) {

  const [isPending, startTransition] = useTransition();

  const handleBuyNow = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await buyNowAndRedirect(id, 1);
        if (result?.error) {
          toast.error(result.error);
        }
      } catch (error) {
        // toast.error(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    });
  }, [id]);

  const discountPercentage = useMemo(() => {
    return salePrice ? Math.round(((price - salePrice) / price) * 100) : 0;
  }, [price, salePrice]);

  // wishlist logic
  const { favoriteIds, toggleFavorite } = useFavorite();
  const isFavorite = favoriteIds.includes(String(id));
  const [favPending, setFavPending] = useState(false);

  const handleFavoriteClick = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (favPending) return;
      try {
      setFavPending(true);
      await toggleFavorite(id);
    } catch (err) {
      // handled in hook
    } finally {
      setFavPending(false);
    }
  };

  return (
    <Card className="group hover:shadow-medium transition-all duration-300 overflow-hidden h-full flex flex-col bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="relative flex-shrink-0">
        <Link href={`/products/${slug}`}>
          <div className="aspect-square overflow-hidden bg-gray-50 dark:bg-gray-700">
            <Image
              src={image}
              alt={name}
              width={500}
              height={500}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isHotTrend && (
            <Badge variant="destructive" className="text-xs bg-red-500">
              HOT
            </Badge>
          )}
          {salePrice && (
            <Badge variant="secondary" className="text-xs">
              -{discountPercentage}%
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <div className="absolute top-2 right-2">
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
          />
        </div>

        {/* Quick Actions */}
        <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            className="w-full bg-[#8BC34A] hover:bg-[#7AB23C] text-white"
            size="sm"
            onClick={handleBuyNow}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            MUA HÀNG
          </Button>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col bg-white dark:bg-gray-800">
        <Link href={`/products/${slug}`} className="flex-1">
          <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-[#8BC34A] dark:hover:text-[#8BC34A] transition-colors min-h-[2.5rem] text-gray-900 dark:text-gray-100">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mb-3">
          <StarRating
            rating={rating.average || 0}
            size="sm"
            showValue={true}
            reviewCount={rating.count || 0}
            className=""
          />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto">
          {salePrice ? (
            <>
              <span className="font-bold text-[#8BC34A]">
                {formatCurrency(salePrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(price)}
              </span>
            </>
          ) : (
            <span className="font-bold text-foreground">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

export default ProductCard;
