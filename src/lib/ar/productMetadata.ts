import type { ARProductMetadata } from './types';

/**
 * Product metadata mapping by product name
 * This file contains AR adjustment settings for each product
 */
export const PRODUCT_METADATA_MAP: Record<string, ARProductMetadata> = {
  // Hat Products
  'hat_8': {
    eyeDistanceDivisor: 3000,
    initAdjustPosition: { x: 0, y: 0, z: -2.5 },
    initAdjustRotation: { x: 0, y: 0, z: 0 }
  },

  'hat_7': {
    eyeDistanceDivisor: 80,
    initAdjustPosition: { x: 0, y: -1.5, z: 0 },
    initAdjustRotation: { x: 0, y: 0, z: 0 }
  },
  
  'glass_7': {
    eyeDistanceDivisor: 550,
    initAdjustPosition: { x: 0, y: -1, z: 0 },
    initAdjustRotation: { x: 0, y: -1.57, z: 0 }
  },
  
  'glass_8': {
    eyeDistanceDivisor: 8,
    initAdjustPosition: { x: 0, y: 0, z: 0 },
    initAdjustRotation: { x: 0, y: 0, z: 0 }
  },
  
  // Add more products here...
};

/**
 * Default metadata for different product types
 * Used when specific product metadata is not found
 */
export const DEFAULT_METADATA_BY_TYPE: Record<string, ARProductMetadata> = {
  'hat': {
    eyeDistanceDivisor: 4500,
    initAdjustPosition: { x: 0, y: 0, z: 0 },
    initAdjustRotation: { x: 0.3, y: 0, z: 0 }
  },
  'glasses': {
    eyeDistanceDivisor: 500,
    initAdjustPosition: { x: 0, y: 0, z: 0 },
    initAdjustRotation: { x: 0, y: 0, z: 0 }
  },
};

/**
 * Get metadata for a product by name and type
 * @param productName - The name of the product
 * @param productType - The type of the product (hat, glasses, etc.)
 * @returns ARProductMetadata or undefined if not found
 */
export function getProductMetadata(productName: string, productType: string): ARProductMetadata | undefined {
  const metadata = PRODUCT_METADATA_MAP[productName];
  
  if (metadata) {
    return metadata;
  }
  
  return DEFAULT_METADATA_BY_TYPE[productType];
}

/**
 * Check if a product has specific metadata configuration
 * @param productName - The name of the product
 * @returns boolean
 */
export function hasProductMetadata(productName: string): boolean {
  return productName in PRODUCT_METADATA_MAP;
}
