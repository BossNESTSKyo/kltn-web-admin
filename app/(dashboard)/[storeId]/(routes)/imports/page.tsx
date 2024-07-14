import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { ImportColumn } from "./components/columns";
import { ImportsClient } from "./components/client";

const ImportsPage = async ({ params }: { params: { storeId: string } }) => {
  const imports = await prismadb.import.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      billboard: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedImports: ImportColumn[] = imports.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    totalPrice: item.totalPrice,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ImportsClient data={formattedImports} />
      </div>
    </div>
  );
};

export default ImportsPage;
