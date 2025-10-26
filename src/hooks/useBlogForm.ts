import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogFormSchema, type BlogFormData } from "@/lib/validations/forms";

export const useBlogForm = (initialData?: Partial<BlogFormData>) => {
    const form = useForm<BlogFormData>({
        resolver: zodResolver(blogFormSchema),
        defaultValues: {
            title: '',
            slug: '',
            content: '',
            excerpt: '',
            featuredImage: '',
            tags: [],
            isPublished: false,
            isFeatured: false,
            ...initialData
        },
    });

    // Tiện ích tạo slug tự động từ title
    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[đĐ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    return {
        ...form,
        generateSlug,
    };
};