import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

interface GraphData {
  name: string;
  sellAmount: number;
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, productId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const paidOrders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
      isPaid: true,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const monthlyRevenue: { [key: number]: number } = {};

  for (const order of paidOrders) {
    const month = order.createdAt.getMonth();
    let revenueForOrder = 0;

    for (const item of order.orderItems) {
      if (item.productId === params.productId) {
        revenueForOrder += item.quantity;
      }
    }

    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + revenueForOrder;
  }

  const graphData: GraphData[] = [
    { name: "Jan", sellAmount: 0 },
    { name: "Feb", sellAmount: 0 },
    { name: "Mar", sellAmount: 0 },
    { name: "Apr", sellAmount: 0 },
    { name: "May", sellAmount: 0 },
    { name: "Jun", sellAmount: 0 },
    { name: "Jul", sellAmount: 0 },
    { name: "Aug", sellAmount: 0 },
    { name: "Sep", sellAmount: 0 },
    { name: "Oct", sellAmount: 0 },
    { name: "Nov", sellAmount: 0 },
    { name: "Dec", sellAmount: 0 },
  ];

  for (const month in monthlyRevenue) {
    graphData[parseInt(month)].sellAmount = monthlyRevenue[parseInt(month)];
  }

    return NextResponse.json(graphData);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
