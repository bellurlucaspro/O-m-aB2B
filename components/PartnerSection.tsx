"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, ArrowRight, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { gsap, ScrollTrigger, ease } from "@/lib/motion";
import type { PartnersContent } from "@/lib/types";

const DEFAULT_PARTNERS = [
  {
    quote: "L'impact sur notre marque employeur a été immédiat. Nos collaboratrices partagent les coffrets sur LinkedIn. C'est devenu un vrai argument de recrutement.",
    name: "Sophie L.",
    role: "DRH — EasyVista",
    employees: "450 collaborateurs",
    initials: "SL",
    metric: "98%",
    metricLabel: "satisfaction",
    logo: "/EasyVista-logo-r-color.svg",
    photo: "/RH%20cadeau%20maternit%C3%A9.JPG",
    avatar: "",
  },
  {
    quote: "Zéro logistique de notre côté, livraison individuelle impeccable. Même nos équipes en télétravail ont reçu leur coffret à temps.",
    name: "Marie D.",
    role: "Responsable CSE — CDTS",
    employees: "120 collaborateurs",
    initials: "MD",
    metric: "100%",
    metricLabel: "livrés à temps",
    logo: "/telesurveillance_teleassistance_cdts.png",
    photo: "/uploads/femme-enceinte-travail.webp",
    avatar: "",
  },
  {
    quote: "La qualité des produits a surpris tout le monde. Naturels, français, élégants. Exactement ce qu'il faut pour un cadeau d'entreprise crédible.",
    name: "Thomas R.",
    role: "Office Manager — Berlin Packaging",
    employees: "280 collaborateurs",
    initials: "TR",
    metric: "3x",
    metricLabel: "renouvellement",
    logo: "/news-20211026-berlin-packaging-logo.png",
    photo: "/mockup-box-grossesse.webp",
    avatar: "",
  },
];

