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

    const { coupon} = body;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!coupon) {
      return new NextResponse("Coupon is required", { status: 400 });
    }

    const couponData = await prismadb.coupon.findFirst({
      where: {
        code: coupon
      }
    });
  
    return NextResponse.json({couponData}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[COUPON_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};