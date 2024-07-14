"use client";

import { Heading } from "@/components/ui/heading";
import { ApiList } from "@/components/ui/api-list";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { ChartUser } from "@/components/chart-user";
import { ChartPurchase } from "@/components/chart-purchase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { columns, UserColumn } from "./columns";

interface CategoriesClientProps {
  data: UserColumn[];
  storeId: string;
}

export const UsersClient: React.FC<CategoriesClientProps> = ({
  data,
  storeId,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Users (${data.length})`}
          description="Manage users for your store"
        />
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Separator />
      <div className="grid gap-4 grid-cols-2">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Prospective Customer Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartUser storeId={storeId} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Customer Purchase Frequency Statistics</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartPurchase storeId={storeId} />
          </CardContent>
        </Card>
      </div>
      <Heading title="API" description="API Calls for Users" />
      <ApiList entityName="users" entityIdName="userId" />
    </>
  );
};
