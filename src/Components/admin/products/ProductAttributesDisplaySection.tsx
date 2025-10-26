import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import React from 'react';

interface ProductAttributesDisplaySectionProps {
    attributes: Record<string, string | Record<string, string>>;
}

const ProductAttributesDisplaySection: React.FC<ProductAttributesDisplaySectionProps> = ({ attributes }) => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    return (
        <Card>
            <CardHeader>
                <CardTitle>Thuộc tính sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(attributes).map(([key, value]) => (
                        <div key={key}>
                            <p className="text-sm font-medium text-muted-foreground capitalize">{key}</p>
                            <p className="text-sm">
                                {typeof value === 'object' && value !== null
                                    ? Object.entries(value).map(([k, v]) => `${k}: ${v}`).join(', ')
                                    : String(value)}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductAttributesDisplaySection;
