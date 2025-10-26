import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProductFormData } from '@/lib/validations/forms';

interface ProductBasicInfoSectionProps {
    register: UseFormRegister<ProductFormData>;
    errors: FieldErrors<ProductFormData>;
}

const ProductBasicInfoSection: React.FC<ProductBasicInfoSectionProps> = ({ register, errors }) => (
    <Card>
        <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                        id="name"
                        {...register('name')}
                        placeholder="Nhập tên sản phẩm"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="sku">Mã SKU *</Label>
                    <Input
                        id="sku"
                        {...register('sku')}
                        placeholder="Ví dụ: MYPHAM-001"
                    />
                    {errors.sku && <p className="text-red-500 text-xs mt-1">{errors.sku.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="shortDescription">Mô tả ngắn</Label>
                <Input
                    id="shortDescription"
                    {...register('shortDescription')}
                    placeholder="Mô tả ngắn về sản phẩm"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Mô tả chi tiết</Label>
                <Textarea
                    id="description"
                    {...register('description')}
                    placeholder="Mô tả chi tiết về sản phẩm"
                    rows={4}
                />
            </div>
        </CardContent>
    </Card>
);

export default ProductBasicInfoSection;
