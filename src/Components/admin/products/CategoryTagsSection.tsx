import { Card, CardHeader, CardTitle, CardContent } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Plus, X } from "lucide-react";
import React from "react";

interface CategoryTagsSectionProps {
    newCategory: string;
    setNewCategory: (val: string) => void;
    addCategory: () => void;
    removeCategory: (cat: string) => void;
    categoryIds: string[];
    newTag: string;
    setNewTag: (val: string) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
    tags: string[];
}

const CategoryTagsSection: React.FC<CategoryTagsSectionProps> = ({
    newCategory,
    setNewCategory,
    addCategory,
    removeCategory,
    categoryIds,
    newTag,
    setNewTag,
    addTag,
    removeTag,
    tags,
}) => (
    <Card>
        <CardHeader>
            <CardTitle>Danh mục và Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Danh mục *</Label>
                <div className="flex space-x-2">
                    <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Nhập ID danh mục (ví dụ: cat-1)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
                    />
                    <Button type="button" onClick={addCategory} size="sm">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {(categoryIds?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {categoryIds.map((category, index) => (
                            <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                {category}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-1 h-auto p-0"
                                    onClick={() => removeCategory(category)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex space-x-2">
                    <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Nhập tag"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {(tags?.length || 0) > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                {tag}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="ml-1 h-auto p-0"
                                    onClick={() => removeTag(tag)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
);

export default CategoryTagsSection;
