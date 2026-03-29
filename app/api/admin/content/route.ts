import { NextRequest, NextResponse } from "next/server";
import { getContent, updateContent } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getContent());
}

export async function PUT(request: NextRequest) {
  const content = await request.json();
  await updateContent(content);
  return NextResponse.json({ success: true });
}
