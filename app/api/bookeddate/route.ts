import { NextResponse } from "next/server";

import Order from "@/lib/database/models/order.model";

import { connectToDatabase } from "@/lib/database";

export async function POST(req: Request) {
  await connectToDatabase();

  try {
    const orders = await Order.find({});
    // console.log("Orders found:", orders.length, orders);

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching order data" },
      { status: 500 }
    );
  }
}
