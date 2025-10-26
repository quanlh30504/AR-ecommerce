'use client';
import React, { useState, useCallback, useMemo } from 'react';

export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'default';

interface SortFilterProps {
    currentSort: SortOption;
    onSortChange: (option: SortOption) => void;
    isLoading?: boolean;
}

const SortFilter: React.FC<SortFilterProps> = ({ currentSort, onSortChange, isLoading = false }) => {
    const [isOpen, setIsOpen] = useState(false);

    const sortOptions = useMemo(() => [
        { value: 'default' as SortOption, label: 'Mặc định' },
        { value: 'name-asc' as SortOption, label: 'Tên: A → Z' },
        { value: 'name-desc' as SortOption, label: 'Tên: Z → A' },
        { value: 'price-asc' as SortOption, label: 'Giá: Thấp → Cao' },
        { value: 'price-desc' as SortOption, label: 'Giá: Cao → Thấp' },
    ], []);

    const getCurrentOption = useCallback(() => {
        return sortOptions.find(opt => opt.value === currentSort) || sortOptions[0];
    }, [sortOptions, currentSort]);

    const handleOptionSelect = useCallback((option: SortOption) => {
        onSortChange(option);
        setIsOpen(false);
    }, [onSortChange]);

    const handleToggleOpen = useCallback(() => {
        if (!isLoading) {
            setIsOpen(prev => !prev);
        }
    }, [isLoading]);

    const handleCloseDropdown = useCallback(() => {
        setIsOpen(false);
    }, []);

    return (
        <div className="relative inline-block text-left">
            <div>
                <button
                    type="button"
                    className={`group inline-flex items-center justify-center w-full rounded-lg bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-lg border border-gray-300 dark:border-gray-600 hover:shadow-xl hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 min-w-[180px] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    onClick={handleToggleOpen}
                    disabled={isLoading}
                >
                    <span className="flex items-center">
                        {getCurrentOption().label}
                    </span>
                    <span className={`ml-2 h-4 w-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </button>
            </div>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={handleCloseDropdown}
                    />
                    <div className="absolute right-0 z-20 mt-2 w-64 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-2xl ring-1 ring-black ring-opacity-5 dark:ring-gray-600 focus:outline-none animate-in fade-in-0 zoom-in-95 duration-300 border border-gray-200 dark:border-gray-600">
                        <div className="py-2">
                            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-600">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sắp xếp theo</p>
                            </div>
                            {sortOptions.map((option, index) => (
                                <button
                                    key={option.value}
                                    onClick={() => handleOptionSelect(option.value)}
                                    className={`${currentSort === option.value
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-500'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-700 dark:hover:to-gray-600'
                                        } group flex w-full items-center px-4 py-3 text-sm transition-all duration-300 hover:scale-105 transform relative overflow-hidden`}
                                    style={{
                                        animationDelay: `${index * 50}ms`
                                    }}
                                >
                                    <span className="font-medium">{option.label}</span>
                                    {currentSort === option.value && (
                                        <span className="ml-auto flex items-center">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                                            <span className="text-blue-500">✓</span>
                                        </span>
                                    )}
                                    {/* Hover effect overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(SortFilter);
