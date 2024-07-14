"use client";

import { Heading } from "@/components/ui/heading";
import { ApiList } from "@/components/ui/api-list";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

import { columns, RefundColumn } from "./columns";

interface RefundClientProps {
  data: RefundColumn[];
}

export const RefundClient: React.FC<RefundClientProps> = ({ data }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Refunds (${data.length})`}
          description="Manage refunds for your store"
        />
      </div>
      <Separator />
      <DataTable searchKey="userName" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Refunds" />
      <Separator />
      <ApiList entityName="refunds" entityIdName="refundId" />
    </>
  );
};
