import { Badge } from "@/Components/ui/badge";
import { Button } from "@/Components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Category } from "@/types/category";
import React from "react";

interface CategoryTableProps {
    categories: Category[];
    loading: boolean;
    filteredCategories: Category[];
    getParentCategoryName: (parentId: string) => string;
    handleEdit: (category: Category) => void;
    handleDelete: (category: Category) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
    loading,
    filteredCategories,
    getParentCategoryName,
    handleEdit,
    handleDelete,
}) => (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {[
                            { label: 'Tên danh mục', align: 'left' },
                            { label: 'Slug', align: 'left' },
                            { label: 'Danh mục cha', align: 'left' },
                            { label: 'Cấp độ', align: 'left' },
                            { label: 'Thứ tự', align: 'left' },
                            { label: 'Trạng thái', align: 'left' },
                            { label: 'Thao tác', align: 'right' },
                        ].map((col) => (
                            <th
                                key={col.label}
                                className={`px-6 py-3 text-${col.align} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider`}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {loading ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-300">
                                Đang tải...
                            </td>
                        </tr>
                    ) : filteredCategories.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-300">
                                Không tìm thấy danh mục nào
                            </td>
                        </tr>
                    ) : (
                        filteredCategories.map((category) => (
                            <tr key={String(category.id)} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {category.slug}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {getParentCategoryName(category.parentId ?? '')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={category.level === 1 ? "default" : "secondary"}>
                                        Cấp {category.level}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                    {category.sortOrder}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={category.isActive ? "default" : "secondary"}>
                                        {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex items-center justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-gray-700 dark:text-gray-100 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                            onClick={() => handleDelete(category)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);
