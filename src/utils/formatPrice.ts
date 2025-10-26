/**
 * Format price to Vietnamese currency format
 * @param price - The price to format
 * @param currency - The currency symbol (default: '₫')
 * @returns Formatted price string
 */
export const formatPrice = (price: number, currency: string = '₫'): string => {
    return `${price.toLocaleString('vi-VN')}${currency}`;
};

/**
 * Format price with discount calculation
 * @param originalPrice - The original price
 * @param salePrice - The sale price
 * @param currency - The currency symbol (default: '₫')
 * @returns Object with formatted prices and discount percentage
 */
export const formatPriceWithDiscount = (
    originalPrice: number,
    salePrice: number,
    currency: string = '₫'
) => {
    const discount = originalPrice > salePrice ?
        Math.round(((originalPrice - salePrice) / originalPrice) * 100) : 0;

    return {
        originalPrice: formatPrice(originalPrice, currency),
        salePrice: formatPrice(salePrice, currency),
        discount: discount > 0 ? `${discount}%` : null,
        hasDiscount: discount > 0
    };
};
