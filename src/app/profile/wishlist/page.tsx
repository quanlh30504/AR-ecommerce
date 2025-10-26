"use client";
import React, { useEffect, useState } from "react";
import { useFavorite } from "@/hooks/useFavorite";
import { Product } from "@/types/product";
import ProductCard from "@/app/products/components/ProductCard";
import { PaginationWrapper } from "@/Components/PaginationWrapper";
import toast from "react-hot-toast";
import { getFavoriteProducts } from "@/services/favoritesService";

const WishlistPage: React.FC = () => {
    const { favoriteIds, refreshFavorites } = useFavorite();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const PRODUCTS_PER_PAGE = 6;


    useEffect(() => {
        if (favoriteIds.length === 0) {
            setProducts([]);
            setLoading(false);
            return;
        }
        getFavoriteProducts(favoriteIds)
            .then((products) => {
                setProducts(products);
                setLoading(false);
            })
            .catch(() => {
                toast.error("Không thể tải danh sách sản phẩm");
                setLoading(false);
            });
    }, [favoriteIds]);

    if (loading) return <div>Đang tải danh sách yêu thích...</div>;

    // Pagination logic
    const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
    const paginatedProducts = products.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Sản phẩm yêu thích</h1>
            {products.length === 0 ? (
                <div>Bạn chưa có sản phẩm yêu thích nào.</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        {paginatedProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                    <PaginationWrapper
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
};

export default WishlistPage;
