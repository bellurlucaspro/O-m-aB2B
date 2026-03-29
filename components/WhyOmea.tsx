"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import Image from "next/image";
import { ArrowRight, ShieldCheck, X, Leaf, Heart, MapPin, Recycle } from "lucide-react";
import type { WhyOmeaContent } from "@/lib/types";

/* ─── Scene data ─────────────────────────────────────────── */
const scenes = [
  {
    image: "/uploads/AUTRE2.png",
    title: "Artisanat français direct",
    desc: "Sourcing en circuit court, sans intermédiaire. Chaque achat soutient directement un artisan local.",
    metric: "100",
    metricSuffix: "%",
    metricLabel: "artisanal",
    ringColor: "var(--sage)",
    bgGradient: "radial-gradient(ellipse at 30% 50%, rgba(135,163,141,0.08) 0%, transparent 70%)",
  },
  {
    image: "/uploads/2.2.png",
    title: "Produits certifiés & tracés",
    desc: "100% naturels, sans composants controversés. Fiches de traçabilité disponibles pour votre CSE.",
    metric: "0",
    metricSuffix: "",
    metricLabel: "controversé",
    ringColor: "var(--sage-dark)",
    bgGradient: "radial-gradient(ellipse at 70% 50%, rgba(135,163,141,0.12) 0%, transparent 70%)",
  },
  {
    image: "/uploads/1.2.png",
    title: "Empreinte carbone réduite",
    desc: "Packaging éco-conçu, expédition groupée. Chaque étape est optimisée pour limiter l'impact.",
    metric: "-60",
    metricSuffix: "%",
    metricLabel: "CO₂",
    ringColor: "var(--green-deep)",
    bgGradient: "radial-gradient(ellipse at 50% 30%, rgba(45,74,62,0.06) 0%, transparent 70%)",
  },
  {
    image: "/uploads/7.png",
    title: "Transparence totale",
    desc: "Origine, composition, prix : tout est visible. Un partenaire de confiance pour vos achats responsables.",
    metric: "100",
    metricSuffix: "%",
    metricLabel: "traçabilité",
    ringColor: "#B8744A",
    bgGradient: "radial-gradient(ellipse at 30% 70%, rgba(237,232,218,0.4) 0%, transparent 70%)",
  },
];

const RING_CIRCUMFERENCE = 2 * Math.PI * 160; // r=160 for the SVG ring

