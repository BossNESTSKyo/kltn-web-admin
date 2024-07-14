import prismadb from "@/lib/prismadb";

import { RefundForm } from "./components/refund-form";

const RefundPage = async ({ params }: { params: { refundId: string } }) => {
  const refund = await prismadb.refund.findUnique({
    where: {
      id: params.refundId,
    },
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
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RefundForm initialData={refund} />
      </div>
    </div>
  );
};

export default RefundPage;
