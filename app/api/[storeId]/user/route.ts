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

    const { user } = body;

    if (!user) {
      return new NextResponse("User is required", { status: 400});
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400});
    }

    const primaryPhoneNumber = user.phoneNumbers && user.phoneNumbers.length > 0
      ? user.phoneNumbers[0].phoneNumber
      : "";

    const emailAddress = user.emailAddresses && user.emailAddresses.length > 0
      ? user.emailAddresses[0].emailAddress
      : "";

    const isExist = await prismadb.user.findFirst({
       where: {
          userId: user.id ? user.id : "",
        }
    });

    if (isExist){
      return new NextResponse("User is exist", { status: 400});
    }

    const response = await prismadb.user.create({
       data: {
          name: user.fullName ? user.fullName : "",
          gender: 1,
          height: 0,
          weight: 0,
          email: emailAddress,
          userId: user.id ? user.id : "",
          imageUrl: user.imageUrl ? user.imageUrl : "",
          phone: primaryPhoneNumber,
          address: "",
        }
    });

    return NextResponse.json({data: response}, {
      headers: corsHeaders
  });
  } catch (error) {
    console.log('[USER_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};