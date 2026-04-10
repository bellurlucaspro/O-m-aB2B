"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Tag, Package, ArrowRight, Play, X, Layers, Leaf, Flag, CalendarDays, Truck, type LucideIcon } from "lucide-react";
import { gsap, ScrollTrigger, ease } from "@/lib/motion";
import CoffretConfigurator from "./CoffretConfigurator";

const ICON_MAP: Record<string, LucideIcon> = { MessageSquare, Tag, Package };

interface PersonalizationStep { title: string; desc: string; iconName: string; }
interface PersonalizationProps { sectionTitle?: string; sectionSubtitle?: string; image?: string; steps?: PersonalizationStep[]; }

const DEFAULT_STEPS: PersonalizationStep[] = [
  { iconName: "MessageSquare", title: "Message personnalisé", desc: "Un mot de votre direction pour chaque collaborateur." },
  { iconName: "Tag", title: "Branding entreprise", desc: "Logo et charte graphique sur le packaging." },
  { iconName: "Package", title: "Sélection sur-mesure", desc: "Composez un coffret adapté à votre événement." },
];

export default function PersonalizationSection({
  sectionTitle = "Votre coffret,\nà votre image",
  sectionSubtitle = "Vous validez, on déploie. Un interlocuteur dédié pilote tout le processus.",
  image = "/uploads/1773424302034-6qae7o.JPG",
  steps = DEFAULT_STEPS,
}: PersonalizationProps) {
  const ref = useRef<HTMLElement>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [configuratorOpen, setConfiguratorOpen] = useState(false);

  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".ps-a"), { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".ps-img-card",
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".ps-img-card", start: "top 80%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".ps-a",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: ease.enter,
          scrollTrigger: { trigger: ".ps-text", start: "top 82%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".ps-step",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.12, ease: ease.enter,
          scrollTrigger: { trigger: ".ps-steps", start: "top 85%", toggleActions: "play none none none" } }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  return (
    <>
    {videoOpen && (
      <div role="dialog" aria-modal="true" onClick={() => setVideoOpen(false)} style={{
        position: "fixed", inset: 0, zIndex: 1000, background: "rgba(18,32,26,0.9)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "24px",
      }}>
        <div onClick={(e) => e.stopPropagation()} style={{
          width: "100%", maxWidth: "860px", borderRadius: "24px", overflow: "hidden",
          boxShadow: "0 48px 120px rgba(0,0,0,0.6)", background: "var(--green-deep)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.88rem", color: "white" }}>Découvrez nos coffrets</span>
            <button onClick={() => setVideoOpen(false)} aria-label="Fermer" style={{
              width: "36px", height: "36px", borderRadius: "50%", background: "rgba(255,255,255,0.08)",
              border: "none", color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
            }}><X size={16} /></button>
          </div>
          <video src="/que%20trouve%20t%20on%20dans%20une%20box%20O%27m%C3%A9a.mp4" poster="/mockup-box-grossesse.webp" controls autoPlay style={{ width: "100%", display: "block", maxHeight: "72vh" }} />
        </div>
      </div>
    )}

    <section id="personnalisation" ref={ref} style={{ background: "var(--cream)", padding: "80px 0 64px", position: "relative", overflow: "hidden" }}>
      <style>{`
        .ps-layout {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 52px;
          align-items: center;
        }
        .ps-img-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          box-shadow: 0 24px 64px rgba(45,74,62,0.1);
        }
        .ps-img-card img {
          transition: transform 6s ease !important;
        }
        .ps-img-card:hover img {
          transform: scale(1.03);
        }
        .ps-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 48px;
        }
        .ps-step-card {
          padding: 28px 24px;
          border-radius: 20px;
          background: var(--cream-dark);
          border: 1.5px solid rgba(135,163,141,0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          overflow: hidden;
        }
        .ps-step-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: var(--sage);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .ps-step-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 56px rgba(45,74,62,0.1);
          border-color: rgba(135,163,141,0.18);
        }
        .ps-step-card:hover::before {
          opacity: 1;
        }
        @media (max-width: 900px) {
          .ps-layout { grid-template-columns: 1fr !important; gap: 32px !important; }
          .ps-img-card { aspect-ratio: 16 / 10; }
          .ps-steps { grid-template-columns: 1fr !important; gap: 12px; margin-top: 32px; }
          .ps-step-card { padding: 20px 18px; }
        }
      `}</style>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 32px" }}>
        {/* Top: image left + text right */}
        <div className="ps-layout">
          {/* Image with overlays */}
          <div className="ps-img-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="Coffret O'Méa personnalisé" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.3) 100%)", pointerEvents: "none" }} />

            {/* Play button */}
            <button onClick={() => setVideoOpen(true)} style={{
              position: "absolute", bottom: "20px", left: "20px", zIndex: 3,
              display: "flex", alignItems: "center", gap: "10px",
              background: "rgba(243,240,232,0.92)", backdropFilter: "blur(10px)",
              border: "none", borderRadius: "999px", padding: "8px 16px 8px 8px",
              cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Play size={10} fill="white" style={{ color: "white", marginLeft: "1px" }} />
              </span>
              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.72rem", color: "var(--text-dark)" }}>
                Voir la vidéo
              </span>
            </button>
          </div>

          {/* Text content */}
          <div className="ps-text">
            <span className="ps-a" style={{
              display: "inline-block", fontSize: "0.65rem", fontWeight: 800,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "var(--sage)", marginBottom: "14px",
              fontFamily: "'Manrope', sans-serif",
            }}>
              Sur mesure
            </span>
            <h2 className="ps-a" style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 900,
              fontSize: "clamp(1.8rem, 3vw, 2.6rem)",
              color: "var(--text-dark)", letterSpacing: "-0.04em",
              lineHeight: 1.1, marginBottom: "16px",
            }}>
              {sectionTitle.split("\n").map((line, i, arr) => (
                <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
              ))}
            </h2>
            <p className="ps-a" style={{
              fontSize: "0.95rem", color: "var(--text-mid)",
              lineHeight: 1.7, maxWidth: "400px", marginBottom: "28px",
            }}>
              {sectionSubtitle}
            </p>

            {/* Mini features as pills */}
            <div className="ps-a" style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
              {[
                { icon: <Layers size={13} />, label: "Dès 5 coffrets" },
                { icon: <Leaf size={13} />, label: "100% naturel" },
                { icon: <Flag size={13} />, label: "Made in France" },
              ].map((item) => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "6px 14px", borderRadius: "999px",
                  background: "var(--cream-dark)",
                  border: "1px solid rgba(135,163,141,0.1)",
                  fontSize: "0.72rem", fontWeight: 700, color: "var(--sage-dark)",
                }}>
                  <span style={{ color: "var(--sage)", display: "flex" }}>{item.icon}</span>
                  {item.label}
                </div>
              ))}
            </div>

            <button onClick={() => setConfiguratorOpen(true)} className="ps-a" style={{
              display: "inline-flex", alignItems: "center", gap: "9px",
              padding: "14px 28px", background: "var(--green-deep)",
              color: "white", borderRadius: "999px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700,
              fontSize: "0.88rem", border: "none", cursor: "pointer",
              boxShadow: "0 8px 28px rgba(45,74,62,0.2)",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-darker)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Configurer mes coffrets <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* 3 Steps below */}
        <div className="ps-steps">
          {steps.map((step, i) => {
            const IconComponent = ICON_MAP[step.iconName] || Package;
            const colors = [
              { bg: "var(--pink)", iconBg: "var(--green-deep)", iconColor: "white" },
              { bg: "var(--cream-dark)", iconBg: "var(--sage)", iconColor: "white" },
              { bg: "var(--cream-dark)", iconBg: "var(--sage-dark)", iconColor: "white" },
            ][i];
            return (
              <div key={step.title} className="ps-step ps-step-card" style={{ background: colors.bg }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "14px",
                    background: colors.iconBg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: colors.iconColor,
                    boxShadow: `0 6px 16px ${colors.iconBg}33`,
                  }}>
                    <IconComponent size={22} />
                  </div>
                  <span style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                    fontSize: "3.2rem", color: "rgba(135,163,141,0.07)",
                    lineHeight: 1, letterSpacing: "-0.05em",
                  }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 style={{
                  fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                  fontSize: "1.1rem", color: "var(--text-dark)",
                  marginBottom: "8px", letterSpacing: "-0.02em",
                }}>
                  {step.title}
                </h3>
                <p style={{
                  fontSize: "0.82rem", color: "var(--text-mid)",
                  lineHeight: 1.6, margin: 0,
                }}>
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
    <CoffretConfigurator open={configuratorOpen} onClose={() => setConfiguratorOpen(false)} />
    </>
  );
}
