"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { MessageSquare, Tag, Package, ArrowRight, Play, X, type LucideIcon } from "lucide-react";
import { gsap, createSectionTimeline, duration, ease, distance, stagger as staggerTokens } from "@/lib/motion";

const TowerModel3D = dynamic(() => import("@/components/TowerModel3D"), {
  ssr: false,
  loading: () => (
    <Image src="/mockup-box-grossesse.webp" alt="Coffret O'méa" width={440} height={360}
      style={{ objectFit: "contain", width: "100%", height: "auto" }} />
  ),
});

const ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  Tag,
  Package,
};

interface PersonalizationStep {
  title: string;
  desc: string;
  iconName: string;
}

interface PersonalizationProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  steps?: PersonalizationStep[];
}

const HOTSPOTS = [
  { x: "22%", y: "30%", label: "Produits naturels certifiés", detail: "Cosmétiques bio, soins doux et artisanaux", color: "var(--sage)", bg: "rgba(135,163,141,0.15)" },
  { x: "72%", y: "25%", label: "Packaging personnalisé", detail: "Votre logo et couleurs sur chaque coffret", color: "#D4956B", bg: "rgba(212,149,107,0.15)" },
  { x: "48%", y: "70%", label: "Made in France", detail: "Artisans locaux et circuits courts", color: "var(--green-deep)", bg: "rgba(45,74,62,0.12)" },
];

const DEFAULT_STEPS: PersonalizationStep[] = [
  {
    iconName: "MessageSquare",
    title: "Message personnalis\é",
    desc: "Int\égrez un message de votre direction ou de votre CSE pour chaque collaborateur.",
  },
  {
    iconName: "Tag",
    title: "Branding entreprise",
    desc: "Votre logo, vos couleurs et votre charte graphique sur chaque coffret et carte.",
  },
  {
    iconName: "Package",
    title: "S\élection sur-mesure",
    desc: "Choisissez parmi nos gammes ou composez un coffret unique adapt\é \à votre \év\énement.",
  },
];

const DEFAULT_TITLE = "Des coffrets\n\à votre image";
const DEFAULT_SUBTITLE = "De la s\élection \à la livraison individuelle, O\’M\éa pilote l\’ensemble du processus. Vous validez, on d\éploie.";

