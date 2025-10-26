import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Controller, Control } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogSettingsProps {
    control: Control<BlogFormData>;
    showPublishedToggle?: boolean;
}

export default function BlogSettings({ control, showPublishedToggle = false }: BlogSettingsProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cài đặt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Controller
                    name="isFeatured"
                    control={control}
                    render={({ field }) => (
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isFeatured"
                                checked={!!field.value}
                                onChange={e => field.onChange(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <label htmlFor="isFeatured" className="text-sm font-medium">
                                Bài viết nổi bật
                            </label>
                        </div>
                    )}
                />

                {showPublishedToggle && (
                    <Controller
                        name="isPublished"
                        control={control}
                        render={({ field }) => (
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={!!field.value}
                                    onChange={e => field.onChange(e.target.checked)}
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="isPublished" className="text-sm font-medium">
                                    Đã xuất bản
                                </label>
                            </div>
                        )}
                    />
                )}
            </CardContent>
        </Card>
    );
}
