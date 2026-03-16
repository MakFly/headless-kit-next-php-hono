import { SiteHeader } from '@/components/site-header';
import { AdminCustomersTable } from '@/components/shop/admin/customers-table';

export default function AdminCustomersPage() {
  return (
    <>
      <SiteHeader title="Admin Customers" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminCustomersTable />
      </div>
    </>
  );
}
