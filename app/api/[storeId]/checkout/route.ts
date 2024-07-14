import Stripe from "stripe";
import { NextResponse } from "next/server";

import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

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
  const { products, totalPrice, userId, couponId } = await req.json();

  if (!products || products.length === 0) {
    return new NextResponse("Products are required", { status: 400, headers: corsHeaders });
  }

  if (!totalPrice) {
    return new NextResponse("TotalPrice is required", { status: 400, headers: corsHeaders });
  }

  // const products = await prismadb.product.findMany({
  //   where: {
  //     id: {
  //       in: productIds
  //     }
  //   }
  // });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  products.forEach((product: any) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: 'USD',
        product_data: {
          name: product.name,
        },
        unit_amount: parseFloat(product.priceDiscount) * product.quantity * 100
      }
    });
  });

  const user = await prismadb.user.findFirst({
    where: {
      userId: userId ? userId : ""
    }
  })

  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      userId: user ? user.id : "",
      couponId: couponId ? couponId : "",
      totalPrice: totalPrice,
      orderItems: {
        create: products.map((product: any) => ({
          product: {
            connect: {
              id: product.id
            }
          },
          color: {
            connect: {
              id: product.color ? product.color.id : ""
            }
          },
          size: {
            connect: {
              id: product.size ? product.size.id : ""
            }
          },
          quantity: product.quantity 
        }))
      }
    }
  });

  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    billing_address_collection: 'required',
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id
    },
  });

  return NextResponse.json({ url: session.url }, {
    headers: corsHeaders
  });
};
