import { SiteHeader } from '@/components/site-header';
import { AdminInventoryTable } from '@/components/shop/admin/inventory-table';

export default function AdminInventoryPage() {
  return (
    <>
      <SiteHeader title="Admin Inventory" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminInventoryTable />
      </div>
    </>
  );
}
