import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const favoriteItem = await prismadb.favoriteItem.deleteMany({
      where: {
        productId: params.productId
      }
    })
  
    return NextResponse.json({}, { headers: corsHeaders });
  } catch (error) {
    console.log('[FAVORITE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, productId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId') || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const favorite = await prismadb.favorite.findMany({
      where: {
        storeId: params.storeId,
        userId: customerId !== undefined ? customerId : "",
      },
      include: {
        favoriteItems: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                colors: true,
                sizes: true,
              },
            },
          },
        },
      },
    });
  
    // Kiểm tra productId có trong favoriteItems không?
    const isExist = favorite.some(fav => 
      fav.favoriteItems.some(item => item.productId === params.productId)
    );

    return NextResponse.json({ isExist }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[FAVORITE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};