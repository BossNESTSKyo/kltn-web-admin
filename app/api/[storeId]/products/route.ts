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

    const { name, price, priceVN, categoryId, colorIds, sizeIds, images, isFeatured, isArchived, isNewed, isDiscounted, perDiscount } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!colorIds) {
      return new NextResponse("Color ids is required", { status: 400 });
    }

    if (!sizeIds) {
      return new NextResponse("Size ids is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
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

    const priceDiscount = price - price * (perDiscount/100);
    const priceVNDiscount = priceVN - priceVN * (perDiscount/100);

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        priceVN,
        isFeatured,
        isArchived,
        categoryId,
        isNewed,
        isDiscounted,
        perDiscount,
        priceDiscount,
        priceVNDiscount,
        amount: 0,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => image),
            ],
          },
        },
      },
    });

    // Add data to table ProductColor
    const colorData = colorIds.map((colorId: string) => ({
      productId: product.id,
      colorId,
    }));

    await prismadb.productColor.createMany({
      data: colorData,
    });

    // Add data to table ProductSize
    const sizeData = sizeIds.map((sizeId: string) => ({
      productId: product.id,
      sizeId,
    }));

    await prismadb.productSize.createMany({
      data: sizeData,
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined;
    const genderType = searchParams.get('genderType') || undefined;
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const minPrice = parseFloat(searchParams.get('minPrice') || '1');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '200');
    const isFeatured = searchParams.get('isFeatured');
    const isNewed = searchParams.get('isNewed');
    const isDiscounted = searchParams.get('isDiscounted');

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colors: colorId ? {
          some: {
            colorId: colorId,
          },
        } : undefined,
        sizes: sizeId ? {
          some: {
            sizeId: sizeId,
          },
        } : undefined,
        genderType: genderType ? genderType : "0",
        isFeatured: isFeatured ? true : undefined,
        isNewed: isNewed ? true : undefined,
        isDiscounted: isDiscounted ? true : undefined,
        isArchived: false,
        price: {
          gte: minPrice,
          lte: maxPrice
        }
      },
      include: {
        images: true,
        category: true,
        colors: {
          include: {
            color: true,
          },
        },
        sizes: {
          include: {
            size: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
