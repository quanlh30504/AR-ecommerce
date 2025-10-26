import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Upload } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { Controller, Control } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogImageUploadProps {
    control: Control<BlogFormData>;
}

export default function BlogImageUpload({ control }: BlogImageUploadProps) {
    const [imageUploading, setImageUploading] = useState(false);

    const handleImageUpload = async (onChange: (url: string) => void, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formDataImg = new FormData();
        formDataImg.append('image', file);
        try {
            setImageUploading(true);
            const response = await fetch('/api/blog/upload-image', {
                method: 'POST',
                body: formDataImg,
            });
            const result = await response.json();
            if (result.success) {
                onChange(result.data.url);
                toast.success('Tải ảnh lên thành công');
            } else {
                toast.error(result.error || 'Lỗi khi tải ảnh lên');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Lỗi khi tải ảnh lên');
        } finally {
            setImageUploading(false);
        }
    };

        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ảnh đại diện</CardTitle>
                </CardHeader>
                <CardContent>
                    <Controller
                        name="featuredImage"
                        control={control}
                        render={({ field }) => (
                            field.value ? (
                                <div className="space-y-4">
                                    <div className="relative aspect-video rounded-lg overflow-hidden">
                                        <Image
                                            src={field.value}
                                            alt="Featured image"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex space-x-2">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleImageUpload(field.onChange, e)}
                                            className="hidden"
                                            id="featured-image-change"
                                            disabled={imageUploading}
                                        />
                                        <Label htmlFor="featured-image-change" className="flex-1">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                                disabled={imageUploading}
                                                asChild
                                            >
                                                {imageUploading ? 'Đang tải...' : 'Thay đổi ảnh'}
                                            </Button>
                                        </Label>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => field.onChange("")}
                                        >
                                            Xóa ảnh
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => handleImageUpload(field.onChange, e)}
                                        className="hidden"
                                        id="featured-image"
                                        disabled={imageUploading}
                                    />
                                    <Label
                                        htmlFor="featured-image"
                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                    </Label>
                                </div>
                            )
                        )}
                    />
                </CardContent>
            </Card>
        );
}
