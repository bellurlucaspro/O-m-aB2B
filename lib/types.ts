export interface BannerContent {
  enabled: boolean;
  text: string;
  bgColor: string;
  textColor: string;
}

export interface HeroContent {
  tagline: string;
  headline: string;
  highlightedText: string;
  headlineEnd: string;
  subtitle: string;
  keyPoints: string[];
  ctaPrimary: string;
  ctaSecondary: string;
  socialProofCount: string;
}

export interface BenefitItem {
  title: string;
  description: string;
  iconName: string;
  image: string;
}

export interface BenefitsContent {
  sectionTitle: string;
  sectionSubtitle: string;
  items: BenefitItem[];
}

export interface WhyOmeaFeature {
  title: string;
  desc: string;
  iconName: string;
}

export interface WhyOmeaContent {
  leftFeatures: WhyOmeaFeature[];
  rightFeatures: WhyOmeaFeature[];
  centerTitle: string;
  centerSubtitle: string;
}

export interface ImpactStat {
  value: string;
  label: string;
}

export interface ImpactItem {
  title: string;
  desc: string;
  iconName: string;
}

export interface ImpactContent {
  sectionTitle: string;
  subtitle: string;
  stats: ImpactStat[];
  description: ImpactItem[];
}

export interface PersonalizationStep {
  title: string;
  desc: string;
  iconName: string;
}

export interface PersonalizationContent {
  sectionTitle: string;
  sectionSubtitle: string;
  steps: PersonalizationStep[];
}

export interface CTAContent {
  sectionTitle: string;
  subtitle: string;
  guarantees: string[];
  testimonial: {
    quote: string;
    name: string;
    role: string;
    initials: string;
  };
}

// --- Testimonials ---
export interface TestimonialItem {
  quote: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  highlight: string;
}

export interface TestimonialsContent {
  sectionLabel: string;
  items: TestimonialItem[];
}

// --- Partners ---
export interface PartnerItem {
  quote: string;
  name: string;
  role: string;
  employees: string;
  initials: string;
  metric: string;
  metricLabel: string;
  logo: string;
  photo: string;
  avatar: string;
}

export interface PartnersContent {
  tag: string;
  title: string;
  titleHighlight: string;
  counter: string;
  counterLabel: string;
  ctaText: string;
  ctaHref: string;
  items: PartnerItem[];
}

// --- Process ---
export interface ProcessStep {
  icon: string;
  title: string;
  desc: string;
  badge: string;
  image: string;
}

export interface ProcessGuarantee {
  icon: string;
  label: string;
}

export interface ProcessContent {
  label: string;
  title: string;
  titleItalic: string;
  subtitle: string;
  timeBadge: string;
  ctaText: string;
  ctaHref: string;
  steps: ProcessStep[];
  guarantees: ProcessGuarantee[];
}

// --- FAQ ---
export interface FAQItem {
  q: string;
  a: string;
}

export interface FAQContent {
  label: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaHref: string;
  ctaAdditionalText: string;
  items: FAQItem[];
}

// --- Footer ---
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSocialLink {
  icon: string;
  href: string;
}

export interface FooterContent {
  description: string;
  socialLinks: FooterSocialLink[];
  navigationTitle: string;
  navigationLinks: FooterLink[];
  servicesTitle: string;
  services: string[];
  servicesHref: string;
  contactTitle: string;
  contactEmail: string;
  contactLocation: string;
  contactCtaText: string;
  contactCtaHref: string;
  legalLinks: FooterLink[];
}

// --- Top Coffrets ---
export interface TopCoffretItem {
  rank: number;
  name: string;
  occasion: string;
  price: string;
  desc: string;
  badge: string;
  photo: string;
  stats: string;
}

export interface TopCoffretsContent {
  label: string;
  title: string;
  ctaText: string;
  ctaHref: string;
  trustText: string;
  items: TopCoffretItem[];
}

// --- About Page ---
export interface AboutValue {
  num: string;
  title: string;
  text: string;
  image: string;
  accent: string;
}

export interface AboutBenefit {
  metric: string;
  metricLabel: string;
  title: string;
  text: string;
  image: string;
}

export interface AboutChiffre {
  value: string;
  suffix: string;
  prefix: string;
  label: string;
}

export interface AboutCtaMetric {
  value: string;
  label: string;
}

export interface AboutTrustPill {
  label: string;
}

export interface AboutHeroStat {
  value: string;
  label: string;
}

export interface AboutHeroBadge {
  title: string;
  subtitle: string;
  position: string;
  style: string;
}

export interface AboutPageContent {
  hero: {
    tag: string;
    image: string;
    secondaryImage: string;
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    subtitleLines: string[];
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    stats: AboutHeroStat[];
    badges: AboutHeroBadge[];
  };
  origin: {
    tag: string;
    image: string;
    badgeTitle: string;
    badgeSubtitle: string;
    title: string;
    titleAccent: string;
    paragraphs: string[];
    quote: string;
    quoteAuthor: string;
  };
  values: {
    tag: string;
    title: string;
    subtitle: string;
    items: AboutValue[];
  };
  chiffres: {
    title: string;
    items: AboutChiffre[];
  };
  benefits: {
    tag: string;
    title: string;
    subtitle: string;
    items: AboutBenefit[];
  };
  cta: {
    bgImage: string;
    testimonial: {
      quote: string;
      name: string;
      role: string;
      initials: string;
    };
    metrics: AboutCtaMetric[];
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    trustPills: AboutTrustPill[];
  };
}

export interface SiteContent {
  banner: BannerContent;
  hero: HeroContent;
  benefits: BenefitsContent;
  whyOmea: WhyOmeaContent;
  impact: ImpactContent;
  personalization: PersonalizationContent;
  cta: CTAContent;
  testimonials: TestimonialsContent;
  partners: PartnersContent;
  process: ProcessContent;
  faq: FAQContent;
  footer: FooterContent;
  topCoffrets: TopCoffretsContent;
  aboutPage: AboutPageContent;
}

export interface ProductDetail {
  name: string;
  image: string;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  composition: string[];
  nbProduits: string;
  price: string;
  priceNote: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  accentColor: string;
  photo: string;
  photoAlt: string;
  iconEmoji: string;
  featured: boolean;
  detailProducts: ProductDetail[];
}

export interface Submission {
  id: string;
  date: string;
  company: string;
  representative: string;
  role: string;
  email: string;
  phone: string;
  tva: string;
  siret: string;
  quantity: string;
  message: string;
  read: boolean;
}
