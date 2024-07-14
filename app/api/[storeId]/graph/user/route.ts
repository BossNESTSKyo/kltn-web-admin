import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';

interface GraphData {
  name: string;
  amount: number;
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const orders = await prismadb.order.findMany({
        where: {
            storeId: params.storeId,
        },
        include: {
            user: true
        }
    });

    const userTotals : any = {};

    orders.forEach((order) => {
    const userId = order.userId;
    if (!userTotals[userId]) {
      userTotals[userId] = {
        userId: userId,
        name: order.user.name,
        totalPrice: order.totalPrice,
      };
    } else {
      userTotals[userId].totalPrice += order.totalPrice;
    }
    });

    const sortedUsersWithTotalPrice = Object.values(userTotals).sort((a: any, b: any) => b.totalPrice - a.totalPrice);
    const top10Users = sortedUsersWithTotalPrice.slice(0, 10);

    const graphData: GraphData[] = [];
  
    top10Users.map((item: any) => {
        graphData.push({
            name: item.name,
            amount: item.totalPrice,
        });
    })

    return NextResponse.json(graphData);
    } catch (error) {
        console.log('[GRAPH_USERS_GET]', error);
        return new NextResponse("Internal error", { status: 500 });
    }
};
