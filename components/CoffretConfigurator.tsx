"use client";

import { useEffect, useRef, useState } from "react";
import { X, Plus, Minus, Send, CheckCircle2, ArrowRight, ArrowLeft, Package, Sparkles, Percent, Droplets, Gift, Cookie, Paintbrush, Lock, type LucideIcon } from "lucide-react";
import type { CustomProduct, DiscountTier, ConfigurateurSettings } from "@/lib/types";

const ICON_MAP: Record<string, LucideIcon> = {
  Droplets, Gift, Cookie, Paintbrush, Sparkles, Package,
};

const DEFAULT_SETTINGS: ConfigurateurSettings = {
  discountTiers: [
    { min: 5, max: 19, discount: 0, label: "5–19" },
    { min: 20, max: 49, discount: 5, label: "20–49" },
    { min: 50, max: 99, discount: 10, label: "50–99" },
    { min: 100, max: 199, discount: 15, label: "100–199" },
    { min: 200, max: null, discount: 20, label: "200+" },
  ],
  minQuantity: 5,
  quantityStep: 5,
  tvaRate: 20,
  customOptionMinQty: 50,
  categories: [
    { value: "soin", label: "Soins", icon: "Droplets" },
    { value: "accessoire", label: "Accessoires", icon: "Gift" },
    { value: "gourmandise", label: "Gourmandises", icon: "Cookie" },
    { value: "custom", label: "Personnalisation", icon: "Paintbrush" },
  ],
};

function getDiscount(qty: number, tiers: DiscountTier[]) {
  return tiers.find(t => qty >= t.min && qty <= (t.max ?? Infinity)) || tiers[0];
}

interface SelectedItem { product: CustomProduct; qty: number; }

