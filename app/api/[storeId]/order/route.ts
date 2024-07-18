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

    const user = await prismadb.user.findFirst({
      where: {
        userId: customerId
      }
    })

    if (!user) {
      return new NextResponse("User is required", { status: 400 });
    }

    const order = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        userId: user.id,
        isPaid: true,
        ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } }),
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
      orderBy: {
        createdAt: 'desc'
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

