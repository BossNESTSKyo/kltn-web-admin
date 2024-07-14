import { format } from "date-fns";

import prismadb from "@/lib/prismadb";

import { UserColumn } from "./components/columns";
import { UsersClient } from "./components/client";

const CategoriesPage = async ({ params }: { params: { storeId: string } }) => {
  const users = await prismadb.user.findMany();

  const formattedUsers: UserColumn[] = users.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    address: item.address,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <UsersClient data={formattedUsers} storeId={params.storeId} />
      </div>
    </div>
  );
};

export default CategoriesPage;
