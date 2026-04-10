import type { Metadata } from "next";
import { getContent } from "@/lib/data";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LegalContent from "./LegalContent";

export const metadata: Metadata = {
  title: "Mentions légales | O'Méa",
  description: "Mentions légales, édition, hébergement et politique de protection des données personnelles du site O'Méa.",
  robots: { index: true, follow: true },
};

export const revalidate = 3600;

export default async function MentionsLegalesPage() {
  const content = await getContent();
  const hasBanner = content.banner?.enabled && content.banner?.text;

  return (
    <>
      <Navbar bannerOffset={hasBanner ? 34 : 0} />
      <main style={{ background: "var(--cream)", minHeight: "100vh" }}>
        <LegalContent />
      </main>
      <Footer content={content.footer} />
    </>
  );
}
