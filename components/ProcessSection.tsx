"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, ease } from "@/lib/motion";
import { MessageSquare, Package, Truck, ArrowRight, ShieldCheck, FileText, MapPin, Clock } from "lucide-react";
import type { ProcessContent } from "@/lib/types";

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquare: <MessageSquare size={20} strokeWidth={1.8} />,
  Package: <Package size={20} strokeWidth={1.8} />,
  Truck: <Truck size={20} strokeWidth={1.8} />,
  ShieldCheck: <ShieldCheck size={14} />,
  FileText: <FileText size={14} />,
  MapPin: <MapPin size={14} />,
  Clock: <Clock size={14} />,
};

const DEFAULT_STEPS = [
  { icon: "MessageSquare", title: "Échangez avec nous", desc: "Besoin, budget, calendrier. Devis sous 24h.", badge: "Interlocuteur dédié", image: "/RH%20cadeau%20maternit%C3%A9.JPG" },
  { icon: "Package", title: "Validez votre sélection", desc: "Branding et messages intégrés. Maquette offerte.", badge: "Maquette offerte", image: "/uploads/produits-box-omea.webp" },
  { icon: "Truck", title: "On déploie, vous recevez", desc: "Multi-sites, domicile ou télétravail. Date garantie.", badge: "Expédition 48h", image: "/uploads/AUTRE%201.png" },
];

const DEFAULT_GUARANTEES = [
  { icon: "ShieldCheck", label: "URSSAF conforme" },
  { icon: "FileText", label: "Documentation complète" },
  { icon: "MapPin", label: "Multi-sites" },
  { icon: "Clock", label: "Délais garantis" },
];

