'use client';
import React, { useEffect, useState } from 'react';
import { motion, cubicBezier } from 'framer-motion';
import dynamic from 'next/dynamic';

const ProductGrid = dynamic(() => import('@/app/products/components/ProductGrid'));
const ProductList = dynamic(() => import('@/app/products/components/ProductList'));
const CategorySidebar = dynamic(() => import('@/app/products/components/CategorySidebar'));
const CompareBox = dynamic(() => import('@/app/products/components/CompareBox'));
const TagList = dynamic(() => import('@/app/products/components/TagList'));
const ViewToggle = dynamic(() => import('@/app/products/components/ViewToggle'));
const SimpleBanner = dynamic(() => import('@/Components/banner/SimpleBanner'));
const PaginationWrapper = dynamic(() => import('@/Components/PaginationWrapper').then(mod => mod.PaginationWrapper));
const ProductCounter = dynamic(() => import('./components/ProductCounter'));
const SortFilter = dynamic(() => import('./components/SortFilter'));

import { Product } from '@/types/product';
import { ICategory } from '@/models/Category';
import { productService } from '@/services/productService';
import { categoryService } from '@/services/categoryService';
import { useFavorite } from '@/hooks/useFavorite';
import toast from 'react-hot-toast';
import { SortOption } from './components/SortFilter';

const ProductPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState<SortOption>('default');

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: cubicBezier(0.25, 0.46, 0.45, 0.94),
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    // MAX prod được hiển thị
    const getProductsPerPage = () => {
        return viewMode === 'list' ? 3 : 6; // max 3 prod cho list mode, 6 prod cho grid mode
    };

    // gộp tags từ sản phẩm, loại bỏ trùng hợp và chuyển thành mảng
    const tags = Array.from(new Set(
        Array.isArray(products) ? products.flatMap(p => p.tags || []) : []
    ));

    // Hàm sắp xếp sản phẩm
    const sortProducts = (products: Product[], sortOption: SortOption): Product[] => {
        const sortedProducts = [...products];

        switch (sortOption) {
            case 'name-asc':
                return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' }));
            case 'name-desc':
                return sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'vi', { sensitivity: 'base' }));
            case 'price-asc':
                return sortedProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
            case 'price-desc':
                return sortedProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
            case 'default':
            default:
                return sortedProducts;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Sử dụng categoryService
                const categories = await categoryService.getAllCategories();
                setCategories(categories);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Lấy toàn bộ sản phẩm lần đầu load page
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                // Sử dụng productService 
                const products = await productService.getAllProducts();

                setProducts(products);
                setFilteredProducts(sortProducts(products, sortOption));
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching initial products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Khi filter thay đổi 
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);

                let products: Product[];

                // Kiểm tra nếu không có filter nào được chọn
                if (selectedCategory === '' && selectedTags.length === 0) {
                    // Không có filter nào - lấy tất cả sản phẩm
                    products = await productService.getAllProducts();
                } else {
                    // Có filter - sử dụng productService với logic Advanced (match với route API thực tế)
                    if (selectedCategory && selectedTags.length > 0) {
                        // Có cả category và tags - sử dụng logic phức tạp từ route
                        products = await productService.getProductsByCategoryAndTagsAdvanced(selectedCategory, selectedTags);
                    } else if (selectedCategory) {
                        // Chỉ có category - route sẽ tự động handle subcategories nếu level 1
                        products = await productService.getProductsByCategoryAdvanced(selectedCategory);
                    } else if (selectedTags.length > 0) {
                        // Chỉ có tags - sử dụng logic từ route
                        products = await productService.getProductsByTagsAdvanced(selectedTags);
                    } else {
                        // Fallback
                        products = await productService.getAllProducts();
                    }
                }

                setProducts(products);
                setFilteredProducts(sortProducts(products, sortOption));
                setCurrentPage(1); // reset về page 1 khi filter thay đổi
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
                console.error('Error fetching filtered products:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedCategory, selectedTags, sortOption]);

    // Áp dụng sắp xếp khi sortOption thay đổi
    useEffect(() => {
        setFilteredProducts(sortProducts(products, sortOption));
        setCurrentPage(1); // reset về page 1 khi sort thay đổi
    }, [sortOption, products]);


    const handleCategorySelect = (category: string) => {
        setSelectedCategory(category);

        // nếu không có tags được lựa chọn sẽ tự lấy tất cả sản phẩm
        if (category === '' && selectedTags.length === 0) {
            const fetchAllProducts = async () => {
                try {
                    setLoading(true);
                    // Sử dụng productService
                    const products = await productService.getAllProducts();

                    setProducts(products);
                    setFilteredProducts(sortProducts(products, sortOption));
                    setCurrentPage(1);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred');
                } finally {
                    setLoading(false);
                }
            };
            fetchAllProducts();
        }
    };

    const handleTagSelect = (tag: string) => {
        setSelectedTags(prevTags => {
            if (prevTags.includes(tag)) {
                // Nếu tag được chọn sẽ xóa trong array không hiển thị nữa
                return prevTags.filter(t => t !== tag);
            } else {
                // Ngược lại
                return [...prevTags, tag];
            }
        });
    };

    const handleClearAllTags = () => {
        setSelectedTags([]);
    };

    const handleSortChange = (option: SortOption) => {
        setSortOption(option);
    };

    // Chức năng thêm vào giỏ hàng
    const handleAddToCart = async (product: Product) => {
        const { useCartStore } = await import('@/store/useCartStore');
        const { addItemToCart, getCart } = await import('@/lib/actions/cart');
        const { toast } = await import('react-hot-toast');
        const res = await addItemToCart(String(product._id), 1);
        if (res.success) {
            toast.success('Đã thêm sản phẩm vào giỏ hàng!');
            // Lấy lại giỏ hàng mới và đồng bộ store
            const cartRes = await getCart();
            if (cartRes.success && cartRes.data) {
                // Ép kiểu đúng với PopulatedCart để tránh lỗi eslint
                const { _id, user, items, totalItems } = cartRes.data as { _id: string, user: string, items: any[], totalItems: number };
                useCartStore.getState().syncCart({ _id, user, items, totalItems });
            }
        } else {
            toast.error(res.message || 'Thêm vào giỏ hàng thất bại!');
        }
    };

    // Chức năng yêu thích
    // favorite context
    const { favoriteIds, setFavoriteIds, refreshFavorites, toggleFavorite } = useFavorite();

    const handleToggleFavorite = async (product: Product) => {
        try {
            await toggleFavorite(product);
        } catch (err: any) {
            toast.error(err?.message || 'Có lỗi xảy ra');
        }
    };

    // Phân trang
    const productsPerPage = getProductsPerPage();
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // reset về page 1 khi đổi view mode
    useEffect(() => {
        setCurrentPage(1);
    }, [viewMode]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-lg">Đang tải sản phẩm...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500">Lỗi: {error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sale Banner at top - chỉ hiển thị ảnh */}
            <div className="mb-8">
                <SimpleBanner type="sale" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:hidden space-y-6">
                    <CategorySidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={handleCategorySelect}
                    />
                    <CompareBox categories={categories} />
                    <TagList
                        tags={tags}
                        selectedTags={selectedTags}
                        onSelectTag={handleTagSelect}
                        onClearAllTags={handleClearAllTags}
                    />

                    <div>
                        {/* Header Section with improved layout */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6 transition-all duration-300 hover:shadow-md">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                {/* Left side - View controls and product count */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                                    <ProductCounter count={filteredProducts.length} />
                                </div>

                                {/* Right side - Sort and pagination */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <SortFilter
                                        currentSort={sortOption}
                                        onSortChange={handleSortChange}
                                        isLoading={loading}
                                    />
                                    <div className="hidden lg:block">
                                        <PaginationWrapper
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={setCurrentPage}
                                            isCompact={true}
                                            className="flex justify-center mt-0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            key={`${viewMode}-${currentPage}-mobile`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {viewMode === 'grid' ? (
                                <ProductGrid
                                    products={currentProducts}
                                    onAddToCart={handleAddToCart}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ) : (
                                <ProductList
                                    products={currentProducts}
                                    onAddToCart={handleAddToCart}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            )}
                        </motion.div>

                        {/* Bottom Pagination for mobile */}
                        <div className="lg:hidden">
                            <PaginationWrapper
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                isCompact={false}
                                className="flex justify-center"
                            />
                        </div>

                        {/* Bottom Pagination for desktop */}
                        <div className="hidden lg:block">
                            <PaginationWrapper
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                isCompact={false}
                                className="flex justify-center"
                            />
                        </div>
                    </div>
                </div>

                <div className="hidden lg:grid lg:grid-cols-4 gap-8">
                    <aside className="col-span-1 space-y-6">
                        <CategorySidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            onSelectCategory={handleCategorySelect}
                        />
                        <CompareBox categories={categories} />
                        <TagList
                            tags={tags}
                            selectedTags={selectedTags}
                            onSelectTag={handleTagSelect}
                            onClearAllTags={handleClearAllTags}
                        />
                        {/* Advertisement Banner */}
                        <div className="mt-6">
                            <SimpleBanner type="advertisement" />
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="col-span-3">
                        {/* Header Section with improved layout */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-all duration-300 hover:shadow-lg">
                            <div className="flex items-center justify-between">
                                {/* Left side - View controls and product count */}
                                <div className="flex items-center gap-6">
                                    <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
                                    <ProductCounter count={filteredProducts.length} />
                                </div>

                                {/* Right side - Sort and pagination */}
                                <div className="flex items-center gap-4">
                                    <SortFilter
                                        currentSort={sortOption}
                                        onSortChange={handleSortChange}
                                        isLoading={loading}
                                    />
                                    <PaginationWrapper
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        isCompact={true}
                                        className="flex justify-center mt-0"
                                    />
                                </div>
                            </div>
                        </div>

                        <motion.div
                            key={`${viewMode}-${currentPage}-desktop`}
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {viewMode === 'grid' ? (
                                <ProductGrid
                                    products={currentProducts}
                                    onAddToCart={handleAddToCart}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            ) : (
                                <ProductList
                                    products={currentProducts}
                                    onAddToCart={handleAddToCart}
                                    onToggleFavorite={handleToggleFavorite}
                                />
                            )}
                        </motion.div>

                        {/* Bottom Pagination - Centered alignment */}
                        <div className="flex justify-center">
                            <PaginationWrapper
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                                isCompact={false}
                                className=""
                            />
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;
