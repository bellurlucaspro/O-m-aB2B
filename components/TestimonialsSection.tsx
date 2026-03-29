"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
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

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(sectionRef.current.querySelectorAll(".testi-line, .testi-star, .testi-dot"), { opacity: 1, y: 0, x: 0, scale: 1, scaleX: 1 });
      gsap.set(quoteRef.current, { opacity: 1, y: 0, filter: "blur(0px)" });
      gsap.set(authorRef.current, { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Thin decorative line grows
      gsap.fromTo(".testi-line", {
        scaleX: 0,
      }, {
        scaleX: 1,
        duration: 0.8,
        ease: ease.enter,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // Quote text
      gsap.fromTo(quoteRef.current, {
        opacity: 0, y: distance.md, filter: "blur(4px)",
      }, {
        opacity: 1, y: 0, filter: "blur(0px)",
        duration: duration.reveal, ease: ease.enter,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Author
      gsap.fromTo(authorRef.current, {
        opacity: 0, y: distance.sm,
      }, {
        opacity: 1, y: 0,
        duration: duration.enter, delay: 0.25, ease: ease.enter,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Stars
      gsap.fromTo(".testi-star", {
        opacity: 0, scale: 0,
      }, {
        opacity: 1, scale: 1,
        duration: 0.35, ease: "back.out(3)",
        stagger: 0.06, delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Dots
      gsap.fromTo(".testi-dot", {
        opacity: 0, scale: 0,
      }, {
        opacity: 1, scale: 1,
        duration: 0.3, ease: "back.out(2)",
        stagger: 0.05, delay: 0.5,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
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
        padding: "100px 32px 80px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <style>{`
        .testi-nav-btn {
          width: 44px; height: 44px; border-radius: 50%;
          background: transparent;
          border: 1.5px solid rgba(45,74,62,0.12);
          color: var(--text-light);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .testi-nav-btn:hover {
          border-color: var(--sage);
          color: var(--green-deep);
          transform: scale(1.06);
        }
        .testi-nav-btn:active {
          transform: scale(0.95);
        }
        @media (max-width: 900px) {
          .testi-nav-desktop { display: none !important; }
          .testi-quote-text { font-size: clamp(1.15rem, 4.5vw, 1.5rem) !important; }
        }
        @media (max-width: 600px) {
          .testi-quote-text { font-size: 1.05rem !important; line-height: 1.7 !important; }
        }
      `}</style>

      {/* Content */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        zIndex: 2,
      }}>
        {/* Thin line + label + thin line */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "52px",
        }}>
          <div className="testi-line" style={{
            width: "48px", height: "1px",
            background: "rgba(45,74,62,0.12)",
            transformOrigin: "right center",
          }} />
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-light)",
            fontFamily: "'Manrope', sans-serif",
          }}>
            {sectionLabel}
          </span>
          <div className="testi-line" style={{
            width: "48px", height: "1px",
            background: "rgba(45,74,62,0.12)",
            transformOrigin: "left center",
          }} />
        </div>

        {/* Stars — small, subtle */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "4px",
          marginBottom: "36px",
        }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} className="testi-star">
              <Star size={14} fill="#D4A574" style={{ color: "#D4A574" }} />
            </span>
          ))}
        </div>

        {/* Quote area */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          minHeight: "150px",
        }}>
          {/* Left arrow */}
          <button
            className="testi-nav-btn testi-nav-desktop"
            onClick={goPrev}
            aria-label="Témoignage précédent"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Quote */}
          <div style={{ flex: 1, textAlign: "center" }}>
            <div ref={quoteRef}>
              <p
                className="testi-quote-text"
                style={{
                  fontSize: "clamp(1.2rem, 2.2vw, 1.55rem)",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 500,
                  color: "var(--text-dark)",
                  lineHeight: 1.7,
                  fontStyle: "italic",
                  letterSpacing: "-0.01em",
                  margin: 0,
                }}
              >
                {renderQuote(t.quote, t.highlight)}
              </p>
            </div>
          </div>

          {/* Right arrow */}
          <button
            className="testi-nav-btn testi-nav-desktop"
            onClick={goNext}
            aria-label="Témoignage suivant"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Author */}
        <div
          ref={authorRef}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            marginTop: "36px",
          }}
        >
          <div style={{
            width: "42px", height: "42px", borderRadius: "50%",
            background: "linear-gradient(135deg, var(--sage), var(--sage-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800, fontSize: "0.75rem", color: "white",
          }}>
            {t.initials}
          </div>
          <div>
            <div style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 800, fontSize: "0.95rem",
              color: "var(--text-dark)", letterSpacing: "-0.01em",
            }}>
              {t.name}
            </div>
            <div style={{
              fontSize: "0.76rem", color: "var(--text-mid)",
              fontWeight: 500,
            }}>
              {t.role} — {t.company}
            </div>
          </div>
        </div>

        {/* Dots + progress */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "16px", marginTop: "40px",
        }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {items.map((_, i) => (
              <button
                key={i}
                className="testi-dot"
                onClick={() => goTo(i)}
                aria-label={`Témoignage ${i + 1}`}
                style={{
                  width: i === active ? "28px" : "8px",
                  height: "8px",
                  borderRadius: "999px",
                  background: i === active
                    ? "var(--green-deep)"
                    : "rgba(45,74,62,0.12)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                  padding: 0,
                }}
              />
            ))}
          </div>

          <div style={{
            width: "80px", height: "1.5px",
            background: "rgba(45,74,62,0.06)",
            borderRadius: "999px", overflow: "hidden",
          }}>
            <div
              ref={progressRef}
              style={{
                width: "100%", height: "100%",
                background: "var(--sage)",
                borderRadius: "999px",
                transformOrigin: "left center",
                transform: "scaleX(0)",
              }}
            />
          </div>
        </div>

        {/* Mobile nav */}
        <style>{`
          @media (max-width: 900px) {
            .testi-mobile-nav { display: flex !important; }
          }
        `}</style>
        <div className="testi-mobile-nav" style={{
          display: "none",
          justifyContent: "center",
          gap: "14px",
          marginTop: "20px",
        }}>
          <button className="testi-nav-btn" onClick={goPrev} aria-label="Précédent">
            <ChevronLeft size={16} />
          </button>
          <button className="testi-nav-btn" onClick={goNext} aria-label="Suivant">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