/* ─── Component ──────────────────────────────────────────── */
export default function WhyOmea({ content }: { content?: WhyOmeaContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rseOpen, setRseOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ── Desktop: pinned scroll-driven experience ── */
  useEffect(() => {
    if (!sectionRef.current || isMobile) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const totalScenes = scenes.length;

      // Main pin + scrub timeline
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: `+=${totalScenes * 100}%`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              Math.floor(self.progress * totalScenes),
              totalScenes - 1
            );
            setActiveScene(idx);
          },
        },
      });

      // Animate ring fill per scene
      for (let i = 0; i < totalScenes; i++) {
        const sceneStart = i / totalScenes;
        tl.fromTo(
          `.why-ring-${i}`,
          { strokeDashoffset: RING_CIRCUMFERENCE },
          { strokeDashoffset: 0, duration: 1 / totalScenes, ease: "none" },
          sceneStart
        );
      }

      // Progress bar
      tl.fromTo(
        ".why-progress-fill",
        { scaleX: 0 },
        { scaleX: 1, duration: 1, ease: "none" },
        0
      );

      // Entrance animation for header (before pin)
      gsap.fromTo(
        ".why-header",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  /* ── Mobile: simple IntersectionObserver-based sequential reveal ── */
  useEffect(() => {
    if (!sectionRef.current || !isMobile) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".why-header",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", scrollTrigger: { trigger: ".why-header", start: "top 85%" } }
      );
      gsap.fromTo(".why-mobile-card",
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: "power2.out", stagger: 0.12, scrollTrigger: { trigger: ".why-mobile-grid", start: "top 85%" } }
      );
      gsap.fromTo(".why-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", scrollTrigger: { trigger: ".why-cta", start: "top 90%" } }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isMobile]);

  const current = scenes[activeScene];

  return (
    <>
    <section
      id="pourquoi"
      ref={sectionRef}
      style={{
        background: "var(--cream)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        /* ── Shared ── */
        .why-header { text-align: center; }

        /* ── Desktop pinned view ── */
        .why-pinned {
          height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: relative;
        }

        .why-stage {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1100px;
          width: 100%;
          padding: 0 48px;
        }

        /* Ring container */
        .why-ring-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .why-ring-icon {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Scene content */
        .why-scene {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Progress bar */
        .why-progress {
          position: absolute;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          width: 240px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .why-progress-bar {
          width: 100%;
          height: 3px;
          background: rgba(135,163,141,0.15);
          border-radius: 2px;
          overflow: hidden;
        }
        .why-progress-fill {
          height: 100%;
          background: var(--green-deep);
          border-radius: 2px;
          transform-origin: left;
        }

        /* Dots */
        .why-dots {
          display: flex;
          gap: 8px;
        }
        .why-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background: rgba(135,163,141,0.25);
        }
        .why-dot--active {
          background: var(--green-deep);
          width: 24px;
          border-radius: 4px;
        }

        /* ── Mobile cards ── */
        .why-mobile-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          padding: 0 20px;
        }
        .why-mobile-card {
          background: white;
          border: 1.5px solid rgba(135,163,141,0.12);
          border-radius: 20px;
          padding: 28px;
          position: relative;
          overflow: hidden;
        }
        .why-mobile-card:hover {
          border-color: rgba(135,163,141,0.25);
          box-shadow: 0 12px 40px rgba(45,74,62,0.08);
        }

        @media (max-width: 900px) {
          .why-desktop { display: none !important; }
          .why-mobile { display: block !important; }
        }
        @media (min-width: 901px) {
          .why-desktop { display: block !important; }
          .why-mobile { display: none !important; }
        }
      `}</style>

      {/* ═══════════ DESKTOP: Pinned Cinematic ═══════════ */}
      <div className="why-desktop">
        <div className="why-pinned">
          {/* Background gradient that changes per scene */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: current.bgGradient,
              transition: "background 0.8s ease",
              pointerEvents: "none",
            }}
          />

          {/* Floating leaf decorations */}
          <div className="why-deco-leaf" style={{
            position: "absolute", top: "10%", left: "5%",
            width: "120px", height: "120px", opacity: 0.06,
            background: "var(--sage)", borderRadius: "60% 40% 50% 50% / 50% 60% 40% 50%",
            transform: "rotate(-20deg)", pointerEvents: "none",
          }} />
          <div className="why-deco-leaf" style={{
            position: "absolute", bottom: "15%", right: "8%",
            width: "80px", height: "80px", opacity: 0.04,
            background: "var(--green-deep)", borderRadius: "40% 60% 50% 50% / 60% 40% 50% 50%",
            transform: "rotate(30deg)", pointerEvents: "none",
          }} />

          {/* Header — above the stage */}
          <div className="why-header" style={{ marginBottom: "64px", position: "relative", zIndex: 2 }}>
            <span className="tag-pill" style={{ marginBottom: "18px" }}>
              <ShieldCheck size={11} /> Nos engagements RSE
            </span>
            <h2 style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800, letterSpacing: "-0.03em",
              color: "var(--text-dark)", marginTop: "16px",
            }}>
              Une d&eacute;marche{" "}
              <em style={{ fontStyle: "normal", color: "var(--green-deep)" }}>responsable</em>{" "}
              de bout en bout.
            </h2>
          </div>

          {/* Stage: ring + content */}
          <div className="why-stage" style={{ position: "relative", zIndex: 2 }}>
            {/* LEFT: Animated ring with photo */}
            <div className="why-ring-wrap" style={{ width: "340px", height: "340px" }}>
              {/* SVG ring */}
              <svg width="340" height="340" viewBox="0 0 340 340" style={{
                position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)", zIndex: 2,
              }}>
                <circle cx="170" cy="170" r="160" fill="none" stroke="rgba(135,163,141,0.1)" strokeWidth="5" />
                {scenes.map((scene, i) => (
                  <circle
                    key={i}
                    className={`why-ring-${i}`}
                    cx="170" cy="170" r="160"
                    fill="none"
                    stroke={scene.ringColor}
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 160}
                    strokeDashoffset={2 * Math.PI * 160}
                    style={{ opacity: activeScene === i ? 1 : 0, transition: "opacity 0.4s ease" }}
                  />
                ))}
              </svg>

              {/* Photo inside ring — circular clip */}
              <div style={{
                width: "290px", height: "290px", borderRadius: "50%",
                overflow: "hidden", position: "relative",
                boxShadow: "inset 0 0 40px rgba(0,0,0,0.08)",
              }}>
                {scenes.map((scene, i) => (
                  <Image
                    key={i}
                    src={scene.image}
                    alt={scene.title}
                    fill
                    style={{
                      objectFit: "cover",
                      opacity: activeScene === i ? 1 : 0,
                      transition: "opacity 0.6s ease",
                      transform: "scale(1.05)",
                    }}
                    sizes="290px"
                  />
                ))}
                {/* Subtle dark overlay for contrast */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "50%",
                  background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.25) 100%)",
                  zIndex: 1,
                }} />
              </div>

              {/* Metric badge — floating bottom-right of ring */}
              <div style={{
                position: "absolute", bottom: "12px", right: "12px", zIndex: 3,
                background: "white", borderRadius: "16px",
                padding: "10px 18px", display: "flex", alignItems: "baseline", gap: "4px",
                boxShadow: "0 8px 32px rgba(45,74,62,0.15)",
                border: "1px solid rgba(135,163,141,0.12)",
                transition: "all 0.4s ease",
              }}>
                <span style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                  fontSize: "1.5rem", letterSpacing: "-0.03em",
                  color: "var(--text-dark)", lineHeight: 1,
                }}>
                  {current.metric}{current.metricSuffix}
                </span>
                <span style={{
                  fontSize: "0.65rem", color: "var(--text-light)",
                  fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {current.metricLabel}
                </span>
              </div>
            </div>

            {/* RIGHT: Scene content — stacked absolutely, crossfade via React state */}
            <div style={{ position: "relative", minHeight: "260px" }}>
              {scenes.map((scene, i) => (
                <div
                  key={i}
                  className={`why-scene why-scene-${i}`}
                  style={{
                    opacity: activeScene === i ? 1 : 0,
                    transform: activeScene === i ? "translateY(0)" : "translateY(20px)",
                    filter: activeScene === i ? "blur(0px)" : "blur(4px)",
                    transition: "opacity 0.5s ease, transform 0.5s ease, filter 0.5s ease",
                    pointerEvents: activeScene === i ? "auto" : "none",
                  }}
                >
                  {/* Step number */}
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                    fontSize: "0.72rem", letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "var(--sage)", marginBottom: "16px",
                  }}>
                    0{i + 1} / 0{scenes.length}
                  </div>

                  <h3 style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                    fontSize: "1.6rem", color: "var(--text-dark)",
                    letterSpacing: "-0.02em", lineHeight: 1.2,
                    marginBottom: "16px",
                  }}>
                    {scene.title}
                  </h3>

                  <p style={{
                    fontSize: "1rem", color: "var(--text-mid)",
                    lineHeight: 1.7, maxWidth: "400px",
                    marginBottom: "28px",
                  }}>
                    {scene.desc}
                  </p>

                  {/* Proof badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: "8px",
                    background: "white", borderRadius: "12px",
                    padding: "10px 18px",
                    border: "1px solid rgba(135,163,141,0.15)",
                    boxShadow: "0 4px 16px rgba(45,74,62,0.06)",
                  }}>
                    <ShieldCheck size={14} style={{ color: "var(--sage)" }} />
                    <span style={{
                      fontSize: "0.78rem", fontWeight: 600,
                      color: "var(--text-mid)",
                    }}>
                      Vérifiable sur demande
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress + dots at bottom */}
          <div className="why-progress">
            <div className="why-dots">
              {scenes.map((_, i) => (
                <button
                  key={i}
                  className={`why-dot ${activeScene === i ? "why-dot--active" : ""}`}
                  aria-label={`Engagement ${i + 1}`}
                />
              ))}
            </div>
            <div className="why-progress-bar">
              <div className="why-progress-fill" />
            </div>
          </div>

          {/* CTA RSE — centered under progress */}
          <div className="why-cta" style={{ textAlign: "center", marginTop: "24px" }}>
            <button
              onClick={() => setRseOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 18px",
                background: "transparent", color: "var(--sage)",
                border: "1.5px solid rgba(135,163,141,0.2)",
                borderRadius: "999px", fontFamily: "'Manrope', sans-serif",
                fontWeight: 600, fontSize: "0.75rem", cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--sage)";
                e.currentTarget.style.background = "rgba(135,163,141,0.06)";
                e.currentTarget.style.color = "var(--green-deep)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(135,163,141,0.2)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--sage)";
              }}
            >
              <Leaf size={12} /> Voir notre charte RSE
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════ MOBILE: Cards ═══════════ */}
      <div className="why-mobile" style={{ padding: "80px 0" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 20px" }}>
          <div className="why-header" style={{ textAlign: "center", marginBottom: "40px" }}>
            <span className="tag-pill" style={{ marginBottom: "18px" }}>
              <ShieldCheck size={11} /> Nos engagements RSE
            </span>
            <h2 style={{
              fontSize: "clamp(1.8rem, 5vw, 2.4rem)",
              fontWeight: 800, letterSpacing: "-0.03em",
              color: "var(--text-dark)", marginTop: "16px",
            }}>
              Une d&eacute;marche{" "}
              <em style={{ fontStyle: "normal", color: "var(--green-deep)" }}>responsable</em>{" "}
              de bout en bout.
            </h2>
          </div>

          <div className="why-mobile-grid">
            {scenes.map((scene, i) => (
              <div key={i} className="why-mobile-card">
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                  {/* Mini photo circle */}
                  <div style={{
                    position: "relative", width: "52px", height: "52px", flexShrink: 0,
                    borderRadius: "50%", overflow: "hidden",
                    border: `2.5px solid ${scene.ringColor}`,
                  }}>
                    <Image src={scene.image} alt={scene.title} fill style={{ objectFit: "cover" }} sizes="52px" />
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                      fontSize: "1.3rem", color: "var(--text-dark)", lineHeight: 1,
                    }}>
                      {scene.metric}{scene.metricSuffix}
                    </div>
                    <div style={{
                      fontSize: "0.65rem", color: "var(--text-light)",
                      fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      {scene.metricLabel}
                    </div>
                  </div>
                </div>

                <h3 style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                  fontSize: "1rem", color: "var(--text-dark)",
                  marginBottom: "6px",
                }}>
                  {scene.title}
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-mid)", lineHeight: 1.6 }}>
                  {scene.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="why-cta" style={{ textAlign: "center", marginTop: "40px" }}>
            <button
              onClick={() => setRseOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: "8px",
                padding: "10px 18px", background: "transparent",
                color: "var(--sage)", borderRadius: "999px",
                fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                fontSize: "0.78rem", cursor: "pointer",
                border: "1.5px solid rgba(135,163,141,0.25)",
              }}
            >
              <Leaf size={13} /> Voir notre charte RSE
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* ═══════ RSE POPUP ═══════ */}
    {rseOpen && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Charte RSE O'Mea"
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
          {/* Close */}
          <button
            onClick={() => setRseOpen(false)}
            aria-label="Fermer"
            style={{
              position: "absolute", top: "16px", right: "16px", zIndex: 2,
              width: "40px", height: "40px", borderRadius: "50%",
              background: "white", border: "1px solid rgba(135,163,141,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-mid)",
              transition: "all 0.2s ease",
            }}
          >
            <X size={16} />
          </button>

          {/* Header */}
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
              Une demarche responsable a chaque etape
            </h3>
          </div>

          {/* Content */}
          <div style={{ padding: "32px 36px 40px" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: "28px" }}>
              Chez O&apos;Mea, la responsabilite n&apos;est pas un argument marketing. C&apos;est le fondement de chaque decision, de la selection des produits a la livraison de vos coffrets.
            </p>

            {[
              { icon: <Leaf size={18} />, color: "var(--sage)", title: "Produits naturels et certifies", text: "Zero perturbateurs endocriniens, zero parabenes. Chaque produit est selectionne pour sa composition irréprochable et son score Yuka. Adapte aux femmes enceintes et aux nourrissons." },
              { icon: <Recycle size={18} />, color: "#D4956B", title: "Packaging eco-responsable", text: "Emballages recycles, encres vegetales, zero plastique superflu. Nos coffrets sont concus pour etre aussi beaux que responsables." },
              { icon: <MapPin size={18} />, color: "var(--green-deep)", title: "100% Made in France", text: "Artisans locaux, circuits courts, savoir-faire francais. Nous sourcons en priorite aupres de producteurs situes a moins de 500 km de nos ateliers." },
              { icon: <Heart size={18} />, color: "#B8744A", title: "Impact social positif", text: "Chaque coffret soutient l'artisanat local et contribue a une economie plus juste. Nous privilegions les partenariats durables avec des marques engagees." },
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

            <div style={{
              marginTop: "8px", padding: "16px 20px",
              background: "rgba(135,163,141,0.06)", borderRadius: "14px",
              border: "1px solid rgba(135,163,141,0.1)",
              fontSize: "0.8rem", color: "var(--text-mid)", lineHeight: 1.7,
            }}>
              <strong style={{ color: "var(--text-dark)" }}>Notre objectif 2026 :</strong> 100% des emballages compostables, bilan carbone neutre sur l&apos;ensemble de la chaine logistique.
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
