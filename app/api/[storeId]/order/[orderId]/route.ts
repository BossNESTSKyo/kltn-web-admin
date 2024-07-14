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

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string, storeId: string } }
) {
  try {
    const body = await req.json();

    const { customerId, phoneNumber, address, state } = body;

    if (!customerId) {
      return new NextResponse("Customer id is required", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.orderId) {
      return new NextResponse("Order id is required", { status: 400 });
    }

    const orderByUserId = await prismadb.order.findFirst({
      where: {
        id: params.orderId,
        storeId: params.storeId,
        userId: customerId
      }
    });

    if (!orderByUserId) {
      return new NextResponse("Order not found.", { status: 405 });
    }

    if (state === ""){
      await prismadb.order.update({
        where: {
          id: params.orderId
        },
        data: {
          phone: phoneNumber,
          address, 
          state
        }
      });
    }
    else {
      await prismadb.order.update({
        where: {
          id: params.orderId
        },
        data: { 
          state
        }
      });
    }
  
    return NextResponse.json({}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[ORDER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
