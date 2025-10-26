import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import Image from "next/image";

interface ProductImageCardProps {
    product: {
        name: string;
        images: string[];
    };
    getImageUrl: (img: string) => string;
}

export const ProductImageCard = React.memo(function ProductImageCard({ product, getImageUrl }: ProductImageCardProps) {
    return (
        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Hình ảnh sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
                {product.images && product.images.length > 0 ? (
                    <div className="space-y-4">
                        <div className="aspect-square rounded-lg overflow-hidden border">
                            <Image
                                src={getImageUrl(product.images[0])}
                                alt={product.name}
                                width={400}
                                height={400}
                                className="object-cover w-full h-full"
                            />
                        </div>
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-3 gap-2">
                                {product.images.slice(1, 4).map((image, index) => (
                                    <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                                        <Image
                                            src={getImageUrl(image)}
                                            alt={`${product.name} ${index + 2}`}
                                            width={100}
                                            height={100}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                        {product.images.length > 4 && (
                            <p className="text-sm text-muted-foreground text-center">
                                +{product.images.length - 4} ảnh khác
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
});
