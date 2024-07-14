import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

import prismadb from '@/lib/prismadb';
 
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, billboardId, rows, totalPrice } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!totalPrice) {
      return new NextResponse("Total Price is required", { status: 400 });
    }

    if (!rows) {
      return new NextResponse("Products import is required", { status: 400 });
    }
    
    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const newImport = await prismadb.import.create({
        data: {
          storeId: params.storeId,
          billboardId,
          name,
          totalPrice,
          importItems: {
            create: rows.map((row: any) => ({
              categoryId: row.categoryId,
              productId: row.productId,
              quantity: row.quantity,
            })),
          },
        },
        include: {
          importItems: true,
        },
      });
    
    for (const row of rows) {
        const { productId, quantity } = row;

        const currentProduct = await prismadb.product.findUnique({
          where: {
            id: productId,
          },
        });

        if (currentProduct){
        const newAmount = currentProduct.amount + quantity;

        await prismadb.product.update({
          where: {
            id: productId,
          },
          data: {
            amount: newAmount,
          },
        });
        }
      }
  
    return NextResponse.json(newImport);
  } catch (error) {
    console.log('[IMPORTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

