"use client";

import { ColumnDef } from "@tanstack/react-table";

import { CellAction } from "./cell-action";

export type CouponColumn = {
  id: string;
  code: string;
  description: string;
  value: number;
  quantity: number;
  expiredDate: string;
  createdAt: string;
};

export const columns: ColumnDef<CouponColumn>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => row.original.code,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.original.description,
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => row.original.value,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => row.original.quantity,
  },
  {
    accessorKey: "expiredDate",
    header: "Expired Date",
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
