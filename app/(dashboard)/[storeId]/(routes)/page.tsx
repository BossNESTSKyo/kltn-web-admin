import { CreditCard, DollarSign, Package } from "lucide-react";

import { Overview } from "@/components/overview";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ChartProduct } from "@/components/chart-product";
import { ChartProductHot } from "@/components/chart-product-hot";
import { ChartProductSell } from "@/components/chart-product-sell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatter } from "@/lib/utils";
import { getSalesCount } from "@/actions/get-sales-count";
import { getStockCount } from "@/actions/get-stock-count";
import { getTotalRevenue } from "@/actions/get-total-revenue";
import { getGraphRevenue } from "@/actions/get-graph-revenue";

interface DashboardPageProps {
  params: {
    storeId: string;
  };
}

const DashboardPage: React.FC<DashboardPageProps> = async ({ params }) => {
  const totalRevenue = await getTotalRevenue(params.storeId);
  const graphRevenue = await getGraphRevenue(params.storeId);
  const salesCount = await getSalesCount(params.storeId);
  const stockCount = await getStockCount(params.storeId);

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />
        <div className="grid gap-4 grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products In Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
        </div>
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={graphRevenue} />
          </CardContent>
        </Card>
        <Card className="col-span-4">
          <CardHeader className="text-center">
            <CardTitle>Product Quantity Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartProduct storeId={params.storeId} />
          </CardContent>
        </Card>
        <div className="grid gap-4 grid-cols-2">
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Monthly Best-Selling Products Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartProductHot storeId={params.storeId} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Monthly Product Purchase Statistics</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartProductSell storeId={params.storeId} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
