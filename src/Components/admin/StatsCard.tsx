import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor: {
    bg: string;
    text: string;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, icon: Icon, iconColor }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 ${iconColor.bg} rounded-full`}>
          <Icon className={`w-6 h-6 ${iconColor.text}`} />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-sm font-medium ${change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {change.value}
        </span>
        <span className="text-gray-600 dark:text-gray-300 text-sm ml-1">so với tháng trước</span>
      </div>
    </div>
  );
};
