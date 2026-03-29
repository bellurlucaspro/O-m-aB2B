"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Calculator, TrendingDown, Zap } from "lucide-react";
import { gsap, ScrollTrigger, ease } from "@/lib/motion";

interface SimulatorProduct {
  id: string;
  label: string;
  name: string;
  basePrice: number;
}

interface PriceSimulatorProps {
  products?: SimulatorProduct[];
}

const DEFAULT_PRODUCTS: SimulatorProduct[] = [
  { id: "grossesse", label: "Grossesse", name: "Coffret Grossesse", basePrice: 40 },
  { id: "naissance", label: "Naissance", name: "Coffret Naissance", basePrice: 60 },
  { id: "fetes", label: "Fêtes & Noël", name: "Coffret Gourmet", basePrice: 45 },
  { id: "events", label: "Petite Attention", name: "Petite Attention", basePrice: 8 },
];

const TIERS = [
  { min: 1, max: 19, discount: 0, label: "Base" },
  { min: 20, max: 99, discount: 5, label: "-5%" },
  { min: 100, max: 199, discount: 10, label: "-10%" },
  { min: 200, max: Infinity, discount: 15, label: "-15%" },
];

function getTier(qty: number) { return TIERS.find((t) => qty >= t.min && qty <= t.max)!; }
function getNextTier(qty: number) {
  const idx = TIERS.findIndex((t) => qty >= t.min && qty <= t.max);
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null;
}

