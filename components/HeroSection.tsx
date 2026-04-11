"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, Clock, Star, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { gsap, ScrollTrigger, ease, useCounter } from "@/lib/motion";

function HeroCounter({ value, prefix = "", suffix = "", color }: { value: number; prefix?: string; suffix?: string; color: string; mobile?: boolean }) {
  const ref = useCounter(value, { suffix });
  return (
    <div style={{
      fontFamily: "var(--font-manrope)", fontWeight: 900,
      fontSize: "clamp(2rem, 6vw, 3.4rem)",
      color, letterSpacing: "-0.03em", lineHeight: 1,
      wordBreak: "keep-all", whiteSpace: "nowrap",
    }}>
      {prefix}<span ref={ref}>0{suffix}</span>
    </div>
  );
}

const DEFAULT_CAROUSEL_IMAGES = [
  { src: "/uploads/1773414643689-kqpc7g.JPG", alt: "Coffret grossesse O'Méa — soins naturels" },
  { src: "/uploads/1773424302034-6qae7o.JPG", alt: "Produits artisanaux français O'Méa" },
  { src: "/uploads/produits-box-omea.webp", alt: "Box O'Méa — cadeau entreprise premium" },
  { src: "/uploads/1773840094503-gpc2v1.jpeg", alt: "Coffret personnalisé O'Méa" },
];

interface HeroProps {
  tagline?: string;
  headlinePre?: string;
  headlineAccent?: string;
  subtitle?: string;
  ctaPrimary?: string;
  ctaSecondary?: string;
  keyPoints?: string[];
  carouselImages?: { src: string; alt: string }[];
  carouselBadgeUrssaf?: string;
  carouselBadgeProducts?: string;
}

