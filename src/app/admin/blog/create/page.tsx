'use client';

import { useState } from "react";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { AdminLayout } from "@/Components/admin/AdminLayout";
import { Button } from "@/Components/ui/button";
import toast from "react-hot-toast";
import { useBlogForm } from "@/hooks/useBlogForm";
import BlogBasicInfo from "@/Components/admin/blog/BlogBasicInfo";
import dynamic from "next/dynamic";
const BlogContentEditor = dynamic(() => import("@/Components/admin/blog/BlogContentEditor"), { loading: () => <div>Đang tải trình soạn thảo...</div>, ssr: false });
import BlogImageUpload from "@/Components/admin/blog/BlogImageUpload";
import BlogTagsManager from "@/Components/admin/blog/BlogTagsManager";
import BlogSettings from "@/Components/admin/blog/BlogSettings";

export default function CreateBlog() {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  // getValues,
  // reset
  } = useBlogForm();

  const onSubmit = async (data: Record<string, unknown>, publish = false) => {
    if (!data.featuredImage) {
      toast.error('Vui lòng chọn ảnh đại diện');
      return;
    }
    try {
      setSaving(true);
      const response = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          isPublished: publish,
          publishedAt: publish ? new Date().toISOString() : undefined
        }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(`${publish ? 'Xuất bản' : 'Lưu'} bài viết thành công`);
        window.location.href = '/admin/blog';
      } else {
        toast.error(result.error || 'Lỗi khi lưu bài viết');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      toast.error('Lỗi khi lưu bài viết');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Tạo bài viết mới</h1>
              <p className="text-muted-foreground">Viết và xuất bản bài viết mới</p>
            </div>
          </div>
          {/* Nút đã chuyển xuống dưới form, tránh lỗi handleSave */}
        </div>

        <form onSubmit={handleSubmit((data) => onSubmit(data, false))}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <BlogBasicInfo register={register} errors={errors} watch={watch} />
              <BlogContentEditor register={register} errors={errors} />
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              <BlogImageUpload control={control} />
              <BlogTagsManager control={control} />
              <BlogSettings control={control} />
            </div>
          </div>
          <div className="flex space-x-2 mt-6">
            <Button
              variant="outline"
              type="submit"
              disabled={saving}
              onClick={() => handleSubmit((data) => onSubmit(data, false))()}
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu nháp
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSubmit((data) => onSubmit(data, true))()}
            >
              <Eye className="h-4 w-4 mr-2" />
              Xuất bản
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
