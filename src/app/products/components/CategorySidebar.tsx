import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ICategory } from '@/models/Category';
import { Button } from "@/Components/ui/button";

interface CategorySidebarProps {
  categories: ICategory[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}


// Class constants for DRY
const MAIN_BTN_BASE = "flex-1 justify-start px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-200";
const MAIN_BTN_SELECTED = "text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-800/30 shadow-md border border-green-200 dark:border-green-700";
const MAIN_BTN_UNSELECTED = "text-gray-700 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/20 hover:shadow-sm";
const ALL_BTN_BASE = "w-full justify-start px-3 py-2 text-sm font-semibold border-b border-gray-200 dark:border-gray-600 pb-3 mb-3 rounded-none transition-all duration-200";
const ALL_BTN_SELECTED = "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 shadow-sm";
const ALL_BTN_UNSELECTED = "text-gray-700 dark:text-gray-200 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20";
const SUB_BTN_BASE = "w-full justify-start px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200";
const SUB_BTN_SELECTED = "text-green-600 dark:text-green-400 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 shadow-sm border border-green-200 dark:border-green-600";
const SUB_BTN_UNSELECTED = "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/20 dark:hover:to-green-800/10";

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const getCategoryId = useCallback((category: ICategory): string => {
    return category.categoryId || '';
  }, []);

  const level1Categories = useMemo(() =>
    categories.filter(cat => cat.level === 1).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    , [categories]);

  const getSubcategories = useCallback((parentCategoryId: string) => {
    return categories
      .filter(cat => cat.level === 2 && cat.parentId === parentCategoryId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories]);

  // Toggle category expansion
  const toggleCategory = useCallback((categoryId: string) => {
    setExpandedCategories(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(categoryId)) {
        newExpanded.delete(categoryId);
      } else {
        newExpanded.add(categoryId);
      }
      return newExpanded;
    });
  }, []);

  const handleSelectAllProducts = useCallback(() => {
    onSelectCategory('');
  }, [onSelectCategory]);

  const handleSelectCategory = useCallback((categoryId: string) => {
    onSelectCategory(categoryId);
  }, [onSelectCategory]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
        <h3 className="font-bold text-gray-800 dark:text-white text-sm uppercase tracking-wide drop-shadow-sm">
          ☰ DANH MỤC SẢN PHẨM
        </h3>
      </div>

      <div className="p-4 space-y-2">
        {/* Show All Products Button */}
        <Button
          variant="ghost"
          onClick={handleSelectAllProducts}
          className={
            `${ALL_BTN_BASE} ${selectedCategory === '' ? ALL_BTN_SELECTED : ALL_BTN_UNSELECTED}`
          }
        >
          Tất cả sản phẩm
        </Button>

        {/* Level 1 Categories */}
        {level1Categories.map((category) => {
          const categoryId = getCategoryId(category);
          const subcategories = getSubcategories(categoryId);
          const hasSubcategories = subcategories.length > 0;
          const isExpanded = expandedCategories.has(categoryId);
          const isSelected = selectedCategory === categoryId;

          return (
            <div key={categoryId}>
              {/* Main Category */}
              <div className="flex items-center justify-between group">
                <Button
                  variant="ghost"
                  onClick={() => handleSelectCategory(categoryId)}
                  className={
                    `${MAIN_BTN_BASE} ${isSelected ? MAIN_BTN_SELECTED : MAIN_BTN_UNSELECTED}`
                  }
                >
                  {category.name}
                </Button>

                {/* Expand/Collapse Button for categories with subcategories */}
                {hasSubcategories && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCategory(categoryId)}
                    className="p-2 h-auto text-gray-400 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-full transition-all duration-200"
                  >
                    {isExpanded ? (
                      <ChevronDown className="text-xs" />
                    ) : (
                      <ChevronRight className="text-xs" />
                    )}
                  </Button>
                )}
              </div>

              {/* Subcategories - shown when expanded */}
              {hasSubcategories && isExpanded && (
                <div className="ml-6 mt-2 space-y-1 border-l-2 border-green-200 dark:border-green-700 pl-4">
                  {subcategories.map((subcategory) => {
                    const subcategoryId = getCategoryId(subcategory);
                    const isSubcategorySelected = selectedCategory === subcategoryId;

                    return (
                      <Button
                        key={subcategoryId}
                        variant="ghost"
                        onClick={() => handleSelectCategory(subcategoryId)}
                        className={
                          `${SUB_BTN_BASE} ${isSubcategorySelected ? SUB_BTN_SELECTED : SUB_BTN_UNSELECTED}`
                        }
                      >
                        {subcategory.name}
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(CategorySidebar);
