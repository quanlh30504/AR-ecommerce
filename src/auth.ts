/**
 * AUTH.TS - NextAuth.js Authentication Configuration
 *
 * CHỨC NĂNG CHÍNH:
 * - Cấu hình NextAuth.js cho toàn bộ ứng dụng
 * - Xác thực người dùng qua email/password (Credentials Provider)
 * - Kết nối với MongoDB để lưu trữ sessions và accounts
 * - Quản lý JWT tokens và session callbacks
 * - Xử lý đăng nhập/đăng xuất users
 *
 * SỬ DỤNG:
 * - Import { auth } từ file này để check authentication trong API routes
 * - Tự động tạo các API endpoints: /api/auth/signin, /api/auth/signout, etc.
 * - Providers: useSession(), signIn(), signOut() trong React components
 *
 * CẤU HÌNH:
 * - MongoDB Adapter để lưu session data
 * - JWT strategy với custom callbacks
 * - Session callbacks để thêm user roles vào session object
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcrypt";
import connectToDB from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import type { User as NextAuthUser, Session as NextAuthSession } from "next-auth";
import type { JWT } from "next-auth/jwt";

interface DBUser {
  _id: string;
  email: string;
  name?: string;
  password?: string;
  role?: "user" | "admin";
  isActive?: boolean;
}

interface User extends NextAuthUser {
  id: string;
  email: string;
  name?: string;
  role?: "user" | "admin";
  isActive?: boolean;
}

// Mở rộng interface Session để user có isActive
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      role?: "user" | "admin";
      isActive?: boolean;
    };
  }
}

export const authConfig = {
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // GitHub Provider
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(
        credentials: Partial<Record<"email" | "password", unknown>>
      ): Promise<(User & { error?: string }) | null> {
        try {
          const email = typeof credentials?.email === 'string' ? credentials.email.toLowerCase().trim() : '';
          const password = credentials?.password as string | undefined;
          if (!email || !password) {
            return { id: "", email, error: "missing_credentials" };
          }
          await connectToDB();
          const user = await User.findOne({ email }).lean<DBUser>();
          if (!user) {
            return { id: "", email, error: "user_not_found" };
          }
          if (!user.password) {
            return { id: user._id.toString(), email: user.email || '', error: "no_password" };
          }
          // Kiểm tra password
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            return { id: user._id.toString(), email: user.email || '', error: "invalid_password" };
          }
          // Kiểm tra user có bị ban không (double check)
          if (user.isActive === false) {
            return { id: user._id.toString(), email: user.email || '', error: "banned" };
          }
          return {
            id: user._id.toString(),
            email: user.email || '',
            name: typeof user.name === 'string' ? user.name : undefined,
            role: user.role === "admin" ? "admin" : "user",
            isActive: user.isActive,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return { id: "", email: "", error: "server_error" };
        }
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    jwt: async ({ token, user, account }: { token: JWT; user?: User | null; account?: Record<string, unknown> }) => {
      // Lần đầu sau login
      if (user && account) {
        token.id = (user as User).id;
        token.email = user.email;
        token.role = (user as User).role ?? 'user';
        token.isActive = (user as User).isActive ?? true;
        token.provider = account.provider;
        token.lastCheckedAt = Date.now();
        return token;
      }
      // Chỉ kiểm tra DB mỗi 2 phút để giảm tải
      const TWO_MIN = 2 * 60 * 1000;
      if (!token.lastCheckedAt || Date.now() - (token.lastCheckedAt as number) > TWO_MIN) {
        await connectToDB();
        const email = token.email;
        if (email) {
          const u = await User.findOne({ email }).select('isActive').lean();
          const userObj = Array.isArray(u) ? u[0] : u;
          if (userObj && typeof (userObj as { isActive?: boolean }).isActive !== 'undefined') {
            token.isActive = (userObj as { isActive?: boolean }).isActive !== false;
          }
        }
        token.lastCheckedAt = Date.now();
      }
      return token;
    },
    session: async ({ session, token }: { session: NextAuthSession; token: JWT }) => {
      if (session.user) {
        session.user.id = typeof token.id === 'string' ? token.id : '';
        session.user.role = typeof token.role === 'string' ? token.role : 'user';
        session.user.name = typeof token.name === 'string' ? token.name : undefined;
        session.user.email = typeof token.email === 'string' ? token.email : '';
        session.user.isActive = typeof token.isActive === 'boolean' ? token.isActive : true;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
