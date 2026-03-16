import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { WelcomeBanner } from '@/components/shop/admin/welcome-banner';
import { CardWithIcon } from '@/components/shop/admin/card-with-icon';
import { formatPrice } from '@/components/shop/admin/format';
import { getAdminDashboardAction } from '@/lib/actions/shop/admin';
import { AdminDashboardChart } from '@/components/shop/admin/dashboard-chart';
import { PendingOrders } from '@/components/shop/admin/pending-orders';
import { PendingReviews } from '@/components/shop/admin/pending-reviews';
import { NewCustomers } from '@/components/shop/admin/new-customers';
import {
  DollarSign,
  ShoppingCart,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  let dashboard;
  try {
    dashboard = await getAdminDashboardAction();
  } catch {
    dashboard = null;
  }

  return (
    <>
      <SiteHeader title="Admin Dashboard" />
      <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
        <WelcomeBanner />

        {dashboard ? (
          <div className="flex flex-col md:flex-row gap-4">
            {/* LEFT COLUMN */}
            <div className="flex flex-col gap-4 md:basis-1/2">
              <div className="flex flex-col md:flex-row gap-4">
                <CardWithIcon
                  icon={DollarSign}
                  title="Monthly Revenue"
                  subtitle={formatPrice(dashboard.monthlyRevenue)}
                  to="/shop/admin/orders"
                />
                <CardWithIcon
                  icon={ShoppingCart}
                  title="New Orders"
                  subtitle={dashboard.nbNewOrders}
                  to="/shop/admin/orders"
                />
              </div>
              <Card>
                <CardContent className="pt-6">
                  {dashboard.orderChart && dashboard.orderChart.length > 0 ? (
                    <AdminDashboardChart data={dashboard.orderChart} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No chart data available.
                    </p>
                  )}
                </CardContent>
              </Card>
              <PendingOrders />
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-4 md:basis-1/2">
              <PendingReviews />
              <NewCustomers />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Unable to load dashboard data. Please ensure you are authenticated
              with admin access.
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
