
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categoryFormSchema, CategoryFormValues } from "@/lib/validations/forms";
import { Label } from "@/Components/ui/label";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/Components/ui/select";
import { Switch } from "@/Components/ui/switch";
import { Button } from "@/Components/ui/button";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/Components/ui/dialog";
import { Category } from "@/types/category";

// Đã import categoryFormSchema, CategoryFormValues từ validations/forms

interface CategoryFormProps {
    parentCategories: Category[];
    editingCategory: Category | null;
    setIsDialogOpen: (open: boolean) => void;
    onSubmit: (values: CategoryFormValues) => void;
    defaultValues?: Partial<CategoryFormValues>;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    parentCategories,
    editingCategory,
    setIsDialogOpen,
    onSubmit,
    defaultValues,
}) => {
    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        resolver: zodResolver(categoryFormSchema),
        defaultValues: {
            name: defaultValues?.name ?? "",
            slug: defaultValues?.slug ?? "",
            description: defaultValues?.description ?? "",
            parentId: defaultValues?.parentId ?? "",
            sortOrder: typeof defaultValues?.sortOrder === "number" ? defaultValues.sortOrder : 1,
            isActive: typeof defaultValues?.isActive === "boolean" ? defaultValues.isActive : true,
        },
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-gray-100">
                    {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                </DialogTitle>
                <DialogDescription className="text-gray-600 dark:text-gray-300">
                    {editingCategory ? "Cập nhật thông tin danh mục" : "Tạo danh mục mới cho cửa hàng"}
                </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-2">
                <div>
                    <Label htmlFor="name" className="block font-medium mb-1">Tên danh mục*</Label>
                    <Input id="name" {...register("name")}
                        className="w-full"
                        autoFocus
                    />
                    {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
                </div>
                <div>
                    <Label htmlFor="slug" className="block font-medium mb-1">Slug*</Label>
                    <Input id="slug" {...register("slug")}
                        className="w-full"
                    />
                    {errors.slug && <span className="text-red-500 text-xs">{errors.slug.message}</span>}
                </div>
                <div>
                    <Label htmlFor="description" className="block font-medium mb-1">Mô tả</Label>
                    <Textarea id="description" {...register("description")}
                        className="w-full"
                        rows={3}
                    />
                </div>
                <div>
                    <Label htmlFor="parentId" className="block font-medium mb-1">Danh mục cha</Label>
                    <Controller
                        control={control}
                        name="parentId"
                        render={({ field }) => (
                            <Select
                                value={field.value || "none"}
                                onValueChange={value => field.onChange(value === "none" ? "" : value)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn danh mục cha (tùy chọn)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Không có (Danh mục gốc)</SelectItem>
                                    {parentCategories.map((category) => (
                                        <SelectItem key={String(category.id)} value={String(category.id)}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Label htmlFor="sortOrder" className="block font-medium mb-1">Thứ tự</Label>
                        <Input id="sortOrder" type="number" min={1} {...register("sortOrder", { valueAsNumber: true })}
                            className="w-full"
                        />
                        {errors.sortOrder && <span className="text-red-500 text-xs">{errors.sortOrder.message}</span>}
                    </div>
                    <div className="flex items-end gap-2">
                        <Label htmlFor="isActive" className="block font-medium mb-1">Kích hoạt</Label>
                        <Controller
                            control={control}
                            name="isActive"
                            render={({ field }) => (
                                <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                            )}
                        />
                    </div>
                </div>
            </div>
            <DialogFooter className="mt-4">
                <Button
                    type="button"
                    variant="outline"
                    className="text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    onClick={() => setIsDialogOpen(false)}
                >
                    Hủy
                </Button>
                <Button
                    type="submit"
                    className="bg-green-400 hover:bg-green-300 text-white dark:bg-green-700 dark:hover:bg-green-800 dark:text-gray-100"
                >
                    {editingCategory ? "Cập nhật" : "Tạo danh mục"}
                </Button>
            </DialogFooter>
        </form>
    );
};

export default CategoryForm;
