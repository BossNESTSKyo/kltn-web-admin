import Stripe from "stripe"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { stripe } from "@/lib/stripe"
import prismadb from "@/lib/prismadb"

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get("Stripe-Signature") as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const address = session?.customer_details?.address;

  const addressComponents = [
    address?.line1,
    address?.line2,
    address?.city,
    address?.state,
    address?.postal_code,
    address?.country
  ];

  const addressString = addressComponents.filter((c) => c !== null).join(', ');

  if (event.type === "checkout.session.completed") {
    const order = await prismadb.order.update({
      where: {
        id: session?.metadata?.orderId,
      },
      data: {
        isPaid: true,
        state: "payment",
        address: addressString,
        phone: session?.customer_details?.phone || '',
      },
      include: {
        orderItems: true,
      }
    });

    const orderItems = order.orderItems;
    for (const orderItem of orderItems) {
      await prismadb.product.update({
        where: {
          id: orderItem.productId,
        },
        data: {
          //isArchived: true,
          amount: {
            decrement: orderItem.quantity,
          },
          sellAmount: {
            increment: orderItem.quantity,
          }
        },
      });
    }

    const couponId = order.couponId;
    if (couponId !== ""){
      await prismadb.coupon.update({
        where: {
          id: couponId,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });
    }

    // const productIds = order.orderItems.map((orderItem) => orderItem.productId);

    // await prismadb.product.updateMany({
    //   where: {
    //     id: {
    //       in: [...productIds],
    //     },
    //   },
    //   data: {
    //     isArchived: true,
    //     amount: 
    //   }
    // });
  }

  return new NextResponse(null, { status: 200 });
};
