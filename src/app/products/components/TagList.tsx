'use client';
import React, { useCallback, useMemo } from 'react';

interface TagListProps {
  tags: string[];
  selectedTags: string[];
  onSelectTag: (tag: string) => void;
  onClearAllTags: () => void;
}

const TagList: React.FC<TagListProps> = ({ tags, selectedTags, onSelectTag, onClearAllTags }) => {
  const hasSelectedTags = useMemo(() => selectedTags.length > 0, [selectedTags.length]);

  const handleSelectTag = useCallback((tag: string) => {
    onSelectTag(tag);
  }, [onSelectTag]);

  const handleClearAllTags = useCallback(() => {
    onClearAllTags();
  }, [onClearAllTags]);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wide">
          TAG SẢN PHẨM
        </h3>
        {hasSelectedTags && (
          <button
            onClick={handleClearAllTags}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {hasSelectedTags && (
        <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
          <div className="text-xs text-gray-600 dark:text-gray-300 mb-1">Đã chọn ({selectedTags.length}):</div>
          <div className="flex flex-wrap gap-1">
            {selectedTags.map((tag) => (
              <span
                key={`selected-${tag}`}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#8ba63a] dark:bg-[#9CCC65] text-white"
              >
                {tag}
                <button
                  onClick={() => handleSelectTag(tag)}
                  className="ml-1 hover:bg-white hover:bg-opacity-20 dark:hover:bg-black dark:hover:bg-opacity-20 rounded-full w-4 h-4 flex items-center justify-center"
                  title="Bỏ chọn"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => handleSelectTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected
                  ? 'bg-[#8ba63a] dark:bg-[#9CCC65] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default React.memo(TagList);
