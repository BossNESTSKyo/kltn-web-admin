import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, monthId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (params.monthId === undefined || params.monthId === null) {
      return new NextResponse("Month is required", { status: 400 });
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

  const productSales: { [key: string]: { name: string; sellAmount: number } } = {};

  for (const order of paidOrders) {
    const month = order.createdAt.getMonth() + 1;

    if (month === Number(params.monthId)){
        for (const item of order.orderItems) {
          const productId = item.product.id;
          if (!productSales[productId]) {
            productSales[productId] = { name: item.product.name, sellAmount: 0 };
          }
          productSales[productId].sellAmount += item.quantity;
        }
    }
  }

  const sortedProducts = Object.values(productSales).sort((a, b) => b.sellAmount - a.sellAmount);
  const topProducts = sortedProducts.slice(0, 5);

  return NextResponse.json(topProducts);
  } catch (error) {
    console.log('[GRAPH_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
