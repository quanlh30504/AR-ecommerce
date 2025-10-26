"use client";

import React, { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SessionUser {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
    isActive?: boolean;
}

const BanWatcher = React.memo(function BanWatcher() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const user: SessionUser & { error?: string } | undefined = session?.user as SessionUser & { error?: string } | undefined;


    const handleBanRedirect = useCallback(() => {
        if (pathname !== "/login" && pathname !== "/banned") {
            localStorage.setItem("lastPathBeforeBan", pathname);
        }
        router.replace("/banned");
    }, [pathname, router]);

    const handleUnbanRedirect = useCallback(() => {
        const lastPath = localStorage.getItem("lastPathBeforeBan");
        localStorage.removeItem("lastPathBeforeBan");
        router.replace(lastPath && lastPath !== "/banned" ? lastPath : "/");
    }, [router]);

    useEffect(() => {
        if (status !== "authenticated") return;
        // Nếu có lỗi xác thực thì redirect về /login?error=...
        if (user?.error) {
            router.replace(`/login?error=${encodeURIComponent(user.error)}`);
            return;
        }
        const isBanned = user?.isActive === false;
        // Khi bị ban, lưu lại trang hiện tại vào localStorage rồi chuyển sang /banned
        if (isBanned && pathname !== "/banned") {
            handleBanRedirect();
        }
        // Khi được gỡ ban, lấy lại lastPath từ localStorage để redirect
        if (!isBanned && pathname === "/banned") {
            handleUnbanRedirect();
        }
    }, [user, status, pathname, router, searchParams, handleBanRedirect, handleUnbanRedirect]);

    return null;
});

export default BanWatcher;
