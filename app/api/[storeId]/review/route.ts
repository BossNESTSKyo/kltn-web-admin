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

    const { customer, productId, rating, content } = body;

    if (!customer) {
      return new NextResponse("Customer is required", { status: 400});
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400});
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400});
    }

    if (!rating) {
      return new NextResponse("Rating is required", { status: 400});
    }

    if (!content) {
      return new NextResponse("Content is required", { status: 400});
    }

    const user = await prismadb.user.findFirst({
      where: {
        userId: customer.id,
      }
    });

    if (!user) {
      return new NextResponse("Customer is required", { status: 400});
    }

    const reviewByUserId = await prismadb.review.findFirst({
      where: {
        storeId: params.storeId,
        userId: user.id,
      }
    });

    if (!reviewByUserId) {
      const review = await prismadb.review.create({
        data: {
          userId: user.id,
          storeId: params.storeId
        }
      });

      await prismadb.reviewItem.create({
        data: {
          productId: productId,
          reviewId: review.id,
          rating: rating,
          content: content,
          userName: customer.fullName,
        }
      });
    } else {
      await prismadb.reviewItem.create({
        data: {
          productId: productId,
          reviewId: reviewByUserId.id,
          rating: rating, 
          content: content,
          userName: customer.fullName,
        }
      });
    }
  
    return NextResponse.json({}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[REVIEW_POST]', error);
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
    const productId = searchParams.get('productId') || undefined;
    const startDateStr  = searchParams.get('startDate') || "";
    const endDateStr = searchParams.get('endDate') || "";

    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const user = await prismadb.user.findFirst({
      where: {
        userId: customerId
      }
    })

    if (!user) {
      return new NextResponse("User is required", { status: 400 });
    }

    const review = await prismadb.review.findFirst({
      where: {
        storeId: params.storeId,
        userId: user.id,
      }
    })

    if (!review) {
      return new NextResponse("Review is required", { status: 400 });
    }

    // const reviewItems = await prismadb.reviewItem.findMany({
    //   where: {
    //     reviewId: review.id,
    //     ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } }),
    //   },
    //   select: {
    //     reviewItems: {
    //       select: {
    //         product: {
    //           select: {
    //             id: true,
    //             name: true,
    //             images: true, 
    //             price: true,
    //             priceVN: true,
    //             priceDiscount: true,
    //             priceVNDiscount: true
    //           }
    //         },
    //         quantity: true,
    //         color: {
    //           select: {
    //             name: true
    //           }
    //         },
    //         size: {
    //           select: {
    //             value: true
    //           }
    //         }
    //       },
    //     },
    //     totalPrice: true,
    //     phone: true,
    //     address: true,
    //     state: true,
    //     deliveryDay: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     id: true
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   },
    // });

    return NextResponse.json({ data: review }, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[ORDER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

