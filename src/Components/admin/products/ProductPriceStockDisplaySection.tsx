import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import React from 'react';

interface ProductPriceStockDisplaySectionProps {
    price: number;
    salePrice?: number;
    stock: number;
    discountPercentage?: number;
    formatPrice: (price: number) => string;
}

const ProductPriceStockDisplaySection: React.FC<ProductPriceStockDisplaySectionProps> = ({
    price,
    salePrice,
    stock,
    discountPercentage,
    formatPrice,
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Giá và kho hàng</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Giá gốc</p>
                    <p className="text-lg font-semibold">{formatPrice(price)}</p>
                </div>
                {salePrice && salePrice < price && (
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Giá khuyến mãi</p>
                        <p className="text-lg font-semibold text-red-600">{formatPrice(salePrice)}</p>
                    </div>
                )}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Tồn kho</p>
                    <p className={`text-lg font-semibold ${stock === 0 ? 'text-red-500' : stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {stock}
                    </p>
                </div>
            </div>
            {discountPercentage && discountPercentage > 0 && (
                <div className="mt-4">
                    <p className="text-sm font-medium text-muted-foreground">Phần trăm giảm giá</p>
                    <p className="text-lg font-semibold text-green-600">{discountPercentage}%</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default ProductPriceStockDisplaySection;
