import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import type { ProductFormData } from '@/lib/validations/forms';
import type { UseFormSetValue, UseFormGetValues } from 'react-hook-form';

interface ProductImagesSectionProps {
    images: string[];
    uploadingImage: boolean;
    setValue: UseFormSetValue<ProductFormData>;
    getValues: UseFormGetValues<ProductFormData>;
    errors: Record<string, { message?: string }>;
    uploadImagesToCloudinary: (files: FileList) => Promise<string[]>;
}

const ProductImagesSection: React.FC<ProductImagesSectionProps> = ({
    images,
    uploadingImage,
    setValue,
    getValues,
    errors,
    uploadImagesToCloudinary
}) => {
    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const imageUrls = await uploadImagesToCloudinary(files);
        setValue('images', [...(getValues('images') || []), ...imageUrls]);
    };
    const removeImage = (index: number) => {
        setValue('images', images.filter((_: string, i: number) => i !== index));
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="images">Tải lên hình ảnh</Label>
                    <div className="flex items-center space-x-2">
                        <Input
                            id="images"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                        />
                        <Button type="button" disabled={uploadingImage} size="sm">
                            <Upload className="mr-2 h-4 w-4" />
                            {uploadingImage ? 'Đang tải...' : 'Tải lên'}
                        </Button>
                    </div>
                </div>
                {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images.message}</p>}
                {(images?.length || 0) > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {images.map((image: string, index: number) => (
                            <div key={index} className="relative group">
                                <div className="aspect-square rounded-lg border">
                                    <Image
                                        src={image}
                                        alt={`Product image ${index + 1}`}
                                        width={200}
                                        height={200}
                                        className="object-cover"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductImagesSection;
