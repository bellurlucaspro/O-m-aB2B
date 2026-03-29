"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, ease } from "@/lib/motion";
import { MessageSquare, Package, Truck, CheckCircle2, ArrowRight, ShieldCheck, FileText, MapPin, Clock } from "lucide-react";
import type { ProcessContent } from "@/lib/types";

/* ── Icon map: resolves CMS string names → JSX elements ── */
const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare size={24} strokeWidth={1.5} />,
  Package: <Package size={24} strokeWidth={1.5} />,
  Truck: <Truck size={24} strokeWidth={1.5} />,
  ShieldCheck: <ShieldCheck size={15} />,
  FileText: <FileText size={15} />,
  MapPin: <MapPin size={15} />,
  Clock: <Clock size={15} />,
};

/* ── Default data (fallback when no CMS content) ── */
const DEFAULT_STEPS: { icon: string; num: string; title: string; desc: string; badge: string; image: string }[] = [
  {
    icon: "MessageSquare",
    num: "01",
    title: "Échangez avec nous",
    desc: "Décrivez votre besoin : nombre de coffrets, occasion, budget, calendrier. Un interlocuteur dédié vous accompagne. Devis personnalisé sous 24h.",
    badge: "Interlocuteur dédié",
    image: "/RH%20cadeau%20maternit%C3%A9.JPG",
  },
  {
    icon: "Package",
    num: "02",
    title: "Validez votre sélection",
    desc: "Choisissez vos coffrets, ajoutez votre branding et vos messages. On prépare les maquettes pour validation. Maquette offerte.",
    badge: "Maquette offerte",
    image: "/uploads/produits-box-omea.webp",
  },
  {
    icon: "Truck",
    num: "03",
    title: "On déploie, vous recevez",
    desc: "Livraison individuelle multi-sites ou groupée. Bureau, domicile, télétravail. Chaque collaborateur reçoit son coffret à la date prévue.",
    badge: "Expédition en 48h",
    image: "/uploads/AUTRE%201.png",
  },
];

const DEFAULT_GUARANTEES: { icon: string; label: string }[] = [
  { icon: "ShieldCheck", label: "URSSAF conforme" },
  { icon: "FileText", label: "Documentation complète" },
  { icon: "MapPin", label: "Multi-sites" },
  { icon: "Clock", label: "Délais garantis" },
];

const DEFAULT_LABEL = "Processus simplifié";
const DEFAULT_TITLE = "3 étapes.";
const DEFAULT_TITLE_ITALIC = "Zéro friction.";
const DEFAULT_SUBTITLE = "Un interlocuteur dédié pilote tout, de la demande de devis à la livraison individuelle.";
const DEFAULT_TIME_BADGE = "Temps moyen : 48h entre validation et expédition";
const DEFAULT_CTA_TEXT = "Demander un devis conforme";
const DEFAULT_CTA_HREF = "#devis";

