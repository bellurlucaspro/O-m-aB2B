"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Leaf, X, Package, Check } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/motion";

interface ProductDetail {
  name: string;
  image: string;
  description: string;
  price?: string;
  nbProduits?: string;
  composition?: string[];
  tvaRate?: number;
}

interface Product {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  composition: string[];
  nbProduits: string;
  price: string;
  priceNote: string;
  tag: string;
  tagBg: string;
  tagColor: string;
  accentColor: string;
  photo: string;
  photoAlt: string;
  iconEmoji: string;
  featured: boolean;
  detailProducts?: ProductDetail[];
  tvaRate?: number;
}

interface ProductSectionProps {
  products?: Product[];
}

/* ------------------------------------------------------------------ */
/*  Product Detail Modal                                               */
/* ------------------------------------------------------------------ */

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const details = product.detailProducts || [];
  const [activeVariant, setActiveVariant] = useState(0);
  const current = details[activeVariant];

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("lenis:stop"));
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);

    const modal = modalRef.current;
    const handleWheel = (e: WheelEvent) => { e.stopPropagation(); };
    modal?.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      window.dispatchEvent(new Event("lenis:start"));
      window.removeEventListener("keydown", handleEsc);
      modal?.removeEventListener("wheel", handleWheel);
    };
  }, [onClose]);

  const getHT = (priceStr: string, rate: number = 20) => {
    const num = parseInt(priceStr.replace(/[^\d]/g, ""), 10);
    return num ? Math.round(num / (1 + rate / 100)) : 0;
  };

  const currentRate = current?.tvaRate ?? product.tvaRate ?? 20;
  const currentHT = getHT(current?.price || product.price, currentRate);
  const currentTTC = current?.price || product.price;

  return (
    <div
      className="pm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideUp { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .pm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.45); backdrop-filter: blur(10px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; animation: pmFadeIn 0.2s ease;
        }
        .pm-modal {
          background: #F5F2EA; border-radius: 24px;
          max-width: 920px; width: 100%;
          max-height: 90vh;
          display: flex; flex-direction: column;
          animation: pmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 32px 80px rgba(0,0,0,0.22); position: relative;
          overflow: hidden;
        }
        .pm-close {
          position: absolute; top: 16px; right: 16px; z-index: 10;
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(255,255,255,0.9); border: none;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-mid); transition: all 0.2s ease;
          backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .pm-close:hover { background: var(--green-deep); color: white; }
        .pm-header {
          padding: 22px 28px 18px;
          background: white;
          border-bottom: 1px solid rgba(135,163,141,0.08);
          flex-shrink: 0;
        }
        .pm-tabs {
          display: flex; gap: 0; border-radius: 14px; overflow: hidden;
          border: 1.5px solid rgba(135,163,141,0.12);
          background: #F5F2EA;
        }
        .pm-tab {
          display: flex; flex-direction: column; align-items: center;
          padding: 12px 24px; flex: 1; min-width: 0;
          border: none; border-right: 1px solid rgba(135,163,141,0.08);
          background: transparent; cursor: pointer;
          font-family: var(--font-manrope);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .pm-tab:last-child { border-right: none; }
        .pm-tab:hover { background: rgba(135,163,141,0.06); }
        .pm-tab--active {
          background: var(--green-deep) !important;
          box-shadow: 0 4px 16px rgba(45,74,62,0.2);
        }
        .pm-body {
          flex: 1; overflow-y: auto; min-height: 0;
          overscroll-behavior: contain;
        }
        .pm-body::-webkit-scrollbar { width: 4px; }
        .pm-body::-webkit-scrollbar-thumb { background: rgba(135,163,141,0.25); border-radius: 2px; }
        .pm-split {
          display: grid; grid-template-columns: 0.85fr 1.15fr;
        }
        .pm-img {
          position: relative; overflow: hidden;
          background: var(--cream-dark); min-height: 320px;
        }
        .pm-detail {
          padding: 28px 32px;
          display: flex; flex-direction: column;
        }
        .pm-section-label {
          font-size: 0.58rem; font-weight: 800; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--sage);
          margin-bottom: 10px;
          font-family: var(--font-manrope);
        }
        .pm-compo-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 3px;
        }
        .pm-compo-item {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 7px 0; border-radius: 8px;
          font-size: 0.73rem; color: var(--text-mid);
          line-height: 1.4;
        }
        .pm-compo-dot {
          width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
          background: rgba(135,163,141,0.08);
          display: flex; align-items: center; justify-content: center;
          margin-top: 1px;
        }
        .pm-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px;
          border-top: 1px solid rgba(135,163,141,0.1);
          flex-shrink: 0;
          background: white;
        }
        @media (max-width: 720px) {
          .pm-split { grid-template-columns: 1fr !important; }
          .pm-img { min-height: 220px; }
          .pm-compo-grid { grid-template-columns: 1fr !important; }
          .pm-tab { padding: 10px 14px; }
          .pm-detail { padding: 20px 24px; }
        }
      `}</style>

      <div ref={modalRef} className="pm-modal" data-lenis-prevent>
        <button className="pm-close" onClick={onClose} aria-label="Fermer"><X size={15} strokeWidth={2.5} /></button>

        {/* Header */}
        <div className="pm-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: details.length > 0 ? "16px" : "0" }}>
            {product.tag && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 700, padding: "3px 10px",
                borderRadius: "999px", background: product.tagBg, color: product.tagColor,
                letterSpacing: "0.02em",
              }}>
                {product.tag}
              </span>
            )}
            <h2 style={{
              fontFamily: "var(--font-manrope)", fontWeight: 900,
              fontSize: "1.25rem", color: "var(--green-deep)",
              letterSpacing: "-0.02em", margin: 0,
            }}>
              {product.name}
            </h2>
          </div>
          {details.length > 0 && (
            <div className="pm-tabs">
              {details.map((d, i) => {
                const isActive = activeVariant === i;
                const htPrice = getHT(d.price || "0", d.tvaRate ?? product.tvaRate ?? 20);
                return (
                  <button key={i} className={`pm-tab ${isActive ? "pm-tab--active" : ""}`} onClick={() => setActiveVariant(i)}>
                    <span style={{
                      fontWeight: 800, fontSize: "0.8rem", letterSpacing: "-0.01em",
                      color: isActive ? "white" : "var(--text-dark)",
                      transition: "color 0.25s ease",
                    }}>
                      {d.name}
                    </span>
                    <span style={{
                      fontWeight: 900, fontSize: "0.92rem", letterSpacing: "-0.02em",
                      color: isActive ? "rgba(255,255,255,0.8)" : "var(--green-deep)",
                      transition: "color 0.25s ease",
                    }}>
                      {htPrice}€ <span style={{ fontSize: "0.65rem", fontWeight: 700 }}>HT</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="pm-body">
          {details.length > 0 && current ? (
            <div className="pm-split">
              <div className="pm-img">
                {current.image ? (
                  <Image src={current.image} alt={current.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 720px) 100vw, 40vw" />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Package size={40} style={{ color: "var(--text-light)", opacity: 0.4 }} />
                  </div>
                )}
              </div>

              <div className="pm-detail">
                {/* Variant title + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <h3 style={{
                    fontFamily: "var(--font-manrope)", fontWeight: 900,
                    fontSize: "1.15rem", color: "var(--text-dark)", margin: 0,
                    letterSpacing: "-0.02em",
                  }}>
                    {current.name}
                  </h3>
                  {current.nbProduits && (
                    <span style={{
                      fontSize: "0.6rem", fontWeight: 700, color: "var(--green-deep)",
                      background: "rgba(45,74,62,0.08)", padding: "3px 10px", borderRadius: "999px",
                      letterSpacing: "0.01em",
                    }}>
                      {current.nbProduits}
                    </span>
                  )}
                </div>

                {/* Description */}
                <p style={{
                  fontSize: "0.82rem", color: "var(--text-mid)", margin: "0 0 24px",
                  lineHeight: 1.6, maxWidth: "440px",
                }}>
                  {current.description}
                </p>

                {/* Composition */}
                {current.composition && current.composition.length > 0 && (
                  <div style={{ flex: 1 }}>
                    <div className="pm-section-label">Contenu du coffret</div>
                    <div className="pm-compo-grid">
                      {current.composition.map((item, i) => (
                        <div key={i} className="pm-compo-item">
                          <span className="pm-compo-dot">
                            <Check size={9} strokeWidth={3} style={{ color: "var(--sage)" }} />
                          </span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: "28px 32px" }}>
              <p style={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.7, marginBottom: "24px", maxWidth: "520px" }}>
                {product.description}
              </p>
              <div className="pm-section-label">Contenu du coffret</div>
              <div className="pm-compo-grid">
                {product.composition.map((item, i) => (
                  <div key={i} className="pm-compo-item">
                    <span className="pm-compo-dot">
                      <Check size={9} strokeWidth={3} style={{ color: "var(--sage)" }} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pm-footer">
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{
                fontFamily: "var(--font-manrope)", fontWeight: 900,
                fontSize: "1.4rem", color: "var(--green-deep)", letterSpacing: "-0.03em",
              }}>
                {currentHT}€ HT
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-light)", fontWeight: 600 }}>
                {currentTTC}
              </span>
            </div>
            <span style={{ fontSize: "0.65rem", color: "var(--text-light)", fontWeight: 500 }}>par coffret</span>
          </div>
          <a href="#devis" onClick={onClose} style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 28px", background: "var(--green-deep)", color: "white",
            borderRadius: "14px", fontFamily: "var(--font-manrope)", fontWeight: 700,
            fontSize: "0.85rem", textDecoration: "none",
            transition: "all 0.25s ease",
            boxShadow: "0 4px 16px rgba(45,74,62,0.18)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-darker)"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(45,74,62,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(45,74,62,0.18)"; }}
          >
            Demander un devis <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Default products                                                   */
/* ------------------------------------------------------------------ */

const defaultProducts: Product[] = [
  {
    id: "grossesse", name: "Coffret Grossesse", subtitle: "Grossesse",
    description: "Accompagnez vos collaboratrices enceintes avec des soins naturels certifi\és. Un pilier concret de votre politique parentalit\é en entreprise.",
    composition: ["Huile de massage ventre anti-vergetures", "Tisane grossesse bio", "Crème hydratante naturelle", "Carnet de grossesse artisanal", "Infusion bien-être & surprise"],
    nbProduits: "6–8 produits", price: "59€ TTC", priceNote: "À partir de · TTC par coffret",
    tag: "Plus populaire", tagBg: "var(--pink)", tagColor: "var(--green-deep)",
    accentColor: "var(--green-deep)", photo: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
    photoAlt: "Produits naturels grossesse", iconEmoji: "🌸", featured: true, detailProducts: [],
  },
  {
    id: "naissance", name: "Coffret Naissance", subtitle: "Naissance",
    description: "C\él\ébrez chaque naissance dans vos \équipes avec un coffret premium. Id\éal au retour de cong\é pour marquer l\'attention de l\'entreprise.",
    composition: ["Lingettes biodégradables certifiées", "Baume protecteur 100% naturel", "Lotion douce bébé sans parfum", "Doudou artisanal français", "Cadeau personnalisé pour maman"],
    nbProduits: "8–10 produits", price: "69€ TTC", priceNote: "À partir de · TTC par coffret",
    tag: "Idéal retour congé", tagBg: "rgba(135,163,141,0.18)", tagColor: "var(--sage-dark)",
    accentColor: "var(--green-deep)", photo: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=80",
    photoAlt: "Coffret naissance naturel", iconEmoji: "🍃", featured: false, detailProducts: [],
  },
  {
    id: "fetes", name: "Coffret Fêtes de fin d'année", subtitle: "Noël & Avent",
    description: "Calendrier de l\'Avent + coffret No\ël en une offre cl\é en main. Le cadeau de fin d\'ann\ée qui marque vos \équipes et simplifie la vie du CSE.",
    composition: ["Calendrier de l'Avent O'Méa", "Coffret Noël complet", "Packaging festif personnalisé", "Carte message entreprise incluse", "Présentation ruban & coffret luxe"],
    nbProduits: "14–18 produits", price: "119€ TTC", priceNote: "À partir de · TTC par coffret",
    tag: "Offre complète", tagBg: "var(--green-deep)", tagColor: "white",
    accentColor: "var(--green-deep)", photo: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
    photoAlt: "Coffret fêtes de fin d'année", iconEmoji: "🎄", featured: false, detailProducts: [],
  },
  {
    id: "events", name: "Coffret Événements CSE", subtitle: "Événements & CSE",
    description: "F\ête des m\ères, team building, s\éminaire\… Des coffrets personnalis\és \à votre image pour chaque temps fort de votre calendrier CSE.",
    composition: ["Sélection produits naturels & artisanaux", "Packaging 100% personnalisable", "Logo entreprise intégré", "Message sur mesure inclus", "Livraison flexible & planifiée"],
    nbProduits: "5–12 produits", price: "49€ TTC", priceNote: "À partir de · TTC par coffret",
    tag: "Toutes occasions", tagBg: "rgba(232,168,124,0.18)", tagColor: "var(--accent-terracotta)",
    accentColor: "var(--green-deep)", photo: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800&q=80",
    photoAlt: "Coffret événements entreprise", iconEmoji: "🎁", featured: false, detailProducts: [],
  },
];

/* ================================================================== */
/*  ProductSection — Tab-based (no ScrollTrigger pin)                  */
/* ================================================================== */

export default function ProductSection({
  products = defaultProducts,
  activeTab = "coffrets",
  onSwitchTab,
}: ProductSectionProps & { activeTab?: string; onSwitchTab?: (tab: "coffrets" | "simulateur") => void }) {
  const ref = useRef<HTMLElement>(null);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [showHT, setShowHT] = useState(true);

  const formatPrice = (ttcStr: string, tvaRate: number = 20) => {
    const num = parseInt(ttcStr.replace(/[^\d]/g, ""), 10);
    if (!num) return ttcStr;
    if (showHT) {
      const ht = Math.round(num / (1 + tvaRate / 100));
      return `${ht}€ HT`;
    }
    return ttcStr;
  };

  const current = products[activeIdx];

  // Entrance animation
  useEffect(() => {
    if (!ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // On mobile, show everything instantly — no scroll animations
    if (window.innerWidth < 900) {
      gsap.set(ref.current.querySelectorAll(".px-header, .px-card-area"), { opacity: 1, y: 0 });
      return;
    }

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".px-header",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none none" } }
      );
      gsap.fromTo(".px-card-area",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.15,
          scrollTrigger: { trigger: ref.current, start: "top 75%", toggleActions: "play none none none" } }
      );
    }, ref);

    return () => ctx.revert();
  }, []);

  // Animate card transition
  const cardRef = useRef<HTMLDivElement>(null);
  const switchTo = (idx: number) => {
    if (idx === activeIdx) return;
    if (cardRef.current && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.to(cardRef.current, {
        opacity: 0, y: 20, duration: 0.2, ease: "power2.in",
        onComplete: () => {
          setActiveIdx(idx);
          gsap.fromTo(cardRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" });
        },
      });
    } else {
      setActiveIdx(idx);
    }
  };

  return (
    <section ref={ref} style={{ background: "var(--cream)", position: "relative", padding: "48px 0 80px" }}>
      <style>{`
        .px-pill {
          padding: 8px 18px; border-radius: 999px;
          font-family: var(--font-manrope); font-weight: 600;
          font-size: 0.73rem; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid rgba(200,180,160,0.25);
          background: rgba(255,248,240,0.8); color: var(--text-mid);
        }
        .px-pill:hover {
          border-color: var(--sage);
          color: var(--text-dark);
          background: var(--cream);
        }
        .px-pill--active {
          background: var(--sage) !important;
          color: white !important;
          border-color: var(--sage) !important;
          box-shadow: 0 4px 14px rgba(135,163,141,0.25);
          font-weight: 700;
        }
        .px-compo-pill {
          font-size: 0.72rem; color: var(--text-mid);
          background: var(--cream-dark); padding: 5px 12px;
          border-radius: 8px; border: 1px solid rgba(135,163,141,0.08);
        }
        .px-card-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 48px;
        }
        @media (max-width: 900px) {
          .px-card-grid { grid-template-columns: 1fr !important; gap: 24px !important; padding: 0 20px !important; }
          .px-photo-wrap { height: 280px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="px-header" style={{ textAlign: "center", padding: "20px 32px 32px" }}>
        {/* Mode tabs */}
        {onSwitchTab && (
          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
            <button onClick={() => onSwitchTab("coffrets")} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 22px", borderRadius: "999px",
              fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", border: "none",
              background: "var(--green-deep)", color: "white",
              boxShadow: "0 6px 20px rgba(45,74,62,0.2)",
            }}>
              Nos coffrets
            </button>
            <button onClick={() => onSwitchTab("simulateur")} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 22px", borderRadius: "999px",
              fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", background: "var(--cream)", color: "var(--text-mid)",
              border: "1.5px solid rgba(135,163,141,0.15)",
              transition: "all 0.3s ease",
            }}>
              Calculer mon prix
            </button>
          </div>
        )}

        <style>{`
          .px-hero-accent {
            position: relative;
            font-style: italic;
            color: var(--green-deep);
            display: inline-block;
          }
          .px-hero-accent::after {
            content: '';
            position: absolute;
            bottom: 2px; left: -4px; right: -4px;
            height: 12px;
            background: rgba(135,163,141,0.12);
            border-radius: 6px;
            z-index: -1;
          }
          .px-hero-sub {
            margin-top: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            font-size: 0.95rem;
            color: var(--text-mid);
            font-weight: 400;
            margin-bottom: 20px;
          }
          .px-hero-sub::before,
          .px-hero-sub::after {
            content: '';
            width: 32px; height: 1.5px;
            background: var(--sage);
            border-radius: 1px;
            opacity: 0.5;
          }
        `}</style>
        <h2 style={{
          fontSize: "clamp(2.8rem, 5.5vw, 4rem)", letterSpacing: "-0.04em",
          lineHeight: 1.05, color: "var(--text-dark)", marginBottom: "0",
          fontWeight: 900,
        }}>
          Coffrets pr&ecirc;ts <span className="px-hero-accent">&agrave; offrir</span>
        </h2>
        <p className="px-hero-sub">
          Pour chaque moment de vie de vos collaborateurs
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "6px", flexWrap: "wrap" }}>
          {products.map((p, i) => (
            <button
              key={p.id}
              className={`px-pill ${activeIdx === i ? "px-pill--active" : ""}`}
              onClick={() => switchTo(i)}
            >
              {p.name} · {formatPrice(p.price, p.tvaRate ?? 20)}
            </button>
          ))}
        </div>
      </div>

      {/* Product card */}
      <div className="px-card-area" ref={cardRef}>
        <style>{`
          .px-nav-wrap {
            position: relative;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 48px;
          }
          .px-nav-btn {
            position: absolute;
            top: 200px;
            z-index: 10;
            width: 48px; height: 48px;
            border-radius: 50%;
            background: var(--cream);
            border: 1.5px solid rgba(135,163,141,0.15);
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 20px rgba(45,74,62,0.1);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            color: var(--green-deep);
          }
          .px-nav-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 8px 28px rgba(45,74,62,0.18);
            background: var(--green-deep);
            color: white;
            border-color: var(--green-deep);
          }
          .px-nav-btn--prev { left: -60px; }
          .px-nav-btn--next { right: -60px; }
          @media (max-width: 900px) {
            .px-nav-wrap { padding: 0 20px; }
            .px-nav-btn { top: 140px; width: 38px; height: 38px; }
            .px-nav-btn--prev { left: 8px; }
            .px-nav-btn--next { right: 8px; }
          }
        `}</style>
        <div className="px-nav-wrap">
          <button
            className="px-nav-btn px-nav-btn--prev"
            aria-label="Coffret precedent"
            onClick={() => switchTo((activeIdx - 1 + products.length) % products.length)}
          >
            <ArrowRight size={17} style={{ transform: "rotate(180deg)" }} />
          </button>
          <button
            className="px-nav-btn px-nav-btn--next"
            aria-label="Coffret suivant"
            onClick={() => switchTo((activeIdx + 1) % products.length)}
          >
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="px-card-grid">
          {/* Photo */}
          <div>
            <div className="px-photo-wrap" style={{
              height: "420px", borderRadius: "24px", overflow: "hidden",
              position: "relative",
              boxShadow: "0 24px 72px rgba(45,74,62,0.12)",
            }}>
              <Image src={current.photo} alt={current.photoAlt} fill style={{ objectFit: "cover" }}
                sizes="(max-width: 900px) 100vw, 55vw" />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />
              <div style={{
                position: "absolute", top: "16px", left: "16px", zIndex: 2,
                fontSize: "0.65rem", fontWeight: 700, padding: "5px 14px",
                borderRadius: "999px", backdropFilter: "blur(8px)",
                background: current.tagBg, color: current.tagColor,
              }}>
                {current.tag}
              </div>
              <div style={{
                position: "absolute", bottom: "16px", left: "16px", zIndex: 2,
                display: "flex", alignItems: "center", gap: "6px",
                background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)",
                borderRadius: "999px", padding: "6px 14px",
                fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dark)",
              }}>
                <Package size={13} /> {current.nbProduits}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "10px", fontFamily: "var(--font-manrope)" }}>
              {current.subtitle}
            </div>
            <h3 style={{
              fontFamily: "var(--font-manrope)", fontWeight: 900,
              fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--text-dark)",
              letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: "16px",
            }}>
              {current.name}
            </h3>
            <p style={{ fontSize: "0.95rem", color: "var(--text-mid)", lineHeight: 1.7, marginBottom: "28px", maxWidth: "440px" }}>
              {current.description}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
              {current.composition.slice(0, 3).map((c, ci) => (
                <span key={ci} className="px-compo-pill">{c}</span>
              ))}
              {current.composition.length > 3 && (
                <span className="px-compo-pill" style={{ fontWeight: 600, color: "var(--green-deep)" }}>
                  +{current.composition.length - 3}
                </span>
              )}
            </div>

            {/* Variantes — sélecteur de gamme */}
            {current.detailProducts && current.detailProducts.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${current.detailProducts.length}, 1fr)`,
                  gap: "10px",
                }}>
                  {current.detailProducts.map((v, vi) => {
                    const vRate = (v.tvaRate ?? current.tvaRate ?? 20) / 100;
                    const htPrice = v.price ? Math.round(parseInt(v.price.replace(/[^\d]/g, ""), 10) / (1 + vRate)) : 0;
                    return (
                      <button
                        key={vi}
                        type="button"
                        onClick={() => {
                          setModalProduct(current);
                          setTimeout(() => {
                            document.querySelector<HTMLButtonElement>(`.pm-tab:nth-child(${vi + 1})`)?.click();
                          }, 100);
                        }}
                        style={{
                          display: "flex", flexDirection: "column",
                          padding: "16px 14px", borderRadius: "16px",
                          background: vi === 0 ? "var(--pink)" : "var(--cream-dark)",
                          border: vi === 0 ? "2px solid var(--pink-dark)" : "2px solid rgba(135,163,141,0.1)",
                          cursor: "pointer",
                          fontFamily: "var(--font-manrope)",
                          transition: "all 0.3s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green-deep)"; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(45,74,62,0.12)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = vi === 0 ? "var(--pink-dark)" : "rgba(135,163,141,0.1)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        {vi === 0 && (
                          <span style={{
                            position: "absolute", top: "0", right: "0",
                            fontSize: "0.55rem", fontWeight: 800, letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            background: "var(--green-deep)", color: "white",
                            padding: "3px 10px", borderRadius: "0 14px 0 10px",
                          }}>
                            Populaire
                          </span>
                        )}
                        <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--text-dark)", marginBottom: "2px" }}>
                          {v.name}
                        </span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 600, color: "var(--text-light)", marginBottom: "8px" }}>
                          {v.nbProduits}
                        </span>
                        <span style={{
                          fontWeight: 900, fontSize: "1.15rem", color: "var(--green-deep)",
                          letterSpacing: "-0.03em", lineHeight: 1,
                        }}>
                          {htPrice}€ <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>HT</span>
                        </span>
                        <span style={{ fontSize: "0.6rem", color: "var(--text-light)", marginTop: "2px" }}>
                          {v.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "9px 16px", background: "rgba(45,74,62,0.06)",
              borderRadius: "10px", border: "1.5px solid rgba(45,74,62,0.2)",
              fontSize: "0.76rem", fontWeight: 700, color: "var(--green-deep)",
              marginBottom: "24px", width: "fit-content",
              fontFamily: "var(--font-manrope)",
            }}>
              <Leaf size={13} /> 100% exonéré de charges URSSAF
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{
                    fontFamily: "var(--font-manrope)", fontWeight: 900,
                    fontSize: "2.2rem", color: "var(--green-deep)", letterSpacing: "-0.03em", lineHeight: 1,
                    textDecoration: "underline", textDecorationColor: "rgba(135,163,141,0.3)",
                    textUnderlineOffset: "6px", textDecorationThickness: "3px",
                  }}>
                    {formatPrice(current.price, current.tvaRate ?? 20)}
                  </span>
                  <div style={{
                    display: "inline-flex", background: "var(--cream-dark)", borderRadius: "999px",
                    padding: "2px", border: "1px solid rgba(135,163,141,0.1)",
                  }}>
                    {[true, false].map((ht) => (
                      <button key={String(ht)} onClick={() => setShowHT(ht)} style={{
                        padding: "4px 10px", borderRadius: "999px", border: "none",
                        fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.65rem",
                        cursor: "pointer", background: showHT === ht ? "var(--green-deep)" : "transparent",
                        color: showHT === ht ? "white" : "var(--text-light)", transition: "all 0.25s ease",
                      }}>
                        {ht ? "HT" : "TTC"}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--text-light)", marginTop: "4px" }}>
                  {showHT ? "par coffret · hors taxes" : current.priceNote}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalProduct(current)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "14px 28px", background: "var(--green-deep)", color: "white",
                  borderRadius: "14px", fontFamily: "var(--font-manrope)", fontWeight: 700,
                  fontSize: "0.88rem", border: "2px solid var(--green-deep)",
                  cursor: "pointer", transition: "all 0.25s ease",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--green-deep)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-deep)"; e.currentTarget.style.color = "white"; }}
              >
                Découvrir <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "8px",
          marginTop: "40px",
        }}>
          {products.map((_, i) => (
            <button key={i} onClick={() => switchTo(i)} aria-label={`Coffret ${i + 1}`} style={{
              width: activeIdx === i ? "28px" : "8px", height: "8px",
              borderRadius: activeIdx === i ? "4px" : "50%",
              background: activeIdx === i ? "var(--green-deep)" : "rgba(135,163,141,0.2)",
              border: "none", padding: 0, cursor: "pointer",
              transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }} />
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalProduct && <ProductModal product={modalProduct} onClose={() => setModalProduct(null)} />}
    </section>
  );
}
