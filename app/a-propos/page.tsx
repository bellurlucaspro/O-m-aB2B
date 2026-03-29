import { getContent } from "@/lib/data";
import AboutClient from "./AboutClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "À propos | O'Méa",
  description: "Découvrez l'histoire d'O'Méa, marque de coffrets maternité premium pour entreprises. Écologie, made in France, impact RH mesurable.",
};

export const revalidate = 60;

export default async function AProposPage() {
  const content = await getContent();
  return <AboutClient data={content.aboutPage} footer={content.footer} />;
}
