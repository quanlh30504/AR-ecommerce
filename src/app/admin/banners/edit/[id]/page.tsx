import React from 'react';
import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import { getBannerById } from '@/lib/actions/banner';
import BannerForm from '@/Components/admin/banner/BannerForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Link from 'next/link';
import { Button } from '@/Components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

interface EditBannerPageProps {
    params: { id: string };
}

export default async function EditBannerPage({ params }: EditBannerPageProps) {
    const { id } = await params;
    const result = await getBannerById(id);

    if (!result.success || !result.data) {
        notFound();
    }

    // Cast result.data to IBanner for type safety
    const banner = result.data as import("@/models/Banner").IBanner;
    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <Link href="/admin/banners">
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa Banner</h1>
                            <p className="text-gray-600 mt-1">
                                Cập nhật thông tin banner &quot;{banner.title}&quot;
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin Banner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BannerForm mode="edit" banner={banner} />
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
