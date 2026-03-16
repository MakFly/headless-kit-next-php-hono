import { SiteHeader } from '@/components/site-header';
import { AdminReviewsTable } from '@/components/shop/admin/reviews-table';

export default function AdminReviewsPage() {
  return (
    <>
      <SiteHeader title="Admin Reviews" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminReviewsTable />
      </div>
    </>
  );
}
