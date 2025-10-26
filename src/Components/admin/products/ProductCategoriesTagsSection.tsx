import React from 'react';
import type { FC } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Plus, X } from 'lucide-react';


interface ProductCategoriesTagsSectionProps {
    value: string[];
    onChange: (value: string[]) => void;
    errors?: Record<string, { message?: string }>;
    name: string;
    label: string;
}

const ProductCategoriesTagsSection: FC<ProductCategoriesTagsSectionProps> = ({ value = [], onChange, errors, name, label }) => {
    const [input, setInput] = React.useState('');
    const addItem = () => {
        if (input.trim() && !value.includes(input.trim())) {
            onChange([...value, input.trim()]);
            setInput('');
        }
    };
    const removeItem = (item: string) => {
        onChange(value.filter((v: string) => v !== item));
    };
    return (
        <Card>
            <CardHeader>
                <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={name === 'categoryIds' ? 'Nhập ID danh mục (ví dụ: cat-1)' : 'Nhập tag'}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem())}
                        />
                        <Button type="button" onClick={addItem} size="sm">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    {value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {value.map((item: string, index: number) => (
                                <div key={index} className="flex items-center bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm">
                                    {item}
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="ml-1 h-auto p-0"
                                        onClick={() => removeItem(item)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    {errors && errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name].message}</p>}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCategoriesTagsSection;
