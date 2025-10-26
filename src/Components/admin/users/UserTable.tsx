import React from 'react';
import { CheckIcon, LockIcon } from './UserIcons';
import { PaginationWrapper } from '../../PaginationWrapper';

const TABLE_HEADER_CLASS = "px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider";
const TABLE_CELL_CLASS = "px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300";
const TABLE_CELL_NAME_CLASS = "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100";
const ROLE_ADMIN_CLASS = "px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300";
const ROLE_USER_CLASS = "px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300";
const STATUS_ADMIN_CLASS = "px-3 py-1 text-xs text-gray-500 dark:text-gray-400 italic border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 cursor-not-allowed";
const STATUS_ACTIVE_CLASS = "w-28 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white border-gray-700 hover:from-gray-700 hover:to-gray-900 focus:ring-gray-400";
const STATUS_BANNED_CLASS = "w-28 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs font-bold shadow transition-all duration-200 border focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-gray-300 to-gray-500 text-gray-800 border-gray-400 hover:from-gray-400 hover:to-gray-600 focus:ring-gray-300 dark:from-gray-700 dark:to-gray-900 dark:text-gray-100 dark:border-gray-700 dark:hover:from-gray-800 dark:hover:to-gray-950 dark:focus:ring-gray-600";
interface User {
    _id: string;
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
}

interface UserTableProps {
    users: User[];
    loading: boolean;
    toggleUserStatus: (userId: string, currentStatus: boolean) => void;
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    usersPerPage: number;
    handlePageChange: (page: number) => void;
}

export default function UserTable({ users, loading, toggleUserStatus, currentPage, totalPages, totalUsers, usersPerPage, handlePageChange }: UserTableProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Danh sách người dùng</h3>
            </div>
            {loading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Đang tải...</p>
                </div>
            ) : (
                <>
                    <div className="w-full">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className={TABLE_HEADER_CLASS}>Tên</th>
                                    <th className={TABLE_HEADER_CLASS}>Email</th>
                                    <th className={TABLE_HEADER_CLASS}>Số điện thoại</th>
                                    <th className={TABLE_HEADER_CLASS}>Vai trò</th>
                                    <th className={TABLE_HEADER_CLASS}>Trạng thái</th>
                                    <th className={TABLE_HEADER_CLASS}>Ngày tạo</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                                {users.map((user) => (
                                    <tr key={user._id?.toString()} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className={TABLE_CELL_NAME_CLASS}>{user.name || 'N/A'}</td>
                                        <td className={TABLE_CELL_CLASS}>{user.email || 'N/A'}</td>
                                        <td className={TABLE_CELL_CLASS}>
                                            {user.phone || <span className="text-gray-400 dark:text-gray-500">Chưa cập nhật</span>}
                                        </td>
                                        <td className={TABLE_CELL_CLASS}>
                                            <span className={user.role === 'admin' ? ROLE_ADMIN_CLASS : ROLE_USER_CLASS}>
                                                {user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {user.role === 'admin' ? (
                                                <span className={STATUS_ADMIN_CLASS}>Quản trị viên</span>
                                            ) : (
                                                <button
                                                    onClick={() => toggleUserStatus(user._id!, user.isActive || false)}
                                                    className={user.isActive ? STATUS_ACTIVE_CLASS : STATUS_BANNED_CLASS}
                                                    title={user.isActive ? 'Click để khóa tài khoản' : 'Click để mở khóa tài khoản'}
                                                >
                                                    {user.isActive ? (
                                                        <>
                                                            <CheckIcon />
                                                            Hoạt động
                                                        </>
                                                    ) : (
                                                        <>
                                                            <LockIcon />
                                                            Khóa
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                                        {/* Pagination */}
                                        <div className="pt-2">
                                            <PaginationWrapper
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                            <div className="text-sm text-gray-700 dark:text-gray-300 mt-2 text-center">
                                                Hiển thị {((currentPage - 1) * usersPerPage) + 1} đến {Math.min(currentPage * usersPerPage, totalUsers)} của {totalUsers} người dùng
                                            </div>
                                        </div>
                </>
            )}
            {!loading && users.length === 0 && (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    Không tìm thấy người dùng nào
                </div>
            )}
        </div>
    );
}
