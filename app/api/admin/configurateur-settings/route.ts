import { NextRequest, NextResponse } from "next/server";
import { getConfigurateurSettings, updateConfigurateurSettings } from "@/lib/data";

export async function GET() {
  const settings = await getConfigurateurSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const settings = await request.json();
  await updateConfigurateurSettings(settings);
  return NextResponse.json({ success: true });
}
