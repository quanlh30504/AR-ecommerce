import BlogBasicInfo from "@/Components/admin/blog/BlogBasicInfo";
import BlogContentEditor from "@/Components/admin/blog/BlogContentEditor";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { BlogFormData } from "@/lib/validations/forms";
import React from "react";

interface BlogMainContentProps {
    register: UseFormRegister<BlogFormData>;
    errors: FieldErrors<BlogFormData>;
    watch: (field: keyof BlogFormData) => string | number | boolean | undefined;
}

export default function BlogMainContent({ register, errors, watch }: BlogMainContentProps) {
    return (
        <div className="lg:col-span-2 space-y-6">
            <BlogBasicInfo register={register} errors={errors} watch={watch} />
            <BlogContentEditor register={register} errors={errors} />
        </div>
    );
}
