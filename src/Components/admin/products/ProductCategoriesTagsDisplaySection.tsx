import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import React from 'react';

interface ProductCategoriesTagsDisplaySectionProps {
    categoryIds: string[];
    tags: string[];
}

const ProductCategoriesTagsDisplaySection: React.FC<ProductCategoriesTagsDisplaySectionProps> = ({ categoryIds, tags }) => (
    <Card>
        <CardHeader>
            <CardTitle>Danh mục và Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Danh mục</p>
                <div className="flex flex-wrap gap-2">
                    {(categoryIds || []).map((category, index) => (
                        <Badge key={index} variant="secondary">
                            {category}
                        </Badge>
                    ))}
                </div>
            </div>
            {tags && tags.length > 0 && (
                <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                        {(tags || []).map((tag, index) => (
                            <Badge key={index} variant="outline">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
);

export default ProductCategoriesTagsDisplaySection;
