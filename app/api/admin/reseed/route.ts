import { NextResponse } from "next/server";
import { reseedFromFiles } from "@/lib/data";

export async function POST() {
  try {
    const result = await reseedFromFiles();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[reseed] error:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
