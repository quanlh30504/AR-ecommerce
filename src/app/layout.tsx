import AuthProvider from "@/Components/Auth/AuthProvider";
import BanWatcher from "@/Components/Auth/BanWatcher";
import ToastProvider from "@/Components/ToastProvider";
import { ConditionalLayout } from "@/Components/ConditionalLayout";
import { ThemeProvider } from "@/Components/providers/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/Components/footer";
import SiteHeader from "@/Components/SiteHeader";
import { getCart } from "@/lib/actions/cart";
import CartStateSyncer from "@/Components/CartStateSyncer";
import AblyClientProvider from "@/Components/providers/AblyClientProvider";
import { FavoriteProvider } from "@/hooks/useFavorite";
import TawkToChat from "@/Components/chat/TawkToChat";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Madala - Cửa hàng thời trang và phụ kiện",
  description:
    "Madala - Điểm đến hoàn hảo cho thời trang và phụ kiện chất lượng cao",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartResult = await getCart();
  const initialCart = cartResult.success ? cartResult.data : null;
  const plainInitialCart = initialCart
    ? JSON.parse(JSON.stringify(initialCart))
    : null;
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          themes={["light", "dark"]}
          disableTransitionOnChange={true}
          storageKey="madala-theme"
          forcedTheme={undefined}
        >
          <AuthProvider>
            <FavoriteProvider>
              <AblyClientProvider />
              <BanWatcher />
              <ToastProvider />
              <CartStateSyncer serverCart={plainInitialCart} />
              <ConditionalLayout header={<SiteHeader />} footer={<Footer />}>
                {children}
              </ConditionalLayout>
            </FavoriteProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
