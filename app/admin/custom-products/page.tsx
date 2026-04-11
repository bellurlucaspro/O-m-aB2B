"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Save, Check, ImagePlus, X,
  Percent, Settings2, ChevronDown, ChevronUp, Upload,
  Droplets, Gift, Cookie, Paintbrush, Tag, type LucideIcon,
  Package, Eye, ShoppingBag, TrendingDown, Lock, Info,
  Sparkles,
} from "lucide-react";
import type { ConfigurateurSettings, DiscountTier, ProductCategory } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface CustomProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  image?: string;
  isCustomOption?: boolean;
  tvaRate?: number;
}

const ICON_MAP: Record<string, LucideIcon> = { Droplets, Gift, Cookie, Paintbrush, Tag, Package, Sparkles };
const CATEGORY_COLORS = ["#87A38D", "#5F7263", "#B8860B", "#C06050", "#4A5C4E", "#D4956B"];
const TVA_OPTIONS = [5.5, 10, 20];

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

/* ------------------------------------------------------------------ */
/*  Section nav config                                                 */
/* ------------------------------------------------------------------ */

interface SectionDef { key: SectionKey; label: string; icon: LucideIcon; color: string; desc: string; }
type SectionKey = "catalog" | "pricing" | "settings";

const SECTIONS: SectionDef[] = [
  { key: "catalog",  label: "Catalogue produits", icon: ShoppingBag, color: "#87A38D", desc: "Les produits que les visiteurs peuvent ajouter à leur coffret" },
  { key: "pricing",  label: "Tarifs & remises",   icon: Percent,    color: "#5F7263", desc: "Paliers de remise par quantité + TVA globale" },
  { key: "settings", label: "Règles & catégories",icon: Settings2,  color: "#C06050", desc: "Quantité min, règles de personnalisation, catégories" },
];

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function SectionIntro({ title, description, tip }: { title: string; description: string; tip?: string }) {
  return (
    <div className="cp-intro">
      <h3 className="cp-intro__title">
        <Eye size={14} strokeWidth={2.2} />
        {title}
      </h3>
      <p className="cp-intro__desc">{description}</p>
      {tip ? (
        <p className="cp-intro__tip">
          <Info size={12} strokeWidth={2.5} style={{ color: "#5F7263", flexShrink: 0 }} />
          <span>{tip}</span>
        </p>
      ) : null}
    </div>
  );
}

