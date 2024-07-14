import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { refundId: string, storeId: string } }
) {
  try {
    const body = await req.json();

    const { accept, reason } = body;

    if (!params.refundId) {
      return new NextResponse("Refund id is required", { status: 400 });
    }

    if (!accept) {
      return new NextResponse("Accept is required", { status: 403 });
    }

    if (!reason) {
      return new NextResponse("Reason is required", { status: 400 });
    }
    
    const refund = await prismadb.refund.update({
      where: {
        id: params.refundId
      },
      data: {
        accept,
        reason
      },
    });
  
    return NextResponse.json(refund);
  } catch (error) {
    console.log('[REFUND_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};