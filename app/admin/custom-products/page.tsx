"use client";

import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, Save, Check, GripVertical, ImagePlus, X,
  Percent, Settings2, ChevronDown, ChevronUp, Upload,
  Droplets, Gift, Cookie, Paintbrush, AlertCircle, Tag, type LucideIcon,
} from "lucide-react";
import type { ConfigurateurSettings, DiscountTier, ProductCategory } from "@/lib/types";

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

const ICON_MAP: Record<string, LucideIcon> = { Droplets, Gift, Cookie, Paintbrush, Tag };
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

function ImageUploader({ current, onUpload, onRemove }: { current?: string; onUpload: (url: string) => void; onRemove: () => void }) {
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
      <div style={{ position: "relative", width: "72px", height: "72px", borderRadius: "12px", overflow: "hidden", flexShrink: 0, border: "1px solid #E5E7EB" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <button onClick={onRemove} style={{
          position: "absolute", top: "3px", right: "3px", width: "20px", height: "20px",
          borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none",
          color: "white", display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", padding: 0,
        }}><X size={10} /></button>
      </div>
    );
  }

  return (
    <>
      <input ref={ref} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button onClick={() => ref.current?.click()} disabled={uploading} style={{
        width: "72px", height: "72px", borderRadius: "12px", flexShrink: 0,
        border: "2px dashed #D1D5DB", background: uploading ? "#F3F4F6" : "white",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", gap: "2px", color: "#9CA3AF", transition: "all 0.2s",
      }}>
        {uploading ? <Upload size={16} className="animate-pulse" /> : <ImagePlus size={16} />}
        <span style={{ fontSize: "0.55rem", fontWeight: 600 }}>{uploading ? "..." : "Image"}</span>
      </button>
    </>
  );
}

