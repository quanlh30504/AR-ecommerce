'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { AdminLayout } from "@/Components/admin/AdminLayout";
import { Button } from "@/Components/ui/button";
import { Save, Eye } from "lucide-react";
import BlogFormHeader from "@/Components/admin/blog/BlogFormHeader";
import toast from "react-hot-toast";
import { useBlogForm } from "@/hooks/useBlogForm";
import BlogBasicInfo from "@/Components/admin/blog/BlogBasicInfo";
import dynamic from "next/dynamic";
const BlogContentEditor = dynamic(() => import("@/Components/admin/blog/BlogContentEditor"), { loading: () => <div>Đang tải trình soạn thảo...</div>, ssr: false });
import BlogImageUpload from "@/Components/admin/blog/BlogImageUpload";
import BlogTagsManager from "@/Components/admin/blog/BlogTagsManager";
import BlogSettings from "@/Components/admin/blog/BlogSettings";

export default function EditBlog() {
  const params = useParams();
  const slug = params.slug as string;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    // getValues,
    reset
  } = useBlogForm();

  // Fetch blog post data
  useEffect(() => {
    if (!slug || dataLoaded) return;

    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/blog/${slug}?admin=true`);
        const result = await response.json();

        if (result.success) {
          const post = result.data.post;
          reset({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            featuredImage: post.featuredImage,
            tags: post.tags || [],
            isPublished: post.isPublished,
            isFeatured: post.isFeatured
          });
          setDataLoaded(true); // ← Đánh dấu đã load xong
        } else {
          toast.error('Không tìm thấy bài viết');
          window.location.href = '/admin/blog';
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        toast.error('Lỗi khi tải bài viết');
        window.location.href = '/admin/blog';
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug, dataLoaded, reset]);

  const onSubmit = async (data: Record<string, unknown>, publish?: boolean) => {
    if (!data.featuredImage) {
      toast.error('Vui lòng chọn ảnh đại diện');
      return;
    }
    try {
      setSaving(true);
      const updateData: Record<string, unknown> = { ...data };
      if (publish !== undefined) {
        updateData.isPublished = publish;
        if (publish) {
          updateData.publishedAt = new Date().toISOString();
        }
      }
      const response = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Cập nhật bài viết thành công');
        if (result.data.slug !== slug) {
          window.location.href = `/admin/blog/edit/${result.data.slug}`;
        }
      } else {
        toast.error(result.error || 'Lỗi khi cập nhật bài viết');
      }
    } catch (error) {
      console.error('Error updating blog post:', error);
      toast.error('Lỗi khi cập nhật bài viết');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <form onSubmit={handleSubmit((data) => onSubmit(data))}>
          <BlogFormHeader
            title="Chỉnh sửa bài viết"
            subtitle="Cập nhật nội dung bài viết"
            onBack={() => { window.location.href = '/admin/blog'; }}
          >
            <Button
              variant="secondary"
              className="text-gray-700 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              type="submit"
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
            {!watch("isPublished") && (
              <Button
                type="button"
                disabled={saving}
                onClick={() => handleSubmit((data) => onSubmit(data, true))()}
              >
                <Eye className="h-4 w-4 mr-2" />
                Xuất bản
              </Button>
            )}
            {watch("isPublished") && (
              <Button
                variant="secondary"
                type="button"
                disabled={saving}
                onClick={() => handleSubmit((data) => onSubmit(data, false))()}
              >
                Hủy xuất bản
              </Button>
            )}
          </BlogFormHeader>

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
              <BlogSettings control={control} showPublishedToggle={true} />
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
