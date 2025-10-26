import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { StatusBadge } from '@/Components/StatusBadge';
import React from 'react';
import type { Product } from '@/types/product';

interface ProductBasicInfoDisplaySectionProps {
    name: string;
    shortDescription: string;
    sku: string;
    slug: string;
    description?: string;
    isFeatured: boolean;
    isHotTrend: boolean;
    product: Product;
}

const ProductBasicInfoDisplaySection: React.FC<ProductBasicInfoDisplaySectionProps> = ({
    name,
    shortDescription,
    sku,
    slug,
    description,
    isFeatured,
    isHotTrend,
    product,
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-semibold text-lg">{name}</h3>
                    <p className="text-muted-foreground">{shortDescription}</p>
                </div>
                <div className="flex flex-col space-y-2">
                    <StatusBadge product={product} />
                    {isFeatured && <Badge variant="outline">Nổi bật</Badge>}
                    {isHotTrend && <Badge variant="outline">Xu hướng</Badge>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Mã SKU</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{sku}</code>
                </div>
                <div>
                    <p className="text-sm font-medium text-muted-foreground">Slug</p>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{slug}</code>
                </div>
            </div>
            {description && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Mô tả</p>
                    <p className="text-sm">{description}</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default ProductBasicInfoDisplaySection;
