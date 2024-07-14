import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

interface GraphData {
  name: string;
  amount: number;
  sellAmount: number;
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, categoryId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
    where: {
        storeId: params.storeId,
        categoryId: params.categoryId,
    },
  });

  const graphData: GraphData[] = [];
  
  for (const product of products) {
     graphData.push({
      name: product.name,
      amount: product.amount,
      sellAmount: product.sellAmount,
    });
  } 

  return NextResponse.json(graphData);
  } catch (error) {
    console.log('[GRAPH_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
