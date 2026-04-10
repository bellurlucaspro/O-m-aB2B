"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Crown, Flame, Star, ShieldCheck } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/motion";
import type { TopCoffretsContent } from "@/lib/types";

const DEFAULT_ITEMS = [
  { rank: 1, name: "Coffret Grossesse", occasion: "Maternité", price: "33€ HT", desc: "Le coffret le plus commandé par les RH. Soins naturels, artisanaux et 100% français.", badge: "N°1 des commandes", photo: "/mockup-box-grossesse.webp", stats: "Commandé par 68% de nos clients" },
  { rank: 2, name: "Coffret Naissance", occasion: "Retour de congé", price: "50€ HT", badge: "Le plus offert au retour", photo: "/uploads/produits-box-omea.webp", desc: "", stats: "" },
  { rank: 3, name: "Coffret Fêtes", occasion: "Noël & Avent", price: "38€ HT", badge: "Préféré des CSE", photo: "/uploads/5.1.png", desc: "", stats: "" },
];

export default function TopCoffretsSection({ content }: { content?: TopCoffretsContent }) {
  const items = content?.items ?? DEFAULT_ITEMS;
  const sectionLabel = content?.label ?? "Les plus demandés";
  const sectionTitle = content?.title ?? "Top 3 des coffrets";
  const ctaText = content?.ctaText ?? "Voir tous les coffrets";
  const ctaHref = content?.ctaHref ?? "#produits";
  const trustText = content?.trustText ?? "98% de satisfaction";
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".tc-label, .tc-title, .tc-hero-card, .tc-side-card, .tc-divider"), {
        opacity: 1, y: 0, x: 0, scale: 1, scaleX: 1,
      });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ref.current,
          start: "top 75%",
          toggleActions: "play none none none",
        },
      });

      // Divider line grows
      tl.fromTo(".tc-divider", { scaleX: 0 }, {
        scaleX: 1, duration: 0.6, ease: "power3.out",
      });

      // Label slides in
      tl.fromTo(".tc-label", { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, duration: 0.4, ease: "power2.out",
      }, "-=0.3");

      // Title — word by word
      tl.fromTo(".tc-title-word", {
        opacity: 0, y: 30, rotateX: -15,
      }, {
        opacity: 1, y: 0, rotateX: 0,
        duration: 0.5, stagger: 0.08, ease: "power3.out",
      }, "-=0.2");

      // Hero card — dramatic entrance
      tl.fromTo(".tc-hero-card", {
        opacity: 0, y: 60, scale: 0.92,
      }, {
        opacity: 1, y: 0, scale: 1,
        duration: 0.9, ease: "power3.out",
      }, "-=0.3");

      // Side cards stagger with offset
      tl.fromTo(".tc-side-card", {
        opacity: 0, x: 40, scale: 0.94,
      }, {
        opacity: 1, x: 0, scale: 1,
        duration: 0.6, stagger: 0.15, ease: "power3.out",
      }, "-=0.5");

      // Floating badge pop
      tl.fromTo(".tc-pop", {
        opacity: 0, scale: 0,
      }, {
        opacity: 1, scale: 1,
        duration: 0.4, stagger: 0.1, ease: "back.out(2)",
      }, "-=0.3");

      // CTA link
      tl.fromTo(".tc-cta", { opacity: 0, y: 10 }, {
        opacity: 1, y: 0, duration: 0.35,
      }, "-=0.2");

      // Continuous float on hero image
      gsap.to(".tc-hero-float", {
        y: -10, duration: 5, ease: "sine.inOut", repeat: -1, yoyo: true,
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  const hero = items[0];
  const sides = items.slice(1);

  return (
    <section ref={ref} style={{
      background: "var(--cream)",
      padding: "56px 0 72px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        .tc-hero-card {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          background: var(--green-deep);
          box-shadow: 0 32px 80px rgba(45,74,62,0.18);
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tc-hero-card:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 40px 100px rgba(45,74,62,0.25);
        }
        .tc-hero-card:hover .tc-hero-img img {
          transform: scale(1.06);
        }
        .tc-hero-img img {
          transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .tc-side-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: var(--cream);
          border: 1.5px solid rgba(135,163,141,0.12);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .tc-side-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 56px rgba(45,74,62,0.12);
          border-color: rgba(135,163,141,0.2);
        }
        .tc-side-card:hover .tc-side-img img {
          transform: scale(1.05);
        }
        .tc-side-img img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .tc-layout {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 24px;
          align-items: stretch;
        }
        .tc-sides {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .tc-layout { grid-template-columns: 1fr !important; }
          .tc-hero-inner { flex-direction: column !important; }
          .tc-hero-img { height: 240px !important; min-height: 240px !important; }
          .tc-hero-text { padding: 28px 24px !important; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ marginBottom: "36px" }}>
          {/* Divider line */}
          <div className="tc-divider" style={{
            width: "48px", height: "3px", borderRadius: "2px",
            background: "var(--green-deep)", marginBottom: "16px",
            transformOrigin: "left center",
          }} />

          <div style={{
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <div className="tc-label" style={{
                display: "flex", alignItems: "center", gap: "8px",
                marginBottom: "10px",
              }}>
                <Flame size={14} style={{ color: "var(--green-deep)" }} />
                <span style={{
                  fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: "var(--green-deep)",
                  fontFamily: "'Manrope', sans-serif",
                }}>
                  {sectionLabel}
                </span>
              </div>
              <h2 style={{ perspective: "600px" }}>
                {sectionTitle.split(" ").map((word, i) => (
                  <span key={i} className="tc-title-word" style={{
                    display: "inline-block", marginRight: "0.3em",
                    fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                    fontWeight: 900, letterSpacing: "-0.04em",
                    color: i < 2 ? "var(--green-deep)" : "var(--text-dark)",
                    lineHeight: 1.1,
                  }}>
                    {word}
                  </span>
                ))}
              </h2>
            </div>
            <a href={ctaHref} className="tc-cta" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 22px", borderRadius: "999px",
              border: "1.5px solid rgba(45,74,62,0.2)",
              fontSize: "0.82rem", fontWeight: 700, color: "var(--green-deep)",
              textDecoration: "none", fontFamily: "'Manrope', sans-serif",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--green-deep)";
                e.currentTarget.style.color = "white";
                e.currentTarget.style.borderColor = "var(--green-deep)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--green-deep)";
                e.currentTarget.style.borderColor = "rgba(45,74,62,0.2)";
              }}
            >
              {ctaText} <ArrowRight size={14} />
            </a>
          </div>
        </div>

        {/* Layout: Hero left + 2 side right */}
        <div className="tc-layout">
          {/* ═══ HERO CARD (N°1) ═══ */}
          <a href="#produits" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="tc-hero-card" style={{ height: "100%" }}>
              <div className="tc-hero-inner" style={{
                display: "flex", height: "100%",
              }}>
                {/* Image side */}
                <div className="tc-hero-img tc-hero-float" style={{
                  position: "relative", flex: "1 1 55%", minHeight: "360px",
                  overflow: "hidden",
                }}>
                  <Image src={hero.photo} alt={hero.name} fill
                    style={{ objectFit: "cover" }}
                    sizes="(max-width: 900px) 100vw, 55vw"
                  />
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, rgba(45,74,62,0.4) 0%, transparent 60%)",
                  }} />
                  {/* Crown badge */}
                  <div className="tc-pop" style={{
                    position: "absolute", top: "20px", left: "20px", zIndex: 2,
                    width: "44px", height: "44px", borderRadius: "14px",
                    background: "var(--cream)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  }}>
                    <Crown size={20} style={{ color: "var(--green-deep)" }} />
                  </div>
                  {/* Stats badge */}
                  <div className="tc-pop" style={{
                    position: "absolute", bottom: "20px", left: "20px", zIndex: 2,
                    background: "rgba(243,240,232,0.95)", backdropFilter: "blur(12px)",
                    borderRadius: "12px", padding: "10px 16px",
                    display: "flex", alignItems: "center", gap: "8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  }}>
                    <div style={{
                      width: "28px", height: "28px", borderRadius: "8px",
                      background: "var(--green-deep)", display: "flex",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Flame size={14} style={{ color: "white" }} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.78rem", color: "var(--green-deep)" }}>
                        {hero.badge}
                      </div>
                      <div style={{ fontSize: "0.62rem", color: "var(--text-mid)", fontWeight: 500 }}>
                        {hero.stats}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Text side */}
                <div className="tc-hero-text" style={{
                  flex: "1 1 45%", padding: "40px 36px",
                  display: "flex", flexDirection: "column", justifyContent: "center",
                }}>
                  <div style={{
                    fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: "var(--sage-light)",
                    marginBottom: "10px", fontFamily: "'Manrope', sans-serif",
                  }}>
                    {hero.occasion}
                  </div>
                  <h3 style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                    fontSize: "clamp(1.4rem, 2.5vw, 1.8rem)",
                    color: "white", letterSpacing: "-0.03em",
                    lineHeight: 1.15, marginBottom: "14px",
                  }}>
                    {hero.name}
                  </h3>
                  <p style={{
                    fontSize: "0.88rem", color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.65, marginBottom: "24px",
                  }}>
                    {hero.desc}
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "20px",
                  }}>
                    <ShieldCheck size={14} style={{ color: "var(--sage-light)" }} />
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--sage-light)" }}>
                      100% exon&eacute;r&eacute; URSSAF
                    </span>
                  </div>
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: "20px",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}>
                    <div>
                      <span style={{
                        fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                        fontSize: "1.8rem", color: "white",
                        letterSpacing: "-0.03em",
                      }}>
                        {hero.price}
                      </span>
                      <span style={{
                        fontSize: "0.72rem", color: "rgba(255,255,255,0.5)",
                        marginLeft: "6px",
                      }}>
                        / coffret
                      </span>
                    </div>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      padding: "10px 20px", borderRadius: "999px",
                      background: "var(--cream)", color: "var(--green-deep)",
                      fontFamily: "'Manrope', sans-serif", fontWeight: 700,
                      fontSize: "0.82rem",
                      transition: "all 0.3s ease",
                    }}>
                      D&eacute;couvrir <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a>

          {/* ═══ SIDE CARDS (N°2 & N°3) ═══ */}
          <div className="tc-sides">
            {sides.map((c) => (
              <a key={c.rank} href="#produits" style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
                <div className="tc-side-card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  {/* Image */}
                  <div className="tc-side-img" style={{
                    position: "relative", height: "140px", overflow: "hidden",
                    flexShrink: 0,
                  }}>
                    <Image src={c.photo} alt={c.name} fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 900px) 100vw, 40vw"
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.35) 100%)",
                    }} />
                    {/* Rank */}
                    <div className="tc-pop" style={{
                      position: "absolute", top: "12px", left: "12px", zIndex: 2,
                      width: "32px", height: "32px", borderRadius: "10px",
                      background: c.rank === 2 ? "var(--sage)" : "rgba(135,163,141,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                      fontSize: "0.82rem", color: "white",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}>
                      {c.rank}
                    </div>
                    {/* Badge */}
                    <div style={{
                      position: "absolute", bottom: "12px", left: "12px", zIndex: 2,
                      background: "rgba(243,240,232,0.92)", backdropFilter: "blur(8px)",
                      borderRadius: "999px", padding: "4px 12px",
                      fontSize: "0.65rem", fontWeight: 700,
                      color: "var(--green-deep)", fontFamily: "'Manrope', sans-serif",
                    }}>
                      {c.badge}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{
                    padding: "18px 20px", flex: 1,
                    display: "flex", flexDirection: "column", justifyContent: "space-between",
                  }}>
                    <div>
                      <div style={{
                        fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em",
                        textTransform: "uppercase", color: "var(--sage)",
                        marginBottom: "5px", fontFamily: "'Manrope', sans-serif",
                      }}>
                        {c.occasion}
                      </div>
                      <h3 style={{
                        fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                        fontSize: "1.1rem", color: "var(--text-dark)",
                        letterSpacing: "-0.02em", marginBottom: "10px",
                      }}>
                        {c.name}
                      </h3>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "6px",
                      marginBottom: "10px",
                    }}>
                      <ShieldCheck size={12} style={{ color: "var(--sage)" }} />
                      <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--sage-dark)" }}>
                        100% exonéré URSSAF
                      </span>
                    </div>
                    <div style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}>
                      <div>
                        <span style={{
                          fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                          fontSize: "1.3rem", color: "var(--green-deep)",
                          letterSpacing: "-0.03em",
                        }}>
                          {c.price}
                        </span>
                        <span style={{
                          fontSize: "0.68rem", color: "var(--text-light)",
                          marginLeft: "4px", fontWeight: 500,
                        }}>
                          / coffret
                        </span>
                      </div>
                      <span style={{
                        display: "inline-flex", alignItems: "center",
                        gap: "4px", fontSize: "0.75rem", fontWeight: 700,
                        color: "var(--green-deep)",
                      }}>
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}

            {/* Mini trust bar */}
            <div className="tc-pop" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: "12px", padding: "12px 0",
            }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={11} fill="var(--accent-gold)" style={{ color: "var(--accent-gold)" }} />)}
              </div>
              <span style={{
                fontSize: "0.75rem", fontWeight: 700,
                color: "var(--text-mid)", fontFamily: "'Manrope', sans-serif",
              }}>
                {trustText}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
