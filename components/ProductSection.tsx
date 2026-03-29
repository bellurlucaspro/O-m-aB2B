"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, Leaf, X, Package } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/motion";

interface ProductDetail {
  name: string;
  image: string;
  description: string;
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

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="pm-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        @keyframes pmFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes pmSlideUp { from { opacity: 0; transform: translateY(40px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pmItemIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .pm-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px; animation: pmFadeIn 0.25s ease;
        }
        .pm-modal {
          background: var(--cream); border-radius: 24px;
          max-width: 880px; width: 100%; max-height: 90vh; overflow-y: auto;
          animation: pmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 40px 120px rgba(0,0,0,0.25); position: relative;
        }
        .pm-modal::-webkit-scrollbar { width: 6px; }
        .pm-modal::-webkit-scrollbar-track { background: transparent; }
        .pm-modal::-webkit-scrollbar-thumb { background: rgba(135,163,141,0.3); border-radius: 6px; }
        .pm-close {
          position: absolute; top: 20px; right: 20px; z-index: 10;
          width: 40px; height: 40px; border-radius: 50%;
          background: white; border: 1px solid rgba(135,163,141,0.15);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-mid); transition: all 0.2s ease;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
        }
        .pm-close:hover { background: var(--green-deep); color: white; transform: rotate(90deg); }
        .pm-hero { position: relative; height: 240px; overflow: hidden; border-radius: 24px 24px 0 0; }
        .pm-hero__gradient { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 20%, rgba(0,0,0,0.5) 100%); }
        .pm-hero__content { position: absolute; bottom: 0; left: 0; right: 0; padding: 32px; }
        .pm-hero__tag { display: inline-block; font-size: 0.65rem; font-weight: 700; padding: 4px 12px; border-radius: 999px; margin-bottom: 10px; backdrop-filter: blur(8px); }
        .pm-hero__title { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.8rem; color: white; letter-spacing: -0.03em; line-height: 1.15; margin: 0 0 6px; }
        .pm-hero__desc { font-size: 0.88rem; color: rgba(255,255,255,0.8); line-height: 1.6; max-width: 540px; }
        .pm-body { padding: 36px 32px 40px; }
        .pm-section-label { display: flex; align-items: center; gap: 10px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-light); margin-bottom: 20px; }
        .pm-section-label::after { content: ''; flex: 1; height: 1px; background: linear-gradient(90deg, rgba(135,163,141,0.2), transparent); }
        .pm-products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        @media (max-width: 720px) { .pm-products-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 480px) { .pm-products-grid { grid-template-columns: 1fr; } }
        .pm-product-card { background: white; border-radius: 16px; overflow: hidden; border: 1px solid rgba(135,163,141,0.1); transition: all 0.25s ease; animation: pmItemIn 0.4s ease backwards; }
        .pm-product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(45,74,62,0.1); border-color: rgba(135,163,141,0.25); }
        .pm-product-card__img { position: relative; height: 160px; overflow: hidden; background: var(--cream-dark); }
        .pm-product-card__body { padding: 14px 16px 16px; }
        .pm-product-card__name { font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text-dark); margin-bottom: 4px; }
        .pm-product-card__desc { font-size: 0.76rem; color: var(--text-mid); line-height: 1.5; }
        .pm-empty { text-align: center; padding: 48px 24px; color: var(--text-light); }
        .pm-empty__icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(135,163,141,0.08); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; }
        .pm-composition { display: flex; flex-wrap: wrap; gap: 8px; }
        .pm-composition__item { display: flex; align-items: center; gap: 8px; background: white; padding: 8px 14px; border-radius: 10px; font-size: 0.8rem; color: var(--text-mid); border: 1px solid rgba(135,163,141,0.1); }
        .pm-composition__dot { width: 6px; height: 6px; border-radius: 50%; background: var(--sage); flex-shrink: 0; }
        .pm-footer { display: flex; align-items: center; justify-content: space-between; padding: 20px 32px; border-top: 1px solid rgba(135,163,141,0.1); background: white; border-radius: 0 0 24px 24px; }
        .pm-footer__price { font-family: 'Manrope', sans-serif; font-weight: 900; font-size: 1.5rem; color: var(--text-dark); letter-spacing: -0.03em; }
        .pm-footer__note { font-size: 0.72rem; color: var(--text-light); font-weight: 500; }
        .pm-footer__cta { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; background: var(--green-deep); color: white; border-radius: 12px; font-family: 'Manrope', sans-serif; font-weight: 700; font-size: 0.88rem; text-decoration: none; border: 2px solid var(--green-deep); transition: all 0.2s ease; cursor: pointer; }
        .pm-footer__cta:hover { background: transparent; color: var(--green-deep); }
      `}</style>

      <div className="pm-modal">
        <button className="pm-close" onClick={onClose} aria-label="Fermer"><X size={18} strokeWidth={2.5} /></button>
        <div className="pm-hero">
          <Image src={product.photo} alt={product.photoAlt} fill style={{ objectFit: "cover" }} sizes="(max-width: 720px) 100vw, 50vw" />
          <div className="pm-hero__gradient" />
          <div className="pm-hero__content">
            <div className="pm-hero__tag" style={{ background: product.tagBg, color: product.tagColor }}>{product.tag}</div>
            <h2 className="pm-hero__title">{product.name}</h2>
            <p className="pm-hero__desc">{product.description}</p>
          </div>
        </div>
        <div className="pm-body">
          {details.length > 0 && (
            <>
              <div className="pm-section-label">Ce qui compose ce coffret</div>
              <div className="pm-products-grid">
                {details.map((dp, i) => (
                  <div key={i} className="pm-product-card" style={{ animationDelay: `${i * 60}ms` }}>
                    {dp.image ? (
                      <div className="pm-product-card__img"><Image src={dp.image} alt={dp.name} fill style={{ objectFit: "cover" }} sizes="(max-width: 480px) 100vw, (max-width: 720px) 50vw, 33vw" /></div>
                    ) : (
                      <div className="pm-product-card__img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><Package size={32} style={{ color: "var(--text-light)" }} /></div>
                    )}
                    <div className="pm-product-card__body">
                      <div className="pm-product-card__name">{dp.name}</div>
                      {dp.description && <div className="pm-product-card__desc">{dp.description}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="pm-section-label">{details.length > 0 ? "Liste complète" : "Composition du coffret"}</div>
          <div className="pm-composition">
            {product.composition.map((item, i) => (
              <div key={i} className="pm-composition__item"><span className="pm-composition__dot" />{item}</div>
            ))}
          </div>
        </div>
        <div className="pm-footer">
          <div>
            <div className="pm-footer__price">{product.price}</div>
            <div className="pm-footer__note">{product.priceNote}</div>
          </div>
          <a href="#devis" className="pm-footer__cta" onClick={onClose}>Demander un devis <ArrowRight size={15} /></a>
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
    tag: "Toutes occasions", tagBg: "rgba(232,168,124,0.18)", tagColor: "#B8744A",
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

  const formatPrice = (ttcStr: string) => {
    const num = parseInt(ttcStr.replace(/[^\d]/g, ""), 10);
    if (!num) return ttcStr;
    if (showHT) {
      const ht = Math.round(num / 1.2);
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
          font-family: 'Manrope', sans-serif; font-weight: 600;
          font-size: 0.73rem; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1.5px solid rgba(200,180,160,0.25);
          background: rgba(255,248,240,0.8); color: var(--text-mid);
        }
        .px-pill:hover {
          border-color: var(--sage);
          color: var(--text-dark);
          background: white;
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
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", border: "none",
              background: "var(--green-deep)", color: "white",
              boxShadow: "0 6px 20px rgba(45,74,62,0.2)",
            }}>
              Nos coffrets
            </button>
            <button onClick={() => onSwitchTab("simulateur")} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 22px", borderRadius: "999px",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem",
              cursor: "pointer", background: "white", color: "var(--text-mid)",
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
          fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.04em",
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
              {p.name} · {formatPrice(p.price)}
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
            background: white;
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
            <div style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--sage)", marginBottom: "10px", fontFamily: "'Manrope', sans-serif" }}>
              {current.subtitle}
            </div>
            <h3 style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 900,
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

            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "9px 16px", background: "rgba(45,74,62,0.06)",
              borderRadius: "10px", border: "1.5px solid rgba(45,74,62,0.2)",
              fontSize: "0.76rem", fontWeight: 700, color: "var(--green-deep)",
              marginBottom: "28px", width: "fit-content",
              fontFamily: "'Manrope', sans-serif",
            }}>
              <Leaf size={13} /> 100% exonéré de charges URSSAF
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                  <span style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 900,
                    fontSize: "2.2rem", color: "var(--green-deep)", letterSpacing: "-0.03em", lineHeight: 1,
                    textDecoration: "underline", textDecorationColor: "rgba(135,163,141,0.3)",
                    textUnderlineOffset: "6px", textDecorationThickness: "3px",
                  }}>
                    {formatPrice(current.price)}
                  </span>
                  <div style={{
                    display: "inline-flex", background: "var(--cream-dark)", borderRadius: "999px",
                    padding: "2px", border: "1px solid rgba(135,163,141,0.1)",
                  }}>
                    {[true, false].map((ht) => (
                      <button key={String(ht)} onClick={() => setShowHT(ht)} style={{
                        padding: "4px 10px", borderRadius: "999px", border: "none",
                        fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.65rem",
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
                  borderRadius: "14px", fontFamily: "'Manrope', sans-serif", fontWeight: 700,
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
