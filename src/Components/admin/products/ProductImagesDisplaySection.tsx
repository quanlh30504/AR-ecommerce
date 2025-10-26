import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import Image from 'next/image';
import React from 'react';

interface ProductImagesDisplaySectionProps {
    images: string[];
    name: string;
    getImageUrl: (img: string) => string;
}

const ProductImagesDisplaySection: React.FC<ProductImagesDisplaySectionProps> = ({ images, name, getImageUrl }) => (
    <Card className="lg:col-span-1">
        <CardHeader>
            <CardTitle>Hình ảnh sản phẩm</CardTitle>
        </CardHeader>
        <CardContent>
            {images && images.length > 0 ? (
                <div className="space-y-4">
                    <div className="aspect-square rounded-lg border">
                        <Image
                            src={getImageUrl(images[0])}
                            alt={name}
                            width={400}
                            height={400}
                            className="object-cover"
                        />
                    </div>
                    {images.length > 1 && (
                        <div className="grid grid-cols-3 gap-2">
                            {images.slice(1, 4).map((image, index) => (
                                <div key={index} className="aspect-square rounded-lg border">
                                    <Image
                                        src={getImageUrl(image)}
                                        alt={`${name} ${index + 2}`}
                                        width={100}
                                        height={100}
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {images.length > 4 && (
                        <p className="text-sm text-muted-foreground text-center">
                            +{images.length - 4} ảnh khác
                        </p>
                    )}
                </div>
            ) : (
                <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <p className="text-muted-foreground">Không có hình ảnh</p>
                </div>
            )}
        </CardContent>
    </Card>
);

export default ProductImagesDisplaySection;
