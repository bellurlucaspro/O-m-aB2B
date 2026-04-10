import { NextRequest, NextResponse } from "next/server";
import { getCustomProducts, updateCustomProducts } from "@/lib/data";

export async function GET() {
  const products = await getCustomProducts();
  return NextResponse.json(products);
}

export async function PUT(request: NextRequest) {
  const products = await request.json();
  await updateCustomProducts(products);
  return NextResponse.json({ success: true });
}
