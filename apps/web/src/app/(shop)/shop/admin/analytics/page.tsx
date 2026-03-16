import { SiteHeader } from '@/components/site-header';
import { AdminAnalyticsContent } from '@/components/shop/admin/analytics-content';

export default function AdminAnalyticsPage() {
  return (
    <>
      <SiteHeader title="Admin Analytics" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <AdminAnalyticsContent />
      </div>
    </>
  );
}
