'use client';

import React, { useState, useEffect } from 'react';
import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogTitle,
} from '@/Components/ui/dialog';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import type { CategoryFormValues } from '@/lib/validations/forms';

const CategoryForm = dynamic(() => import('@/Components/admin/categories/CategoryForm'), { ssr: false });
const CategoryTable = dynamic(() => import('@/Components/admin/categories/CategoryTable').then(mod => mod.CategoryTable), { ssr: false });
import { Plus, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ICategory } from '@/models/Category';
import { Category } from '@/types/category';
import { categoryService } from '@/services/categoryService';

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    parentId: string;
    level: number;
    sortOrder: number;
    isActive: boolean;
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [parentCategories, setParentCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
    // Không cần formData, sẽ dùng defaultValues cho CategoryForm

    // Fetch data
    useEffect(() => {
        fetchCategories();
        fetchParentCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getAllCategories({ includeInactive: true });
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Không thể tải danh sách danh mục');
        } finally {
            setLoading(false);
        }
    };

    const fetchParentCategories = async () => {
        try {
            const data = await categoryService.getParentCategories();
            setParentCategories(data);
        } catch (error) {
            console.error('Error fetching parent categories:', error);
        }
    };

    // Filter categories
    const filteredCategories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Map ICategory[] to Category[] for UI components
    const mapICategoryToCategory = (cat: ICategory): Category => ({
        id: typeof cat._id === 'string' ? cat._id : (typeof cat.categoryId === 'string' ? cat.categoryId : ''),
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        parentId: cat.parentId || null,
        level: cat.level,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
    });
    const filteredCategoriesForTable: Category[] = filteredCategories.map(mapICategoryToCategory);
    const parentCategoriesForForm: Category[] = parentCategories.map(mapICategoryToCategory);
    const editingCategoryForForm: Category | null = editingCategory ? mapICategoryToCategory(editingCategory) : null;

    // Form handlers
    // Không cần handleInputChange, logic sẽ chuyển sang onSubmit của CategoryForm

    const handleCategoryFormSubmit = async (values: CategoryFormValues) => {
        try {
            const categoryData = {
                ...values,
                parentId: values.parentId || null,
            };
            let result;
            if (editingCategory) {
                result = await categoryService.updateCategory(String(editingCategory._id), categoryData);
            } else {
                result = await categoryService.createCategory(categoryData);
            }
            if (result.success) {
                toast.success(result.message || (editingCategory ? 'Cập nhật thành công' : 'Tạo danh mục thành công'));
                setIsDialogOpen(false);
                resetForm();
                fetchCategories();
                if (!editingCategory) fetchParentCategories();
            } else {
                toast.error(result.error || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Có lỗi xảy ra khi lưu danh mục');
        }
    };

    const handleEdit = (category: Category) => {
        // Find the original ICategory by id
        const found = categories.find(cat => (cat._id || cat.categoryId) === category.id);
        if (found) {
            setEditingCategory(found);
            setIsDialogOpen(true);
        }
    };

    const handleDelete = async (category: Category) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
            return;
        }
        // Find the original ICategory by id
        const found = categories.find(cat => (cat._id || cat.categoryId) === category.id);
        if (!found) return;
        try {
            const result = await categoryService.deleteCategory(String(found._id || found.categoryId));
            if (result.success) {
                toast.success(result.message || 'Xóa danh mục thành công');
                fetchCategories();
                fetchParentCategories();
            } else {
                toast.error(result.error || 'Có lỗi xảy ra khi xóa danh mục');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            toast.error('Có lỗi xảy ra khi xóa danh mục');
        }
    };

    const resetForm = () => {
        setEditingCategory(null);
    };

    const getParentCategoryName = (parentId: string | null | undefined) => {
        if (!parentId) return '-';
        const parent = parentCategoriesForForm.find(cat => String(cat.id) === parentId);
        return parent ? parent.name : parentId;
    };

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1
                                className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-green-600 via-lime-500 to-yellow-400 bg-clip-text text-transparent dark:from-green-300 dark:via-lime-400 dark:to-yellow-200 drop-shadow-lg"
                            >
                                Quản lý danh mục
                            </h1>
                            <p className="mt-1 text-base font-medium text-gray-700 dark:text-gray-300">
                                Quản lý danh mục sản phẩm của cửa hàng
                            </p>
                        </div>

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={resetForm} className="bg-[#8ba63a] hover:bg-[#7a942c] text-white dark:bg-green-700 dark:hover:bg-green-800 dark:text-gray-100">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Thêm danh mục
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogTitle className="sr-only">Thêm hoặc chỉnh sửa danh mục</DialogTitle>
                                <CategoryForm
                                    parentCategories={parentCategoriesForForm}
                                    editingCategory={editingCategoryForForm}
                                    setIsDialogOpen={setIsDialogOpen}
                                    onSubmit={handleCategoryFormSubmit}
                                    defaultValues={editingCategoryForForm ? {
                                        name: editingCategoryForForm.name,
                                        slug: editingCategoryForForm.slug,
                                        description: editingCategoryForForm.description || "",
                                        parentId: editingCategoryForForm.parentId || "",
                                        sortOrder: editingCategoryForForm.sortOrder,
                                        isActive: editingCategoryForForm.isActive,
                                    } : undefined}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Search */}
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Badge variant="secondary">
                            {filteredCategories.length} danh mục
                        </Badge>
                    </div>

                    {/* Categories Table */}
                    <Suspense fallback={<div>Đang tải bảng danh mục...</div>}>
                        <CategoryTable
                            categories={categories.map(mapICategoryToCategory)}
                            loading={loading}
                            filteredCategories={filteredCategoriesForTable}
                            getParentCategoryName={getParentCategoryName}
                            handleEdit={handleEdit}
                            handleDelete={handleDelete}
                        />
                    </Suspense>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