export default function ProcessSection({ content }: { content?: ProcessContent }) {
  const ref = useRef<HTMLElement>(null);

  /* ── Derive data from props with fallbacks ── */
  const label = content?.label ?? DEFAULT_LABEL;
  const title = content?.title ?? DEFAULT_TITLE;
  const titleItalic = content?.titleItalic ?? DEFAULT_TITLE_ITALIC;
  const subtitle = content?.subtitle ?? DEFAULT_SUBTITLE;
  const timeBadge = content?.timeBadge ?? DEFAULT_TIME_BADGE;
  const ctaText = content?.ctaText ?? DEFAULT_CTA_TEXT;
  const ctaHref = content?.ctaHref ?? DEFAULT_CTA_HREF;

  const stepsData = content?.steps ?? DEFAULT_STEPS;
  const processSteps = stepsData.map((s, i) => ({
    icon: ICON_MAP[s.icon] ?? <MessageSquare size={28} strokeWidth={1.5} />,
    num: String(i + 1).padStart(2, "0"),
    title: s.title,
    desc: s.desc,
    badge: s.badge,
    image: s.image,
  }));

  const guaranteesData = content?.guarantees ?? DEFAULT_GUARANTEES;
  const processGuarantees = guaranteesData.map((g) => ({
    icon: ICON_MAP[g.icon] ?? <ShieldCheck size={15} />,
    label: g.label,
  }));

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".proc-title, .proc-step, .proc-guarantee"), { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Header
      gsap.fromTo(".proc-title",
        { opacity: 0, y: 24, filter: "blur(3px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: ease.enter,
          scrollTrigger: { trigger: ".proc-title", start: "top 85%", toggleActions: "play none none none" } }
      );

      // Steps stagger
      gsap.fromTo(".proc-step",
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
          scrollTrigger: { trigger: ".proc-steps", start: "top 80%", toggleActions: "play none none none" } }
      );

      // Guarantees
      gsap.fromTo(".proc-guarantee",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: ease.enter,
          scrollTrigger: { trigger: ".proc-bottom", start: "top 85%", toggleActions: "play none none none" } }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section id="processus" ref={ref} style={{ background: "var(--cream)", padding: "80px 0", position: "relative", overflow: "hidden" }}>
      <style>{`
        .proc-step {
          position: relative;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          border: 1.5px solid rgba(135,163,141,0.1);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .proc-step:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 64px rgba(45,74,62,0.1);
          border-color: rgba(135,163,141,0.2);
        }
        .proc-step__img {
          position: relative;
          height: 170px;
          overflow: hidden;
        }
        .proc-step__img img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .proc-step:hover .proc-step__img img {
          transform: scale(1.06);
        }
        .proc-g-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 10px;
          background: white; border: 1px solid rgba(135,163,141,0.1);
          font-size: 0.78rem; font-weight: 600; color: var(--text-mid);
          transition: all 0.3s ease;
        }
        .proc-g-pill:hover {
          border-color: rgba(135,163,141,0.25);
          box-shadow: 0 4px 12px rgba(45,74,62,0.06);
        }
        @media (max-width: 900px) {
          .proc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Decorative symbol */}
      <Image src="/SYMBOLE_RVB-03.png" alt="" width={400} height={400} aria-hidden="true"
        style={{ position: "absolute", top: "50%", left: "-8%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none", width: "25%", height: "auto" }} />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div className="proc-title" style={{ textAlign: "center", marginBottom: "56px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "14px" }}>
            {label}
          </p>
          <h2 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.04em", lineHeight: 1, color: "var(--text-dark)", marginBottom: "14px" }}>
            <span style={{ fontWeight: 200 }}>{title}</span>{" "}
            <span style={{ fontWeight: 900, fontStyle: "italic", color: "var(--green-deep)" }}>{titleItalic}</span>
          </h2>
          <p style={{ fontSize: "1.05rem", color: "var(--text-mid)", lineHeight: 1.7, maxWidth: "500px", margin: "0 auto", fontWeight: 400 }}>
            {subtitle}
          </p>
        </div>

        {/* Steps grid */}
        <div className="proc-steps proc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "48px" }}>
          {processSteps.map((step, i) => (
            <div key={i} className="proc-step">
              {/* Image */}
              <div className="proc-step__img">
                <Image src={step.image} alt={step.title} fill style={{ objectFit: "cover" }} sizes="(max-width: 900px) 100vw, 33vw" />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />
                {/* Step number */}
                <div style={{
                  position: "absolute", top: "14px", left: "14px", zIndex: 2,
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "0.82rem",
                  color: "var(--green-deep)",
                }}>
                  {step.num}
                </div>
                {/* Icon bottom right */}
                <div style={{
                  position: "absolute", bottom: "14px", right: "14px", zIndex: 2,
                  width: "48px", height: "48px", borderRadius: "14px",
                  background: "var(--green-deep)", display: "flex",
                  alignItems: "center", justifyContent: "center", color: "white",
                  boxShadow: "0 4px 12px rgba(45,74,62,0.25)",
                }}>
                  {step.icon}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: "24px" }}>
                <h3 style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                  fontSize: "1.3rem", color: "var(--text-dark)",
                  marginBottom: "12px", letterSpacing: "-0.02em", lineHeight: 1.2,
                }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.65, marginBottom: "16px" }}>
                  {step.desc}
                </p>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: "5px",
                  padding: "5px 12px", borderRadius: "999px",
                  background: "rgba(135,163,141,0.08)", border: "1px solid rgba(135,163,141,0.12)",
                  fontSize: "0.72rem", fontWeight: 700, color: "var(--sage-dark)",
                }}>
                  <CheckCircle2 size={11} /> {step.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom: time badge + guarantees + CTA */}
        <div className="proc-bottom" style={{ textAlign: "center" }}>
          {/* Time badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "12px 26px", background: "var(--green-deep)", color: "white",
            borderRadius: "999px", fontSize: "0.85rem", fontWeight: 700,
            fontFamily: "'Manrope', sans-serif", marginBottom: "28px",
            boxShadow: "0 4px 16px rgba(45,74,62,0.2)",
          }}>
            <Clock size={14} /> {timeBadge}
          </div>

          {/* Guarantees */}
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
            {processGuarantees.map((g) => (
              <div key={g.label} className="proc-guarantee proc-g-pill">
                <span style={{ color: "var(--sage)", display: "flex" }}>{g.icon}</span>
                {g.label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <a href={ctaHref} style={{
            display: "inline-flex", alignItems: "center", gap: "9px",
            padding: "14px 30px", background: "transparent", color: "var(--green-deep)",
            borderRadius: "999px", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
            fontSize: "0.88rem", textDecoration: "none",
            border: "2px solid var(--green-deep)",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.color = "white"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {ctaText} <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
