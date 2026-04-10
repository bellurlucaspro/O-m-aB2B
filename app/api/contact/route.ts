import { NextRequest, NextResponse } from "next/server";
import { addSubmission } from "@/lib/data";
import type { Submission } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Build coffret details for message if present
  let coffretMessage = "";
  if (body.customCoffret) {
    const c = body.customCoffret;
    coffretMessage = `\n\n--- COFFRET SUR-MESURE ---\nQuantité : ${c.quantity} coffret(s)\n`;
    coffretMessage += c.products.map((p: { name: string; price: number; qty: number }) =>
      `• ${p.name} x${p.qty} — ${(p.price / 100).toFixed(2)}€ HT`
    ).join("\n");
    coffretMessage += `\n\nTotal HT : ${(c.totalHT / 100).toFixed(2)}€\nTotal TTC : ${(c.totalTTC / 100).toFixed(2)}€`;
  }

  // Prepend brief meta (type de coffret + budget) to message so it's visible in admin
  const metaParts: string[] = [];
  if (body.boxType) metaParts.push(`Type de coffret : ${body.boxType}`);
  if (body.budgetPerBox) metaParts.push(`Budget / coffret TTC : ${body.budgetPerBox}`);
  const metaPrefix = metaParts.length ? metaParts.join(" · ") + "\n\n" : "";

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
    quantity: body.quantity || body.customCoffret?.quantity?.toString() || "",
    message: metaPrefix + (body.message || "") + coffretMessage,
    read: false,
    customCoffret: body.customCoffret || undefined,
  };

  await addSubmission(submission);

  // Send email notification if SMTP is configured
  if (process.env.SMTP_HOST && process.env.NOTIFICATION_EMAIL) {
    try {
      // Dynamic import to avoid build issues if nodemailer not installed
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.NOTIFICATION_EMAIL,
        subject: `Nouvelle demande O'Méa — ${submission.company || "Sans entreprise"}`,
        text: `Nouvelle demande de devis reçue :\n\nEntreprise : ${submission.company}\nContact : ${submission.representative}\nRôle : ${submission.role}\nEmail : ${submission.email}\nTéléphone : ${submission.phone}\nQuantité : ${submission.quantity}\n\nMessage :\n${submission.message}`,
      });
    } catch {
      // Email sending failed silently — submission is still saved
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
