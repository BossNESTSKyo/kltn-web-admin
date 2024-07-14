import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, productId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const reviewItems = await prismadb.reviewItem.findMany({
      where: {
        productId: params.productId,
        review: {
          storeId: params.storeId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ data: reviewItems }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[FAVORITE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};