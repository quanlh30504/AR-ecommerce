import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";

import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ProductFormData } from '@/lib/validations/forms';

interface PriceStockSectionProps {
    register: UseFormRegister<ProductFormData>;
    errors: FieldErrors<ProductFormData>;
}

const PriceStockSection: React.FC<PriceStockSectionProps> = ({ register, errors }) => (
    <Card>
        <CardHeader>
            <CardTitle>Giá và kho hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Giá gốc (VND) *</Label>
                    <Input
                        id="price"
                        type="number"
                        {...register('price', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                    />
                    {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="salePrice">Giá khuyến mãi (VND)</Label>
                    <Input
                        id="salePrice"
                        type="number"
                        {...register('salePrice', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Tồn kho *</Label>
                    <Input
                        id="stock"
                        type="number"
                        {...register('stock', { valueAsNumber: true })}
                        placeholder="0"
                        min="0"
                    />
                    {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="discountPercentage">Phần trăm giảm giá (%)</Label>
                <Input
                    id="discountPercentage"
                    type="number"
                    {...register('discountPercentage', { valueAsNumber: true })}
                    placeholder="0"
                    min="0"
                    max="100"
                />
            </div>
        </CardContent>
    </Card>
);

export default PriceStockSection;
