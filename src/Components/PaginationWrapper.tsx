'use client';
import React, { useMemo, useCallback } from 'react';
import { cn } from "@/lib/utils";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/Components/ui/pagination";

const PAGINATION_CONTAINER = "w-auto";
const PAGINATION_CONTENT =
    "flex items-center justify-center gap-0.5 sm:gap-1 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 sm:p-1.5 hover:shadow-xl transition-all duration-300 min-w-fit max-w-full h-10 sm:h-11";
const PAGE_BUTTON =
    "flex-shrink-0 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-110 hover:-translate-y-0.5 border-0 h-8 sm:h-9 flex items-center";
const PAGE_BUTTON_DISABLED =
    "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50 pointer-events-none";
const PAGE_BUTTON_ACTIVE =
    "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md";
const PAGE_LINK =
    "relative inline-flex items-center justify-center min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-1 sm:px-2 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 sm:hover:scale-110 hover:-translate-y-0.5 overflow-hidden border-0";
const PAGE_LINK_ACTIVE =
    "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg border-2 border-blue-400 dark:border-blue-300 hover:from-blue-600 hover:to-indigo-600";
const PAGE_LINK_INACTIVE =
    "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-700";
const ELLIPSIS =
    "px-1 sm:px-2 py-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-0 min-w-[24px] sm:min-w-[32px] h-8 sm:h-9 flex items-center justify-center";
interface PaginationWrapperProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isCompact?: boolean;
    className?: string;
}

export const PaginationWrapper = React.memo(function PaginationWrapper({
    currentPage,
    totalPages,
    onPageChange,
    isCompact = false,
    className = ""
}: PaginationWrapperProps) {
    if (totalPages <= 1) return null;

    const handlePrevious = useCallback(() => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    const handleNext = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    const pageNumbers = useMemo(() => {
        /**
         * CẢI TIẾN: Logic được viết lại để dễ hiểu và đáng tin cậy hơn.
         * 1. Xác định các trang cần hiển thị (trang đầu, cuối, và các trang lân cận trang hiện tại).
         * 2. Thêm dấu "..." vào giữa các khoảng trống.
         * 3. Responsive: Giảm số trang hiển thị trên mobile để tránh overflow.
         */
        const getVisiblePages = () => {
            // Responsive delta: ít trang hơn trên mobile
            const delta = isCompact ? 1 : (typeof window !== 'undefined' && window.innerWidth < 640) ? 1 : 2;
            const range = [];

            // Nếu tổng số trang ít, hiển thị tất cả
            if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) {
                    range.push(i);
                }
                return range;
            }

            for (
                let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++
            ) {
                range.push(i);
            }

            const pages: (number | string)[] = [];

            // Luôn thêm trang 1
            pages.push(1);

            // Thêm dấu "..." bên trái nếu cần
            if (currentPage - delta > 2) {
                pages.push('...');
            }

            // Thêm các trang ở giữa (loại bỏ trùng lặp)
            range.forEach(page => {
                if (!pages.includes(page)) {
                    pages.push(page);
                }
            });

            // Thêm dấu "..." bên phải nếu cần
            if (currentPage + delta < totalPages - 1) {
                pages.push('...');
            }

            // Luôn thêm trang cuối (nếu nó chưa có)
            if (!pages.includes(totalPages)) {
                pages.push(totalPages);
            }

            return pages;
        };

        return getVisiblePages();
    }, [currentPage, totalPages, isCompact]);

    const handlePageClick = useCallback((page: number | string) => {
        if (typeof page === 'number') {
            onPageChange(page);
        }
    }, [onPageChange]);

    const visiblePages = pageNumbers;

    return (
        <div className={`${isCompact ? "mt-0" : "mt-8"} ${className} flex justify-center`}>
            <div className="pagination-container">
                <Pagination className={PAGINATION_CONTAINER}>
                    <PaginationContent className={PAGINATION_CONTENT}>
                        <PaginationItem className="flex-shrink-0">
                            <PaginationPrevious
                                href="#"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handlePrevious();
                                }}
                                className={cn(
                                    PAGE_BUTTON,
                                    currentPage === 1 ? PAGE_BUTTON_DISABLED : PAGE_BUTTON_ACTIVE
                                )}
                            >
                                <span className="text-sm sm:text-base mr-1">←</span>
                                <span className="hidden sm:md:inline">Trước</span>
                            </PaginationPrevious>
                        </PaginationItem>

                        {visiblePages.map((page, index) => (
                            <PaginationItem key={`${page}-${index}`} className="flex-shrink-0">
                                {page === '...'
                                    ? (
                                        <PaginationEllipsis className={ELLIPSIS}>
                                            <span className="animate-pulse">•••</span>
                                        </PaginationEllipsis>
                                    ) : (
                                        <PaginationLink
                                            href="#"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                handlePageClick(page);
                                            }}
                                            isActive={currentPage === page}
                                            className={cn(
                                                PAGE_LINK,
                                                currentPage === page ? PAGE_LINK_ACTIVE : PAGE_LINK_INACTIVE
                                            )}
                                        >
                                            {page}
                                            {/* Active page indicator */}
                                            {currentPage === page && (
                                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 sm:w-4 h-0.5 bg-white rounded-full animate-pulse"></div>
                                            )}
                                        </PaginationLink>
                                    )}
                            </PaginationItem>
                        ))}

                        <PaginationItem className="flex-shrink-0">
                            <PaginationNext
                                href="#"
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    handleNext();
                                }}
                                className={cn(
                                    PAGE_BUTTON,
                                    currentPage === totalPages ? PAGE_BUTTON_DISABLED : PAGE_BUTTON_ACTIVE
                                )}
                            >
                                <span className="hidden sm:md:inline mr-1">Sau</span>
                                <span className="text-sm sm:text-base">→</span>
                            </PaginationNext>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
});
