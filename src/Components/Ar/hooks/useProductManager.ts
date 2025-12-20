import { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { getProductMetadata } from '@/lib/ar/productMetadata';

async function prefetchAsset(url: string, isImage: boolean): Promise<void> {
  if (isImage) {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
      img.onerror = () => resolve();
    });
  } else {
    return fetch(url, { method: 'GET', cache: 'force-cache', mode: 'cors' })
      .then(() => {})
      .catch(() => {});
  }
}

export function useProductManager() {
  const [productGlassesList, setProductGlassesList] = useState<Product[]>([]);
  const [productHatList, setProductHatList] = useState<Product[]>([]);
  
  const prefetchGlassesMapRef = useRef<Map<string, Promise<void>>>(new Map());
  const prefetchHatMapRef = useRef<Map<string, Promise<void>>>(new Map());

  useEffect(() => {
    const fetchProducts = async (type: 'glasses' | 'hat') => {
      try {
        const response = await fetch(`/api/models?type=${type}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        const result = await response.json();
        
        if (result.success) {
          const products: Product[] = result.data.map((item: Record<string, unknown>) => {
            const productName = item.name as string;
            const productType = item.type as string;
            const metadata = getProductMetadata(productName, productType);
            
            return {
              _id: item._id as string,
              name: productName,
              type: productType,
              url: item.url as string,
              thumbnailUrl: item.thumbnailUrl as string,
              metadata: metadata,
            };
          });

          if (type === 'glasses') {
            setProductGlassesList(products);
            
            products.forEach(p => {
              if (p.thumbnailUrl && !prefetchGlassesMapRef.current.has(p.thumbnailUrl)) {
                const promise = prefetchAsset(p.thumbnailUrl, true);
                prefetchGlassesMapRef.current.set(p.thumbnailUrl, promise);
              }
              if (p.url && !prefetchGlassesMapRef.current.has(p.url)) {
                const promise = prefetchAsset(p.url, false);
                prefetchGlassesMapRef.current.set(p.url, promise);
              }
            });
          } else {
            setProductHatList(products);
            
            products.forEach(p => {
              if (p.thumbnailUrl && !prefetchHatMapRef.current.has(p.thumbnailUrl)) {
                const promise = prefetchAsset(p.thumbnailUrl, true);
                prefetchHatMapRef.current.set(p.thumbnailUrl, promise);
              }
              if (p.url && !prefetchHatMapRef.current.has(p.url)) {
                const promise = prefetchAsset(p.url, false);
                prefetchHatMapRef.current.set(p.url, promise);
              }
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch ${type} products:`, error);
      }
    };

    fetchProducts('glasses');
    fetchProducts('hat');
  }, []);

  return {
    productGlassesList,
    productHatList,
  };
}
