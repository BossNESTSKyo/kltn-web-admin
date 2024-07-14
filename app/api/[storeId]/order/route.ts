import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId') || undefined;
    const startDateStr  = searchParams.get('startDate') || "";
    const endDateStr = searchParams.get('endDate') || "";

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const order = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        userId: customerId,
        isPaid: true,
        ...(startDate && { createdAt: { gte: startDate } }),
        ...(endDate && { createdAt: { lte: endDate } }),
      },
      select: {
        orderItems: {
          select: {
            product: {
              select: {
                id: true,
                name: true,
                images: true, 
                price: true,
                priceVN: true,
                priceDiscount: true,
                priceVNDiscount: true
              }
            },
            quantity: true,
            color: {
              select: {
                name: true
              }
            },
            size: {
              select: {
                value: true
              }
            }
          },
        },
        totalPrice: true,
        phone: true,
        address: true,
        state: true,
        deliveryDay: true,
        createdAt: true,
        updatedAt: true,
        id: true
      },
    });

    return NextResponse.json({ data: order }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[ORDER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