export default function PartnerSection({ content }: { content?: PartnersContent }) {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const items = content?.items ?? DEFAULT_PARTNERS;
  const tag = content?.tag ?? "Ils nous font confiance";
  const title = content?.title ?? "Ce qu'en disent";
  const titleHighlight = content?.titleHighlight ?? "nos partenaires";
  const counter = content?.counter ?? "+50";
  const counterLabel = content?.counterLabel ?? "entreprises";
  const ctaText = content?.ctaText ?? "Rejoignez-les";
  const ctaHref = content?.ctaHref ?? "#devis";

  const t = items[active];

  const startAuto = () => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => setActive((p) => (p + 1) % items.length), 6000);
  };

  useEffect(() => { startAuto(); return () => { if (autoRef.current) clearInterval(autoRef.current); }; }, []);

  const goTo = (i: number) => { setActive(i); startAuto(); };
  const prev = () => goTo((active - 1 + items.length) % items.length);
  const next = () => goTo((active + 1) % items.length);

  // GSAP entrance
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".ps-wrap, .ps-quote, .ps-photo-active, .ps-metric, .ps-author"), { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".ps-wrap",
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play none none none" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  // Crossfade on change
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".ps-quote", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.45, ease: ease.enter });
      gsap.fromTo(".ps-photo-active", { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" });
      gsap.fromTo(".ps-metric", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.5)", delay: 0.1 });
      gsap.fromTo(".ps-author", { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.35, delay: 0.15 });
    }, ref);
    return () => ctx.revert();
  }, [active]);

  return (
    <section ref={ref} style={{ background: "var(--cream)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <style>{`
        .ps-card {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          border-radius: 28px;
          overflow: hidden;
          background: var(--cream);
          border: 1.5px solid rgba(135,163,141,0.1);
          box-shadow: 0 24px 80px rgba(45,74,62,0.08);
          min-height: 420px;
        }
        .ps-card:hover {
          box-shadow: 0 32px 96px rgba(45,74,62,0.12);
        }
        .ps-nav-btn {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--cream); border: 1.5px solid rgba(135,163,141,0.15);
          color: var(--text-mid); display: flex; align-items: center;
          justify-content: center; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(45,74,62,0.06);
        }
        .ps-nav-btn:hover {
          background: var(--green-deep);
          color: white;
          border-color: var(--green-deep);
          transform: scale(1.08);
        }
        .ps-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(135,163,141,0.25); border: none;
          padding: 0; cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ps-dot--active {
          background: var(--green-deep);
          width: 28px; border-radius: 4px;
        }
        @media (max-width: 900px) {
          .ps-card { grid-template-columns: 1fr !important; }
          .ps-photo-side { min-height: 240px !important; }
          .ps-content-side { padding: 32px 24px !important; }
          .ps-bottom-row { flex-direction: column !important; gap: 20px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--sage)", fontFamily: "var(--font-manrope)" }}>{tag}</span>
          <h2 style={{
            fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
            fontWeight: 800, letterSpacing: "-0.03em",
            color: "var(--text-dark)", marginTop: "16px",
          }}>
            {title} <span style={{ color: "var(--green-deep)" }}>{titleHighlight}</span>
          </h2>
        </div>

        {/* Main testimonial card */}
        <div className="ps-wrap">
          <div className="ps-card">
            {/* LEFT: Photo side */}
            <div className="ps-photo-side" style={{ position: "relative", minHeight: "420px", overflow: "hidden" }}>
              {items.map((item, i) => (
                <Image
                  key={i} src={item.photo} alt={item.name} fill
                  className={active === i ? "ps-photo-active" : ""}
                  style={{
                    objectFit: "cover",
                    opacity: active === i ? 1 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              ))}
              {/* Gradient overlay */}
              <div style={{
                position: "absolute", inset: 0, zIndex: 1,
                background: "linear-gradient(135deg, rgba(45,74,62,0.6) 0%, rgba(45,74,62,0.2) 60%, transparent 100%)",
              }} />

              {/* Metric badge — floating on photo */}
              <div className="ps-metric" style={{
                position: "absolute", bottom: "24px", left: "24px", zIndex: 2,
                background: "var(--cream)", borderRadius: "16px",
                padding: "14px 20px", display: "flex", alignItems: "baseline", gap: "6px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
              }}>
                <span style={{
                  fontFamily: "var(--font-manrope)", fontWeight: 900,
                  fontSize: "2rem", color: "var(--green-deep)",
                  letterSpacing: "-0.03em", lineHeight: 1,
                }}>
                  {t.metric}
                </span>
                <span style={{
                  fontSize: "0.72rem", color: "var(--text-light)",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {t.metricLabel}
                </span>
              </div>

              {/* Company logo watermark — normalized size */}
              {t.logo && (
                <div style={{
                  position: "absolute", top: "24px", left: "24px", zIndex: 2,
                  width: "120px", height: "36px",
                  display: "flex", alignItems: "center",
                }}>
                  <Image
                    src={t.logo} alt="logo" width={120} height={36}
                    style={{ objectFit: "contain", width: "100%", height: "100%", opacity: 0.9, filter: "brightness(0) invert(1)" }}
                  />
                </div>
              )}
            </div>

            {/* RIGHT: Content side */}
            <div className="ps-content-side" style={{
              padding: "48px 40px",
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              {/* Quote mark */}
              <Quote size={32} style={{ color: "var(--sage)", opacity: 0.4, marginBottom: "20px" }} />

              {/* Quote text */}
              <p className="ps-quote" style={{
                fontFamily: "var(--font-manrope)", fontWeight: 600,
                fontSize: "clamp(1.1rem, 2vw, 1.35rem)",
                color: "var(--text-dark)", lineHeight: 1.65,
                marginBottom: "28px", fontStyle: "italic",
                letterSpacing: "-0.01em",
              }}>
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Author */}
              <div className="ps-author" style={{
                display: "flex", alignItems: "center", gap: "14px",
                paddingTop: "20px", borderTop: "1px solid rgba(135,163,141,0.1)",
              }}>
                {t.avatar ? (
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    overflow: "hidden", flexShrink: 0,
                    border: "2px solid rgba(135,163,141,0.2)",
                  }}>
                    <Image src={t.avatar} alt={t.name} width={48} height={48}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }} />
                  </div>
                ) : (
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--sage), var(--sage-dark))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-manrope)", fontWeight: 800,
                    fontSize: "0.88rem", color: "white", flexShrink: 0,
                  }}>
                    {t.initials}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "1rem", color: "var(--text-dark)", letterSpacing: "-0.01em" }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: "0.76rem", color: "var(--text-mid)", fontWeight: 500 }}>
                    {t.role} · {t.employees}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "2px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={13} fill="var(--accent-gold)" style={{ color: "var(--accent-gold)" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation bar below card */}
          <div className="ps-bottom-row" style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginTop: "28px",
          }}>
            {/* Arrows + dots */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button className="ps-nav-btn" onClick={prev} aria-label="Précédent"><ChevronLeft size={18} /></button>
              <button className="ps-nav-btn" onClick={next} aria-label="Suivant"><ChevronRight size={18} /></button>
              <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
                {items.map((_, i) => (
                  <button key={i} className={`ps-dot ${active === i ? "ps-dot--active" : ""}`} onClick={() => goTo(i)} aria-label={`Témoignage ${i + 1}`} />
                ))}
              </div>
            </div>

            {/* Counter + CTA */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <div style={{ textAlign: "center", padding: "8px 16px", background: "rgba(45,74,62,0.05)", borderRadius: "12px", border: "1px solid rgba(45,74,62,0.1)" }}>
                <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "1.5rem", color: "var(--green-deep)", lineHeight: 1, letterSpacing: "-0.03em" }}>
                  {counter}
                </div>
                <div style={{ fontSize: "0.65rem", color: "var(--text-mid)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginTop: "4px" }}>
                  {counterLabel}
                </div>
              </div>
              <a
                href={ctaHref}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "13px 24px", background: "var(--green-deep)",
                  color: "white", borderRadius: "999px",
                  fontFamily: "var(--font-manrope)", fontWeight: 700,
                  fontSize: "0.85rem", textDecoration: "none",
                  boxShadow: "0 8px 28px rgba(45,74,62,0.2)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-darker)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {ctaText} <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