export default function PriceSimulator({ products = DEFAULT_PRODUCTS }: PriceSimulatorProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [selectedProduct, setSelectedProduct] = useState(products[0]);
  const [quantity, setQuantity] = useState(25);
  const [inputQty, setInputQty] = useState("25");

  const tier = getTier(quantity);
  const nextTier = getNextTier(quantity);
  const unitPrice = selectedProduct.basePrice * (1 - tier.discount / 100);
  const totalPrice = unitPrice * quantity;
  const savings = (selectedProduct.basePrice - unitPrice) * quantity;

  const handleSlider = (v: number) => { setQuantity(v); setInputQty(String(v)); };
  const handleInput = (v: string) => { setInputQty(v); const n = parseInt(v); if (!isNaN(n) && n >= 1 && n <= 300) setQuantity(n); };

  // Animate price change
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(".sim-total-num", { scale: 1.1, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out" });
  }, [totalPrice]);

  // Entrance
  useEffect(() => {
    if (!ref.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".sim-main",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: ease.enter,
          scrollTrigger: { trigger: ref.current, start: "top 80%", toggleActions: "play none none none" } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} style={{ padding: "40px 0 80px", position: "relative" }}>
      <style>{`
        .sim-prod-btn {
          flex: 1; padding: 14px 8px; border: none; border-radius: 14px;
          font-family: 'Manrope', sans-serif; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-align: center; position: relative; overflow: hidden;
        }
        .sim-prod-btn--active {
          background: var(--green-deep); color: white;
          box-shadow: 0 8px 24px rgba(45,74,62,0.2);
          transform: translateY(-2px);
        }
        .sim-prod-btn--inactive {
          background: transparent; color: var(--text-mid);
        }
        .sim-prod-btn--inactive:hover {
          background: rgba(135,163,141,0.06);
        }
        .sim-tier-step {
          flex: 1; text-align: center; padding: 10px 4px;
          border-radius: 10px; transition: all 0.3s ease;
          cursor: default;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--green-deep); cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 12px rgba(45,74,62,0.35);
        }
        input[type=range]::-moz-range-thumb {
          width: 24px; height: 24px; border-radius: 50%;
          background: var(--green-deep); cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 12px rgba(45,74,62,0.35);
        }
        @media (max-width: 700px) {
          .sim-prod-row { flex-direction: column !important; }
          .sim-result-row { flex-direction: column !important; }
        }
      `}</style>

      <div className="sim-main" style={{ maxWidth: "800px", margin: "0 auto", padding: "0 32px" }}>

        {/* ═══ Product selector ═══ */}
        <div className="sim-prod-row" style={{
          display: "flex", gap: "6px", padding: "6px",
          background: "var(--cream-dark)", borderRadius: "18px",
          marginBottom: "32px",
        }}>
          {products.map((p) => (
            <button key={p.id}
              className={`sim-prod-btn ${selectedProduct.id === p.id ? "sim-prod-btn--active" : "sim-prod-btn--inactive"}`}
              onClick={() => setSelectedProduct(p)}
            >
              <div style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "4px" }}>
                {p.basePrice}€
              </div>
              <div style={{ fontSize: "0.7rem", fontWeight: 600, opacity: 0.8 }}>{p.name}</div>
            </button>
          ))}
        </div>

        {/* ═══ Quantity slider ═══ */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-dark)" }}>
              Quantité
            </span>
            <div style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "white", borderRadius: "10px", padding: "4px 4px 4px 14px",
              border: "1.5px solid rgba(135,163,141,0.15)",
            }}>
              <input type="number" min={1} max={300} value={inputQty}
                onChange={(e) => handleInput(e.target.value)}
                style={{
                  width: "48px", border: "none", outline: "none",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                  fontSize: "1rem", color: "var(--text-dark)", textAlign: "right",
                  background: "transparent",
                }}
              />
              <span style={{
                fontSize: "0.72rem", fontWeight: 600, color: "var(--text-light)",
                background: "var(--cream)", padding: "6px 10px", borderRadius: "8px",
              }}>
                coffrets
              </span>
            </div>
          </div>

          <input type="range" min={1} max={300} value={quantity}
            onChange={(e) => handleSlider(parseInt(e.target.value))}
            style={{
              width: "100%", height: "6px", appearance: "none",
              background: `linear-gradient(to right, var(--green-deep) 0%, var(--green-deep) ${(quantity / 300) * 100}%, rgba(135,163,141,0.15) ${(quantity / 300) * 100}%, rgba(135,163,141,0.15) 100%)`,
              borderRadius: "3px", outline: "none", cursor: "pointer",
            }}
          />

          {/* Tier steps visual */}
          <div style={{ display: "flex", gap: "4px", marginTop: "12px" }}>
            {TIERS.map((t, i) => {
              const isActive = getTier(quantity) === t;
              return (
                <div key={i} className="sim-tier-step" style={{
                  background: isActive ? "var(--green-deep)" : "rgba(135,163,141,0.12)",
                  border: `1px solid ${isActive ? "var(--green-deep)" : "rgba(135,163,141,0.2)"}`,
                }}>
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800,
                    fontSize: isActive ? "0.85rem" : "0.75rem",
                    color: isActive ? "white" : "var(--sage-dark)",
                    marginBottom: "2px",
                  }}>
                    {t.discount > 0 ? `-${t.discount}%` : "Base"}
                  </div>
                  <div style={{
                    fontSize: "0.6rem", fontWeight: 600,
                    color: isActive ? "rgba(255,255,255,0.6)" : "var(--text-light)",
                  }}>
                    {t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══ Next tier nudge ═══ */}
        {nextTier && (
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "12px 16px", borderRadius: "12px",
            background: "rgba(135,163,141,0.06)", border: "1px solid rgba(135,163,141,0.1)",
            marginBottom: "28px",
          }}>
            <Zap size={16} style={{ color: "var(--sage)", flexShrink: 0 }} />
            <p style={{ fontSize: "0.82rem", color: "var(--text-mid)", margin: 0 }}>
              <strong style={{ color: "var(--green-deep)" }}>{nextTier.min - quantity} coffrets de plus</strong> pour débloquer la remise <strong style={{ color: "var(--green-deep)" }}>-{nextTier.discount}%</strong>
            </p>
          </div>
        )}

        {/* ═══ Results ═══ */}
        <div className="sim-result-row" style={{
          display: "flex", gap: "12px", marginBottom: "24px",
        }}>
          {/* Unit price */}
          <div style={{
            flex: 1, padding: "20px", borderRadius: "16px",
            background: "white", border: "1px solid rgba(135,163,141,0.1)",
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
              Prix unitaire
            </div>
            <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "var(--text-dark)", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {unitPrice.toFixed(2)}€
            </div>
            {tier.discount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-light)", textDecoration: "line-through" }}>{selectedProduct.basePrice}€</span>
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "white", background: "var(--sage)", padding: "2px 6px", borderRadius: "999px" }}>-{tier.discount}%</span>
              </div>
            )}
          </div>

          {/* Total — hero card */}
          <div style={{
            flex: 1.3, padding: "20px", borderRadius: "16px",
            background: "var(--green-deep)", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "-15px", right: "-15px", width: "60px", height: "60px", background: "rgba(255,255,255,0.04)", borderRadius: "50%" }} />
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
              Total TTC
            </div>
            <div className="sim-total-num" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "2rem", color: "white", letterSpacing: "-0.03em", lineHeight: 1 }}>
              {totalPrice.toFixed(0)}€
            </div>
            <div style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.5)", marginTop: "6px" }}>
              pour {quantity} coffret{quantity > 1 ? "s" : ""}
            </div>
          </div>

          {/* Savings */}
          <div style={{
            flex: 1, padding: "20px", borderRadius: "16px",
            background: savings > 0 ? "rgba(135,163,141,0.06)" : "white",
            border: `1px solid ${savings > 0 ? "rgba(135,163,141,0.15)" : "rgba(135,163,141,0.1)"}`,
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-light)", marginBottom: "8px" }}>
              Économies
            </div>
            <div style={{
              fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.5rem",
              color: savings > 0 ? "var(--sage-dark)" : "var(--text-light)",
              letterSpacing: "-0.03em", lineHeight: 1,
            }}>
              {savings > 0 ? `${savings.toFixed(0)}€` : "—"}
            </div>
            {savings > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
                <TrendingDown size={12} style={{ color: "var(--sage)" }} />
                <span style={{ fontSize: "0.72rem", color: "var(--sage-dark)", fontWeight: 600 }}>-{tier.discount}% appliqué</span>
              </div>
            )}
          </div>
        </div>

        {/* ═══ CTA ═══ */}
        <a href="#devis" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
          width: "100%", padding: "16px",
          background: "var(--green-deep)", color: "white",
          borderRadius: "14px", fontFamily: "'Manrope', sans-serif",
          fontWeight: 700, fontSize: "0.95rem", textDecoration: "none",
          boxShadow: "0 8px 28px rgba(45,74,62,0.22)",
          transition: "all 0.3s ease",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(45,74,62,0.3)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(45,74,62,0.22)"; }}
        >
          <Calculator size={16} />
          Demander un devis pour {quantity} coffrets
          <ArrowRight size={15} />
        </a>
        <p style={{ textAlign: "center", marginTop: "10px", fontSize: "0.7rem", color: "var(--text-light)" }}>
          Tarifs indicatifs TTC · Contactez-nous pour une offre sur mesure
        </p>
      </div>
    </div>
  );
}
