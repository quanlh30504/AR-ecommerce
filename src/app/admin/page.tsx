import { AdminGuard } from '@/Components/admin/AdminGuard';
import { AdminLayout } from '@/Components/admin/AdminLayout';
import ClientDashboard from './ClientDashboard';

export default function AdminPage() {
  return (
    <AdminGuard>
      <AdminLayout>
        <ClientDashboard />
      </AdminLayout>
    </AdminGuard>
  );
}

