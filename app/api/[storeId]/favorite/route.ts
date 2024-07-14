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

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();

    const { customerId, productId } = body;

    if (!customerId) {
      return new NextResponse("CustomerId is required", { status: 400});
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400});
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400});
    }

    const favoriteByUserId = await prismadb.favorite.findFirst({
      where: {
        storeId: params.storeId,
        userId: customerId,
      }
    });

    if (!favoriteByUserId) {
      const favorite = await prismadb.favorite.create({
        data: {
          userId: customerId,
          storeId: params.storeId
        }
      });

      await prismadb.favoriteItem.create({
        data: {
          productId: productId,
          favoriteId: favorite.id,
        }
      });
    } else {
      await prismadb.favoriteItem.create({
        data: {
          productId: productId,
          favoriteId: favoriteByUserId.id,
        }
      });
    }
  
    return NextResponse.json({}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[FAVORITE_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get('customerId') || undefined;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const favorite = await prismadb.favorite.findMany({
      where: {
        storeId: params.storeId,
        userId: customerId,
      },
      include: {
        favoriteItems: {
          include: {
            product: {
              include: {
                images: true,
                category: true,
                colors: {
                  include: {
                    color: true
                  }
                },
                sizes: {
                  include: {
                    size: true
                  }
                },
              },
            },
          },
        },
      },
    });
  
    // Lấy ra mảng chứa các product
    const products = favorite.flatMap(fav => 
      fav.favoriteItems.map(item => item.product)
    );

    return NextResponse.json({ data: products }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[FAVORITE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
