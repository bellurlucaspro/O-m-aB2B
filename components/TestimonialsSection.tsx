"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, ScrollTrigger, ease, duration, distance } from "@/lib/motion";
import type { TestimonialsContent } from "@/lib/types";

/* ─── Data ─── */
const DEFAULT_TESTIMONIALS = [
  {
    quote: "L'impact sur notre marque employeur a été immédiat. Nos collaboratrices partagent les coffrets sur LinkedIn.",
    name: "Sophie L.",
    role: "DRH",
    company: "EasyVista",
    initials: "SL",
    highlight: "immédiat",
  },
  {
    quote: "Zéro logistique de notre côté, livraison individuelle impeccable. Même nos équipes en télétravail ont reçu leur coffret à temps.",
    name: "Marie D.",
    role: "CSE",
    company: "CDTS",
    initials: "MD",
    highlight: "impeccable",
  },
  {
    quote: "La qualité des produits a surpris tout le monde. Naturels, français, élégants. Un cadeau d'entreprise crédible.",
    name: "Thomas R.",
    role: "Office Manager",
    company: "Berlin Packaging",
    initials: "TR",
    highlight: "crédible",
  },
];

const AUTOPLAY_DELAY = 6000;

export default function TestimonialsSection({ content }: { content?: TestimonialsContent }) {
  const items = content?.items ?? DEFAULT_TESTIMONIALS;
  const sectionLabel = content?.sectionLabel ?? "Ils témoignent";
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnimating = useRef(false);

  /* ─── Animate transition ─── */
  const animateTransition = useCallback((newIndex: number) => {
    if (isAnimating.current) return;
    isAnimating.current = true;

    const tl = gsap.timeline({
      onComplete: () => { isAnimating.current = false; },
    });

    // Exit
    tl.to(quoteRef.current, {
      opacity: 0, y: -16, filter: "blur(3px)",
      duration: 0.3, ease: "power2.in",
    })
    .to(authorRef.current, {
      opacity: 0, y: -10,
      duration: 0.2, ease: "power2.in",
    }, "-=0.15")

    // Switch
    .call(() => setActive(newIndex))

    // Enter
    .fromTo(quoteRef.current, {
      opacity: 0, y: 24, filter: "blur(4px)",
    }, {
      opacity: 1, y: 0, filter: "blur(0px)",
      duration: 0.55, ease: "power2.out",
    })
    .fromTo(authorRef.current, {
      opacity: 0, y: 16,
    }, {
      opacity: 1, y: 0,
      duration: 0.4, ease: "power2.out",
    }, "-=0.25");

    // Progress bar
    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { scaleX: 0 }, {
        scaleX: 1, duration: AUTOPLAY_DELAY / 1000, ease: "none",
      });
    }
  }, []);

  /* ─── Navigate ─── */
  const goTo = useCallback((index: number) => {
    if (index === active || isAnimating.current) return;
    animateTransition(index);
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % items.length;
        animateTransition(next);
        return prev;
      });
    }, AUTOPLAY_DELAY);
  }, [active, animateTransition]);

  const goNext = useCallback(() => {
    goTo((active + 1) % items.length);
  }, [active, goTo]);

  const goPrev = useCallback(() => {
    goTo((active - 1 + items.length) % items.length);
  }, [active, goTo]);

  /* ─── Autoplay ─── */
  useEffect(() => {
    if (isHovered) {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (progressRef.current) gsap.killTweensOf(progressRef.current);
      return;
    }

    if (progressRef.current) {
      gsap.fromTo(progressRef.current, { scaleX: 0 }, {
        scaleX: 1, duration: AUTOPLAY_DELAY / 1000, ease: "none",
      });
    }

    autoplayRef.current = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % items.length;
        animateTransition(next);
        return prev;
      });
    }, AUTOPLAY_DELAY);

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isHovered, animateTransition]);

  /* ─── Entrance GSAP ─── */
  useEffect(() => {
    if (!sectionRef.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (window.innerWidth < 900) {
      gsap.set(sectionRef.current.querySelectorAll(".testi-dot"), { opacity: 1, scale: 1 });
      gsap.set(quoteRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(authorRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(quoteRef.current, {
        opacity: 0, y: distance.sm, filter: "blur(3px)",
      }, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: duration.reveal, ease: ease.enter,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });

      gsap.fromTo(authorRef.current, {
        opacity: 0, y: 10,
      }, {
        opacity: 1, y: 0,
        duration: duration.enter, delay: 0.15, ease: ease.enter,
        scrollTrigger: { trigger: sectionRef.current, start: "top 80%", toggleActions: "play none none none" },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const t = items[active];

  /* ─── Highlighted word ─── */
  const renderQuote = (quote: string, highlight: string) => {
    const idx = quote.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return <>&ldquo;{quote}&rdquo;</>;
    const before = quote.slice(0, idx);
    const match = quote.slice(idx, idx + highlight.length);
    const after = quote.slice(idx + highlight.length);
    return (
      <>
        &ldquo;{before}
        <span style={{
          color: "var(--green-deep)",
          fontStyle: "normal",
          fontWeight: 800,
          borderBottom: "2px solid rgba(45,74,62,0.2)",
          paddingBottom: "1px",
        }}>
          {match}
        </span>
        {after}&rdquo;
      </>
    );
  };

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        overflow: "hidden",
        background: "var(--cream)",
        padding: "40px 32px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .testi-nav-btn {
          width: 34px; height: 34px; border-radius: 50%;
          background: transparent;
          border: 1.5px solid rgba(45,74,62,0.1);
          color: var(--text-light);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .testi-nav-btn:hover {
          border-color: var(--sage);
          color: var(--green-deep);
        }
        @media (max-width: 700px) {
          .testi-quote-text { font-size: 0.95rem !important; }
          .testi-inner { flex-direction: column !important; gap: 16px !important; text-align: center !important; }
          .testi-author-block { justify-content: center !important; }
        }
      `}</style>

      <div style={{
        maxWidth: "900px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Compact single-row layout */}
        <div className="testi-inner" style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
        }}>
          {/* Nav prev */}
          <button className="testi-nav-btn" onClick={goPrev} aria-label="Précédent">
            <ChevronLeft size={15} />
          </button>

          {/* Quote + Author inline */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div ref={quoteRef}>
              <p
                className="testi-quote-text"
                style={{
                  fontSize: "clamp(1rem, 1.8vw, 1.15rem)",
                  fontFamily: "var(--font-manrope)",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  lineHeight: 1.65,
                  fontStyle: "italic",
                  letterSpacing: "-0.01em",
                  margin: "0 0 12px",
                  textAlign: "center",
                }}
              >
                {renderQuote(t.quote, t.highlight)}
              </p>
            </div>

            <div
              ref={authorRef}
              className="testi-author-block"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--sage), var(--sage-dark))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-manrope)",
                fontWeight: 800, fontSize: "0.55rem", color: "white",
                flexShrink: 0,
              }}>
                {t.initials}
              </div>
              <span style={{
                fontSize: "0.75rem", color: "var(--text-mid)", fontWeight: 600,
                fontFamily: "var(--font-manrope)",
              }}>
                <strong style={{ color: "var(--text-dark)", fontWeight: 800 }}>{t.name}</strong>
                <span style={{ margin: "0 6px", opacity: 0.3 }}>·</span>
                {t.role}, {t.company}
              </span>
            </div>
          </div>

          {/* Nav next */}
          <button className="testi-nav-btn" onClick={goNext} aria-label="Suivant">
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Dots — minimal */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "6px", marginTop: "16px", alignItems: "center",
        }}>
          {items.map((_, i) => (
            <button
              key={i}
              className="testi-dot"
              onClick={() => goTo(i)}
              aria-label={`Témoignage ${i + 1}`}
              style={{
                width: i === active ? "20px" : "6px",
                height: "6px",
                borderRadius: "999px",
                background: i === active ? "var(--green-deep)" : "rgba(45,74,62,0.1)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
