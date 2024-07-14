import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        category: true,
        sizes: {
          select: {
            size: true,
          },
        },
        colors: {
          select: {
            color: true,
          },
        },
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    await prismadb.productColor.deleteMany({
      where: {
        productId: params.productId
      },
    });

    await prismadb.productSize.deleteMany({
      where: {
        productId: params.productId
      },
    });

    const product = await prismadb.product.delete({
      where: {
        id: params.productId
      },
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const { userId } = auth();

    const body = await req.json();

    const { name, price, priceVN, categoryId, images, colorIds, sizeIds, isFeatured, isArchived, isNewed, isDiscounted, perDiscount } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    if (!colorIds || !colorIds.length) {
      return new NextResponse("Color ids is required", { status: 400 });
    }

    if (!sizeIds) {
      return new NextResponse("Size id is required", { status: 400 });
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

    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        priceVN,
        categoryId,
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
        isNewed,
        isDiscounted,
        perDiscount,
        priceDiscount,
        priceVNDiscount
      },
    });

    await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        images: {
          createMany: {
            data: [
              ...images.map((image: { url: string }) => image),
            ],
          },
        },
      },
    })

    await prismadb.productColor.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    const colorData = colorIds.map((colorId: string) => ({
      productId: params.productId,
      colorId,
    }));

    await prismadb.productColor.createMany({
      data: colorData,
    });

    await prismadb.productSize.deleteMany({
      where: {
        productId: params.productId,
      },
    });

    const sizeData = sizeIds.map((sizeId: string) => ({
      productId: params.productId,
      sizeId,
    }));

    await prismadb.productSize.createMany({
      data: sizeData,
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
