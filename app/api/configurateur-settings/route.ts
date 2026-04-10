import { NextResponse } from "next/server";
import { getConfigurateurSettings } from "@/lib/data";

export async function GET() {
  const settings = await getConfigurateurSettings();
  return NextResponse.json(settings);
}
