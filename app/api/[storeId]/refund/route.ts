import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();

    const { orderId, userId, productId, quantity, status, method, note, images } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!orderId) {
      return new NextResponse("Order Id is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product Id is required", { status: 400 });
    }

    if (!quantity) {
      return new NextResponse("Quantity is required", { status: 400 });
    }

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    if (!method) {
      return new NextResponse("Method is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const orderByUserId = await prismadb.order.findFirst({
      where: {
        id: orderId,
        userId: userId
      }
    });

    if (!orderByUserId) {
      return new NextResponse("Order by user not found", { status: 405 });
    }

    const refund = await prismadb.refund.create({
      data: {
        orderId,
        userId,
        productId,
        quantity,
        status,
        method,
        note,
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => image),
            ],
          },
        },
      },
    });
  
    return NextResponse.json(refund, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[REFUNDS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId') || undefined;
    const isAcceptStr = searchParams.get('isAccept') || undefined;

    const isAccept = isAcceptStr === "true" ? true : false;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const refunds = await prismadb.refund.findMany({
      where: {
        userId: customerId,
        accept: isAccept,
      },
      include: {
        order: true,
        product: true
      }
      });

    return NextResponse.json({ data: refunds }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[REFUNDS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};