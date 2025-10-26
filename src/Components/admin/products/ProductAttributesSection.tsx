import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import React from "react";


interface ProductAttributesSectionProps {
    attributes: {
        brand?: string;
        type?: string;
        material?: string;
        color?: string;
        size?: string;
        weight?: string;
    };
    onChange: (value: { [key: string]: string }) => void;
}

const ProductAttributesSection: React.FC<ProductAttributesSectionProps> = ({ attributes = {}, onChange }) => {
    const handleChange = (key: string, value: string) => {
        onChange({ ...attributes, [key]: value });
    };
    const attributeFields = [
        { key: 'brand', label: 'Thương hiệu', placeholder: 'Ví dụ: Lancôme' },
        { key: 'type', label: 'Loại sản phẩm', placeholder: 'Ví dụ: Kem dưỡng ẩm' },
        { key: 'material', label: 'Chất liệu', placeholder: 'Ví dụ: Cotton' },
        { key: 'color', label: 'Màu sắc', placeholder: 'Ví dụ: Đỏ, Xanh' },
        { key: 'size', label: 'Kích thước', placeholder: 'Ví dụ: S, M, L, XL' },
        { key: 'weight', label: 'Trọng lượng', placeholder: 'Ví dụ: 50ml, 100g' },
    ];
    return (
        <Card>
            <CardHeader>
                <CardTitle>Thuộc tính sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {attributeFields.map(({ key, label, placeholder }) => (
                        <div className="space-y-2" key={key}>
                            <Label htmlFor={key}>{label}</Label>
                            <Input
                                id={key}
                                value={attributes[key as keyof typeof attributes] || ''}
                                onChange={(e) => handleChange(key, e.target.value)}
                                placeholder={placeholder}
                            />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductAttributesSection;
