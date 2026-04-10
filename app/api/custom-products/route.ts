import { NextResponse } from "next/server";
import { getCustomProducts } from "@/lib/data";

export async function GET() {
  const products = await getCustomProducts();
  return NextResponse.json(products);
}
