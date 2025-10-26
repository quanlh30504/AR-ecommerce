import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const allowedOrigins = [
    'https://ghoul-emerging-grossly.ngrok-free.app',
    'http://localhost:3001', // Thêm origin của frontend dev nếu có
];

const setCorsHeaders = (response: NextResponse | Response, request: NextRequest) => {
    // Lấy origin từ header của request gửi đến
    const origin = request.headers.get('origin') ?? '';

    // Kiểm tra xem origin có trong danh sách được phép không
    if (allowedOrigins.includes(origin)) {
        // Nếu có, chỉ trả về đúng origin đó
        response.headers.set('Access-Control-Allow-Origin', origin);
    }

    // Các header khác có thể giữ nguyên
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
};

export async function middleware(request: NextRequest) {

    // Xử lý OPTIONS request
    if (request.method === 'OPTIONS') {
        const response = new NextResponse(null);
        return setCorsHeaders(response, request);
    }

    // Tạo response trước
    let response = NextResponse.next();


    const token = await getToken({ req: request, secret: process.env.AUTH_SECRET });
    const { pathname } = request.nextUrl;

    if (token && typeof token === 'object' && token.error) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/login';
        loginUrl.searchParams.set('error', String(token.error));
        response = NextResponse.redirect(loginUrl);
    }

    const isAuthToken = (t: unknown): t is { role?: string; isActive?: boolean } =>
        t !== null && typeof t === 'object' && ('role' in t || 'isActive' in t);

    if (isAuthToken(token) && token.role !== 'admin' && token.isActive === false) {
        if (pathname !== '/banned') {
            const bannedUrl = request.nextUrl.clone();
            bannedUrl.pathname = '/banned';
            bannedUrl.searchParams.set('from', pathname);
            response = NextResponse.redirect(bannedUrl);
        }
    }

    if (isAuthToken(token) && token.role !== 'admin' && token.isActive !== false && pathname === '/banned') {
        const from = request.nextUrl.searchParams.get('from');
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = from && from !== '/banned' ? from : '/';
        redirectUrl.searchParams.delete('from');
        response = NextResponse.redirect(redirectUrl);
    }

    if (pathname.startsWith('/admin')) {
        if (!isAuthToken(token) || token.role !== 'admin') {
            const homeUrl = request.nextUrl.clone();
            homeUrl.pathname = '/';
            response = NextResponse.redirect(homeUrl);
        }
    }
    // ===============================================
    // Kết thúc logic xác thực
    // ===============================================

    return setCorsHeaders(response, request);
}

export const config = {
    matcher: [
        '/api/:path*',
        '/admin/:path*',
        '/banned',
        '/profile/:path*',
        '/checkout',
        '/mandala-pay/:path*',
    ],
};