export default function HeroSection({
  tagline = "Solution cadeaux pour RH, CSE & Dirigeants",
  headlinePre = "Le cadeau d'entreprise qui",
  headlineAccent = "renforce votre marque employeur",
  subtitle = "Coffrets naturels et personnalisables pour chaque moment clé : maternité, naissance, fêtes, évènements CSE.",
  ctaPrimary = "Découvrir nos coffrets",
  ctaSecondary = "Demander un devis",
  keyPoints,
  carouselImages,
  carouselBadgeUrssaf = "Conforme URSSAF",
  carouselBadgeProducts = "6–10 produits par coffret",
}: HeroProps) {
  const CAROUSEL_IMAGES = (carouselImages && carouselImages.length > 0) ? carouselImages : DEFAULT_CAROUSEL_IMAGES;
  const heroRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Carousel autoplay
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 4500);
  }, []);

  useEffect(() => {
    startAutoPlay();
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [startAutoPlay]);

  const goTo = (index: number) => {
    setCurrentSlide(index);
    startAutoPlay();
  };

  // ── Cinematic entrance ──
  useEffect(() => {
    if (!heroRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(heroRef.current.querySelectorAll(".h-a"), { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".h-halo",
        { scale: 0.5, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" }
      );

      const tl = gsap.timeline({ defaults: { ease: ease.enter }, delay: 0.1 });

      tl
        .fromTo(".h-tag", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 })
        .fromTo(".h-word",
          { opacity: 0, y: 24, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.06 },
          "-=0.15"
        )
        .fromTo(".h-underline",
          { strokeDashoffset: 500 },
          { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" },
          "-=0.2"
        )
        .fromTo(".h-sub", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .fromTo(".h-product",
          { opacity: 0, scale: 0.92, y: 40 },
          { opacity: 1, scale: 1, y: 0, duration: 1, ease: "power3.out" },
          "-=0.7"
        )
        .fromTo(".h-badge",
          { opacity: 0, scale: 0.7 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.12, ease: "back.out(1.7)" },
          "-=0.5"
        )
        .fromTo(".h-ctas", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4 }, "-=0.3")
        .fromTo(".h-trust", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35 }, "-=0.15");

      // Subtle badge float
      gsap.to(".h-badge-1", { y: -6, duration: 4, ease: ease.organic, repeat: -1, yoyo: true, delay: 0.5 });
      gsap.to(".h-badge-2", { y: -5, duration: 3.5, ease: ease.organic, repeat: -1, yoyo: true, delay: 1 });

      gsap.to(".h-halo", { scale: 1.05, opacity: 0.8, duration: 4, ease: ease.organic, repeat: -1, yoyo: true, delay: 2 });
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
        .h-split {
          display: grid;
          grid-template-columns: 1fr 1.15fr;
          gap: 48px;
          align-items: center;
          max-width: 1340px;
          margin: 0 auto;
          padding: 40px 48px 0;
        }
        .h-carousel {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 4 / 3.2;
          box-shadow: 0 24px 64px rgba(45,74,62,0.12);
        }
        .h-carousel-slide {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .h-carousel-slide--active {
          opacity: 1;
        }
        .h-carousel-slide img {
          transition: transform 6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .h-carousel-slide--active img {
          transform: scale(1.05);
        }
        .h-carousel-nav {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 5;
        }
        .h-carousel-dot {
          width: 28px;
          height: 3px;
          border-radius: 2px;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,0.4);
          transition: all 0.3s ease;
          padding: 0;
        }
        .h-carousel-dot--active {
          background: white;
          width: 40px;
        }
        .h-carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--green-deep);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          opacity: 0;
        }
        .h-carousel:hover .h-carousel-arrow {
          opacity: 1;
        }
        .h-carousel-arrow:hover {
          background: var(--cream);
          transform: translateY(-50%) scale(1.08);
        }
        @media (max-width: 900px) {
          .h-split { grid-template-columns: 1fr !important; gap: 20px !important; padding: 24px 20px 0 !important; }
          .h-split-right { order: -1 !important; }
          .h-carousel { aspect-ratio: 16 / 10; }
          .h-carousel-arrow { opacity: 1; width: 32px; height: 32px; }
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
              fontFamily: "var(--font-manrope)",
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
              fontFamily: "var(--font-manrope)", fontWeight: 700,
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
              fontFamily: "var(--font-manrope)", fontWeight: 600,
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
              {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="var(--accent-gold)" style={{ color: "var(--accent-gold)" }} />)}
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-dark)", fontFamily: "var(--font-manrope)" }}>+1500 coffrets vendus</span>
          </div>
        </div>

        {/* ── RIGHT: Photo Carousel ── */}
        <div className="h-split-right h-a h-product" style={{ position: "relative", zIndex: 2 }}>
          {/* Decorative blob behind carousel */}
          {!isMobile && (
            <div style={{
              position: "absolute", top: "-20px", right: "-20px",
              width: "90%", height: "90%",
              background: "var(--pink)",
              borderRadius: "28px",
              transform: "rotate(3deg)",
              zIndex: -1,
              opacity: 0.5,
            }} />
          )}
          <div className="h-carousel">
            {CAROUSEL_IMAGES.map((img, i) => (
              <div
                key={i}
                className={`h-carousel-slide ${i === currentSlide ? "h-carousel-slide--active" : ""}`}
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  priority={i === 0}
                />
              </div>
            ))}

            {/* Gradient overlay */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.2) 100%)",
              zIndex: 2, pointerEvents: "none",
            }} />

            {/* Arrows */}
            <button
              className="h-carousel-arrow"
              style={{ left: "12px" }}
              onClick={() => goTo((currentSlide - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length)}
              aria-label="Image précédente"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="h-carousel-arrow"
              style={{ right: "12px" }}
              onClick={() => goTo((currentSlide + 1) % CAROUSEL_IMAGES.length)}
              aria-label="Image suivante"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="h-carousel-nav">
              {CAROUSEL_IMAGES.map((_, i) => (
                <button
                  key={i}
                  className={`h-carousel-dot ${i === currentSlide ? "h-carousel-dot--active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Badge URSSAF — inside carousel, bottom-left */}
            <div className="h-a h-badge h-badge-1" style={{
              position: "absolute", bottom: "48px", left: "16px", zIndex: 5,
              borderRadius: "12px", padding: "8px 14px",
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(243,240,232,0.92)", backdropFilter: "blur(10px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}>
              <ShieldCheck size={13} style={{ color: "var(--green-deep)" }} />
              <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "0.7rem", color: "var(--green-deep)" }}>
                {carouselBadgeUrssaf}
              </span>
            </div>

            {/* Badge produits — inside carousel, top-right */}
            <div className="h-a h-badge h-badge-2" style={{
              position: "absolute", top: "16px", right: "16px", zIndex: 5,
              borderRadius: "12px", padding: "8px 14px",
              display: "flex", alignItems: "center", gap: "8px",
              background: "rgba(243,240,232,0.92)", backdropFilter: "blur(10px)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            }}>
              <Package size={13} style={{ color: "var(--green-deep)" }} />
              <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "0.7rem", color: "var(--green-deep)" }}>
                {carouselBadgeProducts}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ════════ BENTO STATS ════════ */}
      <style>{`
        .h-bento {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0 48px 60px;
          width: 100%;
        }
        .h-bento-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .h-bento { padding: 24px 20px 40px; }
          .h-bento-grid { grid-template-columns: 1fr; gap: 12px; }
        }
      `}</style>
      <div className="h-a h-trust h-bento">
        <div className="h-bento-grid">
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
            <HeroCounter value={1500} prefix="+" color="var(--green-deep)" mobile={isMobile} />
            <div style={{
              fontSize: "0.78rem", fontWeight: 600,
              color: "var(--text-mid)", letterSpacing: "0.12em",
              textTransform: "uppercase", marginTop: "8px",
            }}>
              Coffrets vendus
            </div>
          </div>

          {/* Card 2 */}
          <div style={{
            background: "var(--cream)",
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
