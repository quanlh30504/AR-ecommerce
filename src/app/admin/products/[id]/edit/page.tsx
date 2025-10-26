'use client'

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { productFormSchema, ProductFormData } from '@/lib/validations/forms';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import { Button } from '@/Components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProductBasicInfoSection from '@/Components/admin/products/ProductBasicInfoSection';
import PriceStockSection from '@/Components/admin/products/PriceStockSection';
import ProductImagesSection from '@/Components/admin/products/ProductImagesSection';
import ProductCategoriesTagsSection from '@/Components/admin/products/ProductCategoriesTagsSection';
import ProductAttributesSection from '@/Components/admin/products/ProductAttributesSection';
import ProductSettingsSection from '@/Components/admin/products/ProductSettingsSection';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function EditProduct({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const [loading, setLoading] = useState(false);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [productId, setProductId] = useState<string>('');

    const {
        register,
        handleSubmit,
        setValue,
        getValues,
        formState: { errors },
        reset,
        control,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            shortDescription: '',
            price: 0,
            salePrice: 0,
            sku: '',
            stock: 0,
            images: [],
            categoryIds: [],
            tags: [],
            attributes: {
                brand: '',
                type: '',
                material: '',
                color: '',
                size: '',
                weight: '',
            },
            isActive: true,
            isFeatured: false,
            isHotTrend: false,
            discountPercentage: 0,
        },
    });

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/admin/products/${resolvedParams.id}`);
                const data = await response.json();
                if (data.success) {
                    const product = data.data;
                    setProductId(product._id);
                    reset({
                        name: product.name,
                        description: product.description,
                        shortDescription: product.shortDescription,
                        price: product.price,
                        salePrice: product.salePrice,
                        sku: product.sku,
                        stock: product.stock,
                        images: product.images || [],
                        categoryIds: product.categoryIds || [],
                        tags: product.tags || [],
                        attributes: {
                            brand: product.attributes?.brand || '',
                            type: product.attributes?.type || '',
                            material: product.attributes?.material || '',
                            color: product.attributes?.color || '',
                            size: product.attributes?.size || '',
                            weight: product.attributes?.weight || '',
                        },
                        isActive: product.isActive,
                        isFeatured: product.isFeatured,
                        isHotTrend: product.isHotTrend,
                        discountPercentage: product.discountPercentage || 0,
                    });
                } else {
                    toast.error('Không tìm thấy sản phẩm');
                    router.push('/admin/products');
                }
            } catch (error) {
                toast.error('Lỗi khi tải thông tin sản phẩm');
                router.push('/admin/products');
            } finally {
                setLoadingProduct(false);
            }
        };
        fetchProduct();
    }, [resolvedParams.id, reset, router]);

    // Upload images handler (Cloudinary/local)
    const uploadImagesToCloudinary = async (files: FileList) => {
        // ...implement as before or import from utils
        return [];
    };

    const onSubmit = async (data: ProductFormData) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/admin/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();
            if (result.success) {
                toast.success('Cập nhật sản phẩm thành công!');
                setTimeout(() => router.push('/admin/products'), 1000);
            } else {
                toast.error(result.error || 'Lỗi khi cập nhật sản phẩm');
            }
        } catch (error) {
            toast.error('Lỗi khi cập nhật sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị thông báo lỗi validate khi submit lỗi
    const onError = (formErrors: any) => {
        if (formErrors && Object.keys(formErrors).length > 0) {
            toast.error('Vui lòng kiểm tra lại các trường bắt buộc!');
        }
    };

    if (loadingProduct) {
        return (
            <AdminLayout>
                <div className="flex justify-center items-center w-full min-h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-yellow-300"
                            onClick={() => router.push('/admin/products')}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Quay lại
                        </Button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-800">
                            Chỉnh sửa sản phẩm
                        </h1>
                        <p className="text-base font-medium text-gray-700 dark:text-white">Cập nhật thông tin sản phẩm</p>
                    </div>
                </div>
                <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                    <ProductBasicInfoSection register={register} errors={errors} />
                    <PriceStockSection register={register} errors={errors} />
                    <ProductImagesSection
                        images={getValues('images') || []}
                        uploadingImage={loading}
                        setValue={setValue}
                        getValues={getValues}
                        errors={errors}
                        uploadImagesToCloudinary={uploadImagesToCloudinary}
                    />
                    {errors.images && (
                        <p className="text-red-500 text-xs mt-1">{errors.images.message as string}</p>
                    )}
                    <Controller
                        name="categoryIds"
                        control={control}
                        render={({ field }) => (
                            <>
                                <ProductCategoriesTagsSection
                                    value={field.value || []}
                                    onChange={field.onChange}
                                    errors={errors}
                                    name="categoryIds"
                                    label="Danh mục *"
                                />
                                {errors.categoryIds && (
                                    <p className="text-red-500 text-xs mt-1">{errors.categoryIds.message as string}</p>
                                )}
                            </>
                        )}
                    />
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <ProductCategoriesTagsSection
                                value={field.value || []}
                                onChange={field.onChange}
                                errors={errors}
                                name="tags"
                                label="Tags"
                            />
                        )}
                    />
                    <Controller
                        name="attributes"
                        control={control}
                        render={({ field }) => (
                            <ProductAttributesSection
                                attributes={field.value || { brand: '', type: '', material: '', color: '', size: '', weight: '' }}
                                onChange={field.onChange}
                            />
                        )}
                    />
                    <ProductSettingsSection
                        isActive={getValues('isActive')}
                        isFeatured={getValues('isFeatured')}
                        isHotTrend={getValues('isHotTrend')}
                        setValue={setValue}
                    />
                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={loading}
                            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-yellow-300"
                            onClick={() => router.push('/admin/products')}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang cập nhật...' : 'Cập nhật sản phẩm'}
                        </Button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
