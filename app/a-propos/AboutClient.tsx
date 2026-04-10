"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { gsap, ScrollTrigger, ease, useCounter } from "@/lib/motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { AboutPageContent, FooterContent } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════
   ANIMATED COUNTER (for chiffres section)
   ═══════════════════════════════════════════════════════════ */
function BigCounter({ value, prefix = "", suffix = "", label }: { value: number; prefix?: string; suffix?: string; label: string }) {
  const ref = useCounter(value, { suffix });
  return (
    <div className="chiffre-item">
      <div className="chiffre-value">
        {prefix}<span ref={ref}>0{suffix}</span>
      </div>
      <div className="chiffre-label">{label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function AboutClient({ data, footer }: { data: AboutPageContent; footer?: FooterContent }) {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 900;

    gsap.registerPlugin(ScrollTrigger);

    // On mobile or reduced motion: show everything, skip fancy animations
    if (reduced || mobile) {
      gsap.set(".ap-anim", { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)", clipPath: "none" });
      gsap.set(".hero-word", { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(".hero-line-mask", { clipPath: "inset(0 0 0 0)" });
      return;
    }

    const ctx = gsap.context(() => {

      /* ══════════════════════════════════════════════════════
         1. HERO — Split asymmetric with layered reveals
         ══════════════════════════════════════════════════════ */
      // Left side — staggered entrance
      gsap.fromTo(".hero-tag", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: ease.enter, delay: 0.2 });
      gsap.fromTo(".hero-title-line",
        { opacity: 0, y: 40, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.12, ease: "power3.out", delay: 0.35 }
      );
      gsap.fromTo(".hero-sub",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: ease.enter, delay: 0.8 }
      );
      gsap.fromTo(".hero-cta-row",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: ease.enter, delay: 1 }
      );
      gsap.fromTo(".hero-stat-item",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: ease.enter, delay: 1.2 }
      );
      // Right side — images + badges
      gsap.fromTo(".hero-img-main",
        { opacity: 0, scale: 0.92, borderRadius: "48px" },
        { opacity: 1, scale: 1, borderRadius: "24px", duration: 1, ease: "power3.out", delay: 0.3 }
      );
      gsap.fromTo(".hero-img-secondary",
        { opacity: 0, x: -40, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.7, ease: "back.out(1.4)", delay: 0.9 }
      );
      gsap.fromTo(".hero-float-badge",
        { opacity: 0, y: 20, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: "back.out(1.7)", delay: 1.1 }
      );
      // Blobs scale in
      gsap.fromTo(".hero-blob",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, stagger: 0.2, ease: "power2.out", delay: 0.1 }
      );
      // Parallax on scroll
      gsap.to(".hero-img-main", {
        y: -30, scrollTrigger: { trigger: ".ap-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      });
      gsap.to(".hero-img-secondary", {
        y: -50, scrollTrigger: { trigger: ".ap-hero", start: "top top", end: "bottom top", scrub: 1.5 },
      });

      /* ══════════════════════════════════════════════════════
         2. ORIGIN — Cinematic split reveal
         ══════════════════════════════════════════════════════ */
      gsap.fromTo(".origin-img-wrap",
        { clipPath: "inset(0 100% 0 0)", scale: 1.15 },
        {
          clipPath: "inset(0 0% 0 0)", scale: 1, duration: 1.2, ease: "power3.inOut",
          scrollTrigger: { trigger: ".ap-origin", start: "top 70%", toggleActions: "play none none none" },
        }
      );
      gsap.fromTo(".origin-text-line",
        { opacity: 0, x: -40 },
        {
          opacity: 1, x: 0, duration: 0.7, stagger: 0.12, ease: ease.enter,
          scrollTrigger: { trigger: ".ap-origin", start: "top 65%", toggleActions: "play none none none" },
        }
      );
      gsap.fromTo(".origin-quote",
        { opacity: 0, scale: 0.95, filter: "blur(4px)" },
        {
          opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.8, ease: ease.enter,
          scrollTrigger: { trigger: ".origin-quote", start: "top 80%", toggleActions: "play none none none" },
        }
      );

      /* ══════════════════════════════════════════════════════
         3. HORIZONTAL SCROLL — Values carousel
         ══════════════════════════════════════════════════════ */
      const hsTrack = document.querySelector(".hs-track") as HTMLElement;
      if (hsTrack) {
        const totalScroll = hsTrack.scrollWidth - window.innerWidth;
        gsap.to(hsTrack, {
          x: -totalScroll,
          ease: "none",
          scrollTrigger: {
            trigger: ".ap-horizontal",
            start: "top top",
            end: () => `+=${totalScroll}`,
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });
        // Each card image parallax
        document.querySelectorAll(".hs-card-img").forEach((img) => {
          gsap.fromTo(img,
            { scale: 1.2 },
            { scale: 1, scrollTrigger: { trigger: img.closest(".hs-card"), start: "left right", end: "right left", scrub: true, containerAnimation: gsap.getById?.("hsAnim") } }
          );
        });
      }

      /* ══════════════════════════════════════════════════════
         4. CHIFFRES — Numbers slam in
         ══════════════════════════════════════════════════════ */
      gsap.fromTo(".chiffres-title",
        { opacity: 0, y: 40, filter: "blur(6px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: ease.enter, scrollTrigger: { trigger: ".ap-chiffres", start: "top 75%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".chiffre-item",
        { opacity: 0, y: 50, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)", scrollTrigger: { trigger: ".chiffres-row", start: "top 80%", toggleActions: "play none none none" } }
      );

      /* ══════════════════════════════════════════════════════
         5. BENEFITS — Alternating cinematic blocks
         ══════════════════════════════════════════════════════ */
      gsap.fromTo(".ben-header",
        { opacity: 0, y: 30, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: ease.enter, scrollTrigger: { trigger: ".ben-header", start: "top 80%", toggleActions: "play none none none" } }
      );
      document.querySelectorAll(".ben-row").forEach((row) => {
        const img = row.querySelector(".ben-row-img");
        const text = row.querySelector(".ben-row-text");
        const isReversed = row.classList.contains("ben-row--reversed");
        if (img) {
          gsap.fromTo(img,
            { opacity: 0, x: isReversed ? 60 : -60, scale: 0.95 },
            { opacity: 1, x: 0, scale: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: row, start: "top 75%", toggleActions: "play none none none" } }
          );
        }
        if (text) {
          gsap.fromTo(text,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: ease.enter, scrollTrigger: { trigger: row, start: "top 75%", toggleActions: "play none none none" } }
          );
        }
      });

      /* ══════════════════════════════════════════════════════
         6. CTA — Cinematic card reveal
         ══════════════════════════════════════════════════════ */
      // Card slides up with scale
      gsap.fromTo(".cta-card",
        { opacity: 0, y: 60, scale: 0.94, borderRadius: "48px" },
        { opacity: 1, y: 0, scale: 1, borderRadius: "28px", duration: 1, ease: "power3.out",
          scrollTrigger: { trigger: ".cta-card", start: "top 80%", toggleActions: "play none none none" } }
      );
      // Testimonial text lines stagger
      gsap.fromTo(".cta-quote-line",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: ease.enter,
          scrollTrigger: { trigger: ".cta-card", start: "top 70%", toggleActions: "play none none none" } }
      );
      // Metrics slam in from right
      gsap.fromTo(".cta-metric",
        { opacity: 0, x: 40, scale: 0.9 },
        { opacity: 1, x: 0, scale: 1, duration: 0.5, stagger: 0.12, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ".cta-card", start: "top 65%", toggleActions: "play none none none" } }
      );
      // Stars pop
      gsap.fromTo(".cta-star",
        { opacity: 0, scale: 0, rotation: -45 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.3, stagger: 0.06, ease: "back.out(2)",
          scrollTrigger: { trigger: ".cta-card", start: "top 70%", toggleActions: "play none none none" } }
      );
      // Avatar slide
      gsap.fromTo(".cta-avatar",
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, delay: 0.4, ease: ease.enter,
          scrollTrigger: { trigger: ".cta-card", start: "top 70%", toggleActions: "play none none none" } }
      );
      // Trust pills stagger
      gsap.fromTo(".cta-pill",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: ease.enter,
          scrollTrigger: { trigger: ".cta-card", start: "top 60%", toggleActions: "play none none none" } }
      );

    }, mainRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <Navbar />
      <div ref={mainRef}>
        <style>{`
          /* ── HERO — Split asymmetric ── */
          .ap-hero {
            position: relative;
            min-height: 100vh;
            overflow: hidden;
            background: var(--cream);
          }
          .hero-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            min-height: 100vh;
            max-width: 1400px;
            margin: 0 auto;
            align-items: center;
            gap: 40px;
            padding: 140px 48px 80px;
          }
          .hero-left {
            position: relative;
            z-index: 2;
          }
          .hero-tag {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-bottom: 24px;
          }
          .hero-title-line {
            display: block;
            font-family: var(--font-manrope);
            font-weight: 900;
            font-size: clamp(2.2rem, 4.5vw, 3.4rem);
            color: var(--text-dark);
            letter-spacing: -0.04em;
            line-height: 1.06;
          }
          .hero-title-line--accent {
            color: var(--green-deep);
            position: relative;
            display: inline-block;
          }
          .hero-title-line--italic {
            font-style: italic;
          }
          .hero-sub {
            margin-top: 24px;
            font-size: 1.05rem;
            color: var(--text-mid);
            line-height: 1.8;
            max-width: 460px;
          }
          .hero-cta-row {
            display: flex;
            gap: 14px;
            flex-wrap: wrap;
            margin-top: 36px;
          }
          .hero-stats-row {
            display: flex;
            gap: 32px;
            margin-top: 40px;
            padding-top: 32px;
            border-top: 1px solid rgba(135,163,141,0.15);
          }
          .hero-stat-val {
            font-family: var(--font-manrope);
            font-weight: 900;
            font-size: 1.6rem;
            color: var(--green-deep);
            letter-spacing: -0.03em;
            line-height: 1;
          }
          .hero-stat-label {
            font-size: 0.65rem;
            color: var(--text-light);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            margin-top: 6px;
          }
          /* Right visual */
          .hero-right {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 520px;
          }
          .hero-img-main {
            position: relative;
            width: 100%;
            max-width: 480px;
            height: 540px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 32px 80px rgba(45,74,62,0.18);
          }
          .hero-img-secondary {
            position: absolute;
            bottom: -24px;
            left: -48px;
            width: 200px;
            height: 260px;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 56px rgba(45,74,62,0.2);
            border: 4px solid var(--cream);
            z-index: 3;
          }
          .hero-float-badge {
            position: absolute;
            z-index: 4;
            border-radius: 16px;
            padding: 14px 18px;
            box-shadow: 0 12px 40px rgba(45,74,62,0.18);
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .hero-blob {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            z-index: 0;
          }
          @media (max-width: 900px) {
            .hero-grid { grid-template-columns: 1fr !important; padding: 120px 24px 60px; text-align: center; gap: 40px; }
            .hero-right { min-height: 360px; }
            .hero-img-main { max-width: 340px; height: 380px; margin: 0 auto; }
            .hero-img-secondary { display: none; }
            .hero-float-badge { display: none; }
            .hero-sub { margin: 18px auto 0; }
            .hero-cta-row { justify-content: center; }
            .hero-stats-row { justify-content: center; }
          }

          /* ── ORIGIN ── */
          .ap-origin {
            padding: 120px 0;
            background: var(--cream);
            position: relative;
            overflow: hidden;
          }
          .origin-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 72px;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 32px;
          }
          .origin-img-wrap {
            position: relative;
            height: 520px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 32px 80px rgba(45,74,62,0.15);
          }
          .origin-quote {
            margin-top: 40px;
            padding: 28px 32px;
            border-left: 3px solid var(--sage);
            background: rgba(135,163,141,0.06);
            border-radius: 0 16px 16px 0;
          }

          /* ── HORIZONTAL SCROLL ── */
          .ap-horizontal {
            overflow: hidden;
            background: var(--cream-dark);
          }
          .hs-track {
            display: flex;
            width: fit-content;
            padding: 0 0 0 5vw;
          }
          .hs-card {
            flex-shrink: 0;
            width: 80vw;
            max-width: 1000px;
            height: 100vh;
            display: flex;
            align-items: center;
            padding: 0 6vw 0 0;
          }
          .hs-card-inner {
            display: grid;
            grid-template-columns: 45% 1fr;
            gap: 48px;
            align-items: center;
            width: 100%;
          }
          .hs-card-img-wrap {
            height: 380px;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
            box-shadow: 0 20px 60px rgba(45,74,62,0.12);
          }
          .hs-num {
            font-family: var(--font-manrope);
            font-weight: 900;
            font-size: 7rem;
            line-height: 1;
            letter-spacing: -0.06em;
            -webkit-text-stroke: 1.5px;
            -webkit-text-fill-color: transparent;
            opacity: 0.1;
            position: absolute;
            top: -16px;
            right: 0;
          }

          /* ── CHIFFRES ── */
          .ap-chiffres {
            padding: 100px 0;
            background: var(--green-deep);
            position: relative;
            overflow: hidden;
          }
          .chiffre-item {
            text-align: center;
            flex: 1;
            min-width: 120px;
          }
          .chiffres-row {
            display: flex;
            justify-content: center;
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 32px;
            flex-wrap: wrap;
            gap: 48px;
          }
          .chiffre-value {
            font-family: var(--font-manrope);
            font-weight: 900;
            font-size: clamp(2.4rem, 5vw, 4rem);
            color: var(--sage-light);
            letter-spacing: -0.04em;
            line-height: 1;
          }
          .chiffre-label {
            font-size: 0.72rem;
            color: rgba(255,255,255,0.45);
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-top: 10px;
          }

          /* ── BENEFITS ALTERNATING ── */
          .ap-benefits {
            position: relative;
            background: var(--cream);
            padding: 100px 0 60px;
            overflow: hidden;
          }
          .ben-row {
            display: grid;
            grid-template-columns: 55% 1fr;
            gap: 56px;
            align-items: center;
            max-width: 1200px;
            margin: 0 auto 80px;
            padding: 0 32px;
          }
          .ben-row--reversed {
            grid-template-columns: 1fr 55%;
          }
          .ben-row--reversed .ben-row-img {
            order: 2;
          }
          .ben-row--reversed .ben-row-text {
            order: 1;
          }
          .ben-row-img {
            position: relative;
            height: 400px;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 24px 64px rgba(45,74,62,0.14);
          }
          .ben-row-img::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%);
            z-index: 1;
          }
          .ben-metric-badge {
            position: absolute;
            bottom: 24px;
            right: 24px;
            z-index: 2;
            background: var(--green-deep);
            border-radius: 16px;
            padding: 16px 24px;
            box-shadow: 0 12px 36px rgba(0,0,0,0.25);
          }
          .ben-row--reversed .ben-metric-badge {
            right: auto;
            left: 24px;
          }

          /* ── CTA ── */
          @media (max-width: 900px) {
            .cta-card-grid { grid-template-columns: 1fr !important; }
          }

          /* ── RESPONSIVE ── */
          @media (max-width: 900px) {
            .hero-word { font-size: clamp(2rem, 8vw, 3rem); }
            .origin-layout { grid-template-columns: 1fr !important; gap: 40px; }
            .origin-img-wrap { height: 320px; }
            .ap-horizontal { display: none; }
            .ap-values-mobile { display: block !important; }
            .ben-row { grid-template-columns: 1fr !important; gap: 28px; margin-bottom: 56px; }
            .ben-row--reversed .ben-row-img { order: 0; }
            .ben-row--reversed .ben-row-text { order: 0; }
            .ben-row-img { height: 280px; }
            .chiffres-row { gap: 24px; }
            .chiffre-value { font-size: 2rem; }
          }
        `}</style>

        <main>
          {/* ╔══════════════════════════════════════════════════════════╗
              ║  1. HERO — Full-screen cinematic                        ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-hero">
            {/* Decorative blobs */}
            <div className="hero-blob" style={{ width: "500px", height: "500px", top: "-120px", right: "-100px", background: "radial-gradient(ellipse, rgba(242,216,220,0.5) 0%, transparent 70%)", position: "absolute" }} />
            <div className="hero-blob" style={{ width: "350px", height: "350px", bottom: "-60px", left: "-80px", background: "radial-gradient(ellipse, rgba(135,163,141,0.12) 0%, transparent 70%)", position: "absolute" }} />
            <Image src="/SYMBOLE_RVB-03.png" alt="" width={300} height={300} aria-hidden="true" style={{ position: "absolute", bottom: "-5%", right: "42%", opacity: 0.04, pointerEvents: "none" }} />

            <div className="hero-grid">
              {/* ── LEFT: Copy ── */}
              <div className="hero-left">
                <div className="hero-tag">
                  <span className="tag-pill">{data.hero.tag || "Notre histoire"}</span>
                </div>

                <h1>
                  <span className="hero-title-line">{data.hero.titleLine1}</span>
                  <span className="hero-title-line">
                    <span className="hero-title-line--accent hero-title-line--italic">{data.hero.titleLine2}</span>
                  </span>
                  <span className="hero-title-line">{data.hero.titleLine3}</span>
                </h1>

                <p className="hero-sub">
                  {data.hero.subtitleLines.join(" ")}
                </p>

                <div className="hero-cta-row">
                  <a href={data.hero.ctaPrimaryHref} style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    padding: "15px 30px", background: "var(--green-deep)", color: "white",
                    borderRadius: "999px", fontFamily: "var(--font-manrope)",
                    fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                    boxShadow: "0 8px 32px rgba(45,74,62,0.25)",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 14px 44px rgba(45,74,62,0.3)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(45,74,62,0.25)"; }}
                  >
                    {data.hero.ctaPrimary} <ArrowRight size={15} />
                  </a>
                  <a href={data.hero.ctaSecondaryHref} style={{
                    display: "inline-flex", alignItems: "center", gap: "9px",
                    padding: "15px 30px", background: "transparent", color: "var(--text-dark)",
                    borderRadius: "999px", fontFamily: "var(--font-manrope)",
                    fontWeight: 700, fontSize: "0.9rem", textDecoration: "none",
                    border: "2px solid rgba(135,163,141,0.2)",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green-deep)"; e.currentTarget.style.color = "var(--green-deep)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.2)"; e.currentTarget.style.color = "var(--text-dark)"; }}
                  >
                    {data.hero.ctaSecondary}
                  </a>
                </div>

                {/* Mini stats */}
                <div className="hero-stats-row">
                  {(data.hero.stats ?? [
                    { value: "+50", label: "Entreprises" },
                    { value: "98%", label: "Satisfaction" },
                    { value: "24h", label: "Délai devis" },
                  ]).map((s) => (
                    <div key={s.label} className="hero-stat-item">
                      <div className="hero-stat-val">{s.value}</div>
                      <div className="hero-stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Visual composition ── */}
              <div className="hero-right">
                {/* Main image */}
                <div className="hero-img-main">
                  <Image
                    src={data.hero.image}
                    alt="Coffret O'Méa offert en entreprise"
                    fill
                    style={{ objectFit: "cover", objectPosition: "center 30%" }}
                    priority
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.2) 100%)" }} />
                </div>

                {/* Secondary image — overlapping bottom-left */}
                {(data.hero.secondaryImage) && (
                  <div className="hero-img-secondary">
                    <Image
                      src={data.hero.secondaryImage}
                      alt="Produits dans un coffret O'Méa"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}

                {/* Dynamic badges */}
                {(data.hero.badges ?? []).map((badge, i) => {
                  const isDark = badge.style === "dark";
                  const posStyle = badge.position === "top-right"
                    ? { top: "20px", right: "-16px" }
                    : { bottom: "40px", right: "-24px" };
                  return (
                    <div key={i} className="hero-float-badge" style={{
                      ...posStyle,
                      background: isDark ? "var(--green-deep)" : "white",
                      ...(isDark ? {} : { border: "1px solid rgba(135,163,141,0.1)" }),
                    }}>
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "10px",
                        background: isDark ? "rgba(255,255,255,0.12)" : "rgba(135,163,141,0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <CheckCircle2 size={16} style={{ color: isDark ? "var(--sage-light)" : "var(--green-deep)" }} />
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.78rem", color: isDark ? "white" : "var(--text-dark)" }}>{badge.title}</div>
                        <div style={{ fontSize: "0.62rem", color: isDark ? "rgba(255,255,255,0.5)" : "var(--text-light)" }}>{badge.subtitle}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ╔══════════════════════════════════════════════════════════╗
              ║  2. ORIGIN — Split cinematic reveal                     ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-origin">
            <Image src="/SYMBOLE_RVB-03.png" alt="" width={300} height={300} aria-hidden="true" style={{ position: "absolute", top: "50%", right: "-4%", transform: "translateY(-50%)", opacity: 0.04, pointerEvents: "none" }} />

            <div className="origin-layout">
              {/* Left — Image with curtain reveal */}
              <div className="origin-img-wrap">
                <Image src={data.origin.image} alt="Collaboratrice avec un coffret O'Méa" fill style={{ objectFit: "cover" }} />
                {/* Overlay badge */}
                <div style={{
                  position: "absolute", bottom: "24px", left: "24px", zIndex: 2,
                  background: "rgba(255,255,255,0.95)", backdropFilter: "blur(10px)",
                  borderRadius: "14px", padding: "14px 20px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}>
                  <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "0.85rem", color: "var(--text-dark)" }}>{data.origin.badgeTitle}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-light)", marginTop: "2px" }}>{data.origin.badgeSubtitle}</div>
                </div>
              </div>

              {/* Right — Text */}
              <div>
                <div className="origin-text-line" style={{ marginBottom: "16px" }}>
                  <span className="tag-pill">{data.origin.tag}</span>
                </div>
                <h2 className="origin-text-line" style={{
                  fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                  fontWeight: 900, color: "var(--text-dark)",
                  letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "28px",
                }}>
                  {data.origin.title}<br />
                  <span style={{ color: "var(--green-deep)" }}>{data.origin.titleAccent}</span>
                </h2>
                {data.origin.paragraphs.map((p, i) => (
                  <p key={i} className="origin-text-line" style={{ fontSize: "1rem", color: "var(--text-mid)", lineHeight: 1.8, marginBottom: i < data.origin.paragraphs.length - 1 ? "16px" : undefined }}>
                    {p}
                  </p>
                ))}

                {/* Quote */}
                <div className="origin-quote">
                  <p style={{ fontSize: "0.95rem", color: "var(--text-dark)", lineHeight: 1.7, fontStyle: "italic" }}>
                    &laquo; {data.origin.quote} &raquo;
                  </p>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-light)", marginTop: "10px", fontWeight: 600 }}>
                    {data.origin.quoteAuthor}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ╔══════════════════════════════════════════════════════════╗
              ║  3. HORIZONTAL SCROLL — Values (desktop only)           ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-horizontal">
            <div className="hs-track">
              {/* Intro card */}
              <div className="hs-card" style={{ maxWidth: "600px" }}>
                <div>
                  <span className="tag-pill" style={{ marginBottom: "16px", display: "inline-block" }}>{data.values.tag}</span>
                  <h2 style={{
                    fontSize: "clamp(2rem, 4vw, 3.2rem)",
                    fontWeight: 900, color: "var(--text-dark)",
                    letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: "20px",
                  }}>
                    {data.values.title.split("\n").map((line, i) => (
                      <span key={i}>{line}{i === 0 && <br />}</span>
                    ))}
                  </h2>
                  <p style={{ fontSize: "1rem", color: "var(--text-mid)", lineHeight: 1.8, maxWidth: "400px" }}>
                    {data.values.subtitle}
                  </p>
                  <div style={{ marginTop: "32px", display: "flex", alignItems: "center", gap: "8px", color: "var(--sage)" }}>
                    <div style={{ width: "40px", height: "2px", background: "var(--sage)" }} />
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Scroll</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Value cards */}
              {data.values.items.map((v) => (
                <div key={v.num} className="hs-card">
                  <div className="hs-card-inner">
                    {/* Image side */}
                    <div className="hs-card-img-wrap">
                      <Image src={v.image} alt={v.title} fill className="hs-card-img" style={{ objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.35) 100%)" }} />
                    </div>

                    {/* Text side */}
                    <div style={{ position: "relative" }}>
                      <div className="hs-num" style={{ WebkitTextStrokeColor: v.accent }}>{v.num}</div>
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <div style={{
                          width: "40px", height: "3px", background: v.accent,
                          borderRadius: "2px", marginBottom: "24px",
                        }} />
                        <h3 style={{
                          fontFamily: "var(--font-manrope)", fontWeight: 900,
                          fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                          color: "var(--text-dark)", letterSpacing: "-0.03em",
                          lineHeight: 1.1, marginBottom: "20px",
                          whiteSpace: "pre-line",
                        }}>
                          {v.title}
                        </h3>
                        <p style={{ fontSize: "0.95rem", color: "var(--text-mid)", lineHeight: 1.8, maxWidth: "360px" }}>
                          {v.text}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile fallback for values */}
          <section className="ap-values-mobile" style={{ display: "none", padding: "80px 0", background: "var(--cream-dark)" }}>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "0 24px" }}>
              <span className="tag-pill" style={{ marginBottom: "16px", display: "inline-block" }}>{data.values.tag}</span>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "var(--text-dark)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "40px" }}>
                {data.values.title}
              </h2>
              {data.values.items.map((v) => (
                <div key={v.num} style={{ marginBottom: "48px" }}>
                  <div style={{ position: "relative", height: "240px", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
                    <Image src={v.image} alt={v.title} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "0.75rem", color: v.accent, letterSpacing: "0.06em" }}>{v.num}</span>
                    <div style={{ width: "24px", height: "2px", background: v.accent }} />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "1.3rem", color: "var(--text-dark)", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: "10px", whiteSpace: "pre-line" }}>{v.title}</h3>
                  <p style={{ fontSize: "0.9rem", color: "var(--text-mid)", lineHeight: 1.7 }}>{v.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ╔══════════════════════════════════════════════════════════╗
              ║  4. CHIFFRES — Dark band with animated counters         ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-chiffres">
            <Image src="/SYMBOLE_RVB-03.png" alt="" width={250} height={250} aria-hidden="true" style={{ position: "absolute", top: "50%", left: "-3%", transform: "translateY(-50%)", opacity: 0.06, pointerEvents: "none" }} />
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 32px", textAlign: "center", position: "relative", zIndex: 1 }}>
              <h2 className="chiffres-title" style={{
                fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                fontWeight: 800, color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.06em", textTransform: "uppercase",
                marginBottom: "48px",
              }}>
                {data.chiffres.title}
              </h2>
              <div className="chiffres-row">
                {data.chiffres.items.map((item, i) => {
                  const numericValue = parseInt(item.value, 10);
                  const isNumeric = !isNaN(numericValue) && String(numericValue) === item.value;
                  if (isNumeric) {
                    return (
                      <BigCounter
                        key={i}
                        value={numericValue}
                        prefix={item.prefix}
                        suffix={item.suffix}
                        label={item.label}
                      />
                    );
                  }
                  // Non-numeric (e.g. "24h") — render as static text
                  return (
                    <div key={i} className="chiffre-item">
                      <div className="chiffre-value">{item.prefix}{item.value}{item.suffix}</div>
                      <div className="chiffre-label">{item.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* ╔══════════════════════════════════════════════════════════╗
              ║  5. BENEFITS — Alternating cinematic blocks              ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-benefits">
            {/* Section header */}
            <div className="ben-header" style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 64px", padding: "0 32px" }}>
              <span className="tag-pill" style={{ display: "inline-block", marginBottom: "16px" }}>{data.benefits.tag}</span>
              <h2 style={{
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 900, color: "var(--text-dark)",
                letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: "16px",
              }}>
                {data.benefits.title}
              </h2>
              <p style={{ fontSize: "0.95rem", color: "var(--text-mid)", lineHeight: 1.7 }}>
                {data.benefits.subtitle}
              </p>
            </div>

            {/* Alternating rows */}
            {data.benefits.items.map((b, i) => (
              <div key={b.title} className={`ben-row ${i % 2 !== 0 ? "ben-row--reversed" : ""}`}>
                {/* Image */}
                <div className="ben-row-img">
                  <Image src={b.image} alt={b.title} fill style={{ objectFit: "cover" }} />
                  <div className="ben-metric-badge">
                    <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "1.5rem", color: "var(--sage-light)", letterSpacing: "-0.03em", lineHeight: 1 }}>
                      {b.metric}
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>
                      {b.metricLabel}
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="ben-row-text">
                  <div style={{
                    display: "inline-flex", alignItems: "baseline", gap: "10px",
                    marginBottom: "16px",
                    padding: "8px 16px", borderRadius: "10px",
                    background: "rgba(45,74,62,0.04)", border: "1px solid rgba(135,163,141,0.1)",
                  }}>
                    <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "1.4rem", color: "var(--green-deep)", letterSpacing: "-0.02em" }}>
                      {b.metric}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-light)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {b.metricLabel}
                    </span>
                  </div>
                  <h3 style={{
                    fontFamily: "var(--font-manrope)", fontWeight: 800,
                    fontSize: "clamp(1.2rem, 2vw, 1.5rem)", color: "var(--text-dark)",
                    marginBottom: "14px", lineHeight: 1.2,
                  }}>
                    {b.title}
                  </h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text-mid)", lineHeight: 1.8, maxWidth: "440px" }}>
                    {b.text}
                  </p>
                </div>
              </div>
            ))}
          </section>

          {/* ╔══════════════════════════════════════════════════════════╗
              ║  6. CTA — Full-screen dramatic close                    ║
              ╚══════════════════════════════════════════════════════════╝ */}
          <section className="ap-cta-final" style={{ background: "var(--pink)", position: "relative", overflow: "hidden" }}>
            {/* Decorative */}
            <Image src="/SYMBOLE_RVB-03.png" alt="" width={350} height={350} aria-hidden="true" style={{ position: "absolute", top: "-10%", right: "-5%", opacity: 0.06, pointerEvents: "none", transform: "rotate(15deg)" }} />
            <div style={{ position: "absolute", bottom: "-80px", left: "-60px", width: "350px", height: "350px", background: "radial-gradient(ellipse, rgba(45,74,62,0.06) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "100px 32px", position: "relative", zIndex: 1 }}>
              {/* Top: Big headline centered */}
              <div className="cta-testimonial" style={{ textAlign: "center", marginBottom: "56px" }}>
                <h2 style={{
                  fontFamily: "var(--font-manrope)", fontWeight: 900,
                  fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
                  color: "var(--green-deep)", letterSpacing: "-0.04em", lineHeight: 1.05,
                  marginBottom: "18px",
                }}>
                  {data.cta.title}
                </h2>
                <p style={{ fontSize: "1rem", color: "var(--text-mid)", lineHeight: 1.7, maxWidth: "520px", margin: "0 auto 36px" }}>
                  {data.cta.subtitle}
                </p>

                {/* CTAs */}
                <div className="cta-right" style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href={data.cta.ctaPrimaryHref} style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    padding: "16px 36px", background: "var(--green-deep)", color: "white",
                    borderRadius: "999px", fontFamily: "var(--font-manrope)",
                    fontWeight: 700, fontSize: "0.92rem", textDecoration: "none",
                    boxShadow: "0 10px 44px rgba(45,74,62,0.3)",
                    transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 16px 56px rgba(45,74,62,0.4)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 44px rgba(45,74,62,0.3)"; }}
                  >
                    {data.cta.ctaPrimary} <ArrowRight size={16} />
                  </a>
                  <a href={data.cta.ctaSecondaryHref} style={{
                    display: "inline-flex", alignItems: "center", gap: "10px",
                    padding: "16px 36px", background: "white", color: "var(--green-deep)",
                    borderRadius: "999px", fontFamily: "var(--font-manrope)",
                    fontWeight: 700, fontSize: "0.92rem", textDecoration: "none",
                    border: "1.5px solid rgba(45,74,62,0.1)",
                    transition: "all 0.3s ease",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(45,74,62,0.1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {data.cta.ctaSecondary}
                  </a>
                </div>
              </div>

              {/* Bottom: Testimonial + metrics card */}
              <style>{`
                .cta-card {
                  position: relative;
                  overflow: hidden;
                  border-radius: 28px;
                  background: var(--green-deep);
                  box-shadow: 0 32px 80px rgba(45,74,62,0.25);
                }
                .cta-card-inner {
                  display: grid;
                  grid-template-columns: 1.3fr 1fr;
                  min-height: 380px;
                }
                .cta-card-left {
                  padding: 48px 44px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  position: relative;
                  z-index: 1;
                }
                .cta-card-right {
                  background: var(--pink);
                  padding: 40px 36px;
                  display: flex;
                  flex-direction: column;
                  justify-content: center;
                  gap: 16px;
                  position: relative;
                  overflow: hidden;
                }
                .cta-metric {
                  display: flex;
                  align-items: baseline;
                  gap: 12px;
                  padding: 18px 22px;
                  border-radius: 16px;
                  background: rgba(45,74,62,0.08);
                  border: 1px solid rgba(45,74,62,0.06);
                  transition: all 0.3s ease;
                }
                .cta-metric:hover {
                  background: white;
                  transform: translateX(4px);
                  box-shadow: 0 8px 24px rgba(45,74,62,0.08);
                }
                .cta-pill {
                  display: inline-flex;
                  align-items: center;
                  gap: 5px;
                  font-size: 0.65rem;
                  font-weight: 600;
                  color: var(--green-deep);
                  padding: 5px 10px;
                  border-radius: 8px;
                  background: rgba(45,74,62,0.06);
                }
                @media (max-width: 900px) {
                  .cta-card-inner { grid-template-columns: 1fr !important; }
                  .cta-card-right { border-radius: 0 0 28px 28px; }
                }
              `}</style>
              <div className="cta-card">
                {/* Deco inside card */}
                <Image src="/SYMBOLE_RVB-03.png" alt="" width={200} height={200} aria-hidden="true"
                  style={{ position: "absolute", top: "-20px", left: "-20px", opacity: 0.05, pointerEvents: "none", zIndex: 0 }} />

                <div className="cta-card-inner">
                  {/* Left — Testimonial on dark */}
                  <div className="cta-card-left">
                    {/* Stars */}
                    <div style={{ display: "flex", gap: "3px", marginBottom: "20px" }}>
                      {[1,2,3,4,5].map((s) => (
                        <svg key={s} className="cta-star" width="16" height="16" viewBox="0 0 24 24" fill="var(--pink)" stroke="none">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>

                    {/* Quote — word by word for animation */}
                    <div style={{ marginBottom: "28px" }}>
                      {data.cta.testimonial.quote.split(". ").map((sentence, i) => (
                        <p key={i} className="cta-quote-line" style={{
                          fontSize: "1.05rem", color: "rgba(255,255,255,0.85)",
                          lineHeight: 1.75, fontStyle: "italic",
                        }}>
                          &laquo; {sentence}{i < data.cta.testimonial.quote.split(". ").length - 1 ? "." : ""} &raquo;
                        </p>
                      ))}
                    </div>

                    {/* Author */}
                    <div className="cta-avatar" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <div style={{
                        width: "48px", height: "48px", borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--pink) 0%, var(--pink-dark) 100%)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "0.85rem", color: "var(--green-deep)",
                        boxShadow: "0 4px 16px rgba(255,239,218,0.3)",
                      }}>
                        {data.cta.testimonial.initials}
                      </div>
                      <div>
                        <div style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.88rem", color: "white" }}>{data.cta.testimonial.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--sage-light)" }}>{data.cta.testimonial.role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Right — Metrics on pink */}
                  <div className="cta-card-right">
                    {/* Deco */}
                    <Image src="/SYMBOLE_RVB-03.png" alt="" width={140} height={140} aria-hidden="true"
                      style={{ position: "absolute", bottom: "-20px", right: "-20px", opacity: 0.08, pointerEvents: "none" }} />

                    <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--green-deep)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>
                      Nos résultats
                    </div>

                    {data.cta.metrics.map((m, i) => (
                      <div key={i} className="cta-metric">
                        <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 900, fontSize: "1.8rem", color: "var(--green-deep)", letterSpacing: "-0.03em", lineHeight: 1 }}>{m.value}</span>
                        <span style={{ fontSize: "0.72rem", color: "var(--text-mid)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.label}</span>
                      </div>
                    ))}

                    {/* Trust */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                      {data.cta.trustPills.map((t) => (
                        <span key={t.label} className="cta-pill">{t.label}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <Footer content={footer} />
    </>
  );
}
