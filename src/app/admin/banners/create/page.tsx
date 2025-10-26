import React from 'react';
import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import BannerForm from '@/Components/admin/banner/BannerForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import Link from 'next/link';
import { Button } from '@/Components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateBannerPage() {
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
                            <h1 className="text-3xl font-bold text-gray-900">Tạo Banner Mới</h1>
                            <p className="text-gray-600 mt-1">
                                Tạo banner mới để hiển thị trên website
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin Banner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <BannerForm mode="create" />
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
