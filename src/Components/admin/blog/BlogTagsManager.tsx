import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Badge } from "@/Components/ui/badge";
import { Controller, Control } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogTagsManagerProps {
    control: Control<BlogFormData>;
}

export default function BlogTagsManager({ control }: BlogTagsManagerProps) {
    const [tagInput, setTagInput] = useState("");

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => {
                        const tags: string[] = field.value || [];
                        const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter" && tagInput.trim()) {
                                e.preventDefault();
                                const newTag = tagInput.trim().toLowerCase();
                                if (!tags.includes(newTag)) {
                                    field.onChange([...tags, newTag]);
                                }
                                setTagInput("");
                            }
                        };
                        const handleRemoveTag = (tagToRemove: string) => {
                            field.onChange(tags.filter((tag) => tag !== tagToRemove));
                        };
                        return (
                            <>
                                <Input
                                    placeholder="Nhập tag và nhấn Enter..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleAddTag}
                                />
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag, index) => (
                                        <Badge
                                            key={index}
                                            variant="secondary"
                                            className="flex items-center gap-1"
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type="button"
                                                className="ml-1 text-lg leading-none px-1 text-muted-foreground hover:text-destructive focus:outline-none"
                                                onClick={() => handleRemoveTag(tag)}
                                                aria-label={`Xóa tag ${tag}`}
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </>
                        );
                    }}
                />
            </CardContent>
        </Card>
    );
}
