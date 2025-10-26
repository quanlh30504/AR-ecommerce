import React from "react";
import { Star } from "lucide-react";

interface RatingSummaryProps {
    average: number;
    reviewCount: number;
    className?: string;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({ average, reviewCount, className = "" }) => {
    return (
        <div className={`text-center ${className}`}>
            <div className="text-3xl font-bold text-gray-800 dark:text-white transition-colors">
                {average.toFixed(1)}
            </div>
            <div className="flex items-center justify-center mt-1 gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`w-5 h-5 transition-colors duration-200 ${i < Math.floor(average)
                                ? 'fill-yellow-400 text-yellow-400 drop-shadow dark:fill-yellow-300 dark:text-yellow-300'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                    />
                ))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors">
                {reviewCount} nhận xét
            </div>
        </div>
    );
};

export default RatingSummary;
