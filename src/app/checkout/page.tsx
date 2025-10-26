import { Suspense } from 'react';
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Loader2 } from 'lucide-react';

import { getAddresses } from "@/lib/actions/address";
import { getCheckoutItems } from "@/lib/actions/cart";
import { getUserForHeader } from '@/lib/actions/user'; 
import CheckoutView from "@/Components/checkout/CheckoutView";

interface CheckoutPageProps {
    searchParams: {
        items?: string;
    };
}

// --- Component Server bất đồng bộ để fetch dữ liệu ---
async function CheckoutDataFetcher({ selectedItemIds }: { selectedItemIds: string[] }) {
    const [addressResponse, itemsResponse, userData] = await Promise.all([
        getAddresses(),
        getCheckoutItems(selectedItemIds),
        getUserForHeader() // Dùng hàm này thay cho việc query UserModel trực tiếp
    ]);

    // Xử lý nếu không có dữ liệu cần thiết
    const initialAddresses = addressResponse.success ? addressResponse.data : [];
    const checkoutItems = itemsResponse.success ? itemsResponse.data : [];

    if (checkoutItems.length === 0) {
        redirect("/cart");
    }

    // 3. Truyền toàn bộ object userData xuống client component
    return (
        <CheckoutView 
            initialAddresses={JSON.parse(JSON.stringify(initialAddresses))}
            checkoutItems={JSON.parse(JSON.stringify(checkoutItems))}
            userData={userData}
        />
    );
}


// --- Component Trang chính ---
export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
    const session = await auth();
    if (!session?.user) {
        redirect("/login?error=CheckoutAuthRequired");
    }

    const selectedItemIds = searchParams.items?.split(',') || [];
    if (selectedItemIds.length === 0) {
        redirect("/cart");
    }

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6 text-center">THANH TOÁN</h1>
                <Suspense fallback={
                    <div className="flex justify-center items-center h-96">
                        <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                    </div>
                }>
                    {/* 4. Gọi component fetcher */}
                    <CheckoutDataFetcher selectedItemIds={selectedItemIds} />
                </Suspense>
            </div>
        </div>
    );
}