export default function CustomProductsAdmin() {
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [settings, setSettings] = useState<ConfigurateurSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "settings">("products");
  const [filterCat, setFilterCat] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/custom-products").then(r => r.json()),
      fetch("/api/admin/configurateur-settings").then(r => r.json()),
    ]).then(([prods, setts]) => {
      setProducts(prods);
      setSettings(setts);
      setLoading(false);
    });
  }, []);

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

  const addProduct = () => {
    const newId = `product-${Date.now()}`;
    setProducts([...products, { id: newId, name: "", category: "soin", price: 0, description: "" }]);
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

  // Settings handlers
  const updateTier = (idx: number, patch: Partial<DiscountTier>) => {
    const next = { ...settings, discountTiers: [...settings.discountTiers] };
    next.discountTiers[idx] = { ...next.discountTiers[idx], ...patch };
    // Auto-generate label
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

  // Derived categories (with icon component + color) from settings
  const settingsCats: ProductCategory[] = settings.categories || DEFAULT_SETTINGS.categories || [];
  const derivedCategories = settingsCats.map((c, i) => ({
    ...c,
    icon: (c.icon && ICON_MAP[c.icon]) || Tag,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  const catLookup = new Map(derivedCategories.map(c => [c.value, c]));

  const filteredProducts = filterCat === "all" ? products : products.filter(p => p.category === filterCat);
  const catCounts = derivedCategories.map(c => ({ ...c, count: products.filter(p => p.category === c.value).length }));

  // Simulate live preview price
  const sampleUnitHT = products.slice(0, 3).reduce((s, p) => s + p.price, 0);
  const sampleTier = settings.discountTiers.find(t => 10 >= t.min && 10 <= (t.max ?? Infinity)) || settings.discountTiers[0];
  const sampleDiscount = sampleTier?.discount || 0;
  const sampleDiscountedHT = Math.round(sampleUnitHT * (1 - sampleDiscount / 100));
  const sampleTotalHT = sampleDiscountedHT * 10;
  const sampleTotalTTC = Math.round(sampleTotalHT * (1 + settings.tvaRate / 100));

  if (loading) return (
    <div style={{ padding: "60px", textAlign: "center", color: "#999" }}>
      <div style={{ width: "32px", height: "32px", border: "3px solid #E5E7EB", borderTopColor: "#5F7263", borderRadius: "50%", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
      Chargement...
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "1.5rem", color: "#5F7263", margin: 0, letterSpacing: "-0.02em" }}>
            Configurateur de coffrets
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#888", margin: "4px 0 0" }}>
            {products.length} produit{products.length !== 1 ? "s" : ""} · Les modifications sont appliquées en temps réel sur le front
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "12px 28px", borderRadius: "12px",
          background: saved ? "#16a34a" : "#5F7263", color: "white",
          fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.85rem",
          border: "none", cursor: "pointer", transition: "all 0.3s ease",
          boxShadow: "0 2px 8px rgba(45,74,62,0.2)",
        }}>
          {saved ? <><Check size={16} /> Enregistré !</> : <><Save size={16} /> {saving ? "Enregistrement..." : "Tout enregistrer"}</>}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "24px", background: "#F3F4F6", borderRadius: "12px", padding: "4px" }}>
        {(["products", "settings"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: "10px 16px", borderRadius: "10px", border: "none",
            background: activeTab === tab ? "white" : "transparent",
            color: activeTab === tab ? "#5F7263" : "#6B7280",
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem",
            cursor: "pointer", transition: "all 0.2s",
            boxShadow: activeTab === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
          }}>
            {tab === "products" ? <><GripVertical size={14} /> Produits ({products.length})</> : <><Settings2 size={14} /> Tarification & paramètres</>}
          </button>
        ))}
      </div>

      {activeTab === "products" ? (
        <>
          {/* Category filter */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
            <button onClick={() => setFilterCat("all")} style={{
              padding: "7px 16px", borderRadius: "999px", border: "1.5px solid",
              borderColor: filterCat === "all" ? "#5F7263" : "#E5E7EB",
              background: filterCat === "all" ? "#5F7263" : "white",
              color: filterCat === "all" ? "white" : "#6B7280",
              fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              Tous ({products.length})
            </button>
            {catCounts.map(c => {
              const Icon = c.icon;
              return (
                <button key={c.value} onClick={() => setFilterCat(c.value)} style={{
                  padding: "7px 16px", borderRadius: "999px", border: "1.5px solid",
                  borderColor: filterCat === c.value ? c.color : "#E5E7EB",
                  background: filterCat === c.value ? c.color : "white",
                  color: filterCat === c.value ? "white" : "#6B7280",
                  fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.75rem",
                  cursor: "pointer", transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: "6px",
                }}>
                  <Icon size={12} /> {c.label} ({c.count})
                </button>
              );
            })}
          </div>

          {/* Products list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredProducts.map((p) => {
              const globalIdx = products.findIndex(pp => pp.id === p.id);
              const catInfo = catLookup.get(p.category) || { label: p.category, icon: Tag, color: "#6B7280" };
              const CatIcon = catInfo.icon;
              const isExpanded = expandedId === p.id;
              const isNew = !p.name;

              return (
                <div key={p.id} style={{
                  borderRadius: "16px", overflow: "hidden",
                  border: isNew ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                  background: "white", transition: "all 0.2s",
                }}>
                  {/* Collapsed row */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    padding: "12px 16px", cursor: "pointer",
                  }} onClick={() => setExpandedId(isExpanded ? null : p.id)}>
                    {/* Image thumbnail */}
                    <div style={{
                      width: "44px", height: "44px", borderRadius: "10px", overflow: "hidden", flexShrink: 0,
                      background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid #E5E7EB",
                    }}>
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <CatIcon size={18} style={{ color: catInfo.color, opacity: 0.5 }} />
                      )}
                    </div>

                    {/* Name + category */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.88rem", color: "#1F2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name || <span style={{ color: "#F59E0B", fontStyle: "italic" }}>Nouveau produit</span>}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: "4px",
                          padding: "1px 8px", borderRadius: "6px", fontSize: "0.62rem", fontWeight: 700,
                          background: `${catInfo.color}12`, color: catInfo.color,
                        }}>
                          <CatIcon size={9} /> {catInfo.label}
                        </span>
                        {p.description && (
                          <span style={{ fontSize: "0.7rem", color: "#9CA3AF", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {p.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price */}
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 900, fontSize: "0.95rem", color: "#5F7263", flexShrink: 0 }}>
                      {(p.price / 100).toFixed(2)}€
                      <span style={{ fontSize: "0.6rem", fontWeight: 600, color: "#9CA3AF", marginLeft: "2px" }}>HT</span>
                    </div>

                    {/* Expand/collapse arrow */}
                    <div style={{ color: "#9CA3AF", flexShrink: 0, transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "none" }}>
                      <ChevronDown size={16} />
                    </div>
                  </div>

                  {/* Expanded editor */}
                  {isExpanded && (
                    <div style={{ padding: "0 16px 16px", borderTop: "1px solid #F3F4F6" }}>
                      <div style={{ display: "flex", gap: "16px", paddingTop: "16px" }}>
                        {/* Image */}
                        <ImageUploader
                          current={p.image}
                          onUpload={url => update(globalIdx, { image: url })}
                          onRemove={() => update(globalIdx, { image: undefined })}
                        />

                        {/* Fields */}
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 110px", gap: "10px" }}>
                            <div>
                              <label style={labelStyle}>Nom du produit *</label>
                              <input value={p.name} onChange={e => update(globalIdx, { name: e.target.value })} placeholder="Ex: Huile anti-vergetures" style={inputStyle} />
                            </div>
                            <div>
                              <label style={labelStyle}>Catégorie</label>
                              <select value={p.category} onChange={e => update(globalIdx, { category: e.target.value })} style={{ ...inputStyle, cursor: "pointer" }}>
                                {derivedCategories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label style={labelStyle}>Prix HT (centimes)</label>
                              <div style={{ position: "relative" }}>
                                <input type="number" value={p.price} onChange={e => update(globalIdx, { price: parseInt(e.target.value) || 0 })} style={{ ...inputStyle, paddingRight: "40px" }} />
                                <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "#9CA3AF", fontWeight: 600 }}>
                                  = {(p.price / 100).toFixed(2)}€
                                </span>
                              </div>
                            </div>
                            <div>
                              <label style={labelStyle}>TVA</label>
                              <select
                                value={p.tvaRate ?? settings.tvaRate}
                                onChange={e => update(globalIdx, { tvaRate: parseFloat(e.target.value) })}
                                style={{ ...inputStyle, cursor: "pointer" }}
                              >
                                {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label style={labelStyle}>Description courte</label>
                            <input value={p.description || ""} onChange={e => update(globalIdx, { description: e.target.value })} placeholder="Description visible sur la carte produit" style={inputStyle} />
                          </div>
                          {/* Auto TTC preview */}
                          <div style={{ fontSize: "0.72rem", color: "#87A38D", fontWeight: 600, fontFamily: "'Manrope', sans-serif" }}>
                            Auto-calcul TTC : {((p.price / 100) * (1 + (p.tvaRate ?? settings.tvaRate) / 100)).toFixed(2)}€
                          </div>
                        </div>
                      </div>

                      {/* Actions row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #F3F4F6" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => moveProduct(globalIdx, -1)} disabled={globalIdx === 0} style={smallBtnStyle}>
                            <ChevronUp size={13} /> Monter
                          </button>
                          <button onClick={() => moveProduct(globalIdx, 1)} disabled={globalIdx === products.length - 1} style={smallBtnStyle}>
                            <ChevronDown size={13} /> Descendre
                          </button>
                        </div>
                        <button onClick={() => remove(globalIdx)} style={{
                          ...smallBtnStyle, borderColor: "#FCA5A5", color: "#DC2626", background: "#FEF2F2",
                        }}>
                          <Trash2 size={13} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add product button */}
          <button onClick={addProduct} style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "14px 20px", borderRadius: "14px",
            background: "white", border: "2px dashed #D1D5DB",
            color: "#6B7280", cursor: "pointer", width: "100%", justifyContent: "center",
            marginTop: "12px", fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: "0.82rem",
            transition: "all 0.2s",
          }}>
            <Plus size={16} /> Ajouter un produit
          </button>
        </>
      ) : (
        /* ══════════ SETTINGS TAB ══════════ */
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* General settings */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#5F7263", margin: "0 0 18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Settings2 size={16} /> Paramètres généraux
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Quantité minimum</label>
                <input type="number" value={settings.minQuantity} onChange={e => setSettings({ ...settings, minQuantity: Math.max(1, parseInt(e.target.value) || 1) })} style={inputStyle} />
                <p style={hintStyle}>Nombre minimum de coffrets commandables</p>
              </div>
              <div>
                <label style={labelStyle}>Pas de quantité</label>
                <input type="number" value={settings.quantityStep} onChange={e => setSettings({ ...settings, quantityStep: Math.max(1, parseInt(e.target.value) || 1) })} style={inputStyle} />
                <p style={hintStyle}>Incrément des boutons +/− (ex: 5 en 5)</p>
              </div>
              <div>
                <label style={labelStyle}>TVA par défaut</label>
                <select value={settings.tvaRate} onChange={e => setSettings({ ...settings, tvaRate: parseFloat(e.target.value) })} style={{ ...inputStyle, cursor: "pointer" }}>
                  {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
                </select>
                <p style={hintStyle}>TVA appliquée si produit non configuré</p>
              </div>
              <div>
                <label style={labelStyle}>Perso. à partir de</label>
                <input type="number" value={settings.customOptionMinQty ?? 50} onChange={e => setSettings({ ...settings, customOptionMinQty: Math.max(1, parseInt(e.target.value) || 1) })} style={inputStyle} />
                <p style={hintStyle}>Personnalisation active dès N coffrets</p>
              </div>
            </div>
          </div>

          {/* Categories management */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#5F7263", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Tag size={16} /> Catégories
              </h3>
              <button onClick={() => {
                const cats = [...(settings.categories || [])];
                cats.push({ value: `cat-${Date.now()}`, label: "Nouvelle catégorie", icon: "Tag" });
                setSettings({ ...settings, categories: cats });
              }} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px",
                background: "#F0FDF4", border: "1px solid #86EFAC",
                color: "#166534", fontWeight: 700, fontSize: "0.75rem",
                cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}>
                <Plus size={12} /> Ajouter une catégorie
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "130px 1fr 140px 40px", gap: "10px", padding: "0 0 8px", borderBottom: "1px solid #F3F4F6", marginBottom: "10px" }}>
              <span style={headerCellStyle}>ID (clé)</span>
              <span style={headerCellStyle}>Label affiché</span>
              <span style={headerCellStyle}>Icône</span>
              <span />
            </div>

            {(settings.categories || []).map((c, i) => {
              const count = products.filter(p => p.category === c.value).length;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 1fr 140px 40px", gap: "10px", alignItems: "center", padding: "6px 0" }}>
                  <input
                    value={c.value}
                    onChange={e => {
                      const oldVal = c.value;
                      const newVal = e.target.value.trim() || oldVal;
                      const cats = [...(settings.categories || [])];
                      cats[i] = { ...cats[i], value: newVal };
                      setSettings({ ...settings, categories: cats });
                      // Migrate existing products referencing oldVal
                      if (oldVal !== newVal) {
                        setProducts(products.map(p => p.category === oldVal ? { ...p, category: newVal } : p));
                      }
                    }}
                    style={tierInputStyle}
                    placeholder="ex: soin"
                  />
                  <input
                    value={c.label}
                    onChange={e => {
                      const cats = [...(settings.categories || [])];
                      cats[i] = { ...cats[i], label: e.target.value };
                      setSettings({ ...settings, categories: cats });
                    }}
                    style={{ ...tierInputStyle, textAlign: "left" }}
                    placeholder="Ex: Soins"
                  />
                  <select
                    value={c.icon || "Tag"}
                    onChange={e => {
                      const cats = [...(settings.categories || [])];
                      cats[i] = { ...cats[i], icon: e.target.value };
                      setSettings({ ...settings, categories: cats });
                    }}
                    style={{ ...tierInputStyle, textAlign: "left", cursor: "pointer" }}
                  >
                    {Object.keys(ICON_MAP).map(k => <option key={k} value={k}>{k}</option>)}
                  </select>
                  <button onClick={() => {
                    if (count > 0 && !confirm(`Cette catégorie contient ${count} produit(s). Supprimer quand même ?`)) return;
                    setSettings({ ...settings, categories: (settings.categories || []).filter((_, idx) => idx !== i) });
                  }} style={{
                    width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #FCA5A5",
                    background: "white", color: "#DC2626", display: "flex",
                    alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0,
                  }}><Trash2 size={12} /></button>
                </div>
              );
            })}
            <p style={{ ...hintStyle, marginTop: "12px" }}>
              💡 Vous pouvez déplacer un produit d&apos;une catégorie à l&apos;autre via le sélecteur dans la fiche produit. Les modifications sont appliquées en temps réel sur le front.
            </p>
          </div>

          {/* Discount tiers */}
          <div style={{ background: "white", borderRadius: "16px", border: "1px solid #E5E7EB", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "1rem", color: "#5F7263", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Percent size={16} /> Barème dégressif
              </h3>
              <button onClick={addTier} style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px",
                background: "#F0FDF4", border: "1px solid #86EFAC",
                color: "#166534", fontWeight: 700, fontSize: "0.75rem",
                cursor: "pointer", fontFamily: "'Manrope', sans-serif",
              }}>
                <Plus size={12} /> Ajouter un palier
              </button>
            </div>

            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "80px 80px 100px 1fr 40px", gap: "10px", padding: "0 0 8px", borderBottom: "1px solid #F3F4F6", marginBottom: "8px" }}>
              <span style={headerCellStyle}>De (qté)</span>
              <span style={headerCellStyle}>À (qté)</span>
              <span style={headerCellStyle}>Remise %</span>
              <span style={headerCellStyle}>Label affiché</span>
              <span />
            </div>

            {settings.discountTiers.map((t, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 80px 100px 1fr 40px", gap: "10px", alignItems: "center", padding: "6px 0" }}>
                <input type="number" value={t.min} onChange={e => updateTier(i, { min: parseInt(e.target.value) || 0 })} style={tierInputStyle} />
                <input type="number" value={t.max ?? ""} placeholder="∞" onChange={e => {
                  const val = e.target.value;
                  updateTier(i, { max: val === "" ? null : parseInt(val) || 0 });
                }} style={tierInputStyle} />
                <div style={{ position: "relative" }}>
                  <input type="number" value={t.discount} onChange={e => updateTier(i, { discount: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)) })} style={{ ...tierInputStyle, paddingRight: "24px" }} />
                  <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", fontSize: "0.7rem", color: "#9CA3AF" }}>%</span>
                </div>
                <input value={t.label} onChange={e => updateTier(i, { label: e.target.value })} style={tierInputStyle} />
                <button onClick={() => removeTier(i)} disabled={settings.discountTiers.length <= 1} style={{
                  width: "28px", height: "28px", borderRadius: "8px", border: "1px solid #FCA5A5",
                  background: settings.discountTiers.length <= 1 ? "#F9FAFB" : "white",
                  color: settings.discountTiers.length <= 1 ? "#D1D5DB" : "#DC2626",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: settings.discountTiers.length <= 1 ? "default" : "pointer", padding: 0,
                }}><Trash2 size={12} /></button>
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div style={{ background: "#FFFBEB", borderRadius: "16px", border: "1px solid #FDE68A", padding: "20px 24px" }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: "0.88rem", color: "#92400E", margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <AlertCircle size={14} /> Aperçu en temps réel
            </h3>
            <p style={{ fontSize: "0.78rem", color: "#78716C", margin: "0 0 12px", lineHeight: 1.6 }}>
              Simulation pour <strong>10 coffrets</strong> avec les 3 premiers produits du catalogue :
            </p>
            <div style={{ display: "flex", gap: "24px", fontSize: "0.82rem" }}>
              <div>
                <span style={{ color: "#78716C" }}>Prix unitaire HT :</span>
                <strong style={{ color: "#5F7263", marginLeft: "6px" }}>{(sampleUnitHT / 100).toFixed(2)}€</strong>
                {sampleDiscount > 0 && <span style={{ color: "#16a34a", marginLeft: "6px", fontSize: "0.72rem" }}>−{sampleDiscount}% = {(sampleDiscountedHT / 100).toFixed(2)}€</span>}
              </div>
              <div>
                <span style={{ color: "#78716C" }}>Total HT :</span>
                <strong style={{ color: "#5F7263", marginLeft: "6px" }}>{(sampleTotalHT / 100).toFixed(2)}€</strong>
              </div>
              <div>
                <span style={{ color: "#78716C" }}>Total TTC ({settings.tvaRate}%) :</span>
                <strong style={{ color: "#5F7263", marginLeft: "6px" }}>{(sampleTotalTTC / 100).toFixed(2)}€</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared styles ───
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.65rem", fontWeight: 700, color: "#6B7280",
  marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.06em",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: "10px",
  border: "1.5px solid #E5E7EB", background: "#FAFAFA",
  fontSize: "0.82rem", outline: "none", fontFamily: "'Inter', sans-serif",
  transition: "border-color 0.2s",
};

const tierInputStyle: React.CSSProperties = {
  width: "100%", padding: "7px 10px", borderRadius: "8px",
  border: "1.5px solid #E5E7EB", background: "#FAFAFA",
  fontSize: "0.78rem", outline: "none", fontFamily: "'Manrope', sans-serif",
  fontWeight: 600, textAlign: "center",
};

const headerCellStyle: React.CSSProperties = {
  fontSize: "0.6rem", fontWeight: 700, color: "#9CA3AF",
  textTransform: "uppercase", letterSpacing: "0.08em",
};

const smallBtnStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: "4px",
  padding: "6px 12px", borderRadius: "8px",
  border: "1px solid #E5E7EB", background: "white",
  color: "#6B7280", fontWeight: 600, fontSize: "0.72rem",
  cursor: "pointer", fontFamily: "'Manrope', sans-serif",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.65rem", color: "#9CA3AF", margin: "4px 0 0", lineHeight: 1.4,
};
