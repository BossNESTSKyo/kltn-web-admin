import moment from "moment";
import { NextResponse } from "next/server";

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
  const { products, totalPrice, userId } = await req.json();

  process.env.TZ = 'Asia/Ho_Chi_Minh';
    
  let date = new Date();
  let createDate = moment(date).format('YYYYMMDDHHmmss');

  let ipAddr: string | undefined = req.headers.get('x-forwarded-for') as string;

  if (!ipAddr || typeof ipAddr !== 'string') {
    ipAddr = 'unknown';
  }
    
  let tmnCode = process.env.VNP_TMNCODE;
  let secretKey = "QUKDKKNOATQJURXAADEBNAZDBMVVOSPF";
  let vnpUrl = process.env.VNP_URL;
  let orderId = moment(date).format('DDHHmmss');
  let bankCode = "VNBANK";
    
  let locale = "";
  if(locale === null || locale === ''){
    locale = 'vn';
  }
  let currCode = 'VND';

  const user = await prismadb.user.findFirst({
    where: {
      userId: userId ? userId : ""
    }
  })

  // Insert data into table Order
  const order = await prismadb.order.create({
    data: {
      storeId: params.storeId,
      isPaid: false,
      userId: user ? user.id : "",
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

  let returnUrl = `${process.env.FRONTEND_STORE_URL}/result?orderId=${order.id}`;

  let vnp_Params: any = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = 'Thanh toan cho ma GD:' + orderId;
  vnp_Params['vnp_OrderType'] = 'other';
  vnp_Params['vnp_Amount'] = totalPrice * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if(bankCode !== null && bankCode !== ''){
    vnp_Params['vnp_BankCode'] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require('qs');
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");     
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  return NextResponse.json({ url: vnpUrl }, {
    headers: corsHeaders
  });
};

function sortObject(obj: any) {
	let sorted: any = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}
