"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Leaf, MapPin, TrendingUp, type LucideIcon } from "lucide-react";
import { gsap, ScrollTrigger, duration, ease, distance, scrollDefaults } from "@/lib/motion";

interface BenefitItem {
  title: string;
  description: string;
  iconName: string;
  image: string;
}

interface BenefitsProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  items?: BenefitItem[];
}

const iconMap: Record<
  string,
  { Icon: LucideIcon; gradient: string; accent: string; iconColor: string; image: string }
> = {
  Heart: {
    Icon: Heart,
    gradient: "linear-gradient(165deg, rgba(255,239,218,0.7) 0%, rgba(240,223,197,0.5) 100%)",
    accent: "var(--pink)",
    iconColor: "#B4707A",
    image: "/uploads/femme-enceinte-travail.webp",
  },
  Leaf: {
    Icon: Leaf,
    gradient: "linear-gradient(165deg, rgba(135,163,141,0.5) 0%, rgba(95,114,99,0.4) 100%)",
    accent: "var(--sage)",
    iconColor: "#fff",
    image: "/uploads/produits-naturels.webp",
  },
  MapPin: {
    Icon: MapPin,
    gradient: "linear-gradient(165deg, rgba(45,74,62,0.5) 0%, rgba(30,51,41,0.4) 100%)",
    accent: "var(--green-deep)",
    iconColor: "#ABBFAF",
    image: "/uploads/marque-francaise.webp",
  },
  TrendingUp: {
    Icon: TrendingUp,
    gradient: "linear-gradient(165deg, rgba(232,168,124,0.5) 0%, rgba(184,116,74,0.4) 100%)",
    accent: "#E8A87C",
    iconColor: "#fff",
    image: "/uploads/impact-positif.webp",
  },
};

const defaultItems: BenefitItem[] = [
  {
    iconName: "Heart",
    title: "Marque employeur renforcée",
    description:
      "Célébrez chaque moment de vie de vos collaborateurs. Un signal fort qui se remarque, se partage et fidélise.",
    image: "/uploads/femme-enceinte-travail.webp",
  },
  {
    iconName: "Leaf",
    title: "Conformité & sérénité",
    description:
      "Coffrets 100% exonérés URSSAF. Produits certifiés, traçabilité complète. Zéro risque pour votre CSE.",
    image: "/uploads/3.2.png",
  },
  {
    iconName: "MapPin",
    title: "Logistique clé en main",
    description:
      "Livraison multi-sites, domicile ou télétravail. On gère tout de A à Z pour vos équipes RH.",
    image: "/uploads/marque-francaise.webp",
  },
  {
    iconName: "TrendingUp",
    title: "ROI mesurable",
    description:
      "Améliorez la QVT, réduisez le turnover et renforcez l'engagement. Un investissement qui se mesure.",
    image: "/uploads/impact-positif.webp",
  },
];

