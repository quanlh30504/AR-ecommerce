'use client';

import React, { useTransition } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bannerSchema, BannerFormValues } from '@/lib/validations/forms';
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import BannerTitleInput from "@/Components/admin/BannerTitleInput";
import BannerDescriptionInput from "@/Components/admin/BannerDescriptionInput";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import ImageUploader from "@/Components/admin/ImageUploader";
import { createBanner, updateBanner } from "@/lib/actions/banner";
import { IBanner } from "@/models/Banner";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";



interface BannerFormProps {
    banner?: IBanner | null;
    mode: 'create' | 'edit';
}

const BANNER_TYPES = [
    { value: 'sale', label: 'Sale Banner' },
    { value: 'advertisement', label: 'Advertisement' }
];

export default function BannerForm({ banner, mode }: BannerFormProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    // Always keep the latest selected file for upload
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = React.useState<string | null>(banner?.imageUrl || null);

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: banner?.title || '',
            description: banner?.description || '',
            type: banner?.type || 'sale',
            isActive: banner?.isActive ?? true,
            displayOrder: banner?.displayOrder?.toString() || '0',
        },
    });

    // Ensure selectedFile is always the latest file chosen
    const onImageChange = (file: File | null, preview: string | null) => {
        setSelectedFile(file);
        setPreviewUrl(preview);
    };

    const onSubmit = async (data: BannerFormValues) => {
        if (mode === 'create' && !selectedFile) {
            toast.error('Vui lòng chọn ảnh banner');
            return;
        }
        const submitFormData = new FormData();
        submitFormData.append('title', data.title.trim());
        submitFormData.append('description', data.description?.trim() || '');
        submitFormData.append('type', data.type);
        submitFormData.append('isActive', data.isActive.toString());
        submitFormData.append('displayOrder', data.displayOrder);
        if (selectedFile) {
            submitFormData.append('image', selectedFile);
        }
        startTransition(async () => {
            try {
                let result;
                if (mode === 'create') {
                    result = await createBanner(submitFormData);
                } else if (banner) {
                    result = await updateBanner(String(banner._id), submitFormData);
                } else {
                    toast.error('Banner không tồn tại');
                    return;
                }
                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/banners');
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error) {
                console.error('Form submission error:', error);
                toast.error('Có lỗi xảy ra khi xử lý form');
            }
        });
    };

    // Remove displayWidth and displayHeight, use responsive container instead

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Form Fields */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin Banner</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Title */}
                            <BannerTitleInput
                                {...register('title')}
                                error={errors.title?.message}
                            />

                            {/* Description */}
                            <BannerDescriptionInput
                                {...register('description')}
                                error={errors.description?.message}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">Loại Banner *</Label>
                                <Controller
                                    control={control}
                                    name="type"
                                    render={({ field }) => (
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Chọn loại banner" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {BANNER_TYPES.map((type) => (
                                                    <SelectItem key={type.value} value={type.value}>
                                                        {type.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
                            </div>

                            {/* Display Order */}
                            <div className="space-y-2">
                                <Label htmlFor="displayOrder">Thứ tự hiển thị *</Label>
                                <Input
                                    id="displayOrder"
                                    type="number"
                                    min="0"
                                    {...register('displayOrder')}
                                    placeholder="0"
                                />
                                {errors.displayOrder && <p className="text-xs text-red-500">{errors.displayOrder.message}</p>}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Số nhỏ sẽ hiển thị trước (phải duy nhất cho mỗi loại banner)
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Controller
                                        control={control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <Switch
                                                id="isActive"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        )}
                                    />
                                    <Label htmlFor="isActive">Kích hoạt banner</Label>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Image Upload */}
                <div>
                    <ImageUploader
                        title="Ảnh Banner"
                        currentImageUrl={banner?.imageUrl}
                        onImageChange={onImageChange}
                        maxSizeInMB={5}
                        acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                        aspectRatio={banner?.type === 'advertisement' || (!banner && control._defaultValues.type === 'advertisement') ? "320/280" : "1380/320"}
                        showPreview={true}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="min-w-[120px]"
                >
                    {isPending ? 'Đang xử lý...' : (mode === 'create' ? 'Tạo Banner' : 'Cập nhật')}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isPending}
                >
                    Hủy
                </Button>
            </div>
        </form>
    );
}
