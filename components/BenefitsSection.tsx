"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Leaf, MapPin, TrendingUp, type LucideIcon } from "lucide-react";
import { gsap, ScrollTrigger, duration, ease, distance, scrollDefaults } from "@/lib/motion";

interface BenefitItem {
  title: string;
  description: string;
  iconName: string;
  image: string;
}

interface BenefitsProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items?: BenefitItem[];
}

const iconMap: Record<string, LucideIcon> = {
  Heart, Leaf, MapPin, TrendingUp,
};

const defaultItems: BenefitItem[] = [
  {
    iconName: "Heart",
    title: "Marque employeur renforcée",
    description: "87% des salariés valorisent les entreprises qui célèbrent leurs moments de vie.",
    image: "",
  },
  {
    iconName: "Leaf",
    title: "Conformité & sérénité",
    description: "100% exonérés URSSAF. Produits certifiés, traçabilité complète pour votre CSE.",
    image: "",
  },
  {
    iconName: "MapPin",
    title: "Logistique clé en main",
    description: "Livraison multi-sites ou domicile, même en télétravail. Vous commandez, on déploie.",
    image: "",
  },
  {
    iconName: "TrendingUp",
    title: "ROI mesurable",
    description: "Réduisez le turnover, renforcez l'engagement. Un impact mesurable sur vos KPIs RH.",
    image: "",
  },
];

export default function BenefitsSection({
  sectionTitle = "Tout ce qu'un DRH attend d'un cadeau d'entreprise",
  sectionSubtitle = "Des coffrets conçus pour simplifier la vie des équipes RH et valoriser l'expérience collaborateur.",
  items = defaultItems,
}: BenefitsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.innerWidth < 900) {
      gsap.set(el.querySelectorAll(".ba-item"), { opacity: 1, y: 0 });
      return;
    }
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".ba-item",
        { opacity: 0, y: distance.md },
        {
          opacity: 1, y: 0, duration: duration.reveal, ease: ease.enter, stagger: 0.1,
          scrollTrigger: { trigger: ".ba-list", start: scrollDefaults.start, toggleActions: scrollDefaults.toggleActions },
        }
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-section="benefits"
      style={{
        background: "var(--cream-dark)",
        padding: isMobile ? "56px 0" : "80px 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .ba-list {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          counter-reset: benefit;
        }
        .ba-item {
          padding: 0 32px;
          position: relative;
          counter-increment: benefit;
        }
        .ba-item::after {
          content: '';
          position: absolute;
          top: 8px; bottom: 8px; right: 0;
          width: 1px;
          background: rgba(135,163,141,0.12);
        }
        .ba-item:last-child::after { display: none; }
        .ba-item:first-child { padding-left: 0; }
        .ba-item:last-child { padding-right: 0; }
        .ba-icon-line {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 20px;
        }
        .ba-icon-circle {
          width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid var(--sage);
          display: flex; align-items: center; justify-content: center;
          color: var(--green-deep);
          flex-shrink: 0;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ba-item:hover .ba-icon-circle {
          background: var(--green-deep);
          border-color: var(--green-deep);
          color: white;
          transform: scale(1.08);
        }
        .ba-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, var(--sage) 0%, transparent 100%);
          opacity: 0.2;
        }
        @media (max-width: 1024px) {
          .ba-list {
            grid-template-columns: 1fr 1fr;
            gap: 40px 0;
          }
          .ba-item:nth-child(2)::after { display: none; }
          .ba-item:nth-child(odd) { padding-left: 0; }
          .ba-item:nth-child(even) { padding-right: 0; }
        }
        @media (max-width: 600px) {
          .ba-list { grid-template-columns: 1fr; gap: 32px; }
          .ba-item { padding: 0 !important; }
          .ba-item::after { display: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: isMobile ? "36px" : "56px" }}>
          <span style={{
            display: "inline-block",
            fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.2em",
            textTransform: "uppercase", color: "var(--sage)",
            fontFamily: "var(--font-manrope)", marginBottom: "18px",
            padding: "6px 16px", background: "rgba(135,163,141,0.08)", borderRadius: "999px",
          }}>
            Vos avantages
          </span>
          <h2 style={{
            fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 900,
            letterSpacing: "-0.035em", color: "var(--text-dark)",
            marginBottom: "14px", lineHeight: 1.1,
          }}>
            {sectionTitle}
          </h2>
          <p style={{
            fontSize: "0.92rem", color: "var(--text-mid)",
            maxWidth: "440px", margin: "0 auto", lineHeight: 1.7,
          }}>
            {sectionSubtitle}
          </p>
        </div>

        {/* Items */}
        <div className="ba-list">
          {items.map((b, i) => {
            const IconComp = iconMap[b.iconName] || Heart;
            return (
              <div key={b.title || i} className="ba-item">
                <div className="ba-icon-line">
                  <div className="ba-icon-circle">
                    <IconComp size={18} strokeWidth={2} />
                  </div>
                  <div className="ba-line" />
                </div>

                <h3 style={{
                  fontFamily: "var(--font-manrope)", fontWeight: 800,
                  fontSize: "1.05rem", color: "var(--text-dark)",
                  lineHeight: 1.25, letterSpacing: "-0.02em", marginBottom: "10px",
                }}>
                  {b.title}
                </h3>

                <p style={{
                  fontSize: "0.82rem", color: "var(--text-mid)",
                  lineHeight: 1.65, margin: 0,
                }}>
                  {b.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