export default function BenefitsSection({
  sectionTitle = "Les b\én\éfices concrets\npour votre entreprise",
  sectionSubtitle = "Chaque coffret O\’M\éa g\én\ère de la valeur pour vos \équipes RH, votre marque employeur et vos collaborateurs.",
  items = defaultItems,
}: BenefitsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelector(".benefits-accordion-section"), { opacity: 1, y: 0 });
      setIsVisible(true);
      return;
    }

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(el.querySelector(".benefits-accordion-section"), { opacity: 1, y: 0 });
      setIsVisible(true);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(".benefits-accordion-section",
        { opacity: 0, y: distance.md },
        {
          opacity: 1,
          y: 0,
          duration: duration.reveal,
          ease: ease.enter,
          scrollTrigger: {
            trigger: ".benefits-accordion-section",
            start: scrollDefaults.start,
            toggleActions: scrollDefaults.toggleActions,
            onEnter: () => setIsVisible(true),
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  // Auto-play
  useEffect(() => {
    if (!isVisible) return;
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isVisible, items.length]);

  const handleSelect = (i: number) => {
    setActiveIndex(i);
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
  };

  return (
    <section
      ref={sectionRef}
      style={{
        background: "var(--cream-dark)",
        padding: isMobile ? "72px 0" : "100px 0",
        position: "relative",
        overflow: isMobile ? "visible" : "hidden",
      }}
    >
      <style>{`
        /* ---- Desktop accordion ---- */
        .ba-panel {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          transition: flex 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          min-height: 420px;
        }
        .ba-panel--active {
          flex: 4;
        }
        .ba-panel--inactive {
          flex: 1;
        }

        .ba-panel__bg {
          position: absolute;
          inset: 0;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ba-panel:hover .ba-panel__bg {
          transform: scale(1.04);
        }

        .ba-panel__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.08) 50%, transparent 100%);
          transition: opacity 0.4s ease;
          z-index: 1;
        }

        /* Decorative elements on active panels */
        .ba-panel__deco {
          position: absolute;
          border-radius: 50%;
          opacity: 0;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s;
          z-index: 0;
          pointer-events: none;
        }
        .ba-panel--active .ba-panel__deco {
          opacity: 0.12;
        }

        /* Content */
        .ba-panel__content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 32px;
        }

        /* Collapsed state: rotated title */
        .ba-panel__collapsed {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 1;
          transition: opacity 0.3s ease;
        }
        .ba-panel--active .ba-panel__collapsed {
          opacity: 0;
          pointer-events: none;
        }

        .ba-panel__rotated-title {
          writing-mode: vertical-lr;
          transform: rotate(180deg);
          font-family: 'Manrope', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.9);
          letter-spacing: 0.02em;
          white-space: nowrap;
          text-shadow: 0 1px 6px rgba(0,0,0,0.3);
        }

        /* Active content transition */
        .ba-panel__active-content {
          opacity: 0;
          transform: translateY(16px);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }
        .ba-panel--active .ba-panel__active-content {
          opacity: 1;
          transform: translateY(0);
        }

        /* Number/index */
        .ba-panel__index {
          position: absolute;
          top: 24px;
          left: 28px;
          z-index: 2;
          font-family: 'Manrope', sans-serif;
          font-weight: 800;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
        .ba-panel--active .ba-panel__index {
          color: rgba(255,255,255,0.7);
        }

        /* Progress dots */
        .ba-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 32px;
        }
        .ba-dot {
          width: 32px;
          height: 3px;
          border-radius: 2px;
          background: var(--sage);
          opacity: 0.2;
          cursor: pointer;
          transition: all 0.4s ease;
          border: none;
          padding: 0;
        }
        .ba-dot--active {
          opacity: 1;
          width: 48px;
        }

        /* ---- Mobile card carousel ---- */
        .ba-mobile-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding: 0 32px 16px;
        }
        .ba-mobile-track::-webkit-scrollbar { display: none; }

        .ba-mobile-card {
          flex: 0 0 85%;
          max-width: 340px;
          scroll-snap-align: center;
          border-radius: 20px;
          overflow: hidden;
          min-height: 340px;
          position: relative;
        }

        /* (no emoji — image-based panels) */
      `}</style>

      {/* Subtle dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "radial-gradient(circle, var(--sage) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <div
        className="benefits-accordion-section"
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}
      >
        {/* Header */}
        <div
          style={{ textAlign: "center", marginBottom: isMobile ? "40px" : "64px" }}
          className="benefits-header"
        >
          <span className="tag-pill" style={{ marginBottom: "20px" }}>
            Vos avantages
          </span>
          <h2
            style={{
              fontSize: "clamp(2rem, 4vw, 2.8rem)",
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text-dark)",
              marginTop: "16px",
              marginBottom: "16px",
            }}
          >
            {sectionTitle.split("\n").map((line, i, arr) => (
              <span key={i}>
                {line}
                {i < arr.length - 1 && <br />}
              </span>
            ))}
          </h2>
          <p
            style={{
              fontSize: "1rem",
              color: "var(--text-mid)",
              maxWidth: "520px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* ===== Desktop: Accordion ===== */}
        {!isMobile && (
          <>
            <div style={{ display: "flex", gap: "12px" }}>
              {items.map((b, i) => {
                const mapped = iconMap[b.iconName] || iconMap.Heart;
                const IconComp = mapped.Icon;
                const isActive = activeIndex === i;

                return (
                  <div
                    key={b.title}
                    className={`ba-panel ${isActive ? "ba-panel--active" : "ba-panel--inactive"}`}
                    onClick={() => handleSelect(i)}
                    onMouseEnter={() => handleSelect(i)}
                  >
                    {/* Background image + gradient overlay */}
                    <div
                      className="ba-panel__bg"
                      style={{
                        backgroundImage: `${mapped.gradient}, url(${b.image || mapped.image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundBlendMode: "overlay",
                      }}
                    />

                    {/* Decorative circles */}
                    <div
                      className="ba-panel__deco"
                      style={{
                        width: "300px",
                        height: "300px",
                        top: "-80px",
                        right: "-60px",
                        background: "white",
                      }}
                    />
                    <div
                      className="ba-panel__deco"
                      style={{
                        width: "200px",
                        height: "200px",
                        bottom: "-40px",
                        left: "-40px",
                        background: "white",
                      }}
                    />

                    {/* Overlay */}
                    <div
                      className="ba-panel__overlay"
                      style={{
                        opacity: isActive ? 1 : 0.6,
                        background: isActive
                          ? "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)"
                          : "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 100%)",
                      }}
                    />

                    {/* Index number */}
                    <div className="ba-panel__index">
                      0{i + 1}
                    </div>

                    {/* (image-based — no floating emoji) */}

                    {/* Collapsed: rotated title */}
                    <div className="ba-panel__collapsed">
                      <span className="ba-panel__rotated-title">{b.title}</span>
                    </div>

                    {/* Active: full content */}
                    <div className="ba-panel__content">
                      <div className="ba-panel__active-content">
                        {/* Icon badge */}
                        <div
                          style={{
                            width: "52px",
                            height: "52px",
                            borderRadius: "14px",
                            background: "rgba(255,255,255,0.15)",
                            backdropFilter: "blur(10px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "16px",
                            color: "white",
                            border: "1px solid rgba(255,255,255,0.2)",
                          }}
                        >
                          <IconComp size={24} strokeWidth={2} />
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontWeight: 800,
                            fontSize: "1.4rem",
                            color: "white",
                            marginBottom: "10px",
                            lineHeight: 1.2,
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {b.title}
                        </h3>

                        {/* Description */}
                        <p
                          style={{
                            fontSize: "0.88rem",
                            color: "rgba(255,255,255,0.8)",
                            lineHeight: 1.65,
                            maxWidth: "360px",
                          }}
                        >
                          {b.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="ba-dots">
              {items.map((_, i) => (
                <button
                  key={i}
                  className={`ba-dot ${activeIndex === i ? "ba-dot--active" : ""}`}
                  onClick={() => handleSelect(i)}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* ===== Mobile: Swipeable cards ===== */}
        {isMobile && (
          <div style={{ margin: "0 -32px" }}>
            <div className="ba-mobile-track">
              {items.map((b, i) => {
                const mapped = iconMap[b.iconName] || iconMap.Heart;
                const IconComp = mapped.Icon;

                return (
                  <div key={b.title} className="ba-mobile-card">
                    {/* BG image */}
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      backgroundImage: `${mapped.gradient}, url(${b.image || mapped.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundBlendMode: "overlay",
                    }} />
                    {/* Decorative circles */}
                    <div
                      style={{
                        position: "absolute",
                        width: "200px",
                        height: "200px",
                        borderRadius: "50%",
                        top: "-60px",
                        right: "-40px",
                        background: "white",
                        opacity: 0.1,
                      }}
                    />
                    {/* Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)",
                      }}
                    />
                    {/* Index */}
                    <div
                      style={{
                        position: "absolute",
                        top: "20px",
                        left: "24px",
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 800,
                        fontSize: "0.7rem",
                        color: "rgba(255,255,255,0.5)",
                        letterSpacing: "0.1em",
                        zIndex: 2,
                      }}
                    >
                      0{i + 1}
                    </div>
                    {/* (image-based — no floating emoji) */}
                    {/* Content */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "28px 24px",
                        zIndex: 2,
                      }}
                    >
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(10px)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          marginBottom: "14px",
                          color: "white",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        <IconComp size={20} strokeWidth={2} />
                      </div>
                      <h3
                        style={{
                          fontFamily: "'Manrope', sans-serif",
                          fontWeight: 800,
                          fontSize: "1.15rem",
                          color: "white",
                          marginBottom: "8px",
                          lineHeight: 1.2,
                        }}
                      >
                        {b.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "rgba(255,255,255,0.8)",
                          lineHeight: 1.6,
                        }}
                      >
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
