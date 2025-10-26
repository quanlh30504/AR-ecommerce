import React from 'react';

interface UserStats {
    totalUsers: number;
    totalAdmins: number;
    totalRegularUsers: number;
    weeklyUsers: number;
    activeUsers: number;
    bannedUsers: number;
}

export default function UserStatsCards({ stats }: { stats: UserStats }) {
    const statsList = [
        {
            label: 'Tổng số',
            value: stats.totalUsers,
            className: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: 'Quản trị viên',
            value: stats.totalAdmins,
            className: 'text-purple-600 dark:text-purple-400',
        },
        {
            label: 'Người dùng',
            value: stats.totalRegularUsers,
            className: 'text-green-600 dark:text-green-400',
        },
        {
            label: 'Hoạt động',
            value: stats.activeUsers,
            className: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: 'Bị khóa',
            value: stats.bannedUsers,
            className: 'text-red-600 dark:text-red-400',
        },
        {
            label: 'Tuần này',
            value: stats.weeklyUsers,
            className: 'text-orange-600 dark:text-orange-400',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statsList.map((item) => (
                <div
                    key={item.label}
                    className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
                >
                    <div className="text-sm text-gray-600 dark:text-gray-300">{item.label}</div>
                    <div className={`text-2xl font-bold ${item.className}`}>{item.value}</div>
                </div>
            ))}
        </div>
    );
}