function ImageUploader({ current, onUpload, onRemove, size = 80 }: { current?: string; onUpload: (url: string) => void; onRemove: () => void; size?: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onUpload(data.url);
    } catch { /* silent */ }
    setUploading(false);
  };

  if (current) {
    return (
      <div style={{ position: "relative", width: size, height: size, borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid #E5E7EB" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={onRemove} style={{
          position: "absolute", top: "4px", right: "4px", width: "22px", height: "22px",
          borderRadius: "50%", background: "rgba(0,0,0,0.7)", border: "none",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
        }}><X size={11} /></button>
      </div>
    );
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button onClick={() => ref.current?.click()} disabled={uploading} style={{
        width: size, height: size, borderRadius: "12px", flexShrink: 0,
        border: "2px dashed #D1D5DB", background: uploading ? "#F3F4F6" : "#FAFBFC",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", gap: "4px", color: "#9CA3AF", transition: "all 0.2s",
        fontFamily: "var(--font-inter)",
      }}>
        {uploading ? <Upload size={18} /> : <ImagePlus size={18} />}
        <span style={{ fontSize: "0.58rem", fontWeight: 600 }}>{uploading ? "..." : "Image"}</span>
      </button>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function CustomProductsAdmin() {
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [rawSettings, setSettings] = useState<ConfigurateurSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>("catalog");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedCatIdx, setExpandedCatIdx] = useState<number | null>(null);
  const [expandedTierIdx, setExpandedTierIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let done = false;

    // Hard timeout: max 5s avant fallback forcé
    const timeout = window.setTimeout(function () {
      if (cancelled || done) return;
      done = true;
      setProducts([]);
      setSettings(DEFAULT_SETTINGS);
      setLoading(false);
    }, 5000);

    // Fetch ultra-simple avec .then() en chaine — pas d'async/await
    function finalize(prods: unknown, setts: unknown) {
      if (cancelled || done) return;
      done = true;
      window.clearTimeout(timeout);
      const safeProds: CustomProduct[] = Array.isArray(prods) ? (prods as CustomProduct[]) : [];
      const s = setts as ConfigurateurSettings | null | undefined;
      const safeSetts: ConfigurateurSettings =
        s && typeof s === "object" && Array.isArray((s as ConfigurateurSettings).discountTiers)
          ? (s as ConfigurateurSettings)
          : DEFAULT_SETTINGS;
      setProducts(safeProds);
      setSettings(safeSetts);
      setLoading(false);
    }

    function parseOrFallback(r: Response, fallback: unknown): Promise<unknown> {
      if (!r.ok) return Promise.resolve(fallback);
      const ct = r.headers.get("content-type") || "";
      if (ct.indexOf("application/json") === -1) return Promise.resolve(fallback);
      return r.json().catch(function () { return fallback; });
    }

    const p1 = fetch("/api/admin/custom-products", { credentials: "include", cache: "no-store" })
      .then(function (r) { return parseOrFallback(r, []); })
      .catch(function () { return []; });

    const p2 = fetch("/api/admin/configurateur-settings", { credentials: "include", cache: "no-store" })
      .then(function (r) { return parseOrFallback(r, DEFAULT_SETTINGS); })
      .catch(function () { return DEFAULT_SETTINGS; });

    Promise.all([p1, p2]).then(function (results) {
      finalize(results[0], results[1]);
    }).catch(function () {
      finalize([], DEFAULT_SETTINGS);
    });

    return function () {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  // Local safe view of settings — tout le JSX qui suit utilise `settings` naturellement
  // mais avec la garantie que tous les champs sont valides
  const settings: ConfigurateurSettings = {
    discountTiers: Array.isArray(rawSettings?.discountTiers) && rawSettings.discountTiers.length > 0
      ? rawSettings.discountTiers
      : DEFAULT_SETTINGS.discountTiers,
    minQuantity: rawSettings?.minQuantity ?? DEFAULT_SETTINGS.minQuantity,
    quantityStep: rawSettings?.quantityStep ?? DEFAULT_SETTINGS.quantityStep,
    tvaRate: rawSettings?.tvaRate ?? DEFAULT_SETTINGS.tvaRate,
    customOptionMinQty: rawSettings?.customOptionMinQty ?? DEFAULT_SETTINGS.customOptionMinQty,
    categories: Array.isArray(rawSettings?.categories) && rawSettings.categories.length > 0
      ? rawSettings.categories
      : DEFAULT_SETTINGS.categories,
  };

  const handleSave = async () => {
    setSaving(true);
    await Promise.all([
      fetch("/api/admin/custom-products", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(products) }),
      fetch("/api/admin/configurateur-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) }),
    ]);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, settings]);

  const addProduct = () => {
    const firstCat = (settings.categories?.[0]?.value) || "soin";
    const newId = `product-${Date.now()}`;
    setProducts([...products, { id: newId, name: "", category: firstCat, price: 0, description: "" }]);
    setExpandedId(newId);
    setFilterCat("all");
  };

  const update = (idx: number, patch: Partial<CustomProduct>) => {
    const next = [...products];
    next[idx] = { ...next[idx], ...patch };
    if (patch.category === "custom") next[idx].isCustomOption = true;
    else if (patch.category) next[idx].isCustomOption = false;
    setProducts(next);
  };

  const remove = (idx: number) => {
    if (!confirm("Supprimer ce produit ?")) return;
    setProducts(products.filter((_, i) => i !== idx));
  };

  const moveProduct = (idx: number, dir: -1 | 1) => {
    const next = [...products];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setProducts(next);
  };

  const updateTier = (idx: number, patch: Partial<DiscountTier>) => {
    const next = { ...settings, discountTiers: [...settings.discountTiers] };
    next.discountTiers[idx] = { ...next.discountTiers[idx], ...patch };
    const t = next.discountTiers[idx];
    t.label = t.max === null ? `${t.min}+` : `${t.min}–${t.max}`;
    setSettings(next);
  };

  const addTier = () => {
    const tiers = [...settings.discountTiers];
    const last = tiers[tiers.length - 1];
    tiers.push({ min: (last?.max ?? 100) + 1, max: null, discount: 0, label: "" });
    const t = tiers[tiers.length - 1];
    t.label = t.max === null ? `${t.min}+` : `${t.min}–${t.max}`;
    setSettings({ ...settings, discountTiers: tiers });
  };

  const removeTier = (idx: number) => {
    setSettings({ ...settings, discountTiers: settings.discountTiers.filter((_, i) => i !== idx) });
  };

  // ⬇️ Loading guard MUST come before any derived computation
  if (loading) return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "60vh", gap: "14px",
      color: "#6b7280", fontSize: "0.9rem",
      fontFamily: "var(--font-inter)",
      padding: "40px 20px",
    }}>
      <div style={{
        width: "32px", height: "32px",
        border: "3px solid #eef0f2",
        borderTopColor: "#5F7263",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <span>Chargement du configurateur…</span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // Derived (uses the safe `settings` shadow above)
  const settingsCats: ProductCategory[] = settings.categories || [];
  const derivedCategories = settingsCats.map((c, i) => ({
    ...c,
    Icon: (c.icon && ICON_MAP[c.icon]) || Tag,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const catLookup = new Map(derivedCategories.map(c => [c.value, c]));
  const filteredProducts = filterCat === "all" ? products : products.filter(p => p.category === filterCat);
  const catCounts = derivedCategories.map(c => ({ ...c, count: products.filter(p => p.category === c.value).length }));

  // Preview sample
  const sampleUnitHT = products.slice(0, 3).reduce((s, p) => s + p.price, 0);
  const sampleQty = 25;
  const sampleTier = settings.discountTiers.find(t => sampleQty >= t.min && sampleQty <= (t.max ?? Infinity)) || settings.discountTiers[0];
  const sampleDiscount = sampleTier?.discount || 0;
  const sampleDiscountedHT = Math.round(sampleUnitHT * (1 - sampleDiscount / 100));
  const sampleTotalHT = sampleDiscountedHT * sampleQty;
  const sampleTotalTTC = Math.round(sampleTotalHT * (1 + settings.tvaRate / 100));

  const activeSectionDef = SECTIONS.find(s => s.key === activeSection)!;

  return (
    <div className="cps-root">
      <style>{styles}</style>

      {/* Top bar */}
      <div className="cp-topbar">
        <div>
          <h1 className="cp-topbar__title">Constructeur de coffret sur-mesure</h1>
          <p className="cp-topbar__subtitle">
            Gérez les produits, prix, remises et règles du mini configurateur visible sur votre site
          </p>
        </div>
        <button
          className={`cp-save ${saving ? "cp-save--saving" : saved ? "cp-save--saved" : ""}`}
          onClick={handleSave}
          disabled={saving}
        >
          {saved ? <><Check size={15} strokeWidth={3} /> Enregistré</> : saving ? <>Enregistrement...</> : <><Save size={15} /> Tout enregistrer</>}
        </button>
      </div>

      <div className="cp-builder">
        {/* ─── Sidebar ─── */}
        <aside className="cp-sidebar">
          <p className="cp-sidebar__label">Sections</p>
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            return (
              <button
                key={s.key}
                className={`cp-sidebar__item ${isActive ? "cp-sidebar__item--active" : ""}`}
                onClick={() => setActiveSection(s.key)}
              >
                <div
                  className="cp-sidebar__icon"
                  style={{
                    background: isActive ? `${s.color}18` : "rgba(0,0,0,0.03)",
                    color: isActive ? s.color : "#9ca3af",
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <div className="cp-sidebar__text">
                  <span className="cp-sidebar__item-label">{s.label}</span>
                  <span className="cp-sidebar__item-desc">{s.desc}</span>
                </div>
              </button>
            );
          })}

          {/* Quick stats */}
          <div className="cp-quick-stats">
            <div className="cp-stat">
              <span className="cp-stat__val">{products.length}</span>
              <span className="cp-stat__label">Produits au catalogue</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat__val">{settings.discountTiers.length}</span>
              <span className="cp-stat__label">Paliers de remise</span>
            </div>
            <div className="cp-stat">
              <span className="cp-stat__val">{(settings.categories || []).length}</span>
              <span className="cp-stat__label">Catégories</span>
            </div>
          </div>
        </aside>

        {/* ─── Editor ─── */}
        <div className="cp-editor">
          {/* Section header */}
          <div className="cp-section-header">
            <div className="cp-section-icon" style={{ background: `${activeSectionDef.color}14`, color: activeSectionDef.color }}>
              <activeSectionDef.icon size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="cp-section-title">{activeSectionDef.label}</h2>
              <p className="cp-section-subtitle">{activeSectionDef.desc}</p>
            </div>
          </div>

          {/* ═══════ SECTION: CATALOG ═══════ */}
          {activeSection === "catalog" && (
            <>
              <SectionIntro
                title="Les produits que vos clients peuvent ajouter à leur coffret"
                description="Chaque produit listé ici apparaît dans le mini configurateur de la page d'accueil. Les visiteurs cliquent dessus pour composer leur coffret sur-mesure. Vous pouvez ajouter une image, un prix HT, une description et choisir la catégorie."
                tip="Les produits marqués comme « Personnalisation » ne sont débloqués qu'à partir d'une certaine quantité de coffrets (voir section Règles)."
              />

              {/* Category filter */}
              <div className="cp-filter-row">
                <button
                  className={`cp-filter ${filterCat === "all" ? "cp-filter--active" : ""}`}
                  onClick={() => setFilterCat("all")}
                >
                  <Package size={13} strokeWidth={2.2} />
                  Tous
                  <span className="cp-filter__count">{products.length}</span>
                </button>
                {catCounts.map(c => {
                  const isActive = filterCat === c.value;
                  return (
                    <button
                      key={c.value}
                      className={`cp-filter ${isActive ? "cp-filter--active" : ""}`}
                      style={isActive ? { background: c.color, borderColor: c.color } : undefined}
                      onClick={() => setFilterCat(c.value)}
                    >
                      <c.Icon size={13} strokeWidth={2.2} />
                      {c.label}
                      <span className="cp-filter__count" style={isActive ? { background: "rgba(255,255,255,0.25)", color: "white" } : undefined}>{c.count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Products list */}
              <div className="cp-products">
                {filteredProducts.length === 0 && (
                  <div className="cp-empty">
                    <Package size={28} style={{ opacity: 0.3 }} />
                    <p>Aucun produit dans cette catégorie</p>
                    <button onClick={addProduct} className="cp-btn-primary">
                      <Plus size={14} /> Ajouter un produit
                    </button>
                  </div>
                )}
                {filteredProducts.map((p) => {
                  const globalIdx = products.findIndex(pp => pp.id === p.id);
                  const catInfo = catLookup.get(p.category);
                  const CatIcon = catInfo?.Icon || Tag;
                  const catColor = catInfo?.color || "#6B7280";
                  const catLabel = catInfo?.label || p.category;
                  const isExpanded = expandedId === p.id;
                  const isNew = !p.name;
                  const ttc = (p.price / 100) * (1 + (p.tvaRate ?? settings.tvaRate) / 100);

                  return (
                    <div key={p.id} className={`cp-card ${isNew ? "cp-card--new" : ""} ${isExpanded ? "cp-card--expanded" : ""}`}>
                      {/* Collapsed row */}
                      <button
                        className="cp-card__header"
                        onClick={() => setExpandedId(isExpanded ? null : p.id)}
                      >
                        {/* Thumbnail */}
                        <div className="cp-card__thumb">
                          {p.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.image} alt="" />
                          ) : (
                            <CatIcon size={20} style={{ color: catColor, opacity: 0.5 }} />
                          )}
                        </div>

                        {/* Info */}
                        <div className="cp-card__info">
                          <div className="cp-card__name">
                            {p.name || <span className="cp-card__name--empty">Nouveau produit · cliquez pour éditer</span>}
                          </div>
                          <div className="cp-card__meta">
                            <span className="cp-card__cat" style={{ background: `${catColor}14`, color: catColor }}>
                              <CatIcon size={10} strokeWidth={2.5} /> {catLabel}
                            </span>
                            {p.description && <span className="cp-card__desc">{p.description}</span>}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="cp-card__price">
                          <span className="cp-card__price-ht">{(p.price / 100).toFixed(2)}€ <span className="cp-card__price-unit">HT</span></span>
                          <span className="cp-card__price-ttc">{ttc.toFixed(2)}€ TTC</span>
                        </div>

                        {/* Chevron */}
                        <ChevronDown size={16} className={`cp-card__chevron ${isExpanded ? "cp-card__chevron--open" : ""}`} />
                      </button>

                      {/* Expanded editor */}
                      {isExpanded && (
                        <div className="cp-card__body">
                          <div className="cp-card__edit">
                            <ImageUploader
                              current={p.image}
                              onUpload={url => update(globalIdx, { image: url })}
                              onRemove={() => update(globalIdx, { image: undefined })}
                              size={100}
                            />
                            <div className="cp-card__fields">
                              <div className="cp-field">
                                <label className="cp-label">Nom du produit</label>
                                <input className="cp-input" value={p.name} onChange={e => update(globalIdx, { name: e.target.value })} placeholder="Ex : Huile anti-vergetures bio" />
                              </div>
                              <div className="cp-field">
                                <label className="cp-label">Description courte</label>
                                <input className="cp-input" value={p.description || ""} onChange={e => update(globalIdx, { description: e.target.value })} placeholder="Ex : Soin naturel pour la peau sensible" />
                              </div>
                            </div>
                          </div>

                          <div className="cp-card__row">
                            <div className="cp-field">
                              <label className="cp-label">Catégorie</label>
                              <select className="cp-input" value={p.category} onChange={e => update(globalIdx, { category: e.target.value })}>
                                {derivedCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                            </div>
                            <div className="cp-field">
                              <label className="cp-label">Prix HT</label>
                              <div className="cp-price-input">
                                <input
                                  type="number"
                                  className="cp-input"
                                  value={(p.price / 100).toFixed(2)}
                                  step="0.01"
                                  onChange={e => update(globalIdx, { price: Math.round(parseFloat(e.target.value || "0") * 100) })}
                                />
                                <span className="cp-price-input__suffix">€</span>
                              </div>
                            </div>
                            <div className="cp-field">
                              <label className="cp-label">TVA applicable</label>
                              <div className="cp-tva-group">
                                {TVA_OPTIONS.map(t => (
                                  <button
                                    key={t}
                                    type="button"
                                    className={`cp-tva-btn ${((p.tvaRate ?? settings.tvaRate) === t) ? "cp-tva-btn--active" : ""}`}
                                    onClick={() => update(globalIdx, { tvaRate: t })}
                                  >
                                    {t}%
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="cp-card__preview">
                            <div className="cp-card__preview-line">
                              <span className="cp-card__preview-label">Prix TTC calculé automatiquement</span>
                              <strong className="cp-card__preview-val">{ttc.toFixed(2)}€</strong>
                            </div>
                            <div className="cp-card__preview-hint">
                              Soit {(p.price / 100).toFixed(2)}€ HT + {((p.tvaRate ?? settings.tvaRate))}% de TVA
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="cp-card__actions">
                            <div style={{ display: "flex", gap: "6px" }}>
                              <button onClick={() => moveProduct(globalIdx, -1)} disabled={globalIdx === 0} className="cp-btn-ghost">
                                <ChevronUp size={13} /> Monter
                              </button>
                              <button onClick={() => moveProduct(globalIdx, 1)} disabled={globalIdx === products.length - 1} className="cp-btn-ghost">
                                <ChevronDown size={13} /> Descendre
                              </button>
                            </div>
                            <button onClick={() => remove(globalIdx)} className="cp-btn-danger">
                              <Trash2 size={13} /> Supprimer ce produit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredProducts.length > 0 && (
                  <button onClick={addProduct} className="cp-add-btn">
                    <Plus size={16} /> Ajouter un nouveau produit
                  </button>
                )}
              </div>
            </>
          )}

          {/* ═══════ SECTION: PRICING ═══════ */}
          {activeSection === "pricing" && (
            <>
              <SectionIntro
                title="Remises automatiques selon la quantité commandée"
                description="Plus un client commande de coffrets, plus il bénéficie d'une remise. Créez vos paliers ici : le système applique automatiquement la bonne remise au moment de la simulation."
                tip="Exemple : 5-19 coffrets = prix plein, 20-49 = -5%, 50-99 = -10%, 100+ = -15%. Vous pouvez ajouter autant de paliers que vous voulez."
              />

              {/* Global TVA */}
              <div className="cp-card cp-card--static">
                <div className="cp-panel-header">
                  <Percent size={16} />
                  <h3>TVA globale par défaut</h3>
                </div>
                <p className="cp-panel-desc">Taux appliqué quand un produit n&apos;a pas de TVA spécifique définie.</p>
                <div className="cp-tva-group" style={{ marginTop: "10px" }}>
                  {TVA_OPTIONS.map(t => (
                    <button
                      key={t}
                      type="button"
                      className={`cp-tva-btn cp-tva-btn--large ${settings.tvaRate === t ? "cp-tva-btn--active" : ""}`}
                      onClick={() => setSettings({ ...settings, tvaRate: t })}
                    >
                      {t}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount tiers */}
              <div className="cp-card cp-card--static">
                <div className="cp-panel-header cp-panel-header--with-action">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <TrendingDown size={16} />
                    <h3>Paliers de remise</h3>
                    <span className="cp-count-badge">{settings.discountTiers.length}</span>
                  </div>
                  <button onClick={addTier} className="cp-btn-sm">
                    <Plus size={12} /> Nouveau palier
                  </button>
                </div>

                <div className="cp-tiers">
                  {settings.discountTiers.map((t, i) => {
                    const isExpanded = expandedTierIdx === i;
                    const rangeLabel = t.max === null ? `${t.min}+ coffrets` : `${t.min}–${t.max} coffrets`;
                    return (
                      <div key={i} className={`cp-tier-item ${isExpanded ? "cp-tier-item--expanded" : ""}`}>
                        {/* Compact row */}
                        <button
                          type="button"
                          className="cp-tier-head"
                          onClick={() => setExpandedTierIdx(isExpanded ? null : i)}
                        >
                          <div className="cp-tier__number">{i + 1}</div>
                          <div className="cp-tier-head-text">
                            <span className="cp-tier-head-range">{rangeLabel}</span>
                            <span className="cp-tier-head-discount">
                              {t.discount > 0 ? `−${t.discount}% de remise` : "Prix plein"}
                            </span>
                          </div>
                          <ChevronDown
                            size={15}
                            strokeWidth={2.2}
                            style={{
                              color: "#9ca3af",
                              transition: "transform 0.25s ease",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          />
                        </button>

                        {/* Expanded editor */}
                        {isExpanded && (
                          <div className="cp-tier-body">
                            <div>
                              <label className="cp-mini-label">À partir de</label>
                              <div className="cp-tier-input-wrap">
                                <input
                                  type="number"
                                  value={t.min}
                                  onChange={e => updateTier(i, { min: parseInt(e.target.value) || 0 })}
                                  className="cp-tier-input"
                                />
                                <span className="cp-tier-input-suffix">coffrets</span>
                              </div>
                            </div>
                            <div>
                              <label className="cp-mini-label">Jusqu&apos;à</label>
                              <div className="cp-tier-input-wrap">
                                <input
                                  type="number"
                                  value={t.max ?? ""}
                                  placeholder="∞"
                                  onChange={e => {
                                    const val = e.target.value;
                                    updateTier(i, { max: val === "" ? null : parseInt(val) || 0 });
                                  }}
                                  className="cp-tier-input"
                                />
                                <span className="cp-tier-input-suffix">{t.max === null ? "illimité" : "coffrets"}</span>
                              </div>
                            </div>
                            <div>
                              <label className="cp-mini-label">Remise appliquée</label>
                              <div className="cp-tier-input-wrap">
                                <input
                                  type="number"
                                  value={t.discount}
                                  onChange={e => updateTier(i, { discount: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })}
                                  className="cp-tier-input"
                                />
                                <span className="cp-tier-input-suffix">%</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                removeTier(i);
                                setExpandedTierIdx(null);
                              }}
                              disabled={settings.discountTiers.length <= 1}
                              className="cp-btn-danger"
                              style={{ alignSelf: "flex-start" }}
                            >
                              <Trash2 size={13} strokeWidth={2.2} /> Supprimer ce palier
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live preview */}
              <div className="cp-card cp-card--preview">
                <div className="cp-panel-header">
                  <Sparkles size={16} style={{ color: "#92400E" }} />
                  <h3 style={{ color: "#92400E" }}>Aperçu du calcul en temps réel</h3>
                </div>
                <p className="cp-panel-desc" style={{ color: "#92400E" }}>
                  Simulation d&apos;une commande de <strong>{sampleQty} coffrets</strong> contenant les 3 premiers produits du catalogue.
                </p>
                <div className="cp-preview-grid">
                  <div className="cp-preview-stat">
                    <span className="cp-preview-stat__label">Prix unitaire</span>
                    <span className="cp-preview-stat__val">{(sampleUnitHT / 100).toFixed(2)}€ HT</span>
                    {sampleDiscount > 0 && <span className="cp-preview-stat__discount">−{sampleDiscount}% appliqué</span>}
                  </div>
                  <div className="cp-preview-stat">
                    <span className="cp-preview-stat__label">Total HT</span>
                    <span className="cp-preview-stat__val">{(sampleTotalHT / 100).toFixed(2)}€</span>
                  </div>
                  <div className="cp-preview-stat cp-preview-stat--highlight">
                    <span className="cp-preview-stat__label">Total TTC ({settings.tvaRate}%)</span>
                    <span className="cp-preview-stat__val">{(sampleTotalTTC / 100).toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ═══════ SECTION: SETTINGS ═══════ */}
          {activeSection === "settings" && (
            <>
              <SectionIntro
                title="Règles de commande et gestion des catégories"
                description="Définissez la quantité minimum de coffrets, le pas d'incrémentation, la règle de personnalisation et vos catégories de produits."
                tip="Les catégories sont utilisées pour classer les produits dans le configurateur. Vous pouvez renommer, ajouter ou supprimer des catégories à tout moment."
              />

              {/* Order rules */}
              <div className="cp-card cp-card--static">
                <div className="cp-panel-header">
                  <Settings2 size={16} />
                  <h3>Règles de commande</h3>
                </div>
                <div className="cp-rules-grid">
                  <div>
                    <label className="cp-label">Quantité minimum</label>
                    <div className="cp-price-input">
                      <input
                        type="number"
                        className="cp-input"
                        value={settings.minQuantity}
                        onChange={e => setSettings({ ...settings, minQuantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                      <span className="cp-price-input__suffix">coffrets</span>
                    </div>
                    <p className="cp-hint">Nombre de coffrets minimum commandables en une fois</p>
                  </div>
                  <div>
                    <label className="cp-label">Incrément quantité</label>
                    <div className="cp-price-input">
                      <input
                        type="number"
                        className="cp-input"
                        value={settings.quantityStep}
                        onChange={e => setSettings({ ...settings, quantityStep: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                      <span className="cp-price-input__suffix">par clic</span>
                    </div>
                    <p className="cp-hint">Combien de coffrets ajouter / retirer par clic sur +/−</p>
                  </div>
                  <div>
                    <label className="cp-label">
                      <Lock size={12} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                      Personnalisation dès
                    </label>
                    <div className="cp-price-input">
                      <input
                        type="number"
                        className="cp-input"
                        value={settings.customOptionMinQty ?? 50}
                        onChange={e => setSettings({ ...settings, customOptionMinQty: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                      <span className="cp-price-input__suffix">coffrets</span>
                    </div>
                    <p className="cp-hint">Quantité minimum pour débloquer les options de personnalisation</p>
                  </div>
                </div>
              </div>

              {/* Categories */}
              <div className="cp-card cp-card--static">
                <div className="cp-panel-header cp-panel-header--with-action">
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Tag size={16} />
                    <h3>Catégories de produits</h3>
                    <span className="cp-count-badge">{(settings.categories || []).length}</span>
                  </div>
                  <button
                    onClick={() => {
                      const cats = [...(settings.categories || [])];
                      cats.push({ value: `cat-${Date.now()}`, label: "Nouvelle catégorie", icon: "Tag" });
                      setSettings({ ...settings, categories: cats });
                    }}
                    className="cp-btn-sm"
                  >
                    <Plus size={12} /> Nouvelle catégorie
                  </button>
                </div>

                <div className="cp-categories">
                  {(settings.categories || []).map((c, i) => {
                    const Icon = (c.icon && ICON_MAP[c.icon]) || Tag;
                    const color = CATEGORY_COLORS[i % CATEGORY_COLORS.length];
                    const count = products.filter(p => p.category === c.value).length;
                    const isExpanded = expandedCatIdx === i;
                    return (
                      <div key={i} className={`cp-cat-item ${isExpanded ? "cp-cat-item--expanded" : ""}`}>
                        {/* Compact row */}
                        <button
                          type="button"
                          className="cp-cat-head"
                          onClick={() => setExpandedCatIdx(isExpanded ? null : i)}
                        >
                          <div className="cp-cat-icon" style={{ background: `${color}15`, color }}>
                            <Icon size={16} strokeWidth={2.2} />
                          </div>
                          <div className="cp-cat-head-text">
                            <span className="cp-cat-head-name">{c.label || "(sans nom)"}</span>
                            <span className="cp-cat-head-meta">{count} produit{count !== 1 ? "s" : ""} · {c.value}</span>
                          </div>
                          <ChevronDown
                            size={15}
                            strokeWidth={2.2}
                            style={{
                              color: "#9ca3af",
                              transition: "transform 0.25s ease",
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              flexShrink: 0,
                            }}
                          />
                        </button>

                        {/* Expanded editor */}
                        {isExpanded && (
                          <div className="cp-cat-body">
                            <div>
                              <label className="cp-mini-label">Nom affiché</label>
                              <input
                                className="cp-input"
                                value={c.label}
                                onChange={e => {
                                  const cats = [...(settings.categories || [])];
                                  cats[i] = { ...cats[i], label: e.target.value };
                                  setSettings({ ...settings, categories: cats });
                                }}
                                placeholder="Ex : Soins"
                              />
                            </div>
                            <div>
                              <label className="cp-mini-label">Identifiant technique</label>
                              <input
                                className="cp-input"
                                value={c.value}
                                onChange={e => {
                                  const oldVal = c.value;
                                  const newVal = e.target.value.trim() || oldVal;
                                  const cats = [...(settings.categories || [])];
                                  cats[i] = { ...cats[i], value: newVal };
                                  setSettings({ ...settings, categories: cats });
                                  if (oldVal !== newVal) {
                                    setProducts(products.map(p => p.category === oldVal ? { ...p, category: newVal } : p));
                                  }
                                }}
                                placeholder="ex: soin"
                              />
                              <p className="cp-hint">Utilisé dans le code, en minuscules sans espaces</p>
                            </div>
                            <div>
                              <label className="cp-mini-label">Icône</label>
                              <select
                                className="cp-input"
                                value={c.icon || "Tag"}
                                onChange={e => {
                                  const cats = [...(settings.categories || [])];
                                  cats[i] = { ...cats[i], icon: e.target.value };
                                  setSettings({ ...settings, categories: cats });
                                }}
                              >
                                {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                              </select>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (count > 0 && !confirm(`Cette catégorie contient ${count} produit(s). Supprimer quand même ?`)) return;
                                setSettings({ ...settings, categories: (settings.categories || []).filter((_, idx) => idx !== i) });
                                setExpandedCatIdx(null);
                              }}
                              className="cp-btn-danger"
                              style={{ alignSelf: "flex-start" }}
                            >
                              <Trash2 size={13} strokeWidth={2.2} /> Supprimer cette catégorie
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

  .cps-root {
    font-family: var(--font-inter);
    display: block;
    width: 100%;
    max-width: 100%;
    position: relative;
  }
  .cps-root * { box-sizing: border-box; }

  /* ─── Topbar ─── */
  .cp-topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    padding: 20px 28px;
    background: white;
    border-bottom: 1px solid #eef0f2;
    box-sizing: border-box;
  }
  .cp-topbar__title {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.3rem; color: #1a1f25;
    margin: 0; letter-spacing: -0.025em;
  }
  .cp-topbar__subtitle {
    font-size: 0.8rem; color: #6b7280;
    margin: 4px 0 0; line-height: 1.5;
  }
  .cp-save {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 11px 22px; border-radius: 12px;
    background: #5F7263; color: white; border: none;
    font-family: var(--font-manrope); font-weight: 700; font-size: 0.82rem;
    cursor: pointer; transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(95,114,99,0.2);
    white-space: nowrap;
  }
  .cp-save:hover:not(:disabled) { background: #4A5C4E; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(95,114,99,0.3); }
  .cp-save--saving { background: #9ca3af; cursor: wait; }
  .cp-save--saved { background: #10b981; }

  /* ─── Builder layout ─── */
  .cp-builder {
    display: flex;
    align-items: flex-start;
    box-sizing: border-box;
  }

  /* ─── Sidebar ─── */
  .cp-sidebar {
    width: 280px; flex-shrink: 0;
    background: #fafbfc;
    border-right: 1px solid #eef0f2;
    padding: 18px 14px;
    display: flex; flex-direction: column; gap: 4px;
  }
  .cp-sidebar__label {
    font-size: 0.6rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.1em; color: #9ca3af;
    padding: 0 10px; margin: 0 0 10px;
  }
  .cp-sidebar__item {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 12px 10px; border-radius: 12px;
    border: none; background: transparent; cursor: pointer;
    text-align: left; transition: all 0.15s ease;
    font-family: inherit;
  }
  .cp-sidebar__item:hover { background: rgba(135,163,141,0.06); }
  .cp-sidebar__item--active { background: rgba(135,163,141,0.1); }
  .cp-sidebar__icon {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s ease;
  }
  .cp-sidebar__text { display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
  .cp-sidebar__item-label {
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.82rem; color: #1a1f25; letter-spacing: -0.01em;
  }
  .cp-sidebar__item--active .cp-sidebar__item-label { color: #5F7263; }
  .cp-sidebar__item-desc {
    font-size: 0.68rem; color: #9ca3af;
    line-height: 1.45;
  }

  /* Quick stats */
  .cp-quick-stats {
    margin-top: auto;
    display: flex; flex-direction: column; gap: 8px;
    padding: 16px 10px 4px;
    border-top: 1px solid #eef0f2;
  }
  .cp-stat {
    display: flex; align-items: baseline; gap: 10px;
    padding: 6px 0;
  }
  .cp-stat__val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.3rem; color: #5F7263;
    letter-spacing: -0.03em; line-height: 1;
    min-width: 32px;
  }
  .cp-stat__label {
    font-size: 0.68rem; color: #9ca3af;
    font-weight: 600;
  }

  /* ─── Editor ─── */
  .cp-editor {
    flex: 1; min-width: 0;
    padding: 28px 36px 60px;
    animation: fadeIn 0.25s ease;
  }

  .cp-section-header {
    display: flex; align-items: center; gap: 16px;
    margin-bottom: 24px; padding-bottom: 20px;
    border-bottom: 2px solid #f3f5f7;
  }
  .cp-section-icon {
    width: 48px; height: 48px; border-radius: 14px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cp-section-title {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.35rem; color: #1a1f25; letter-spacing: -0.025em;
    margin: 0;
  }
  .cp-section-subtitle {
    font-size: 0.78rem; color: #9ca3af;
    margin: 3px 0 0; line-height: 1.5;
  }

  /* ─── SectionIntro ─── */
  .cp-intro {
    background: linear-gradient(135deg, rgba(135,163,141,0.08), rgba(255,239,218,0.25));
    border: 1px solid rgba(135,163,141,0.15);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 24px;
  }
  .cp-intro__title {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.95rem; color: #5F7263;
    margin: 0 0 8px; letter-spacing: -0.01em;
  }
  .cp-intro__desc {
    font-size: 0.85rem; color: #5F7263;
    margin: 0 0 12px; line-height: 1.6;
    opacity: 0.9;
  }
  .cp-intro__tip {
    display: flex; align-items: flex-start; gap: 8px;
    font-size: 0.78rem; color: #6b7280;
    margin: 0; padding: 12px 14px;
    background: rgba(255,255,255,0.65);
    border-radius: 10px; line-height: 1.55;
  }

  /* ─── Filter pills ─── */
  .cp-filter-row {
    display: flex; gap: 8px; flex-wrap: wrap;
    margin-bottom: 20px;
  }
  .cp-filter {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 16px; border-radius: 999px;
    border: 1.5px solid #e5e7eb; background: white;
    color: #6b7280; font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.78rem;
    cursor: pointer; transition: all 0.2s ease;
  }
  .cp-filter:hover { border-color: #87A38D; color: #5F7263; }
  .cp-filter--active { background: #5F7263; color: white; border-color: #5F7263; }
  .cp-filter__count {
    padding: 1px 8px; border-radius: 999px;
    background: rgba(0,0,0,0.06); color: inherit;
    font-size: 0.68rem; font-weight: 700;
  }

  /* ─── Products list ─── */
  .cp-products { display: flex; flex-direction: column; gap: 10px; }
  .cp-card {
    background: white; border: 1px solid #e5e7eb;
    border-radius: 16px; overflow: hidden;
    transition: all 0.2s ease;
  }
  .cp-card:hover { border-color: #d4d8de; box-shadow: 0 4px 14px rgba(0,0,0,0.04); }
  .cp-card--new { border: 2px solid #F59E0B; background: #FFFBEB; }
  .cp-card--expanded { box-shadow: 0 8px 30px rgba(0,0,0,0.08); }

  .cp-card__header {
    display: flex; align-items: center; gap: 14px;
    padding: 14px 18px; width: 100%;
    background: transparent; border: none; cursor: pointer;
    font-family: inherit; text-align: left;
  }
  .cp-card__thumb {
    width: 52px; height: 52px; border-radius: 12px;
    background: #f3f4f6; border: 1px solid #e5e7eb;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden; flex-shrink: 0;
  }
  .cp-card__thumb img { width: 100%; height: 100%; object-fit: cover; }

  .cp-card__info { flex: 1; min-width: 0; }
  .cp-card__name {
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.92rem; color: #1a1f25;
    letter-spacing: -0.01em;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .cp-card__name--empty { color: #F59E0B; font-weight: 600; font-style: italic; }
  .cp-card__meta {
    display: flex; align-items: center; gap: 10px;
    margin-top: 4px;
  }
  .cp-card__cat {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 9px; border-radius: 999px;
    font-family: var(--font-manrope);
    font-size: 0.66rem; font-weight: 700;
    flex-shrink: 0;
  }
  .cp-card__desc {
    font-size: 0.72rem; color: #9ca3af;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .cp-card__price {
    text-align: right; flex-shrink: 0;
    display: flex; flex-direction: column; gap: 1px;
  }
  .cp-card__price-ht {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1rem; color: #5F7263;
    letter-spacing: -0.02em;
  }
  .cp-card__price-unit {
    font-size: 0.62rem; font-weight: 700; color: #9ca3af;
    margin-left: 2px;
  }
  .cp-card__price-ttc {
    font-size: 0.68rem; color: #9ca3af; font-weight: 500;
  }

  .cp-card__chevron {
    color: #9ca3af; flex-shrink: 0;
    transition: transform 0.25s ease;
  }
  .cp-card__chevron--open { transform: rotate(180deg); color: #5F7263; }

  .cp-card__body {
    padding: 0 18px 18px;
    border-top: 1px solid #f3f4f6;
    animation: fadeIn 0.2s ease;
  }
  .cp-card__edit {
    display: flex; gap: 16px; padding-top: 18px;
  }
  .cp-card__fields { flex: 1; display: flex; flex-direction: column; gap: 10px; }
  .cp-card__row {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 12px; margin-top: 12px;
  }
  .cp-card__preview {
    margin-top: 14px; padding: 12px 16px;
    background: rgba(135,163,141,0.08);
    border: 1px solid rgba(135,163,141,0.15);
    border-radius: 10px;
  }
  .cp-card__preview-line {
    display: flex; justify-content: space-between; align-items: baseline;
  }
  .cp-card__preview-label { font-size: 0.72rem; color: #5F7263; font-weight: 600; }
  .cp-card__preview-val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.1rem; color: #5F7263;
    letter-spacing: -0.02em;
  }
  .cp-card__preview-hint {
    font-size: 0.65rem; color: #9ca3af; margin-top: 4px;
  }
  .cp-card__actions {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 14px; padding-top: 14px;
    border-top: 1px solid #f3f4f6;
  }

  /* ─── Fields ─── */
  .cp-field { display: flex; flex-direction: column; }
  .cp-label {
    display: block; font-size: 0.7rem; font-weight: 700;
    color: #4b5563; margin-bottom: 5px;
    letter-spacing: 0.01em;
  }
  .cp-mini-label {
    display: block; font-size: 0.6rem; font-weight: 700;
    color: #9ca3af; margin-bottom: 4px;
    text-transform: uppercase; letter-spacing: 0.06em;
  }
  .cp-input {
    width: 100%; padding: 10px 14px;
    border: 1.5px solid #e5e7eb; border-radius: 10px;
    font-size: 0.84rem; font-family: inherit;
    background: #fafbfc; color: #1a1f25;
    outline: none; transition: all 0.15s ease;
    box-sizing: border-box;
  }
  .cp-input:focus {
    border-color: #87A38D;
    box-shadow: 0 0 0 3px rgba(135,163,141,0.12);
    background: white;
  }
  .cp-hint { font-size: 0.68rem; color: #9ca3af; margin: 4px 0 0; line-height: 1.45; }

  .cp-price-input { position: relative; }
  .cp-price-input input { padding-right: 60px; }
  .cp-price-input__suffix {
    position: absolute; right: 12px; top: 50%;
    transform: translateY(-50%);
    font-size: 0.72rem; color: #9ca3af; font-weight: 600;
    pointer-events: none;
  }

  /* ─── TVA buttons ─── */
  .cp-tva-group {
    display: flex; gap: 4px;
    background: #f3f4f6; border-radius: 10px;
    padding: 4px;
  }
  .cp-tva-btn {
    flex: 1; padding: 7px 12px; border-radius: 7px;
    border: none; background: transparent;
    font-family: var(--font-manrope);
    font-size: 0.78rem; font-weight: 700; color: #6b7280;
    cursor: pointer; transition: all 0.15s ease;
  }
  .cp-tva-btn:hover { background: white; color: #5F7263; }
  .cp-tva-btn--active {
    background: #5F7263 !important; color: white !important;
    box-shadow: 0 2px 6px rgba(95,114,99,0.25);
  }
  .cp-tva-btn--large { padding: 12px 24px; font-size: 0.92rem; flex: 0 0 auto; min-width: 80px; }

  /* ─── Buttons ─── */
  .cp-btn-ghost {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 7px 13px; border-radius: 8px;
    border: 1px solid #e5e7eb; background: white;
    color: #6b7280; font-family: var(--font-manrope);
    font-size: 0.72rem; font-weight: 600;
    cursor: pointer; transition: all 0.15s ease;
  }
  .cp-btn-ghost:hover:not(:disabled) { border-color: #87A38D; color: #5F7263; }
  .cp-btn-ghost:disabled { opacity: 0.4; cursor: default; }

  .cp-btn-danger {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 14px; border-radius: 8px;
    background: #FEF2F2; border: 1px solid #FCA5A5;
    color: #DC2626; font-family: var(--font-manrope);
    font-size: 0.74rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s ease;
  }
  .cp-btn-danger:hover { background: #FEE2E2; }

  .cp-btn-primary {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    background: #5F7263; border: none; color: white;
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.8rem; cursor: pointer;
    transition: all 0.2s ease;
  }
  .cp-btn-primary:hover { background: #4A5C4E; }

  .cp-btn-sm {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 6px 12px; border-radius: 8px;
    background: #F0FDF4; border: 1px solid #86EFAC;
    color: #166534; font-family: var(--font-manrope);
    font-size: 0.72rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s ease;
  }
  .cp-btn-sm:hover { background: #DCFCE7; }

  .cp-add-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 16px;
    background: white; border: 2px dashed #d4d8de;
    border-radius: 14px; color: #6b7280;
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.82rem; cursor: pointer;
    transition: all 0.15s ease; margin-top: 8px;
  }
  .cp-add-btn:hover {
    border-color: #87A38D; color: #5F7263;
    background: rgba(135,163,141,0.04);
  }

  /* ─── Static cards (pricing & settings) ─── */
  .cp-card--static {
    background: white; border: 1px solid #e5e7eb;
    border-radius: 16px; padding: 24px;
    margin-bottom: 16px;
  }
  .cp-card--preview {
    background: #FFFBEB; border-color: #FDE68A;
  }

  .cp-panel-header {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 6px;
  }
  .cp-panel-header h3 {
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 1rem; color: #1a1f25;
    margin: 0; letter-spacing: -0.01em;
  }
  .cp-panel-header--with-action { justify-content: space-between; }
  .cp-panel-desc {
    font-size: 0.78rem; color: #6b7280;
    margin: 0 0 14px; line-height: 1.5;
  }
  .cp-count-badge {
    font-size: 0.66rem; font-weight: 700;
    padding: 2px 8px; border-radius: 999px;
    background: #f0f1f3; color: #6b7280;
  }

  /* ─── Tiers (accordion) ─── */
  .cp-tiers { display: flex; flex-direction: column; gap: 8px; }
  .cp-tier-item {
    background: #fafbfc;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .cp-tier-item--expanded {
    background: white;
    border-color: #d4d8de;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }
  .cp-tier-head {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 14px 16px;
    background: transparent; border: none;
    cursor: pointer; text-align: left;
    font-family: inherit;
  }
  .cp-tier-head:hover { background: rgba(135,163,141,0.03); }
  .cp-tier-head-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .cp-tier-head-range {
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.88rem; color: #0f172a;
    letter-spacing: -0.01em;
  }
  .cp-tier-head-discount {
    font-size: 0.72rem; color: #5F7263;
    font-weight: 600;
  }
  .cp-tier-body {
    display: flex; flex-direction: column; gap: 12px;
    padding: 4px 16px 18px 56px;
    animation: fadeIn 0.2s ease;
  }

  .cp-tier__number {
    width: 28px; height: 28px; border-radius: 50%;
    background: #5F7263; color: white;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 0.78rem;
    flex-shrink: 0;
  }
  .cp-tier__grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 12px; flex: 1;
  }
  .cp-tier-input-wrap {
    display: flex; align-items: center;
    background: white; border: 1.5px solid #e5e7eb;
    border-radius: 10px; padding: 0 0 0 12px;
    transition: all 0.15s ease;
  }
  .cp-tier-input-wrap:focus-within {
    border-color: #87A38D;
    box-shadow: 0 0 0 3px rgba(135,163,141,0.12);
  }
  .cp-tier-input {
    flex: 1; padding: 9px 0;
    border: none; background: transparent;
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.88rem; color: #5F7263;
    outline: none; min-width: 0; width: 40px;
  }
  .cp-tier-input-suffix {
    padding: 0 12px;
    font-size: 0.68rem; color: #9ca3af;
    font-weight: 600; white-space: nowrap;
  }
  .cp-tier__del {
    width: 32px; height: 32px; border-radius: 8px;
    background: transparent; border: 1px solid #FCA5A5;
    color: #DC2626; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s ease;
  }
  .cp-tier__del:hover:not(:disabled) { background: #FEF2F2; }
  .cp-tier__del:disabled { opacity: 0.3; cursor: default; }

  /* ─── Preview grid ─── */
  .cp-preview-grid {
    display: grid; grid-template-columns: 1fr 1fr 1.2fr;
    gap: 12px; margin-top: 12px;
  }
  .cp-preview-stat {
    background: white; border: 1px solid #FDE68A;
    border-radius: 12px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .cp-preview-stat--highlight {
    background: #5F7263; color: white;
    border-color: #5F7263;
  }
  .cp-preview-stat__label {
    font-size: 0.68rem; font-weight: 700;
    color: #92400E; text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .cp-preview-stat--highlight .cp-preview-stat__label { color: rgba(255,239,218,0.7); }
  .cp-preview-stat__val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.4rem; color: #5F7263;
    letter-spacing: -0.03em;
  }
  .cp-preview-stat--highlight .cp-preview-stat__val { color: white; }
  .cp-preview-stat__discount {
    font-size: 0.66rem; font-weight: 700;
    color: #16a34a;
  }

  /* ─── Rules grid ─── */
  .cp-rules-grid {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 16px; margin-top: 10px;
  }

  /* ─── Categories (accordion) ─── */
  .cp-categories { display: flex; flex-direction: column; gap: 8px; }
  .cp-cat-item {
    background: #fafbfc;
    border: 1px solid #eef0f2;
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
  }
  .cp-cat-item--expanded {
    background: white;
    border-color: #d4d8de;
    box-shadow: 0 2px 10px rgba(0,0,0,0.04);
  }
  .cp-cat-head {
    display: flex; align-items: center; gap: 12px;
    width: 100%; padding: 14px 16px;
    background: transparent; border: none;
    cursor: pointer; text-align: left;
    font-family: inherit;
  }
  .cp-cat-head:hover { background: rgba(135,163,141,0.03); }
  .cp-cat-head-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .cp-cat-head-name {
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.88rem; color: #0f172a;
    letter-spacing: -0.01em;
  }
  .cp-cat-head-meta {
    font-size: 0.7rem; color: #9ca3af;
    font-weight: 500;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .cp-cat-body {
    display: flex; flex-direction: column; gap: 12px;
    padding: 4px 16px 18px 56px;
    animation: fadeIn 0.2s ease;
  }

  .cp-cat-icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .cp-cat-fields {
    flex: 1; display: grid;
    grid-template-columns: 1fr 130px 130px;
    gap: 10px;
  }
  .cp-cat-count {
    display: flex; flex-direction: column; align-items: center;
    flex-shrink: 0; min-width: 60px;
  }
  .cp-cat-count__val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.2rem; color: #5F7263;
    line-height: 1;
  }
  .cp-cat-count__label {
    font-size: 0.62rem; color: #9ca3af;
    font-weight: 600; text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .cp-cat-del {
    width: 32px; height: 32px; border-radius: 8px;
    background: transparent; border: 1px solid #FCA5A5;
    color: #DC2626; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; transition: all 0.15s ease;
  }
  .cp-cat-del:hover { background: #FEF2F2; }

  /* ─── Empty state ─── */
  .cp-empty {
    text-align: center; padding: 48px 24px;
    background: #fafbfc; border: 2px dashed #e5e7eb;
    border-radius: 16px;
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    color: #9ca3af;
  }
  .cp-empty p {
    margin: 0; font-size: 0.88rem; font-weight: 600;
  }

  /* ─── Loading ─── */
  .cp-loading {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    min-height: 60vh; gap: 14px; color: #6b7280; font-size: 0.9rem;
    font-family: var(--font-inter);
  }
  .cp-spinner {
    width: 32px; height: 32px;
    border: 3px solid #eef0f2; border-top-color: #5F7263;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  @media (max-width: 1024px) {
    .cps-root,
    .cps-root > *,
    .cp-builder,
    .cp-builder > * {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
    }
    .cp-topbar {
      flex-direction: column;
      align-items: stretch;
      padding: 16px 18px;
      gap: 12px;
    }
    .cp-topbar__title { font-size: 1.1rem; }
    .cp-topbar__subtitle { font-size: 0.74rem; }
    .cp-save { width: 100%; justify-content: center; }

    .cp-builder {
      flex-direction: column;
      min-height: 0;
    }
    .cp-sidebar {
      width: 100%;
      border-right: none;
      border-bottom: 1px solid #eef0f2;
      padding: 12px 14px;
      gap: 6px;
      overflow-x: auto;
      overflow-y: hidden;
      flex-direction: row;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
    }
    .cp-sidebar::-webkit-scrollbar { display: none; }
    .cp-sidebar__label { display: none; }
    .cp-sidebar__item {
      flex: 0 0 auto;
      min-width: 180px;
      background: white;
      border: 1.5px solid #eef0f2;
    }
    .cp-sidebar__item--active {
      border-color: #87A38D;
      background: rgba(135,163,141,0.08) !important;
    }
    .cp-quick-stats { display: none; }

    .cp-editor {
      padding: 20px 16px 60px;
    }
    .cp-section-header { margin-bottom: 18px; padding-bottom: 16px; gap: 12px; }
    .cp-section-icon { width: 40px !important; height: 40px !important; }
    .cp-section-title { font-size: 1.15rem !important; }
    .cp-section-subtitle { font-size: 0.72rem !important; }

    .cp-intro { padding: 14px 16px; margin-bottom: 18px; }
    .cp-intro__title { font-size: 0.85rem; }
    .cp-intro__desc { font-size: 0.76rem; }

    .cp-filter-row { gap: 6px; }
    .cp-filter { font-size: 0.72rem; padding: 8px 14px; }

    .cp-card__header { padding: 12px 14px; gap: 10px; }
    .cp-card__edit { flex-direction: column; gap: 14px; }
    .cp-card__row { grid-template-columns: 1fr; }

    .cp-rules-grid { grid-template-columns: 1fr; }
    .cp-preview-grid { grid-template-columns: 1fr; }

    /* Accordion bodies: reduce left padding on mobile */
    .cp-cat-body,
    .cp-tier-body {
      padding-left: 16px;
    }
    .cp-cat-head,
    .cp-tier-head {
      padding: 12px 14px;
    }

    .cp-input { font-size: 16px; } /* prevent iOS zoom */
  }

  @media (max-width: 600px) {
    .cp-topbar { padding: 14px 16px; }
    .cp-editor { padding: 16px 14px 60px; }
    .cp-sidebar__item { min-width: 160px; }
  }
`;
