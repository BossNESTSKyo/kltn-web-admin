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

