import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const refunds = await prismadb.refund.findMany({
      include: {
        images: true,
        user: true,
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(refunds);
  } catch (error) {
    console.log('[REFUNDS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};