import { getContent, getProducts } from "@/lib/data";
import AnnouncementBanner from "@/components/layout/AnnouncementBanner";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/HeroSection";
import BenefitsSection from "@/components/BenefitsSection";
import WhyOmea from "@/components/WhyOmea";
import ImpactSection from "@/components/ImpactSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PartnerSection from "@/components/PartnerSection";
import PersonalizationSection from "@/components/PersonalizationSection";
import CoffretHub from "@/components/CoffretHub";
import CTASection from "@/components/CTASection";
import ProcessSection from "@/components/ProcessSection";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/layout/Footer";
import TopCoffretsSection from "@/components/TopCoffretsSection";


export const revalidate = 60;

export default async function Home() {
  const content = await getContent();
  const products = await getProducts();

  const simulatorProducts = products.map((p) => ({
    id: p.id,
    label: p.subtitle,
    name: p.name,
    basePrice: parseInt(p.price.replace(/[^\d]/g, ""), 10) || 49,
  }));

  const hasBanner = content.banner?.enabled && content.banner?.text;

  return (
    <>
      {hasBanner && (
        <AnnouncementBanner
          text={content.banner.text}
          bgColor={content.banner.bgColor}
          textColor={content.banner.textColor}
        />
      )}
      <Navbar bannerOffset={hasBanner ? 34 : 0} />

      <main>
        <HeroSection
          tagline={content.hero.tagline}
          headlinePre={content.hero.headline}
          headlineAccent={content.hero.highlightedText}
          subtitle={content.hero.subtitle}
          ctaPrimary={content.hero.ctaPrimary}
          ctaSecondary={content.hero.ctaSecondary}
          keyPoints={content.hero.keyPoints}
        />
        <TopCoffretsSection content={content.topCoffrets} />
        <BenefitsSection
          sectionTitle={content.benefits.sectionTitle}
          sectionSubtitle={content.benefits.sectionSubtitle}
          items={content.benefits.items}
        />
        <WhyOmea content={content.whyOmea} />
        <ImpactSection content={content.impact} />
        <TestimonialsSection content={content.testimonials} />
        <PersonalizationSection
          sectionTitle={content.personalization.sectionTitle}
          sectionSubtitle={content.personalization.sectionSubtitle}
          steps={content.personalization.steps}
        />
        <CoffretHub products={products} simulatorProducts={simulatorProducts} />
        <ProcessSection content={content.process} />
        <CTASection
          sectionTitle={content.cta.sectionTitle}
          subtitle={content.cta.subtitle}
          guarantees={content.cta.guarantees}
          testimonial={content.cta.testimonial}
        />
        <PartnerSection content={content.partners} />
        <FAQSection content={content.faq} />
      </main>
      <Footer content={content.footer} />
    </>
  );
}
