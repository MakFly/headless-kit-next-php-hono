import { SiteHeader } from '@/components/site-header';
import { AdminOrdersTable } from '@/components/shop/admin/orders-table';

export default function AdminOrdersPage() {
  return (
    <>
      <SiteHeader title="Admin Orders" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminOrdersTable />
      </div>
    </>
  );
}
