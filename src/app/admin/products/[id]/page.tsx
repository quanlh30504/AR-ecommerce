'use client'

import { useState, useEffect, use } from "react"
import { AdminLayout } from "@/Components/admin/AdminLayout"
import { Button } from "@/Components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card"
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
const ProductImagesDisplaySection = dynamic(() => import('@/Components/admin/products/ProductImagesDisplaySection'), { ssr: false });
const ProductBasicInfoDisplaySection = dynamic(() => import('@/Components/admin/products/ProductBasicInfoDisplaySection'), { ssr: false });
const ProductPriceStockDisplaySection = dynamic(() => import('@/Components/admin/products/ProductPriceStockDisplaySection'), { ssr: false });
const ProductCategoriesTagsDisplaySection = dynamic(() => import('@/Components/admin/products/ProductCategoriesTagsDisplaySection'), { ssr: false });
const ProductAttributesDisplaySection = dynamic(() => import('@/Components/admin/products/ProductAttributesDisplaySection'), { ssr: false });
import { ArrowLeft, Edit, Trash2, Eye } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Product } from "@/types/product"
import { getImageUrl, formatPrice } from "@/lib/utils/productUtils"

export default function ViewProduct({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState<Product | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${resolvedParams.id}`)
        const data = await response.json()
        if (data.success) {
          setProduct(data.data)
        } else {
          toast.error('Không tìm thấy sản phẩm')
          router.push('/admin/products')
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Lỗi khi tải thông tin sản phẩm')
        router.push('/admin/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [resolvedParams.id, router])

  const handleDelete = async () => {
    if (!product || !confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) return

    try {
      const response = await fetch(`/api/admin/products/${product._id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast.success("Xóa sản phẩm thành công")
        router.push('/admin/products')
      } else {
        toast.error(data.error || "Lỗi khi xóa sản phẩm")
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error("Lỗi khi xóa sản phẩm")
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-muted-foreground">Không tìm thấy sản phẩm</h2>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Chi tiết sản phẩm</h1>
              <p className="text-muted-foreground">Xem thông tin chi tiết sản phẩm</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/products/${product.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Xem trên web
              </Button>
            </Link>
            <Link href={`/admin/products/${product._id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
            <ProductImagesDisplaySection images={product.images} name={product.name} getImageUrl={getImageUrl} />
          </Suspense>
          <div className="lg:col-span-2 space-y-6">
            <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
              <ProductBasicInfoDisplaySection
                name={product.name}
                shortDescription={product.shortDescription}
                sku={product.sku}
                slug={product.slug}
                description={product.description}
                isFeatured={product.isFeatured}
                isHotTrend={product.isHotTrend}
                product={product}
              />
            </Suspense>
            <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
              <ProductPriceStockDisplaySection
                price={product.price}
                salePrice={product.salePrice}
                stock={product.stock}
                discountPercentage={product.discountPercentage}
                formatPrice={formatPrice}
              />
            </Suspense>
            <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
              <ProductCategoriesTagsDisplaySection
                categoryIds={product.categoryIds}
                tags={product.tags}
              />
            </Suspense>
            <Suspense fallback={<div className="p-4 text-center">Đang tải...</div>}>
              <ProductAttributesDisplaySection attributes={typeof product.attributes === 'object' && !Array.isArray(product.attributes) ? product.attributes : {}} />
            </Suspense>
            <Card>
              <CardHeader>
                <CardTitle>Thống kê</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Lượt xem</p>
                    <p className="text-lg font-semibold">{product.viewCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Đánh giá trung bình</p>
                    <p className="text-lg font-semibold">
                      {product.rating?.average ? product.rating.average.toFixed(1) : '0'}/5
                      {product.rating?.count ? ` (${product.rating.count} đánh giá)` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bình luận</p>
                    <p className="text-lg font-semibold">{product.commentCount || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
