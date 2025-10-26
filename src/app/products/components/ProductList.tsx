'use client';
import React from 'react';
import { Product } from '@/types/product';
import ProductListItem from './ProductListItem';

interface ProductListProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (product: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddToCart,
  onToggleFavorite
}) => {
  return (
    <div className="space-y-4">
      {products.map((product) => (
        <ProductListItem
          key={String(product._id) || product.productId}
          product={product}
          onAddToCart={onAddToCart}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
};

export default React.memo(ProductList);
