'use client';
import React, { useCallback, useMemo } from 'react';
import { LayoutGrid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

const VIEWTOGGLE_CONTAINER = "flex items-center bg-gray-100 dark:bg-gray-700 p-1 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600";
const VIEWTOGGLE_BTN = "p-2.5 rounded-md transition-all duration-200 transform hover:scale-110";
const VIEWTOGGLE_BTN_ACTIVE = "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-md border border-blue-200 dark:border-blue-600";
const VIEWTOGGLE_BTN_INACTIVE = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-600/50";

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  const tabs = useMemo(() => [
    {
      id: 'grid' as const,
      label: 'Grid View',
  icon: <LayoutGrid className="text-sm" />
    },
    {
      id: 'list' as const,
      label: 'List View',
  icon: <List className="text-sm" />
    }
  ], []);

  const handleViewChange = useCallback((mode: 'grid' | 'list') => {
    onViewChange(mode);
  }, [onViewChange]);

  return (
    <div className={VIEWTOGGLE_CONTAINER}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleViewChange(tab.id)}
          className={
            `${VIEWTOGGLE_BTN} ` +
            (viewMode === tab.id ? VIEWTOGGLE_BTN_ACTIVE : VIEWTOGGLE_BTN_INACTIVE)
          }
          title={tab.label}
        >
          {tab.icon}
        </button>
      ))}
    </div>
  );
};

export default React.memo(ViewToggle);
