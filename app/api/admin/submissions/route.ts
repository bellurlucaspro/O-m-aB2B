import { NextRequest, NextResponse } from "next/server";
import { getSubmissions, deleteSubmission, markSubmissionRead } from "@/lib/data";

export async function GET() {
  return NextResponse.json(await getSubmissions());
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  await deleteSubmission(id);
  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  const { id } = await request.json();
  await markSubmissionRead(id);
  return NextResponse.json({ success: true });
}
