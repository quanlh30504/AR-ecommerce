'use client'

import { useState } from "react"
import { useForm, SubmitHandler, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productFormSchema, ProductFormData } from "@/lib/validations/forms"
import { AdminLayout } from "@/Components/admin/AdminLayout"
import { Button } from "@/Components/ui/button"
import { ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { uploadImagesToCloudinary } from "@/lib/utils/productUtils"

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const PriceStockSection = dynamic(() => import('@/Components/admin/products/PriceStockSection'), { ssr: false });
const ProductImagesSection = dynamic(() => import('@/Components/admin/products/ProductImagesSection'), { ssr: false });
const ProductCategoriesTagsSection = dynamic(() => import('@/Components/admin/products/ProductCategoriesTagsSection'), { ssr: false });
const ProductAttributesSection = dynamic(() => import('@/Components/admin/products/ProductAttributesSection'), { ssr: false });
const ProductSettingsSection = dynamic(() => import('@/Components/admin/products/ProductSettingsSection'), { ssr: false });
const ProductBasicInfoSection = dynamic(() => import('@/Components/admin/products/ProductBasicInfoSection'), { ssr: false });



export default function CreateProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
    watch
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      price: '' as unknown as number,
      salePrice: '' as unknown as number,
      sku: '',
      stock: '' as unknown as number,
      images: [],
      categoryIds: [],
      tags: undefined,
      attributes: undefined,
      isActive: true,
      isFeatured: false,
      isHotTrend: false,
      discountPercentage: '' as unknown as number,
    } as ProductFormData,
  });

  // Image upload handler
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      toast.error('Vui lòng chọn ít nhất một file');
      return;
    }
    setUploadingImage(true);
    try {
      const imageUrls = await uploadImagesToCloudinary(files);
      setValue('images', [...getValues('images'), ...imageUrls]);
      toast.success(`Tải lên ${imageUrls.length} ảnh thành công`);
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      toast.error(cloudinaryError instanceof Error ? cloudinaryError.message : 'Lỗi khi tải lên ảnh');
    }

  // Image remove handler
  const removeImage = (indexToRemove: number) => {
    const currentImages = getValues('images');
    setValue('images', currentImages.filter((_: any, index: number) => index !== indexToRemove));
  };
  };

  // Tag/category handlers
  const [newTag, setNewTag] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const addTag = () => {
    const tags = getValues('tags') || [];
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  const removeTag = (tagToRemove: string) => {
    const tags = getValues('tags') || [];
    setValue('tags', tags.filter(tag => tag !== tagToRemove));
  };
  const addCategory = () => {
    const cats = getValues('categoryIds') || [];
    if (newCategory.trim() && !cats.includes(newCategory.trim())) {
      setValue('categoryIds', [...cats, newCategory.trim()]);
      setNewCategory('');
    }
  };
  const removeCategory = (categoryToRemove: string) => {
    const cats = getValues('categoryIds') || [];
    setValue('categoryIds', cats.filter(cat => cat !== categoryToRemove));
  };

  // Attribute handler
  const handleAttributeChange = (key: string, value: string) => {
    setValue('attributes', {
      ...getValues('attributes'),
      [key]: value
    });
  };

  // Submit handler
  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const res = await response.json();
      if (res.success) {
        toast.success('Tạo sản phẩm thành công!');
        router.push('/admin/products');
      } else {
        toast.error(res.error || 'Lỗi khi tạo sản phẩm');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Lỗi khi tạo sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-2 pb-4">
        <div className="flex items-center space-x-4 mb-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 hover:text-black dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-yellow-300"
            onClick={() => router.push('/admin/products')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-800">
            Thêm sản phẩm mới
          </h1>
          <p className="text-base font-medium text-gray-700 dark:text-white">Tạo sản phẩm mới trong hệ thống</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Suspense fallback={<div>Đang tải thông tin cơ bản...</div>}>
            <ProductBasicInfoSection register={register} errors={errors} />
          </Suspense>
          <Suspense fallback={<div>Đang tải giá và kho...</div>}>
            <PriceStockSection register={register} errors={errors} />
          </Suspense>
          <Suspense fallback={<div>Đang tải ảnh sản phẩm...</div>}>
            <ProductImagesSection
              images={getValues('images')}
              uploadingImage={uploadingImage}
              setValue={(field, value) => setValue(field as keyof ProductFormData, value)}
              getValues={getValues}
              errors={errors}
              uploadImagesToCloudinary={uploadImagesToCloudinary}
            />
          </Suspense>
          <Suspense fallback={<div>Đang tải danh mục...</div>}>
            <ProductCategoriesTagsSection
              value={watch('categoryIds') || []}
              onChange={(val) => setValue('categoryIds', val)}
              errors={errors}
              name="categoryIds"
              label="Danh mục *"
            />
          </Suspense>
          <Suspense fallback={<div>Đang tải tags...</div>}>
            <ProductCategoriesTagsSection
              value={watch('tags') || []}
              onChange={(val) => setValue('tags', val)}
              errors={errors}
              name="tags"
              label="Tags"
            />
          </Suspense>
          <Suspense fallback={<div>Đang tải thuộc tính...</div>}>
            <ProductAttributesSection
              attributes={getValues('attributes') || {}}
              onChange={(val) => setValue('attributes', val)}
            />
          </Suspense>
          <Suspense fallback={<div>Đang tải cài đặt sản phẩm...</div>}>
            <ProductSettingsSection
              isActive={getValues('isActive')}
              isFeatured={getValues('isFeatured')}
              isHotTrend={getValues('isHotTrend')}
              setValue={(field, value) => setValue(field as keyof ProductFormData, value)}
            />
          </Suspense>
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
              {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}
