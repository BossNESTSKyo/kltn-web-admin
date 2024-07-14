"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type RefundColumn = {
  id: string;
  userName: string;
  productName: string;
  quantity: number;
  status: string;
  method: string;
  accept: boolean;
};

export const columns: ColumnDef<RefundColumn>[] = [
  {
    accessorKey: "userName",
    header: "User",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "accept",
    header: "Accept",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
