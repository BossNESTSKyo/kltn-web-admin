"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, CouponColumn } from "./columns";
import { ApiList } from "@/components/ui/api-list";

interface CouponsClientProps {
  data: CouponColumn[];
}

export const CouponsClient: React.FC<CouponsClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Coupons (${data.length})`}
          description="Manage coupons for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/coupons/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="code" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Coupons" />
      <Separator />
      <ApiList entityName="coupons" entityIdName="couponId" />
    </>
  );
};
