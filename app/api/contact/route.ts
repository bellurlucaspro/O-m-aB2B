import { NextRequest, NextResponse } from "next/server";
import { addSubmission } from "@/lib/data";
import type { Submission } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const submission: Submission = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    company: body.company || "",
    representative: body.representative || "",
    role: body.role || "",
    email: body.email || "",
    phone: body.phone || "",
    tva: body.tva || "",
    siret: body.siret || "",
    quantity: body.quantity || "",
    message: body.message || "",
    read: false,
  };

  await addSubmission(submission);

  return NextResponse.json({ success: true }, { status: 201 });
}
