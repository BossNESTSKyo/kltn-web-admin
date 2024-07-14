import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { CouponColumn } from "./components/columns";
import { CouponsClient } from "./components/client";

const CouponsPage = async ({ params }: { params: { storeId: string } }) => {
  const coupons = await prismadb.coupon.findMany({
    where: {
      storeId: params.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCoupons: CouponColumn[] = coupons.map((item) => ({
    id: item.id,
    code: item.code,
    description: item.description,
    value: item.value,
    quantity: item.quantity,
    expiredDate: format(item.expiredDate, "MMMM do, yyyy"),
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CouponsClient data={formattedCoupons} />
      </div>
    </div>
  );
};

export default CouponsPage;
