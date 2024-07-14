import { NextResponse } from 'next/server';
import {format} from "date-fns";

import prismadb from '@/lib/prismadb';

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, monthId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (params.monthId === undefined || params.monthId === null) {
      return new NextResponse("Month is required", { status: 400 });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        user: true,
      },
    });

    const userOrderFrequency : any = {};

    orders.forEach((order) => {
      const userId = order.userId;
      const month = format(new Date(order.createdAt), 'yyyy-MM');

      if (!userOrderFrequency[userId]) {
        userOrderFrequency[userId] = {
          userId: userId,
          name: order.user.name,
          ordersByMonth: {},
        };
      }

      if (!userOrderFrequency[userId].ordersByMonth[month]) {
        userOrderFrequency[userId].ordersByMonth[month] = 1;
      } else {
        userOrderFrequency[userId].ordersByMonth[month] += 1;
      }
    });

    const userPurchaseFrequency = Object.values(userOrderFrequency).map((user : any) => {
      const months = Object.keys(user.ordersByMonth).length;
      const totalOrders : any = Object.values(user.ordersByMonth).reduce((sum: any, count: any) => sum + count, 0);
      const averageOrdersPerMonth = totalOrders / months;

      return {
        userId: user.userId,
        name: user.name,
        averageOrders: averageOrdersPerMonth,
      };
    });

    const top10Users = userPurchaseFrequency.sort((a, b) => b.averageOrders - a.averageOrders).slice(0, 10);

    return NextResponse.json(top10Users);
  } catch (error) {
    console.log('[GRAPH_PURCHASES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
