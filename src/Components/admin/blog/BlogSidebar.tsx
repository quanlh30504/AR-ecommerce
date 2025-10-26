import BlogImageUpload from "@/Components/admin/blog/BlogImageUpload";
import BlogTagsManager from "@/Components/admin/blog/BlogTagsManager";
import BlogSettings from "@/Components/admin/blog/BlogSettings";
import { Control } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";

interface BlogSidebarProps {
    control: Control<BlogFormData>;
}

export default function BlogSidebar({ control }: BlogSidebarProps) {
    return (
        <div className="space-y-6">
            <BlogImageUpload control={control} />
            <BlogTagsManager control={control} />
            <BlogSettings control={control} showPublishedToggle={true} />
        </div>
    );
}
