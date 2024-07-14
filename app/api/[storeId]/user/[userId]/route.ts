import { NextResponse } from 'next/server';

import prismadb from '@/lib/prismadb';
 
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, userId: string } }
) {
  try {
    if (!params.userId) {
      return new NextResponse("User id is required", { status: 400});
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400});
    }

    const user = await prismadb.user.findFirst({
       where: {
          userId: params.userId,
        }
    });

    return NextResponse.json({data: user}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[USER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function PATCH(
  req: Request,
  { params }: { params: { userId: string, storeId: string } }
) {
  try {
    const body = await req.json();

    const { gender, name, email, phone, address, height, weight } = body;

    // if (!email) {
    //   return new NextResponse("Email is required", { status: 403 });
    // }

    // if (!phone) {
    //   return new NextResponse("Phone is required", { status: 400 });
    // }

    // if (!address) {
    //   return new NextResponse("Address is required", { status: 400 });
    // }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!params.userId) {
      return new NextResponse("User id is required", { status: 400 });
    }

    const isExist = await prismadb.user.findFirst({
       where: {
          userId: params.userId,
        }
    });

    if (!isExist){
      return new NextResponse("User is not exist", { status: 400});
    }

    if(gender === 0 && height === 0 && weight === 0){
      await prismadb.user.update({
        where: {
          id: isExist.id
        },
        data: {
            name,
            email,
            phone,
            address,
          }
      });
    } else {
      await prismadb.user.update({
        where: {
          id: isExist.id
        },
        data: {
            name,
            gender,
            height,
            weight,
            email,
            phone,
            address,
          }
      });
    }
  
    return NextResponse.json({}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[USER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};