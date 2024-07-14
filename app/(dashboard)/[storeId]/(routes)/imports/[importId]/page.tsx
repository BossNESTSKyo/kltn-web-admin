import prismadb from "@/lib/prismadb";

import { ImportForm } from "./components/import-form";

const ImportPage = async ({
  params,
}: {
  params: { importId: string; storeId: string };
}) => {
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ImportForm billboards={billboards} categories={categories} />
      </div>
    </div>
  );
};

export default ImportPage;
