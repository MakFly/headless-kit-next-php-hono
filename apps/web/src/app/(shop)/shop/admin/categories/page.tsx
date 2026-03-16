import { SiteHeader } from '@/components/site-header';
import { AdminCategoriesTable } from '@/components/shop/admin/categories-table';

export default function AdminCategoriesPage() {
  return (
    <>
      <SiteHeader title="Admin Categories" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminCategoriesTable />
      </div>
    </>
  );
}
