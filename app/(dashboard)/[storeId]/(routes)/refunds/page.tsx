import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { RefundClient } from "./components/client";
import { RefundColumn } from "./components/columns";

const RefundsPage = async ({ params }: { params: { storeId: string } }) => {
  const refunds = await prismadb.refund.findMany({
    include: {
      images: true,
      user: {
        select: {
          name: true,
        },
      },
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedRefunds: RefundColumn[] = refunds.map((item) => ({
    id: item.id,
    userName: item.user.name,
    productName: item.product.name,
    quantity: item.quantity,
    status: item.status,
    method: item.method,
    accept: item.accept,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RefundClient data={formattedRefunds} />
      </div>
    </div>
  );
};

export default RefundsPage;
