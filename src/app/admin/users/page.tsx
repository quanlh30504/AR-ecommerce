"use client";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import { userService } from '@/services/userService';
import { toast } from 'react-hot-toast';

const UserStatsCards = dynamic(() => import('@/Components/admin/users/UserStatsCards'), { ssr: false });
const UserSearchBar = dynamic(() => import('@/Components/admin/users/UserSearchBar'), { ssr: false });
const UserTable = dynamic(() => import('@/Components/admin/users/UserTable'), { ssr: false });

interface User {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
}

interface UserStats {
    totalUsers: number;
    totalAdmins: number;
    totalRegularUsers: number;
    weeklyUsers: number;
    activeUsers: number;
    bannedUsers: number;
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const usersPerPage = 10;

    // Fetch user statistics
    const fetchStats = async () => {
        try {
            const statsData = await userService.getUserStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    // Fetch users
    const fetchUsers = async (page = 1, search = '') => {
        try {
            setLoading(true);
            const response = await userService.getAllUsers({
                page,
                limit: usersPerPage,
                search: search || undefined
            });

            if (response.success && response.data) {
                // Convert IUser[] to User[]
                const convertedUsers: User[] = response.data.map((user: unknown) => {
                    const u = user as User & { _id?: string | { toString: () => string } };
                    return {
                        _id: u._id?.toString() || '',
                        name: u.name,
                        email: u.email,
                        phone: u.phone,
                        role: u.role,
                        isActive: u.isActive,
                        createdAt: u.createdAt,
                    };
                });
                setUsers(convertedUsers);
                setTotalPages(response.totalPages || 1);
                setTotalUsers(response.total || 0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    // Toggle user status
    const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const response = await userService.updateUser(userId, { isActive: !currentStatus });

            if (response.success) {
                setUsers(users.map(user =>
                    user._id === userId
                        ? { ...user, isActive: !currentStatus }
                        : user
                ));
                await fetchStats();
                toast.success(currentStatus ? 'Đã khóa tài khoản người dùng' : 'Đã mở khóa tài khoản người dùng');
            } else {
                toast.error(response.error || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng');
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái người dùng');
        }
    };

    // Handle search
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
        fetchUsers(1, value);
    };

    // Handle page change
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchUsers(page, searchTerm);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
        fetchUsers(1, '');
    };

    useEffect(() => {
        fetchStats();
        fetchUsers();
    }, []);

    return (
        <AdminGuard>
            <AdminLayout>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white drop-shadow-sm">Quản lý người dùng</h1>
                            <p className="text-gray-600 dark:text-gray-500 mt-1">Quản lý thông tin người dùng trong hệ thống</p>
                        </div>
                    </div>
                    {/* Stats Cards */}
                    {stats && (
                        <Suspense fallback={<div>Đang tải thống kê người dùng...</div>}>
                            <UserStatsCards stats={stats} />
                        </Suspense>
                    )}
                    <Suspense fallback={<div>Đang tải thanh tìm kiếm...</div>}>
                        <UserSearchBar
                            searchTerm={searchTerm}
                            onSearch={handleSearch}
                            onClear={clearSearch}
                        />
                    </Suspense>
                    <Suspense fallback={<div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div><p className="mt-2 text-gray-600 dark:text-gray-300">Đang tải bảng người dùng...</p></div>}>
                        <UserTable
                            users={users}
                            loading={loading}
                            toggleUserStatus={toggleUserStatus}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalUsers={totalUsers}
                            usersPerPage={usersPerPage}
                            handlePageChange={handlePageChange}
                        />
                    </Suspense>
                </div>
            </AdminLayout>
        </AdminGuard>
    );
}
