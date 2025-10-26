"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toggleFavorite as toggleFavoriteService } from "@/services/favoritesService";
import toast from "react-hot-toast";

interface FavoriteContextType {
    favoriteIds: string[];
    refreshFavorites: () => Promise<void>;
    setFavoriteIds: React.Dispatch<React.SetStateAction<string[]>>;
    toggleFavorite: (productOrId: string | { _id?: string; productId?: string }) => Promise<string[]>;
}

const FavoriteContext = createContext<FavoriteContextType | undefined>(undefined);

export const FavoriteProvider = ({ children }: { children: ReactNode }) => {
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

    const refreshFavorites = async () => {
        const res = await fetch("/api/users/favorites");
        const data = await res.json();
        if (Array.isArray(data.favorites)) {
            setFavoriteIds(data.favorites);
        }
    };

    useEffect(() => {
        refreshFavorites();
    }, []);

    const toggleFavorite = async (productOrId: string | { _id?: string; productId?: string }) => {
        const id = typeof productOrId === "string" ? productOrId : String(productOrId._id ?? productOrId.productId ?? "");
        const isFav = favoriteIds.includes(id);
        try {
            const favorites = await toggleFavoriteService(id, isFav);
            if (Array.isArray(favorites)) {
                setFavoriteIds(favorites);
            }
            toast.success(isFav ? "Đã bỏ khỏi yêu thích" : "Đã thêm vào yêu thích");
            await refreshFavorites();
            return favorites;
        } catch (err: any) {
            toast.error(err?.message || "Có lỗi xảy ra");
            throw err;
        }
    };

    return (
        <FavoriteContext.Provider value={{ favoriteIds, refreshFavorites, setFavoriteIds, toggleFavorite }}>
            {children}
        </FavoriteContext.Provider>
    );
};

export const useFavorite = () => {
    const ctx = useContext(FavoriteContext);
    if (!ctx) throw new Error("useFavorite must be used within FavoriteProvider");
    return ctx;
};
