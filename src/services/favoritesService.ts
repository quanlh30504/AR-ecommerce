import { productService } from "./productService";
import { Product } from "@/types/product";

export async function getFavoriteProducts(favoriteIds: string[]): Promise<Product[]> {
    if (!Array.isArray(favoriteIds) || favoriteIds.length === 0) return [];
    const allProducts = await productService.getProducts({ limit: 1000 });
    return allProducts.filter((p: any) => favoriteIds.includes(p._id));
}

export async function toggleFavorite(productId: string, isFavorite: boolean) {
    const method = isFavorite ? "DELETE" : "POST";

    const res = await fetch("/api/users/favorites", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || "Có lỗi xảy ra");
    }

    if (!Array.isArray(data.favorites)) {
        throw new Error("Invalid response from favorites API");
    }

    return data.favorites as string[];
}

