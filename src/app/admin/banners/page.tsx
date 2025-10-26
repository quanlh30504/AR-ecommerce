import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import BannerManagerClient from './BannerManagerClient';

export default function BannersAdminPage() {
    return (
        <AdminGuard>
            <AdminLayout>
                <BannerManagerClient />
            </AdminLayout>
        </AdminGuard>
    );
}