export default function ProcessSection({ content }: { content?: ProcessContent }) {
  const ref = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const label = content?.label ?? "Processus simplifié";
  const title = content?.title ?? "3 étapes.";
  const titleItalic = content?.titleItalic ?? "Zéro friction.";
  const subtitle = content?.subtitle ?? "Un interlocuteur dédié pilote tout, du devis à la livraison.";
  const ctaText = content?.ctaText ?? "Demander un devis";
  const ctaHref = content?.ctaHref ?? "#devis";

  const stepsData = content?.steps ?? DEFAULT_STEPS;
  const steps = stepsData.map((s, i) => ({
    icon: ICON_MAP[s.icon] ?? <MessageSquare size={20} />,
    num: String(i + 1).padStart(2, "0"),
    title: s.title, desc: s.desc, badge: s.badge, image: s.image,
  }));

  const guarantees = (content?.guarantees ?? DEFAULT_GUARANTEES).map((g) => ({
    icon: ICON_MAP[g.icon] ?? <ShieldCheck size={14} />,
    label: g.label,
  }));

  // Auto-advance steps
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  // GSAP entrance
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".ps-a"), { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".ps-header",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: ease.enter,
          scrollTrigger: { trigger: ".ps-header", start: "top 85%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".ps-timeline",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: ease.enter,
          scrollTrigger: { trigger: ".ps-timeline", start: "top 80%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".ps-bottom-el",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.06, ease: ease.enter,
          scrollTrigger: { trigger: ".ps-bottom", start: "top 90%", toggleActions: "play none none none" } }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <section id="processus" ref={ref} style={{ background: "var(--cream)", padding: "72px 0 56px", position: "relative", overflow: "hidden" }}>
      <style>{`
        .ps-step-btn {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 20px 22px; border-radius: 18px;
          border: 1.5px solid transparent; background: transparent;
          cursor: pointer; width: 100%; text-align: left;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .ps-step-btn--active {
          background: var(--cream-dark);
          border-color: rgba(135,163,141,0.12);
        }
        .ps-step-btn:hover:not(.ps-step-btn--active) {
          background: rgba(135,163,141,0.04);
        }
        .ps-bar-track {
          position: absolute; bottom: 0; left: 22px; right: 22px;
          height: 2px; background: rgba(135,163,141,0.08);
          border-radius: 1px; overflow: hidden;
        }
        .ps-bar-fill {
          height: 100%; background: var(--green-deep);
          border-radius: 1px; width: 0%;
        }
        @keyframes psBarFill {
          from { width: 0%; }
          to { width: 100%; }
        }
        .ps-img-wrap {
          position: relative; border-radius: 20px;
          overflow: hidden; height: 100%;
          min-height: 320px;
        }
        .ps-img-slide {
          position: absolute; inset: 0;
          opacity: 0; transition: opacity 0.6s ease;
        }
        .ps-img-slide--active { opacity: 1; }
        .ps-img-slide img {
          transition: transform 6s ease !important;
        }
        .ps-img-slide--active img {
          transform: scale(1.04);
        }
        @media (max-width: 900px) {
          .ps-layout { grid-template-columns: 1fr !important; }
          .ps-img-wrap { min-height: 240px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div className="ps-header" style={{ textAlign: "center", marginBottom: "44px" }}>
          <p style={{
            fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.25em",
            textTransform: "uppercase", color: "var(--sage)", marginBottom: "12px",
            fontFamily: "var(--font-manrope)",
          }}>
            {label}
          </p>
          <h2 style={{
            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", letterSpacing: "-0.04em",
            lineHeight: 1.05, color: "var(--text-dark)", marginBottom: "10px",
          }}>
            <span style={{ fontWeight: 200 }}>{title}</span>{" "}
            <span style={{ fontWeight: 900, fontStyle: "italic", color: "var(--green-deep)" }}>{titleItalic}</span>
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.6, maxWidth: "420px", margin: "0 auto" }}>
            {subtitle}
          </p>
        </div>

        {/* Timeline — steps left + image right */}
        <div className="ps-timeline ps-layout" style={{
          display: "grid", gridTemplateColumns: "1.1fr 1fr",
          gap: "28px", alignItems: "stretch", marginBottom: "40px",
        }}>
          {/* Left — steps list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {steps.map((step, i) => {
              const isActive = activeStep === i;
              return (
                <button
                  key={i}
                  className={`ps-step-btn ${isActive ? "ps-step-btn--active" : ""}`}
                  onClick={() => setActiveStep(i)}
                >
                  {/* Icon circle */}
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "14px", flexShrink: 0,
                    background: isActive ? "var(--green-deep)" : "rgba(135,163,141,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isActive ? "white" : "var(--sage)",
                    transition: "all 0.4s ease",
                    boxShadow: isActive ? "0 4px 16px rgba(45,74,62,0.2)" : "none",
                  }}>
                    {step.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-manrope)", fontWeight: 900,
                        fontSize: "1rem", color: isActive ? "var(--text-dark)" : "var(--text-mid)",
                        transition: "color 0.3s ease",
                      }}>
                        {step.title}
                      </span>
                      <span style={{
                        fontSize: "0.6rem", fontWeight: 700, color: "var(--sage)",
                        opacity: isActive ? 0 : 0.6, transition: "opacity 0.3s ease",
                      }}>
                        {step.num}
                      </span>
                    </div>
                    <div style={{
                      fontSize: "0.78rem", color: "var(--text-light)",
                      lineHeight: 1.5,
                      maxHeight: isActive ? "60px" : "0",
                      overflow: "hidden",
                      opacity: isActive ? 1 : 0,
                      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}>
                      {step.desc}
                    </div>
                    {isActive && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: "5px",
                        marginTop: "8px",
                        fontSize: "0.68rem", fontWeight: 700, color: "var(--green-deep)",
                        fontFamily: "var(--font-manrope)",
                      }}>
                        <Clock size={11} /> {step.badge}
                      </div>
                    )}
                  </div>

                  {/* Progress bar at bottom */}
                  {isActive && (
                    <div className="ps-bar-track">
                      <div className="ps-bar-fill" style={{ animation: "psBarFill 4s linear" }} />
                    </div>
                  )}
                </button>
              );
            })}

          </div>

          {/* Right — image with crossfade */}
          <div className="ps-img-wrap" style={{ boxShadow: "0 20px 60px rgba(45,74,62,0.1)" }}>
            {steps.map((step, i) => (
              <div key={i} className={`ps-img-slide ${activeStep === i ? "ps-img-slide--active" : ""}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={step.image}
                  alt={step.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ))}
            {/* Gradient */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "40%",
              background: "linear-gradient(to top, rgba(0,0,0,0.25) 0%, transparent 100%)",
              pointerEvents: "none", zIndex: 1,
            }} />
          </div>
        </div>

        {/* Bottom — guarantees + CTA inline */}
        <div className="ps-bottom" style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          gap: "10px", flexWrap: "wrap",
        }}>
          {guarantees.map((g) => (
            <div key={g.label} className="ps-bottom-el" style={{
              display: "flex", alignItems: "center", gap: "5px",
              padding: "7px 12px", borderRadius: "999px",
              border: "1px solid rgba(135,163,141,0.12)",
              fontSize: "0.7rem", fontWeight: 600, color: "var(--text-mid)",
            }}>
              <span style={{ color: "var(--sage)", display: "flex" }}>{g.icon}</span>
              {g.label}
            </div>
          ))}
          <a href={ctaHref} className="ps-bottom-el" style={{
            display: "inline-flex", alignItems: "center", gap: "7px",
            padding: "10px 22px", background: "var(--green-deep)", color: "white",
            borderRadius: "999px", fontFamily: "var(--font-manrope)", fontWeight: 700,
            fontSize: "0.8rem", textDecoration: "none",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-darker)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {ctaText} <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}
