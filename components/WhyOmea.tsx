"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import Image from "next/image";
import { ShieldCheck, Leaf, Heart, MapPin, Recycle, X } from "lucide-react";
import type { WhyOmeaContent } from "@/lib/types";

/* ─── Scene data ─────────────────────────────────────────── */
const scenes = [
  {
    image: "/uploads/AUTRE2.png",
    title: "Artisanat français direct",
    desc: "Circuit court, sans intermédiaire. Chaque achat soutient un artisan local.",
    metric: "100%",
    metricLabel: "artisanal",
  },
  {
    image: "/uploads/2.2.png",
    title: "Produits certifiés & tracés",
    desc: "100% naturels, sans composants controversés. Traçabilité pour votre CSE.",
    metric: "0",
    metricLabel: "controversé",
  },
  {
    image: "/uploads/1.2.png",
    title: "Empreinte carbone réduite",
    desc: "Packaging éco-conçu, expédition groupée. Impact limité à chaque étape.",
    metric: "-60%",
    metricLabel: "CO₂",
  },
  {
    image: "/uploads/7.png",
    title: "Transparence totale",
    desc: "Origine, composition, prix : tout est visible et vérifiable sur demande.",
    metric: "100%",
    metricLabel: "traçabilité",
  },
];

/* ─── Component ──────────────────────────────────────────── */
export default function WhyOmea({ content }: { content?: WhyOmeaContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [rseOpen, setRseOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll(".why-card"), { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".why-card",
        { opacity: 0, y: 30, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.5, ease: "power2.out", stagger: 0.1,
          scrollTrigger: {
            trigger: ".why-grid",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <section
        id="pourquoi"
        ref={sectionRef}
        style={{
          background: "var(--cream)",
          padding: "80px 0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <style>{`
          .why-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
          }
          .why-card {
            background: white;
            border-radius: 24px;
            overflow: hidden;
            border: 1px solid rgba(135,163,141,0.04);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 8px rgba(45,74,62,0.03);
          }
          .why-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 60px rgba(45,74,62,0.10), 0 8px 24px rgba(45,74,62,0.05);
            border-color: rgba(135,163,141,0.1);
          }
          .why-card:hover .why-card-img img {
            transform: scale(1.08);
          }
          .why-card-img {
            position: relative;
            height: 180px;
            overflow: hidden;
          }
          .why-card-img img {
            transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
          }
          .why-metric-badge {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .why-card:hover .why-metric-badge {
            transform: scale(1.05);
            box-shadow: 0 8px 24px rgba(0,0,0,0.3) !important;
          }
          @media (max-width: 1024px) {
            .why-grid { grid-template-columns: repeat(2, 1fr); }
          }
          @media (max-width: 600px) {
            .why-grid { grid-template-columns: 1fr; gap: 12px; }
            .why-card-img { height: 160px; }
          }
        `}</style>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "56px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              fontSize: "0.65rem", fontWeight: 800, letterSpacing: "0.2em",
              textTransform: "uppercase", color: "var(--sage)",
              fontFamily: "'Manrope', sans-serif", marginBottom: "18px",
              padding: "6px 16px",
              background: "rgba(135,163,141,0.08)",
              borderRadius: "999px",
            }}>
              <ShieldCheck size={11} strokeWidth={2.5} /> Nos engagements
            </div>
            <h2 style={{
              fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
              fontWeight: 900, letterSpacing: "-0.035em",
              color: "var(--text-dark)", lineHeight: 1.1,
            }}>
              Une démarche{" "}
              <em style={{
                fontStyle: "italic",
                color: "var(--green-deep)",
                position: "relative",
              }}>responsable</em>{" "}
              de bout en bout.
            </h2>
          </div>

          {/* Cards */}
          <div className="why-grid">
            {scenes.map((scene, i) => {
              const isHovered = hoveredIdx === i;
              return (
                <div
                  key={i}
                  className="why-card"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  {/* Image */}
                  <div className="why-card-img">
                    <Image
                      src={scene.image}
                      alt={scene.title}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 600px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(45,74,62,0.55) 0%, rgba(45,74,62,0.05) 50%, transparent 100%)",
                    }} />

                    {/* Metric badge */}
                    <div className="why-metric-badge" style={{
                      position: "absolute", bottom: "14px", left: "14px", zIndex: 2,
                      display: "inline-flex", alignItems: "baseline", gap: "5px",
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(12px)",
                      borderRadius: "12px",
                      padding: "8px 14px",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}>
                      <span style={{
                        fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                        fontSize: "1.4rem", color: "white", lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}>
                        {scene.metric}
                      </span>
                      <span style={{
                        fontSize: "0.58rem", color: "rgba(255,255,255,0.75)",
                        fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        {scene.metricLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "22px 22px 26px" }}>
                    <h3 style={{
                      fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                      fontSize: "1rem", color: "var(--green-deep)",
                      lineHeight: 1.25, marginBottom: "8px",
                      letterSpacing: "-0.02em",
                    }}>
                      {scene.title}
                    </h3>
                    <p style={{
                      fontSize: "0.82rem", color: "var(--text-mid)",
                      lineHeight: 1.65, margin: 0,
                    }}>
                      {scene.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Verification badge */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", marginTop: "36px",
          }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "8px 18px",
              background: "rgba(135,163,141,0.06)",
              borderRadius: "999px",
              border: "1px solid rgba(135,163,141,0.08)",
            }}>
              <ShieldCheck size={13} strokeWidth={2.2} style={{ color: "var(--sage)" }} />
              <span style={{
                fontSize: "0.75rem", fontWeight: 600, color: "var(--text-mid)",
              }}>
                Toutes nos données sont vérifiables sur demande
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ RSE POPUP ═══════ */}
      {rseOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Charte RSE O'Méa"
          onClick={() => setRseOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(18,32,26,0.85)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
            animation: "rse-fade-in 0.25s ease",
          }}
        >
          <style>{`
            @keyframes rse-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes rse-slide-up { from { opacity: 0; transform: translateY(32px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--cream)", borderRadius: "24px",
              maxWidth: "640px", width: "100%", maxHeight: "85vh", overflowY: "auto",
              boxShadow: "0 40px 120px rgba(0,0,0,0.3)",
              animation: "rse-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              position: "relative",
            }}
          >
            <button
              onClick={() => setRseOpen(false)}
              aria-label="Fermer"
              style={{
                position: "absolute", top: "16px", right: "16px", zIndex: 2,
                width: "40px", height: "40px", borderRadius: "50%",
                background: "var(--cream)", border: "1px solid rgba(135,163,141,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "var(--text-mid)",
              }}
            >
              <X size={16} />
            </button>

            <div style={{
              background: "var(--green-deep)", padding: "40px 36px 32px",
              borderRadius: "24px 24px 0 0",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <Leaf size={18} style={{ color: "var(--sage-light)" }} />
                <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--sage-light)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Nos engagements RSE</span>
              </div>
              <h3 style={{
                fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                fontSize: "1.5rem", color: "white", letterSpacing: "-0.03em", lineHeight: 1.15,
              }}>
                Une démarche responsable à chaque étape
              </h3>
            </div>

            <div style={{ padding: "32px 36px 40px" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "28px" }}>
                Chez O&apos;Méa, la responsabilité n&apos;est pas un argument marketing. C&apos;est le fondement de chaque décision.
              </p>

              {[
                { icon: <Leaf size={18} />, color: "var(--sage)", title: "Produits naturels et certifiés", text: "Zéro perturbateurs endocriniens. Chaque produit sélectionné pour sa composition irréprochable." },
                { icon: <Recycle size={18} />, color: "#D4956B", title: "Packaging éco-responsable", text: "Emballages recyclés, encres végétales, zéro plastique superflu." },
                { icon: <MapPin size={18} />, color: "var(--green-deep)", title: "100% Made in France", text: "Artisans locaux, circuits courts, savoir-faire français." },
                { icon: <Heart size={18} />, color: "var(--accent-terracotta)", title: "Impact social positif", text: "Chaque coffret soutient l'artisanat local et une économie plus juste." },
              ].map((item) => (
                <div key={item.title} style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: `${item.color}15`, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: item.color,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.9rem", color: "var(--text-dark)", marginBottom: "4px" }}>{item.title}</h4>
                    <p style={{ fontSize: "0.82rem", color: "var(--text-mid)", lineHeight: 1.7 }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
