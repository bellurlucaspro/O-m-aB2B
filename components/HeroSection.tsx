"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, ShieldCheck, Truck, Clock, Star } from "lucide-react";
import { gsap, ScrollTrigger, ease, useCounter } from "@/lib/motion";

const BoxModel3D = dynamic(() => import("@/components/BoxModel3D"), {
  ssr: false,
  loading: () => <div style={{ width: "100%", height: 420 }} />,
});

function HeroCounter({ value, prefix = "", suffix = "", color, mobile }: { value: number; prefix?: string; suffix?: string; color: string; mobile: boolean }) {
  const ref = useCounter(value, { suffix });
  return (
    <div style={{
      fontFamily: "'Manrope', sans-serif", fontWeight: 900,
      fontSize: mobile ? "2.8rem" : "3.4rem",
      color, letterSpacing: "-0.03em", lineHeight: 1,
    }}>
      {prefix}<span ref={ref}>0{suffix}</span>
    </div>
  );
}

interface HeroProps {
  tagline?: string;
  headlinePre?: string;
  headlineAccent?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  keyPoints?: string[];
}

export default function HeroSection({
  tagline = "Solution cadeaux pour RH, CSE & Dirigeants",
  headlinePre = "Le cadeau d'entreprise qui",
  headlineAccent = "renforce votre marque employeur",
  subtitle = "Coffrets naturels et personnalisables pour chaque moment clé : maternité, naissance, fêtes, évènements CSE.",
  ctaPrimary = "Découvrir nos coffrets",
  ctaSecondary = "Demander un devis",
  keyPoints,
}: HeroProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Cinematic entrance ──
  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(heroRef.current.querySelectorAll(".h-a"), { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Halo glow pulse in
      gsap.fromTo(".h-halo",
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" }
      );

      const tl = gsap.timeline({ defaults: { ease: ease.enter }, delay: 0.1 });

      tl
        // Tag
        .fromTo(".h-tag", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 })
        // Headline words
        .fromTo(".h-word",
          { opacity: 0, y: 24, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.06 },
          "-=0.15"
        )
        // SVG underline
        .fromTo(".h-underline",
          { strokeDashoffset: 500 },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
          "-=0.2"
        )
        // Subtitle
        .fromTo(".h-sub", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        // Product — dramatic scale entrance from behind
        .fromTo(".h-product",
          { opacity: 0, scale: 0.85, y: 60 },
          { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "power3.out" },
          "-=0.7"
        )
        // Floating badges — pop in around product
        .fromTo(".h-badge",
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: "back.out(1.7)" },
          "-=0.5"
        )
        // CTAs
        .fromTo(".h-ctas", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        // Trust bar
        .fromTo(".h-trust", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.15")
;

      // Continuous badge float
      gsap.to(".h-badge-1", { y: -10, duration: 5, ease: ease.organic, repeat: -1, yoyo: true, delay: 0.5 });
      gsap.to(".h-badge-2", { y: -8, duration: 4.5, ease: ease.organic, repeat: -1, yoyo: true, delay: 1 });
      gsap.to(".h-badge-3", { y: -12, duration: 5.5, ease: ease.organic, repeat: -1, yoyo: true, delay: 0.8 });
      gsap.to(".h-badge-4", { y: -9, duration: 4, ease: ease.organic, repeat: -1, yoyo: true, delay: 1.2 });

      // Product gentle float
      gsap.to(".h-float", { y: -14, duration: 7, ease: ease.organic, repeat: -1, yoyo: true });

      // Halo breathe
      gsap.to(".h-halo", { scale: 1.05, opacity: 0.8, duration: 4, ease: ease.organic, repeat: -1, yoyo: true, delay: 2 });

      // No scroll parallax — keep hero elements in fixed position
    }, heroRef);

    return () => ctx.revert();
  }, [isMobile]);


  const allWords = [...headlinePre.split(" "), "||ACCENT||", ...headlineAccent.split(" ")];

  return (
    <section
      ref={heroRef}
      style={{
        background: "var(--cream)",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        paddingTop: "90px",
      }}
    >
      <style>{`
        .h-glass {
          background: white;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(135,163,141,0.12);
          box-shadow: 0 8px 30px rgba(45,74,62,0.08);
        }
        .h-split {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: center;
          max-width: 1260px;
          margin: 0 auto;
          padding: 40px 48px 0;
        }
        @media (max-width: 900px) {
          .h-split { grid-template-columns: 1fr !important; gap: 16px !important; padding: 24px 20px 0 !important; }
          .h-split-right { order: -1 !important; }
        }
      `}</style>

      {/* Background decorations */}
      <div className="h-halo" style={{
        position: "absolute", top: "40%", right: "-10%",
        width: "600px", height: "600px",
        background: "radial-gradient(ellipse, rgba(168,188,151,0.1) 0%, transparent 65%)",
        borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      {/* ════════ SPLIT LAYOUT ════════ */}
      <div className="h-split">
        {/* ── LEFT: Text ── */}
        <div className="h-text-block" style={{ position: "relative", zIndex: 2 }}>
          {/* Tag */}
          <div className="h-a h-tag" style={{ marginBottom: "20px" }}>
            <span style={{
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--sage)",
              fontFamily: "'Manrope', sans-serif",
              display: "inline-flex", alignItems: "center", gap: "8px",
            }}>
              <ShieldCheck size={12} />
              {tagline}
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: isMobile ? "clamp(2rem, 8vw, 2.8rem)" : "clamp(2.6rem, 4vw, 3.6rem)",
            fontWeight: 900, letterSpacing: "-0.035em",
            lineHeight: 1.08, marginBottom: "20px",
            color: "var(--text-dark)",
          }}>
            {allWords.map((word, i) => {
              if (word === "||ACCENT||") return null;
              const isAccent = i > allWords.indexOf("||ACCENT||");
              return (
                <span key={i} className="h-a h-word" style={{
                  display: "inline-block", marginRight: "0.28em",
                  color: isAccent ? "var(--green-deep)" : "var(--text-dark)",
                }}>
                  {word}
                </span>
              );
            })}
            <svg style={{ display: "block", margin: "-4px 0 0", width: isMobile ? "240px" : "380px", height: "10px" }}
              viewBox="0 0 460 10" fill="none">
              <path className="h-underline" d="M4 7 C100 2, 360 2, 456 7" stroke="var(--sage)"
                strokeWidth="3" strokeLinecap="round" strokeDasharray="500" strokeDashoffset="500" fill="none" />
            </svg>
          </h1>

          {/* Subtitle */}
          <p className="h-a h-sub" style={{
            fontSize: isMobile ? "0.92rem" : "1.02rem",
            color: "var(--text-mid)", lineHeight: 1.7,
            maxWidth: "480px", marginBottom: "28px",
          }}>
            {subtitle}
          </p>

          {/* Key points — pill style */}
          <div className="h-a" style={{
            display: "flex", gap: "8px", flexWrap: "wrap",
            marginBottom: "32px", maxWidth: "480px",
          }}>
            {(keyPoints ?? ["URSSAF conforme", "Multi-sites & domicile", "Personnalisable", "Devis 24h"]).map((label, i) => (
              <div key={label} style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                padding: "6px 14px", borderRadius: "999px",
                fontSize: "0.72rem", fontWeight: 700,
                background: i === 0 ? "rgba(45,74,62,0.06)" : "rgba(135,163,141,0.06)",
                color: i === 0 ? "var(--green-deep)" : "var(--sage-dark)",
                letterSpacing: "0.01em",
                border: i === 0 ? "1.5px solid rgba(45,74,62,0.2)" : "1px solid rgba(135,163,141,0.12)",
              }}>
                {i === 0 ? <ShieldCheck size={12} /> : i === 1 ? <Truck size={12} /> : i === 3 ? <Clock size={12} /> : <Star size={12} />}
                {label}
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="h-a h-ctas" style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#produits" style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              padding: "15px 30px", background: "var(--green-deep)",
              color: "white", borderRadius: "999px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700,
              fontSize: "0.92rem", textDecoration: "none",
              boxShadow: "0 8px 32px rgba(45,74,62,0.25)",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.background = "var(--green-darker)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.background = "var(--green-deep)"; }}
            >
              {ctaPrimary} <ArrowRight size={16} />
            </a>
            <a href="#devis" style={{
              display: "inline-flex", alignItems: "center", gap: "7px",
              padding: "15px 28px", background: "transparent",
              color: "var(--text-mid)", borderRadius: "999px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 600,
              fontSize: "0.85rem", textDecoration: "none",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--green-deep)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-mid)"; }}
            >
              {ctaSecondary} <ArrowRight size={13} />
            </a>
          </div>

          {/* Social proof mini */}
          <div className="h-a h-trust" style={{
            display: "flex", alignItems: "center", gap: "8px",
            marginTop: "32px",
          }}>
            <div style={{ display: "flex", gap: "2px" }}>
              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="#E8A87C" style={{ color: "#E8A87C" }} />)}
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dark)", fontFamily: "'Manrope', sans-serif" }}>+50 entreprises nous font confiance</span>
          </div>
        </div>

        {/* ── RIGHT: 3D Product ── */}
        <div className="h-split-right h-a h-product" style={{ position: "relative", zIndex: 2 }}>
          <div className="h-float">
            <BoxModel3D height={isMobile ? 360 : 520} />
          </div>

          {/* Floating badges around product (desktop only) */}
          {!isMobile && (
            <>
              <div className="h-a h-badge h-badge-1" style={{
                position: "absolute", top: "8%", left: "-20px",
                borderRadius: "14px", padding: "12px 16px",
                display: "flex", alignItems: "center", gap: "10px", zIndex: 3,
                background: "white",
                border: "1.5px solid rgba(45,74,62,0.15)",
                boxShadow: "0 8px 30px rgba(45,74,62,0.12)",
              }}>
                <ShieldCheck size={16} style={{ color: "var(--green-deep)" }} />
                <div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.78rem", color: "var(--green-deep)" }}>Conforme URSSAF</div>
                  <div style={{ fontSize: "0.6rem", color: "var(--text-mid)", fontWeight: 500 }}>100% exonéré</div>
                </div>
              </div>
              <div className="h-a h-badge h-badge-2 h-glass" style={{
                position: "absolute", top: "15%", right: "-10px",
                borderRadius: "14px", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: "8px", zIndex: 3,
              }}>
                <Truck size={14} style={{ color: "var(--sage)" }} />
                <div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "var(--text-dark)" }}>Livraison multi-sites</div>
                  <div style={{ fontSize: "0.58rem", color: "var(--text-light)" }}>Bureau & domicile</div>
                </div>
              </div>
              <div className="h-a h-badge h-badge-3 h-glass" style={{
                position: "absolute", bottom: "18%", right: "0px",
                borderRadius: "14px", padding: "10px 14px",
                display: "flex", alignItems: "center", gap: "8px", zIndex: 3,
              }}>
                <Clock size={14} style={{ color: "var(--sage)" }} />
                <div>
                  <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "var(--text-dark)" }}>Devis en 24h</div>
                  <div style={{ fontSize: "0.58rem", color: "var(--text-light)" }}>Accompagnement dédié</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ════════ BENTO STATS ════════ */}
      <div className="h-a h-trust" style={{
        maxWidth: "1260px", margin: "0 auto",
        padding: isMobile ? "24px 20px 40px" : "0 48px 60px",
        width: "100%",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr 1fr",
          gap: "16px",
        }}>
          {/* Card 1 — Large accent */}
          <div style={{
            background: "var(--pink)",
            borderRadius: "20px",
            padding: isMobile ? "28px 24px" : "36px 32px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden", minHeight: isMobile ? "140px" : "160px",
          }}>
            <div style={{
              position: "absolute", top: "-30px", right: "-30px",
              width: "120px", height: "120px",
              background: "radial-gradient(circle, rgba(168,188,151,0.15) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />
            <HeroCounter value={50} prefix="+" color="var(--green-deep)" mobile={isMobile} />
            <div style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "var(--text-mid)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginTop: "8px",
            }}>
              Entreprises partenaires
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: isMobile ? "28px 24px" : "36px 32px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            border: "1px solid rgba(135,163,141,0.12)",
            boxShadow: "0 4px 20px rgba(45,74,62,0.05)",
            minHeight: isMobile ? "140px" : "160px",
          }}>
            <HeroCounter value={98} suffix="%" color="var(--green-deep)" mobile={isMobile} />
            <div style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "var(--text-mid)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginTop: "8px",
            }}>
              Satisfaction client
            </div>
          </div>

          {/* Card 3 */}
          <div style={{
            background: "var(--green-deep)",
            borderRadius: "20px",
            padding: isMobile ? "28px 24px" : "36px 32px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden",
            minHeight: isMobile ? "140px" : "160px",
          }}>
            <div style={{
              position: "absolute", bottom: "-20px", left: "-20px",
              width: "100px", height: "100px",
              background: "radial-gradient(circle, rgba(240,223,197,0.5) 0%, transparent 70%)",
              borderRadius: "50%",
            }} />
            <HeroCounter value={100} suffix="%" color="white" mobile={isMobile} />
            <div style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "var(--sage-light)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginTop: "8px",
            }}>
              Made in France
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
