import { SiteHeader } from '@/components/site-header';
import { AdminProductsTable } from '@/components/shop/admin/products-table';

export default function AdminProductsPage() {
  return (
    <>
      <SiteHeader title="Admin Products" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminProductsTable />
      </div>
    </>
  );
}
