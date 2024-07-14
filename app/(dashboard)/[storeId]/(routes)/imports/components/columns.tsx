"use client";

import { ColumnDef } from "@tanstack/react-table";

export type ImportColumn = {
  id: string;
  name: string;
  billboardLabel: string;
  totalPrice: any;
  createdAt: string;
};

export const columns: ColumnDef<ImportColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "billboard",
    header: "Billboard",
    cell: ({ row }) => row.original.billboardLabel,
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => row.original.totalPrice,
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];
