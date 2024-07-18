import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    
    const { orderId } = body;
    
    if (!params.storeId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const order = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        isPaid: true,
        state: "payment",
        address: "",
        phone: "",
      },
      include: {
        orderItems: true,
      }
    });

    const orderItems = order.orderItems;
    for (const orderItem of orderItems) {
      await prismadb.product.update({
        where: {
          id: orderItem.productId,
        },
        data: {
          //isArchived: true,
          amount: {
            decrement: orderItem.quantity,
          },
          sellAmount: {
            increment: orderItem.quantity,
          }
        },
      });
    }

    const couponId = order.couponId;
    if (couponId !== ""){
      await prismadb.coupon.update({
        where: {
          id: couponId,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    }
  
    return new NextResponse(null, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse("Internal error", { status: 500, headers: corsHeaders });
  }
};