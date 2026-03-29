import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IS_VERCEL = !!process.env.VERCEL;
const UPLOAD_DIR = IS_VERCEL
  ? "/tmp/uploads"
  : path.join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
  }

  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }

  const ext = path.extname(file.name) || ".jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filepath, buffer);

  // On Vercel, serve via API route; locally, serve from public/
  const url = IS_VERCEL
    ? `/api/uploads/${filename}`
    : `/uploads/${filename}`;

  return NextResponse.json({ url });
}
