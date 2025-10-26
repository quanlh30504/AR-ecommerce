import Link from 'next/link';
import { PlusCircle, AlertTriangle } from 'lucide-react';
import { getAddresses } from '@/lib/actions/address';
import { Button } from '@/Components/ui/button';
import AddressList from '@/Components/Profile/AddressList';
import { serializeMongoArray } from '@/lib/utils/serialize';

export default async function AddressesPage() {
  try {
    const response = await getAddresses();

    if (!response.success) {
      throw new Error(response.message || "Đã xảy ra lỗi không xác định.");
    }

    const addresses = response.data || [];
    const serializedAddresses = serializeMongoArray(addresses);

    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Danh sách địa chỉ
          </h1>
          <Button asChild>
            <Link href="/profile/addresses/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm địa chỉ mới
            </Link>
          </Button>
        </div>
        <AddressList initialAddresses={serializedAddresses} />
      </div>
    );
  } catch (error) {
    // Ghi lại lỗi trên server 
    console.error("Lỗi khi tải danh sách địa chỉ:", error);

    // Render UI thông báo lỗi
    return (
      <div className="flex flex-col items-center justify-center text-center bg-red-50 border border-red-200 text-red-700 px-4 py-8 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Không thể tải địa chỉ</h2>
        <p className="max-w-md">
          Đã có lỗi xảy ra trong quá trình tải danh sách địa chỉ của bạn. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }
}
