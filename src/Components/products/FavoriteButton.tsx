"use client";

import React from "react";
import { Button } from "@/Components/ui/button";
import { Heart } from "lucide-react";

interface FavoriteButtonProps {
    isFavorite: boolean;
    onClick: (e?: React.MouseEvent) => void;
    title?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ isFavorite, onClick, title }) => {
    return (
        <Button
            variant={isFavorite ? "default" : "outline"}
            size="icon"
            onClick={onClick}
            className={`border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors w-9 h-9 flex items-center justify-center ${isFavorite ? 'bg-red-600' : ''}`}
            title={title}
        >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'text-white fill-white' : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'}`} fill={isFavorite ? 'currentColor' : 'none'} />
        </Button>
    );
};

export default FavoriteButton;
