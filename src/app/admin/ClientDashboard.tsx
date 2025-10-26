"use client";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { statsData, activityData, progressData } from '@/constants/dashboardData';

const StatsCard = dynamic(() => import('@/Components/admin/StatsCard').then(mod => mod.StatsCard), { ssr: false });
const ActivityItem = dynamic(() => import('@/Components/admin/ActivityItem').then(mod => mod.ActivityItem), { ssr: false });
const ProgressBar = dynamic(() => import('@/Components/admin/ProgressBar').then(mod => mod.ProgressBar), { ssr: false });

export default function ClientDashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Chào mừng bạn đến với trang quản trị
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <Suspense fallback={<div>Đang tải thống kê...</div>}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statsData.map((stat, index) => (
                        <StatsCard
                            key={index}
                            title={stat.title}
                            value={stat.value}
                            change={stat.change}
                            icon={stat.icon}
                            iconColor={stat.iconColor}
                        />
                    ))}
                </div>
            </Suspense>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Hoạt động gần đây</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <Suspense fallback={<div>Đang tải hoạt động...</div>}>
                                {activityData.map((activity, index) => (
                                    <ActivityItem
                                        key={index}
                                        title={activity.title}
                                        time={activity.time}
                                        icon={activity.icon}
                                        iconColor={activity.iconColor}
                                    />
                                ))}
                            </Suspense>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Thống kê nhanh</h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <Suspense fallback={<div>Đang tải tiến trình...</div>}>
                                {progressData.map((progress, index) => (
                                    <ProgressBar
                                        key={index}
                                        label={progress.label}
                                        percentage={progress.percentage}
                                        color={progress.color}
                                    />
                                ))}
                            </Suspense>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