export default function PersonalizationSection({
  sectionTitle = DEFAULT_TITLE,
  sectionSubtitle = DEFAULT_SUBTITLE,
  steps = DEFAULT_STEPS,
}: PersonalizationProps) {
  const ref = useRef<HTMLElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(ref.current.querySelectorAll(".perso-box, .perso-play, .perso-strip, .perso-header, .perso-step, .perso-cta"), {
        opacity: 1, y: 0, scale: 1,
      });
      return;
    }

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".perso-box, .perso-play, .perso-strip, .perso-header, .perso-step, .perso-cta"), { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    const tl = createSectionTimeline(ref.current);
    tl.fromTo(".perso-box",
      { opacity: 0, y: distance.md, scale: 0.97 },
      { opacity: 1, y: 0, scale: 1, duration: duration.reveal }
    )
    .fromTo(".perso-play",
      { opacity: 0, y: distance.sm },
      { opacity: 1, y: 0 },
      "-=0.4"
    )
    .fromTo(".perso-strip",
      { opacity: 0, y: distance.sm },
      { opacity: 1, y: 0 },
      "-=0.4"
    )
    .fromTo(".perso-header",
      { opacity: 0, y: distance.md },
      { opacity: 1, y: 0 },
      "-=0.6"
    )
    .fromTo(".perso-step",
      { opacity: 0, y: distance.sm },
      { opacity: 1, y: 0, stagger: staggerTokens.default },
      "-=0.3"
    )
    .fromTo(".perso-cta",
      { opacity: 0, y: distance.sm },
      { opacity: 1, y: 0 },
      "-=0.2"
    );

    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  return (
    <>
    {/* Video modal — branded */}
    {videoOpen && (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Vidéo de présentation O'Méa"
        onClick={() => setVideoOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1000,
          background: "rgba(18,32,26,0.9)",
          backdropFilter: "blur(14px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: "100%",
            maxWidth: "860px",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 48px 120px rgba(0,0,0,0.6)",
            background: "var(--green-deep)",
          }}
        >
          {/* Modal header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: "var(--pink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <Play size={12} fill="var(--green-deep)" style={{ color: "var(--green-deep)", marginLeft: "2px" }} />
              </div>
              <div>
                <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.88rem", color: "white", letterSpacing: "-0.01em" }}>
                  D&eacute;couvrez nos coffrets en vid&eacute;o
                </div>
                <div style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.4)", marginTop: "1px", fontWeight: 500 }}>
                  Contenu, packaging et personnalisation
                </div>
              </div>
            </div>
            <button
              aria-label="Fermer la vidéo"
              onClick={() => setVideoOpen(false)}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.12)",
                color: "rgba(255,255,255,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Video */}
          <div style={{ background: "#0a1810" }}>
            <video
              src="/que%20trouve%20t%20on%20dans%20une%20box%20O%27m%C3%A9a.mp4"
              poster="/mockup-box-grossesse.webp"
              controls
              autoPlay
              style={{ width: "100%", display: "block", maxHeight: "72vh" }}
            />
          </div>

          {/* Modal footer */}
          <div style={{
            padding: "14px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>
              O&apos;méa & Cie · Coffrets maternité entreprise
            </span>
            <a
              href="#devis"
              onClick={() => setVideoOpen(false)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                background: "var(--pink)",
                color: "var(--green-deep)",
                borderRadius: "999px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.75rem",
                textDecoration: "none",
              }}
            >
              Demander un devis
            </a>
          </div>
        </div>
      </div>
    )}

    <section
      id="personnalisation"
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Split: left = visual on pink, right = content on cream */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "600px",
        }}
      >
        <style>{`
          @media (max-width: 900px) {
            .perso-grid { grid-template-columns: 1fr !important; }
            .perso-visual { min-height: 320px !important; }
          }
        `}</style>

        {/* LEFT visual */}
        <div
          className="perso-visual"
          style={{
            background: "var(--cream-gold)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "52px 40px 80px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background decorations — branded O'Mea */}
          <Image src="/SYMBOLE_RVB-03.png" alt="" width={220} height={220} aria-hidden="true"
            style={{ position: "absolute", top: "8%", right: "5%", opacity: 0.06, pointerEvents: "none", transform: "rotate(15deg)" }} />
          <Image src="/SYMBOLE_RVB-03.png" alt="" width={160} height={160} aria-hidden="true"
            style={{ position: "absolute", bottom: "12%", left: "3%", opacity: 0.04, pointerEvents: "none", transform: "rotate(-20deg)" }} />
          {/* Radial gradient accents */}
          <div style={{ position: "absolute", top: "-60px", left: "-60px", width: "300px", height: "300px", background: "radial-gradient(ellipse, rgba(135,163,141,0.08) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", right: "-40px", width: "250px", height: "250px", background: "radial-gradient(ellipse, rgba(242,216,220,0.2) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          {/* Subtle leaf SVG pattern */}
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ position: "absolute", top: "15%", left: "8%", opacity: 0.07, pointerEvents: "none" }}>
            <path d="M40 5 C55 20, 65 40, 40 75 C15 40, 25 20, 40 5Z" fill="var(--sage)" />
          </svg>
          <svg width="50" height="50" viewBox="0 0 80 80" fill="none" aria-hidden="true" style={{ position: "absolute", bottom: "20%", right: "10%", opacity: 0.05, pointerEvents: "none", transform: "rotate(45deg)" }}>
            <path d="M40 5 C55 20, 65 40, 40 75 C15 40, 25 20, 40 5Z" fill="var(--sage)" />
          </svg>

          {/* Title — large editorial centered */}
          <style>{`
            .perso-hero-title {
              position: relative; z-index: 3;
              text-align: center;
              margin-bottom: 16px;
            }
            .perso-hero-title h3 {
              font-family: 'Manrope', sans-serif;
              font-weight: 900;
              font-size: clamp(2rem, 4vw, 2.8rem);
              color: var(--text-dark);
              letter-spacing: -0.04em;
              line-height: 1.05;
            }
            .perso-hero-accent {
              position: relative;
              font-style: italic;
              color: var(--green-deep);
              display: inline-block;
            }
            .perso-hero-accent::after {
              content: '';
              position: absolute;
              bottom: 2px; left: -4px; right: -4px;
              height: 12px;
              background: rgba(135,163,141,0.12);
              border-radius: 6px;
              z-index: -1;
            }
            .perso-hero-sub {
              margin-top: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              font-size: 0.82rem;
              color: var(--text-mid);
            }
            .perso-hero-sub::before,
            .perso-hero-sub::after {
              content: '';
              width: 32px; height: 1.5px;
              background: var(--sage);
              border-radius: 1px;
              opacity: 0.5;
            }
          `}</style>
          <div className="perso-hero-title perso-box">
            <h3>
              Composez votre <span className="perso-hero-accent">coffret id&eacute;al</span>
            </h3>
            <p className="perso-hero-sub">Explorez le contenu interactif</p>
          </div>

          {/* 3D Tower model */}
          <div
            className="perso-box"
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              maxWidth: "500px",
              height: "420px",
            }}
          >
            <TowerModel3D height={420} />

            {/* Interactive hotspots */}
            {HOTSPOTS.map((spot, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: spot.x,
                  top: spot.y,
                  zIndex: 5,
                }}
              >
                <button
                  onClick={() => setActiveHotspot(activeHotspot === i ? null : i)}
                  aria-label={spot.label}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    background: spot.bg,
                    border: `2.5px solid ${spot.color}`,
                    cursor: "pointer",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 16px ${spot.color}33`,
                    padding: 0,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                >
                  <span style={{
                    width: "9px",
                    height: "9px",
                    borderRadius: "50%",
                    background: spot.color,
                    display: "block",
                  }} />
                  {/* Pulse ring */}
                  <span style={{
                    position: "absolute",
                    inset: "-6px",
                    borderRadius: "50%",
                    border: `2px solid ${spot.color}`,
                    opacity: 0.3,
                    animation: "hotspotPulse 2s ease-in-out infinite",
                  }} />
                </button>

                <div
                  style={{
                    position: "absolute",
                    top: "36px",
                    left: "50%",
                    transform: activeHotspot === i
                      ? "translateX(-50%) translateY(0) scale(1)"
                      : "translateX(-50%) translateY(8px) scale(0.95)",
                    opacity: activeHotspot === i ? 1 : 0,
                    pointerEvents: activeHotspot === i ? "auto" : "none",
                    transition: "opacity 0.2s ease, transform 0.2s ease",
                    background: "white",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    boxShadow: "0 8px 32px rgba(45,74,62,0.18)",
                    border: "1px solid rgba(135,163,141,0.15)",
                    width: "180px",
                    zIndex: 10,
                  }}
                >
                  <div style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    color: "var(--text-dark)",
                    marginBottom: "4px",
                  }}>
                    {spot.label}
                  </div>
                  <div style={{
                    fontSize: "0.7rem",
                    color: "var(--text-mid)",
                    lineHeight: 1.5,
                  }}>
                    {spot.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Play button — centered under 3D model */}
          <button
            className="perso-play"
            onClick={() => setVideoOpen(true)}
            style={{
              position: "relative",
              marginTop: "20px",
              zIndex: 4,
              display: "flex",
              alignItems: "center",
              gap: "14px",
              background: "white",
              border: "none",
              borderRadius: "999px",
              padding: "10px 20px 10px 10px",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(45,74,62,0.18)",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "scale(1.04)";
              el.style.boxShadow = "0 12px 40px rgba(45,74,62,0.26)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "scale(1)";
              el.style.boxShadow = "0 8px 32px rgba(45,74,62,0.18)";
            }}
          >
            <span style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "var(--green-deep)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Play size={13} fill="white" style={{ color: "white", marginLeft: "2px" }} />
            </span>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.8rem",
                color: "var(--text-dark)",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                Voir la vid&eacute;o
              </div>
              <div style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 500,
                fontSize: "0.75rem",
                color: "var(--text-mid)",
                lineHeight: 1.2,
              }}>
                D&eacute;couvrir nos coffrets
              </div>
            </div>
          </button>

          {/* strip removed — now in bottom row */}
        </div>

        {/* RIGHT content */}
        <div
          style={{
            background: "var(--green-deep)",
            padding: "80px 60px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div className="perso-header">
            <span className="tag-pill" style={{ marginBottom: "20px", background: "rgba(255,255,255,0.1)", color: "var(--sage-light)", borderColor: "rgba(255,255,255,0.15)" }}>
              Sur mesure
            </span>
            <h2
              style={{
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "white",
                marginTop: "16px",
                marginBottom: "16px",
                lineHeight: 1.15,
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
                fontSize: "0.95rem",
                color: "rgba(255,255,255,0.6)",
                lineHeight: 1.7,
                maxWidth: "380px",
                marginBottom: "40px",
              }}
            >
              {sectionSubtitle}
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "24px" }}
          >
            {steps.map((step, i) => {
              const IconComponent = ICON_MAP[step.iconName] || Package;
              return (
                <div
                  key={step.title}
                  className="perso-step"
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "42px",
                      height: "42px",
                      borderRadius: "12px",
                      background: "rgba(255,255,255,0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--sage-light)",
                    }}
                  >
                    <IconComponent size={20} />
                  </div>
                  <div>
                    <h3
                      style={{
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        color: "white",
                        marginBottom: "4px",
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.6,
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="perso-cta"
            style={{
              marginTop: "40px",
            }}
          >
            <a
              href="#devis"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "9px",
                padding: "15px 28px",
                background: "var(--pink)",
                color: "var(--green-deep)",
                borderRadius: "999px",
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                textDecoration: "none",
                boxShadow: "0 8px 28px rgba(45,74,62,0.2)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "var(--pink-light)";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "var(--pink)";
                el.style.transform = "translateY(0)";
              }}
            >
              Configurer mes coffrets
              <ArrowRight size={15} />
            </a>

          </div>

        </div>

        {/* ════ BOTTOM ROW: green strip left + pink strip right ════ */}
        <div style={{
          background: "var(--green-deep)",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
          {[
            { value: "5 coffrets", label: "minimum" },
            { value: "100%", label: "naturel & bio" },
            { value: "\ud83c\uddeb\ud83c\uddf7", label: "Made in France" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "white", lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.55)", marginTop: "3px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: "var(--pink)",
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}>
          {[
            { value: "Saisonnière", label: "Sélection" },
            { value: "100%", label: "Made in France" },
            { value: "Expert", label: "Logistique" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--green-deep)", lineHeight: 1.1 }}>{item.value}</div>
              <div style={{ fontSize: "0.65rem", color: "var(--text-mid)", marginTop: "3px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
}
