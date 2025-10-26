import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogBasicInfoProps {
    register: UseFormRegister<BlogFormData>;
    errors: FieldErrors<BlogFormData>;
    watch: (field: keyof BlogFormData) => string | number | boolean | undefined;
}

export default function BlogBasicInfo({ register, errors, watch }: BlogBasicInfoProps) {
    const rawExcerpt = watch("excerpt");
    const excerpt = typeof rawExcerpt === 'string' ? rawExcerpt : '';
    return (
        <Card>
            <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="text-sm font-medium">
                        Tiêu đề <span className="text-red-500">*</span>
                    </label>
                    <Input
                        placeholder="Nhập tiêu đề bài viết..."
                        {...register("title")}
                        className="mt-1"
                    />
                    {errors.title && <span className="text-red-500 text-xs">{errors.title.message as string}</span>}
                </div>
                <div>
                    <label className="text-sm font-medium">Slug</label>
                    <Input
                        placeholder="slug-bai-viet"
                        {...register("slug")}
                        className="mt-1"
                    />
                    {errors.slug && <span className="text-red-500 text-xs">{errors.slug.message as string}</span>}
                </div>
                <div>
                    <label className="text-sm font-medium">
                        Mô tả ngắn <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        placeholder="Nhập mô tả ngắn về bài viết..."
                        {...register("excerpt")}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={3}
                        maxLength={500}
                    />
                    {errors.excerpt && <span className="text-red-500 text-xs">{errors.excerpt.message as string}</span>}
                    <p className="text-xs text-muted-foreground mt-1">
                        {excerpt.length}/500 ký tự
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
