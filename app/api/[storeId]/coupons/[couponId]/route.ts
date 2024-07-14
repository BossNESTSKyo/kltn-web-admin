import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function DELETE(
  req: Request,
  { params }: { params: { couponId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.couponId) {
      return new NextResponse("Coupon id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const coupon = await prismadb.coupon.delete({
      where: {
        id: params.couponId
      }
    });
  
    return NextResponse.json(coupon);
  } catch (error) {
    console.log('[COUPON_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function PATCH(
  req: Request,
  { params }: { params: { couponId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { code, description, value, expiredDate, quantity } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }
    
    if (!description) {
      return new NextResponse("Description is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!quantity) {
      return new NextResponse("Quantity is required", { status: 400 });
    }

    if (!expiredDate) {
      return new NextResponse("Expired date is required", { status: 400 });
    }


    if (!params.couponId) {
      return new NextResponse("Coupon id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const coupon = await prismadb.coupon.update({
      where: {
        id: params.couponId
      },
      data: {
        code,
        description,
        value,
        quantity,
        expiredDate: new Date(expiredDate),
      }
    });
  
    return NextResponse.json(coupon);
  } catch (error) {
    console.log('[COUPON_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
