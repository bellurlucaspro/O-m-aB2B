import { NextRequest, NextResponse } from "next/server";
import { getProducts, createProduct } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getProducts());
}

export async function POST(request: NextRequest) {
  const product = await request.json();
  product.id = product.id || Date.now().toString();
  await createProduct(product);
  return NextResponse.json({ success: true }, { status: 201 });
}
