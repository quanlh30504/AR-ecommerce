import { Button } from "@/Components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { BlogPost } from "@/types/blog";
import React from "react";

interface BlogActionButtonsProps {
    post: BlogPost;
    deleting: string | null;
    togglePublishStatus: (slug: string, isPublished: boolean) => void;
    handleDelete: (slug: string, title: string) => void;
}

const BlogActionButtons: React.FC<BlogActionButtonsProps> = ({ post, deleting, togglePublishStatus, handleDelete }) => (
    <div className="flex items-center space-x-2">
        <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/news/${post.slug}`, '_blank')}
            title="Xem bài viết"
        >
            <Eye className="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = `/admin/blog/edit/${post.slug}`}
            title="Chỉnh sửa"
        >
            <Edit className="h-4 w-4" />
        </Button>
        <Button
            variant="ghost"
            size="sm"
            onClick={() => togglePublishStatus(post.slug, post.isPublished)}
            className={post.isPublished ? "text-yellow-600" : "text-green-600"}
            title={post.isPublished ? "Hủy xuất bản" : "Xuất bản"}
        >
            {post.isPublished ? "Hủy xuất bản" : "Xuất bản"}
        </Button>
        <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(post.slug, post.title)}
            disabled={deleting === post.slug}
            className="text-red-600 hover:text-red-700"
            title="Xóa bài viết"
        >
            {deleting === post.slug ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    </div>
);

export default BlogActionButtons;