export default function CoffretConfigurator({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [settings, setSettings] = useState<ConfigurateurSettings>(DEFAULT_SETTINGS);
  const [selected, setSelected] = useState<Map<string, SelectedItem>>(new Map());
  const [coffretQty, setCoffretQty] = useState(10);
  const [step, setStep] = useState<"build" | "contact">("build");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ company: "", representative: "", email: "", phone: "", message: "" });
  const [activeCategory, setActiveCategory] = useState<string>("soin");

  // When settings load, ensure activeCategory is a valid category from settings
  useEffect(() => {
    const cats = settings.categories || [];
    if (!cats.length) return;
    if (!cats.some(c => c.value === activeCategory)) {
      // Prefer first category with products, else first category overall
      const firstWithProducts = cats.find(c => products.some(p => p.category === c.value));
      setActiveCategory((firstWithProducts || cats[0]).value);
    }
  }, [settings, products, activeCategory]);

  // Auto-remove custom options if qty drops below customOptionMinQty
  useEffect(() => {
    const minQty = settings.customOptionMinQty ?? 50;
    if (coffretQty >= minQty) return;
    let changed = false;
    const next = new Map(selected);
    selected.forEach((item, key) => {
      if (item.product.isCustomOption || item.product.category === "custom") {
        next.delete(key); changed = true;
      }
    });
    if (changed) setSelected(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coffretQty, settings.customOptionMinQty]);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/custom-products").then(r => r.json()).then(setProducts).catch(() => {});
    fetch("/api/configurateur-settings").then(r => r.json()).then(setSettings).catch(() => {});
    window.dispatchEvent(new Event("lenis:stop"));
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; document.documentElement.style.overflow = ""; window.dispatchEvent(new Event("lenis:start")); };
  }, [open]);

  if (!open) return null;

  const toggle = (p: CustomProduct, delta: number) => {
    const next = new Map(selected);
    const newQty = (next.get(p.id)?.qty || 0) + delta;
    if (newQty <= 0) next.delete(p.id); else next.set(p.id, { product: p, qty: newQty });
    setSelected(next);
  };

  const items = Array.from(selected.values());
  const unitHT = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const tier = getDiscount(coffretQty, settings.discountTiers);
  const discountFactor = 1 - tier.discount / 100;
  const discountedUnitHT = Math.round(unitHT * discountFactor);
  const totalHT = discountedUnitHT * coffretQty;
  // Per-product TVA: weighted TTC calculation
  const unitTTC = items.reduce((s, i) => {
    const rate = (i.product.tvaRate ?? settings.tvaRate) / 100;
    return s + (i.product.price * i.qty) * (1 + rate);
  }, 0);
  const discountedUnitTTC = Math.round(unitTTC * discountFactor);
  const totalTTC = discountedUnitTTC * coffretQty;

  // VAT breakdown per rate (after discount, for all coffrets)
  const tvaBreakdown = items.reduce<Record<string, { baseHT: number; tva: number }>>((acc, i) => {
    const rate = i.product.tvaRate ?? settings.tvaRate;
    const key = String(rate);
    const lineHT = i.product.price * i.qty * discountFactor * coffretQty;
    const lineTVA = lineHT * (rate / 100);
    if (!acc[key]) acc[key] = { baseHT: 0, tva: 0 };
    acc[key].baseHT += lineHT;
    acc[key].tva += lineTVA;
    return acc;
  }, {});
  const tvaBreakdownList = Object.entries(tvaBreakdown)
    .map(([rate, { baseHT, tva }]) => ({ rate: parseFloat(rate), baseHT: Math.round(baseHT), tva: Math.round(tva) }))
    .sort((a, b) => a.rate - b.rate);

  const customOptionMinQty = settings.customOptionMinQty ?? 50;
  const configCategories = settings.categories || DEFAULT_SETTINGS.categories || [];
  // Show ALL configured categories (even empty ones) so admin changes are immediately visible
  const categories = configCategories.map(c => c.value);
  const filteredProducts = products.filter(p => p.category === activeCategory);
  const getCategoryInfo = (cat: string) => {
    const found = configCategories.find(c => c.value === cat);
    return {
      label: found?.label || cat,
      icon: (found?.icon && ICON_MAP[found.icon]) || Package,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form, quantity: String(coffretQty),
          customCoffret: {
            products: items.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price * i.qty, qty: i.qty })),
            totalHT, totalTTC, quantity: coffretQty,
          },
        }),
      });
      setSent(true);
    } catch { alert("Erreur, veuillez réessayer."); }
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: "12px",
    border: "1.5px solid rgba(135,163,141,0.12)", background: "white",
    fontSize: "0.85rem", outline: "none", fontFamily: "'Inter', sans-serif",
    transition: "border-color 0.2s ease",
  };

  return (
    <div onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{
      position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "16px",
    }}>
      <style>{`
        .cfg { background: #F5F2EA; border-radius: 24px; max-width: 1000px; width: 100%; max-height: 92vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.2); }
        .cfg-body { flex: 1; overflow-y: auto; min-height: 0; overscroll-behavior: contain; }
        .cfg-body::-webkit-scrollbar { width: 4px; }
        .cfg-body::-webkit-scrollbar-thumb { background: rgba(135,163,141,0.25); border-radius: 2px; }
        .cfg-cat-btn {
          padding: 9px 20px; border-radius: 999px; border: 1.5px solid rgba(135,163,141,0.15);
          background: white; cursor: pointer; font-family: 'Manrope', sans-serif;
          font-weight: 700; font-size: 0.78rem; color: var(--text-mid);
          transition: all 0.25s ease; display: flex; align-items: center; gap: 7px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.03);
        }
        .cfg-cat-btn:hover { border-color: var(--sage); color: var(--green-deep); box-shadow: 0 2px 8px rgba(45,74,62,0.06); }
        .cfg-cat-btn--active { background: var(--green-deep); color: white; border-color: var(--green-deep); box-shadow: 0 4px 12px rgba(45,74,62,0.2); }
        .cfg-card {
          border-radius: 16px; border: 2px solid transparent;
          background: white; overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); cursor: pointer;
          box-shadow: 0 2px 8px rgba(45,74,62,0.04);
        }
        .cfg-card:hover { border-color: rgba(135,163,141,0.18); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,74,62,0.08); }
        .cfg-card--selected { border-color: var(--sage) !important; box-shadow: 0 0 0 3px rgba(135,163,141,0.12), 0 4px 16px rgba(45,74,62,0.06); }
        .cfg-card-img {
          width: 100%; height: 110px; object-fit: cover; display: block;
          background: var(--cream-dark);
        }
        @media (max-width: 600px) {
          .cfg-products { grid-template-columns: repeat(2, 1fr) !important; }
          .cfg-card-img { height: 80px; }
        }
      `}</style>

      <div ref={modalRef} className="cfg" data-lenis-prevent>
        {/* ── Header ── */}
        <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid rgba(135,163,141,0.1)", flexShrink: 0, display: "flex", alignItems: "flex-start", justifyContent: "space-between", background: "white" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(45,74,62,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Package size={16} strokeWidth={2.2} style={{ color: "var(--green-deep)" }} />
              </div>
              <h2 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.18rem", color: "var(--green-deep)", margin: 0, letterSpacing: "-0.02em" }}>
                {step === "build" ? "Composez votre coffret" : sent ? "Demande envoyée !" : "Finalisez votre devis"}
              </h2>
            </div>
            {step === "build" && (
              <p style={{ fontSize: "0.72rem", color: "var(--text-mid)", margin: 0, paddingLeft: "42px" }}>
                {items.length} produit{items.length !== 1 ? "s" : ""} sélectionné{items.length !== 1 ? "s" : ""} · {coffretQty} coffret{coffretQty > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width: "34px", height: "34px", borderRadius: "10px", background: "rgba(45,74,62,0.05)", border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-mid)", flexShrink: 0,
            transition: "all 0.2s ease",
          }}><X size={15} strokeWidth={2.2} /></button>
        </div>

        {/* ── Body ── */}
        <div className="cfg-body" style={{ padding: step === "build" ? "20px 28px" : "24px 28px" }}>
          {step === "build" ? (
            <>
              {/* Quantity + discount tier */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "22px" }}>
                <div style={{ padding: "18px 20px", borderRadius: "16px", background: "white", border: "1px solid rgba(135,163,141,0.08)" }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 800, color: "var(--sage-dark)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Quantité</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <button onClick={() => setCoffretQty(Math.max(settings.minQuantity, coffretQty - settings.quantityStep))} style={{ width: "34px", height: "34px", borderRadius: "10px", border: "1.5px solid rgba(135,163,141,0.15)", background: "#F5F2EA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-deep)", padding: 0, transition: "all 0.2s ease" }}><Minus size={14} strokeWidth={2.5} /></button>
                    <input type="number" min={settings.minQuantity} value={coffretQty} onChange={e => setCoffretQty(Math.max(settings.minQuantity, parseInt(e.target.value) || settings.minQuantity))} style={{
                      width: "56px", textAlign: "center", fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.3rem",
                      color: "var(--green-deep)", border: "none", background: "transparent", outline: "none",
                    }} />
                    <button onClick={() => setCoffretQty(coffretQty + settings.quantityStep)} style={{ width: "34px", height: "34px", borderRadius: "10px", border: "1.5px solid rgba(135,163,141,0.15)", background: "#F5F2EA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-deep)", padding: 0, transition: "all 0.2s ease" }}><Plus size={14} strokeWidth={2.5} /></button>
                  </div>
                </div>

                {/* Discount tiers */}
                <div style={{ padding: "18px 20px", borderRadius: "16px", background: tier.discount > 0 ? "rgba(45,74,62,0.04)" : "white", border: tier.discount > 0 ? "1px solid rgba(135,163,141,0.15)" : "1px solid rgba(135,163,141,0.08)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.65rem", fontWeight: 800, color: tier.discount > 0 ? "var(--green-deep)" : "var(--sage-dark)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
                    <Percent size={12} strokeWidth={2.5} />
                    {tier.discount > 0 ? `−${tier.discount}% appliqué` : "Barème dégressif"}
                  </div>
                  <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                    {settings.discountTiers.map(t => (
                      <div key={t.label} style={{
                        padding: "4px 9px", borderRadius: "8px", fontSize: "0.62rem", fontWeight: 700,
                        background: t.label === tier.label ? "var(--green-deep)" : "rgba(135,163,141,0.06)",
                        color: t.label === tier.label ? "white" : "var(--text-light)",
                        fontFamily: "'Manrope', sans-serif",
                        transition: "all 0.25s ease",
                      }}>
                        {t.label} : {t.discount > 0 ? `−${t.discount}%` : "base"}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Category tabs */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "18px", flexWrap: "wrap" }}>
                {categories.map(cat => {
                  const info = getCategoryInfo(cat);
                  const Icon = info.icon;
                  const count = selected.size > 0 ? Array.from(selected.values()).filter(s => s.product.category === cat).length : 0;
                  const isActive = activeCategory === cat;
                  return (
                    <button key={cat} className={`cfg-cat-btn ${isActive ? "cfg-cat-btn--active" : ""}`} onClick={() => setActiveCategory(cat)}>
                      <Icon size={14} strokeWidth={2.2} />
                      {info.label}
                      {count > 0 && <span style={{ background: isActive ? "rgba(255,255,255,0.25)" : "var(--green-deep)", color: "white", padding: "1px 7px", borderRadius: "999px", fontSize: "0.6rem", fontWeight: 800, lineHeight: "1.5" }}>{count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Empty state */}
              {filteredProducts.length === 0 && (
                <div style={{
                  padding: "48px 24px", textAlign: "center",
                  background: "white", borderRadius: "16px",
                  border: "1px dashed rgba(135,163,141,0.25)",
                }}>
                  <Package size={28} style={{ color: "var(--text-light)", opacity: 0.4, margin: "0 auto 10px" }} />
                  <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem", color: "var(--text-mid)", margin: "0 0 4px" }}>
                    Aucun produit dans cette catégorie
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-light)", margin: 0 }}>
                    Nouveaux produits à venir prochainement
                  </p>
                </div>
              )}

              {/* Products grid */}
              <div className="cfg-products" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {filteredProducts.map(p => {
                  const sel = selected.get(p.id);
                  const qty = sel?.qty || 0;
                  const isCustomOpt = p.isCustomOption || p.category === "custom";
                  const locked = isCustomOpt && coffretQty < customOptionMinQty;
                  return (
                    <div
                      key={p.id}
                      className={`cfg-card ${qty > 0 ? "cfg-card--selected" : ""} ${locked ? "cfg-card--locked" : ""}`}
                      onClick={() => !locked && qty === 0 && toggle(p, 1)}
                      style={locked ? { opacity: 0.6, cursor: "not-allowed" } : undefined}
                    >
                      {/* Image */}
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="cfg-card-img" />
                      ) : (
                        <div className="cfg-card-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {isCustomOpt ? <Sparkles size={24} style={{ color: "var(--accent-terracotta)", opacity: 0.4 }} /> : <Package size={24} style={{ color: "var(--text-light)", opacity: 0.3 }} />}
                        </div>
                      )}

                      <div style={{ padding: "12px 14px" }}>
                        <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.78rem", color: "var(--text-dark)", marginBottom: "2px", lineHeight: 1.3 }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-light)", marginBottom: "8px" }}>
                          {p.description}
                        </div>

                        {locked && (
                          <div style={{
                            display: "flex", alignItems: "center", gap: "4px",
                            padding: "4px 8px", borderRadius: "6px", marginBottom: "8px",
                            background: "rgba(232,168,124,0.12)", border: "1px solid rgba(232,168,124,0.25)",
                            fontSize: "0.58rem", fontWeight: 700, color: "var(--accent-terracotta)",
                            fontFamily: "'Manrope', sans-serif",
                          }}>
                            <Lock size={9} strokeWidth={2.5} />
                            À partir de {customOptionMinQty} coffrets
                          </div>
                        )}

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "0.88rem", color: "var(--green-deep)" }}>
                            {(p.price / 100).toFixed(2)}€
                            <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "var(--text-light)", marginLeft: "2px" }}>HT</span>
                          </span>

                          {qty > 0 && !locked ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#F5F2EA", borderRadius: "10px", padding: "3px" }} onClick={e => e.stopPropagation()}>
                              <button onClick={() => toggle(p, -1)} style={{ width: "26px", height: "26px", borderRadius: "8px", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-deep)", padding: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}><Minus size={12} strokeWidth={2.5} /></button>
                              <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "0.82rem", color: "var(--green-deep)", minWidth: "20px", textAlign: "center" }}>{qty}</span>
                              <button onClick={() => toggle(p, 1)} style={{ width: "26px", height: "26px", borderRadius: "8px", border: "none", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green-deep)", padding: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}><Plus size={12} strokeWidth={2.5} /></button>
                            </div>
                          ) : locked ? (
                            <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "rgba(135,163,141,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Lock size={12} strokeWidth={2.5} style={{ color: "var(--text-light)" }} />
                            </div>
                          ) : (
                            <div style={{ width: "28px", height: "28px", borderRadius: "9px", background: "var(--green-deep)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(45,74,62,0.2)" }}>
                              <Plus size={14} strokeWidth={2.5} style={{ color: "white" }} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : sent ? (
            <div style={{ textAlign: "center", padding: "48px 20px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, var(--sage), var(--green-deep))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(135,163,141,0.25)" }}>
                <CheckCircle2 size={28} style={{ color: "white" }} />
              </div>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "var(--text-dark)", marginBottom: "8px" }}>Composition envoyée !</h3>
              <p style={{ fontSize: "0.88rem", color: "var(--text-mid)", lineHeight: 1.6 }}>Notre équipe revient vers vous sous 24h.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="cfg-form" style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Recap */}
              <div style={{ padding: "18px 20px", borderRadius: "16px", background: "white", border: "1px solid rgba(135,163,141,0.08)", marginBottom: "4px" }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
                  Récapitulatif · {coffretQty} coffret{coffretQty > 1 ? "s" : ""}
                  {tier.discount > 0 && <span style={{ color: "var(--green-deep)", marginLeft: "8px" }}>−{tier.discount}%</span>}
                </div>
                {items.map(i => (
                  <div key={i.product.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "var(--text-mid)", marginBottom: "4px" }}>
                    <span>{i.product.name} ×{i.qty}</span>
                    <span style={{ fontWeight: 700, color: "var(--text-dark)" }}>{((i.product.price * i.qty) / 100).toFixed(2)}€</span>
                  </div>
                ))}
                {/* Subtotal HT */}
                <div style={{ borderTop: "1px solid rgba(135,163,141,0.1)", marginTop: "10px", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                  <span style={{ fontWeight: 700, color: "var(--text-mid)" }}>Sous-total HT × {coffretQty}</span>
                  <span style={{ fontWeight: 800, color: "var(--text-dark)" }}>{(totalHT / 100).toFixed(2)}€</span>
                </div>

                {/* VAT breakdown by rate */}
                {tvaBreakdownList.length > 0 && (
                  <div style={{ marginTop: "6px" }}>
                    {tvaBreakdownList.map(({ rate, baseHT, tva }) => (
                      <div key={rate} style={{
                        display: "flex", justifyContent: "space-between",
                        fontSize: "0.7rem", color: "var(--text-light)",
                        padding: "2px 0",
                      }}>
                        <span>
                          TVA {rate}% <span style={{ opacity: 0.7 }}>(sur {(baseHT / 100).toFixed(2)}€ HT)</span>
                        </span>
                        <span style={{ fontWeight: 600, color: "var(--text-mid)" }}>+{(tva / 100).toFixed(2)}€</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total TTC */}
                <div style={{
                  borderTop: "1px solid rgba(135,163,141,0.15)",
                  marginTop: "10px", paddingTop: "10px",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 900, fontSize: "0.85rem", color: "var(--text-dark)", fontFamily: "'Manrope', sans-serif" }}>Total TTC</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.15rem", color: "var(--green-deep)", letterSpacing: "-0.02em" }}>
                      {(totalTTC / 100).toFixed(2)}€
                    </div>
                    <div style={{ fontSize: "0.62rem", color: "var(--text-light)" }}>
                      soit {(totalHT / 100).toFixed(2)}€ HT
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-light)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Entreprise *</label>
                  <input required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Nom" style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = "var(--sage)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.15)"; }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-light)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nom *</label>
                  <input required value={form.representative} onChange={e => setForm({ ...form, representative: e.target.value })} placeholder="Prénom Nom" style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = "var(--sage)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.15)"; }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-light)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Email pro *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="vous@entreprise.fr" style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = "var(--sage)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.15)"; }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-light)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Téléphone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+33 6 00 00 00 00" style={inputStyle} onFocus={e => { e.currentTarget.style.borderColor = "var(--sage)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.15)"; }} />
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.65rem", fontWeight: 700, color: "var(--text-light)", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Message (optionnel)</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Besoins, délais..." rows={2} style={{ ...inputStyle, resize: "vertical" }} onFocus={e => { e.currentTarget.style.borderColor = "var(--sage)"; }} onBlur={e => { e.currentTarget.style.borderColor = "rgba(135,163,141,0.15)"; }} />
              </div>
            </form>
          )}
        </div>

        {/* ── Footer ── */}
        {!sent && (
          <div style={{ padding: "16px 28px", borderTop: "1px solid rgba(135,163,141,0.1)", flexShrink: 0, background: "white", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            {step === "build" ? (
              <>
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                    <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.2rem", color: "var(--green-deep)", letterSpacing: "-0.03em" }}>
                      {items.length > 0 ? `${(discountedUnitHT / 100).toFixed(2)}€` : "0€"}
                    </span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-light)" }}>HT / coffret</span>
                    {tier.discount > 0 && unitHT > 0 && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-light)", textDecoration: "line-through" }}>
                        {(unitHT / 100).toFixed(2)}€
                      </span>
                    )}
                  </div>
                  {items.length > 0 && (
                    <div style={{ fontSize: "0.65rem", color: "var(--text-light)" }}>
                      × {coffretQty} = <strong style={{ color: "var(--green-deep)" }}>{(totalHT / 100).toFixed(2)}€ HT</strong> ({(totalTTC / 100).toFixed(2)}€ TTC)
                    </div>
                  )}
                </div>
                <button onClick={() => items.length > 0 && setStep("contact")} disabled={items.length === 0} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "14px",
                  background: items.length > 0 ? "var(--green-deep)" : "rgba(135,163,141,0.12)",
                  color: items.length > 0 ? "white" : "var(--text-light)",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem",
                  border: "none", cursor: items.length > 0 ? "pointer" : "default",
                  boxShadow: items.length > 0 ? "0 4px 16px rgba(45,74,62,0.18)" : "none",
                  transition: "all 0.3s ease",
                }}>
                  Demander un devis <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setStep("build")} style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "10px 18px", borderRadius: "10px", border: "1.5px solid rgba(135,163,141,0.15)",
                  background: "transparent", cursor: "pointer", fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600, fontSize: "0.8rem", color: "var(--text-mid)",
                }}>
                  <ArrowLeft size={14} /> Modifier
                </button>
                <button type="submit" form="cfg-form" disabled={sending} style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 24px", borderRadius: "14px", background: "var(--green-deep)", color: "white",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem",
                  border: "none", cursor: sending ? "wait" : "pointer",
                  boxShadow: "0 4px 16px rgba(45,74,62,0.18)", opacity: sending ? 0.8 : 1,
                }}>
                  <Send size={14} /> {sending ? "Envoi..." : "Envoyer"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
