"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

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
  detailProducts: ProductDetail[];
  tvaRate?: number;
}

const TVA_OPTIONS = [5.5, 10, 20];
const DEFAULT_TVA = 20;

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  subtitle: "",
  description: "",
  composition: [],
  nbProduits: "",
  price: "",
  priceNote: "",
  tag: "",
  tagBg: "",
  tagColor: "",
  accentColor: "",
  photo: "",
  photoAlt: "",
  iconEmoji: "",
  featured: false,
  detailProducts: [],
  tvaRate: DEFAULT_TVA,
};

const ACCENT = "#5F7263";
const SAGE = "#87A38D";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.78rem",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  fontFamily: "var(--font-inter)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1.5px solid #e5e7eb",
  borderRadius: "8px",
  fontSize: "0.88rem",
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-inter)",
  transition: "all 0.2s ease",
};

const fieldGroup: React.CSSProperties = {
  marginBottom: "20px",
};

const sectionHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "20px",
  paddingBottom: "12px",
  borderBottom: "1px solid #f3f4f6",
};

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-manrope)",
  fontWeight: 700,
  fontSize: "1.1rem",
  color: ACCENT,
  margin: 0,
};

function focusInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = SAGE;
  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(135,163,141,0.15)";
}
function blurInput(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = "#e5e7eb";
  e.currentTarget.style.boxShadow = "none";
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={fieldGroup}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#ffffff"
          onFocus={focusInput}
          onBlur={blurInput}
        />
        <div style={{
          width: "38px",
          height: "38px",
          borderRadius: "8px",
          border: "1.5px solid #e5e7eb",
          background: value || "#ffffff",
          flexShrink: 0,
        }} />
      </div>
    </div>
  );
}

type FormTab = "info" | "pricing" | "apparence" | "details";

const TABS: { key: FormTab; label: string; icon: string }[] = [
  { key: "info", label: "Informations", icon: "📝" },
  { key: "pricing", label: "Composition & Tarifs", icon: "💰" },
  { key: "apparence", label: "Apparence", icon: "🎨" },
  { key: "details", label: "Produits du coffret", icon: "📦" },
];

export default function AdminProductEdit() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<Omit<Product, "id">>(EMPTY_PRODUCT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<FormTab>("info");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          const { id: _id, ...rest } = data;
          setForm(rest);
        } else {
          setMessage({ type: "error", text: "Coffret introuvable" });
        }
      } catch {
        setMessage({ type: "error", text: "Erreur de chargement" });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const updateField = (field: keyof Omit<Product, "id">, value: string | boolean | number | string[] | ProductDetail[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        updateField("photo", data.url);
      } else {
        setMessage({ type: "error", text: "Erreur lors de l'upload" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau lors de l'upload" });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Coffret mis à jour avec succès" });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: data.error || "Erreur lors de la sauvegarde" });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur réseau" });
    } finally {
      setSaving(false);
    }
  };

  const addComposition = () => {
    updateField("composition", [...form.composition, ""]);
  };

  const updateComposition = (index: number, value: string) => {
    const updated = [...form.composition];
    updated[index] = value;
    updateField("composition", updated);
  };

  const removeComposition = (index: number) => {
    updateField("composition", form.composition.filter((_, i) => i !== index));
  };

  const addDetailProduct = () => {
    updateField("detailProducts", [...(form.detailProducts || []), { name: "", image: "", description: "", price: "", nbProduits: "", composition: [] }]);
  };

  const updateDetailProduct = (index: number, field: keyof ProductDetail, value: string | number | string[]) => {
    const updated = [...(form.detailProducts || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField("detailProducts", updated);
  };

  const removeDetailProduct = (index: number) => {
    updateField("detailProducts", (form.detailProducts || []).filter((_, i) => i !== index));
  };

  const handleDetailImageUpload = async (index: number, file: File) => {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        updateDetailProduct(index, "image", data.url);
      }
    } catch { /* silent */ }
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
    padding: "28px",
    marginBottom: "16px",
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid #f3f4f6",
          borderTop: `3px solid ${ACCENT}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px",
        }} />
        <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>Chargement du coffret...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Back link */}
      <Link
        href="/admin/products"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          color: "#6b7280",
          textDecoration: "none",
          fontSize: "0.85rem",
          marginBottom: "20px",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = ACCENT; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}
      >
        &larr; Retour aux coffrets
      </Link>

      <h1
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color: ACCENT,
          fontFamily: "var(--font-manrope)",
          marginBottom: "24px",
        }}
      >
        Modifier le coffret
      </h1>

      {/* Message */}
      {message ? (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "0.85rem",
            marginBottom: "20px",
            background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
            color: message.type === "success" ? "#10b981" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {message.text}
        </div>
      ) : null}

      {/* Tab navigation */}
      <div style={{
        display: "flex", gap: "4px", marginBottom: "20px",
        background: "white", borderRadius: "12px", padding: "6px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        position: "sticky", top: "56px", zIndex: 30,
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: 1,
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
              padding: "10px 16px", borderRadius: "8px",
              border: "none", cursor: "pointer",
              fontSize: "0.82rem", fontWeight: activeTab === tab.key ? 650 : 450,
              fontFamily: "var(--font-inter)",
              background: activeTab === tab.key ? ACCENT : "transparent",
              color: activeTab === tab.key ? "white" : "#6b7280",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "0.9rem" }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>

        {/* Left column: form (tabbed) */}
        <div>
          {/* Tab: Informations */}
          {activeTab === "info" && (
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: ACCENT }} />
                <h2 style={sectionTitleStyle}>Informations</h2>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Nom *</label>
                  <input style={inputStyle} value={form.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Coffret Essentiel" onFocus={focusInput} onBlur={blurInput} />
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Le nom affiché sur la landing page</p>
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Sous-titre</label>
                  <input style={inputStyle} value={form.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="L'attention qui compte" onFocus={focusInput} onBlur={blurInput} />
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Sous le nom du coffret</p>
                </div>
              </div>
              <div style={fieldGroup}>
                <label style={labelStyle}>Description</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Description du coffret..."
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
                <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Visible dans le détail du coffret</p>
              </div>
            </div>
          )}

          {/* Tab: Composition & Tarifs */}
          {activeTab === "pricing" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: ACCENT }} />
                  <h2 style={sectionTitleStyle}>Composition</h2>
                  <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600, background: "#f3f4f6", padding: "2px 8px", borderRadius: "10px" }}>
                    {form.composition.length} élément{form.composition.length !== 1 ? "s" : ""}
                  </span>
                </div>
                {form.composition.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: "#9ca3af", fontFamily: "monospace", width: "20px", textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                    <input
                      style={{ ...inputStyle, flex: 1 }}
                      value={item}
                      onChange={(e) => updateComposition(i, e.target.value)}
                      placeholder={`Produit ${i + 1}`}
                      onFocus={focusInput}
                      onBlur={blurInput}
                    />
                    <button
                      type="button"
                      onClick={() => removeComposition(i)}
                      style={{
                        padding: "8px 10px", background: "#fef2f2", color: "#dc2626",
                        border: "none", borderRadius: "6px", fontSize: "0.85rem",
                        cursor: "pointer", flexShrink: 0,
                      }}
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addComposition}
                  style={{
                    padding: "7px 14px", background: "transparent", color: ACCENT,
                    border: `1.5px dashed ${SAGE}`, borderRadius: "8px",
                    fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", marginTop: "4px",
                  }}
                >
                  + Ajouter
                </button>
              </div>

              <div style={cardStyle}>
                <div style={sectionHeaderStyle}>
                  <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: ACCENT }} />
                  <h2 style={sectionTitleStyle}>Tarification</h2>
                </div>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Nombre de produits</label>
                  <input style={inputStyle} value={form.nbProduits} onChange={(e) => updateField("nbProduits", e.target.value)} placeholder="5 produits" onFocus={focusInput} onBlur={blurInput} />
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Texte affiché sous le prix</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.3fr 100px 1fr", gap: "12px" }}>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Prix TTC</label>
                    <input style={inputStyle} value={form.price} onChange={(e) => updateField("price", e.target.value)} placeholder="40€ TTC" onFocus={focusInput} onBlur={blurInput} />
                    {(() => {
                      const num = parseInt(form.price.replace(/[^\d]/g, ""), 10);
                      const rate = (form.tvaRate ?? DEFAULT_TVA) / 100;
                      return num ? <p style={{ fontSize: "0.72rem", color: SAGE, fontWeight: 700, margin: "4px 0 0" }}>= {Math.round(num / (1 + rate))}€ HT (auto, TVA {form.tvaRate ?? DEFAULT_TVA}%)</p> : null;
                    })()}
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>TVA</label>
                    <select
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={form.tvaRate ?? DEFAULT_TVA}
                      onChange={(e) => updateField("tvaRate", parseFloat(e.target.value))}
                    >
                      {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
                    </select>
                  </div>
                  <div style={fieldGroup}>
                    <label style={labelStyle}>Note prix</label>
                    <input style={inputStyle} value={form.priceNote} onChange={(e) => updateField("priceNote", e.target.value)} placeholder="HT / coffret" onFocus={focusInput} onBlur={blurInput} />
                  </div>
                </div>
                <div style={{ ...fieldGroup, display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid #f3f4f6", marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                    style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: ACCENT }}
                  />
                  <label htmlFor="featured" style={{ fontSize: "0.82rem", color: "#374151", cursor: "pointer" }}>
                    Mettre en avant sur la landing page
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Apparence */}
          {activeTab === "apparence" && (
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: ACCENT }} />
                <h2 style={sectionTitleStyle}>Apparence</h2>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginBottom: "20px", marginTop: "-8px" }}>
                Personnalisez le badge et les couleurs de la carte produit
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div style={fieldGroup}>
                  <label style={labelStyle}>Tag (badge)</label>
                  <input style={inputStyle} value={form.tag} onChange={(e) => updateField("tag", e.target.value)} placeholder="Populaire" onFocus={focusInput} onBlur={blurInput} />
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Affiché en haut de la carte</p>
                </div>
                <ColorField label="Fond tag" value={form.tagBg} onChange={(v) => updateField("tagBg", v)} />
                <ColorField label="Texte tag" value={form.tagColor} onChange={(v) => updateField("tagColor", v)} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <ColorField label="Couleur accent" value={form.accentColor} onChange={(v) => updateField("accentColor", v)} />
                <div style={fieldGroup}>
                  <label style={labelStyle}>Emoji icône</label>
                  <input style={inputStyle} value={form.iconEmoji} onChange={(e) => updateField("iconEmoji", e.target.value)} placeholder="🎁" onFocus={focusInput} onBlur={blurInput} />
                  <p style={{ fontSize: "0.68rem", color: "#9ca3af", margin: "4px 0 0" }}>Affiche si pas d&apos;image</p>
                </div>
              </div>
              {form.tag && (
                <div style={{ marginTop: "12px", padding: "16px", background: "#f9fafb", borderRadius: "10px" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Aperçu du badge</p>
                  <span style={{
                    fontSize: "0.72rem", fontWeight: 600, padding: "4px 12px",
                    borderRadius: "20px",
                    background: form.tagBg || "#f3f4f6",
                    color: form.tagColor || "#374151",
                  }}>
                    {form.tag}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tab: Detail Products (Variants) */}
          {activeTab === "details" && (
            <div style={cardStyle}>
              <div style={sectionHeaderStyle}>
                <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: "#FFEFDA" }} />
                <h2 style={sectionTitleStyle}>Gammes / variantes du coffret</h2>
                <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#9ca3af", fontWeight: 500 }}>
                  Ex : Vahine · Eeva · Tama — chaque variante a son prix, ses produits, son image
                </span>
              </div>

              {(form.detailProducts || []).length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 16px", background: "#f9fafb", borderRadius: "10px", marginBottom: "12px" }}>
                  <p style={{ fontSize: "0.82rem", color: "#9ca3af", margin: "0 0 4px" }}>Aucune variante ajoutée</p>
                  <p style={{ fontSize: "0.72rem", color: "#c4c9d1", margin: 0 }}>Ajoutez les gammes qui composent ce coffret (avec prix, composition, image)</p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(form.detailProducts || []).map((dp, i) => {
                  const ttcNum = parseInt((dp.price || "").replace(/[^\d]/g, ""), 10) || 0;
                  const effectiveTva = dp.tvaRate ?? form.tvaRate ?? DEFAULT_TVA;
                  const htNum = Math.round(ttcNum / (1 + effectiveTva / 100));
                  return (
                    <div key={i} style={{ background: "#f9fafb", borderRadius: "14px", border: "1px solid #eef0f2", overflow: "hidden" }}>
                      {/* Variant header */}
                      <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef0f2", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 800, fontSize: "0.88rem", color: ACCENT }}>
                            {dp.name || `Variante ${i + 1}`}
                          </span>
                          {ttcNum > 0 && (
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: SAGE, background: "rgba(135,163,141,0.12)", padding: "2px 8px", borderRadius: "6px" }}>
                              {htNum}€ HT · {ttcNum}€ TTC
                            </span>
                          )}
                        </div>
                        <button type="button" onClick={() => removeDetailProduct(i)} style={{
                          padding: "5px 10px", background: "#fef2f2", color: "#dc2626",
                          border: "none", borderRadius: "6px", fontSize: "0.72rem", cursor: "pointer", fontWeight: 600,
                        }}>Supprimer</button>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", padding: "16px" }}>
                        {/* Image */}
                        <div
                          style={{
                            height: "140px", background: dp.image ? "none" : "#e5e7eb",
                            borderRadius: "10px", position: "relative", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", border: "1px solid #eef0f2",
                          }}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file"; input.accept = "image/*";
                            input.onchange = (e) => { const file = (e.target as HTMLInputElement).files?.[0]; if (file) handleDetailImageUpload(i, file); };
                            input.click();
                          }}
                        >
                          {dp.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={dp.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <span style={{ fontSize: "0.72rem", color: "#9ca3af", textAlign: "center", padding: "8px" }}>Cliquez pour ajouter une image</span>
                          )}
                        </div>

                        {/* Fields */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: "3px" }}>Nom de la variante *</label>
                              <input style={{ ...inputStyle, fontSize: "0.82rem", padding: "7px 10px" }} value={dp.name} onChange={(e) => updateDetailProduct(i, "name", e.target.value)} placeholder="Ex: Vahine" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: "3px" }}>Nb produits</label>
                              <input style={{ ...inputStyle, fontSize: "0.82rem", padding: "7px 10px" }} value={dp.nbProduits || ""} onChange={(e) => updateDetailProduct(i, "nbProduits", e.target.value)} placeholder="5 produits" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: "3px" }}>Description</label>
                            <input style={{ ...inputStyle, fontSize: "0.78rem", padding: "6px 10px" }} value={dp.description} onChange={(e) => updateDetailProduct(i, "description", e.target.value)} placeholder="Description courte de la variante" onFocus={focusInput} onBlur={blurInput} />
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: "140px 100px 1fr", gap: "8px", alignItems: "end" }}>
                            <div>
                              <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: "3px" }}>Prix TTC</label>
                              <input style={{ ...inputStyle, fontSize: "0.82rem", padding: "7px 10px" }} value={dp.price || ""} onChange={(e) => updateDetailProduct(i, "price", e.target.value)} placeholder="40€ TTC" onFocus={focusInput} onBlur={blurInput} />
                            </div>
                            <div>
                              <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: "3px" }}>TVA</label>
                              <select
                                style={{ ...inputStyle, fontSize: "0.82rem", padding: "7px 10px", cursor: "pointer" }}
                                value={dp.tvaRate ?? form.tvaRate ?? DEFAULT_TVA}
                                onChange={(e) => updateDetailProduct(i, "tvaRate", parseFloat(e.target.value))}
                              >
                                {TVA_OPTIONS.map(t => <option key={t} value={t}>{t}%</option>)}
                              </select>
                            </div>
                            {ttcNum > 0 && (
                              <span style={{ fontSize: "0.72rem", color: SAGE, fontWeight: 700, whiteSpace: "nowrap", paddingBottom: "8px" }}>
                                = {htNum}€ HT (auto, TVA {effectiveTva}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Composition */}
                      <div style={{ padding: "0 16px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                          <label style={{ ...labelStyle, fontSize: "0.68rem", marginBottom: 0 }}>Composition de la variante</label>
                          <button type="button" onClick={() => {
                            const updated = [...(form.detailProducts || [])];
                            updated[i] = { ...updated[i], composition: [...(updated[i].composition || []), ""] };
                            updateField("detailProducts", updated);
                          }} style={{
                            padding: "3px 10px", background: "transparent", color: SAGE, border: `1px dashed ${SAGE}`,
                            borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600, cursor: "pointer",
                          }}>+ Ajouter</button>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                          {(dp.composition || []).map((comp, ci) => (
                            <div key={ci} style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                              <input style={{ ...inputStyle, flex: 1, fontSize: "0.75rem", padding: "5px 8px" }} value={comp} onChange={(e) => {
                                const updated = [...(form.detailProducts || [])];
                                const comps = [...(updated[i].composition || [])];
                                comps[ci] = e.target.value;
                                updated[i] = { ...updated[i], composition: comps };
                                updateField("detailProducts", updated);
                              }} placeholder={`Produit ${ci + 1}`} onFocus={focusInput} onBlur={blurInput} />
                              <button type="button" onClick={() => {
                                const updated = [...(form.detailProducts || [])];
                                updated[i] = { ...updated[i], composition: (updated[i].composition || []).filter((_, k) => k !== ci) };
                                updateField("detailProducts", updated);
                              }} style={{ padding: "4px 6px", background: "#fef2f2", color: "#dc2626", border: "none", borderRadius: "4px", fontSize: "0.7rem", cursor: "pointer" }}>&times;</button>
                            </div>
                          ))}
                        </div>
                        {(!dp.composition || dp.composition.length === 0) && (
                          <p style={{ fontSize: "0.7rem", color: "#c4c9d1", margin: "4px 0 0" }}>Aucun produit — ajoutez la composition de cette variante</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button type="button" onClick={addDetailProduct} style={{
                padding: "10px 18px", background: "transparent", color: ACCENT,
                border: `1.5px dashed ${SAGE}`, borderRadius: "10px",
                fontSize: "0.82rem", fontWeight: 700, cursor: "pointer", marginTop: "14px",
                width: "100%", fontFamily: "var(--font-manrope)",
              }}>
                + Ajouter une variante
              </button>

              {/* Auto-calc info */}
              <div style={{ marginTop: "14px", padding: "12px 14px", borderRadius: "10px", background: "#F0FDF4", border: "1px solid #86EFAC", fontSize: "0.75rem", color: "#166534", lineHeight: 1.6 }}>
                <strong>Calcul automatique :</strong> Le prix HT est calculé automatiquement (TTC ÷ 1.2). Les prix saisis ici sont directement affichés sur la landing page et dans le popup produit.
              </div>
            </div>
          )}
        </div>

        {/* Right column: image + preview (sticky) */}
        <div style={{ position: "sticky", top: "24px" }}>
          {/* Image */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: ACCENT }} />
              <h2 style={sectionTitleStyle}>Image</h2>
            </div>
            {form.photo ? (
              <div style={{
                width: "100%",
                height: "180px",
                borderRadius: "10px",
                overflow: "hidden",
                border: "1.5px solid #e5e7eb",
                marginBottom: "14px",
              }}>
                <img src={form.photo} alt="Aperçu" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : null}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? SAGE : "#d1d5db"}`,
                borderRadius: "10px",
                padding: "24px",
                textAlign: "center",
                cursor: uploading ? "wait" : "pointer",
                background: isDragging ? "rgba(135,163,141,0.06)" : "#fafafa",
                transition: "all 0.2s ease",
              }}
            >
              <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "0 0 4px" }}>
                {uploading ? "Upload en cours..." : "Glissez ou cliquez"}
              </p>
              <p style={{ fontSize: "0.7rem", color: "#9ca3af", margin: 0 }}>PNG, JPG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </div>
            <div style={{ marginTop: "12px" }}>
              <label style={labelStyle}>Texte alternatif</label>
              <input
                style={inputStyle}
                value={form.photoAlt}
                onChange={(e) => updateField("photoAlt", e.target.value)}
                placeholder="Description de l'image"
                onFocus={focusInput}
                onBlur={blurInput}
              />
            </div>
          </div>

          {/* Preview */}
          <div style={cardStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ width: "4px", height: "20px", borderRadius: "2px", background: "#FFEFDA" }} />
              <h2 style={sectionTitleStyle}>Aperçu</h2>
            </div>
            <div style={{
              background: "#f9fafb",
              borderRadius: "12px",
              padding: "20px",
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "10px",
                background: "#e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                marginBottom: "12px",
              }}>
                {form.photo ? (
                  <img src={form.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontSize: "1.5rem", color: "#9ca3af" }}>?</span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-manrope)", fontWeight: 700, fontSize: "0.95rem", color: ACCENT }}>
                  {form.name || "Nom du coffret"}
                </span>
                {form.tag ? (
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: "20px",
                    background: form.tagBg || "#f3f4f6",
                    color: form.tagColor || "#374151",
                  }}>
                    {form.tag}
                  </span>
                ) : null}
              </div>
              {form.subtitle ? (
                <p style={{ fontSize: "0.78rem", color: "#6b7280", margin: "0 0 6px" }}>{form.subtitle}</p>
              ) : null}
              <p style={{ fontSize: "0.95rem", fontWeight: 700, color: ACCENT, margin: 0 }}>
                {(() => {
                  const num = parseInt((form.price || "").replace(/[^\d]/g, ""), 10);
                  const rate = (form.tvaRate ?? DEFAULT_TVA) / 100;
                  return num ? `${Math.round(num / (1 + rate))}€ HT` : form.price || "--";
                })()}
                {form.priceNote ? <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "#6b7280", marginLeft: "4px" }}>{form.price}</span> : null}
              </p>

              {/* Variants preview */}
              {(form.detailProducts || []).length > 0 && (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #eef0f2" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
                    Variantes ({(form.detailProducts || []).length})
                  </p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {(form.detailProducts || []).map((v, vi) => {
                      const vttc = parseInt((v.price || "").replace(/[^\d]/g, ""), 10) || 0;
                      const vRate = (v.tvaRate ?? form.tvaRate ?? DEFAULT_TVA) / 100;
                      return (
                        <div key={vi} style={{
                          padding: "6px 10px", borderRadius: "8px", fontSize: "0.72rem",
                          background: vi === 0 ? "rgba(135,163,141,0.12)" : "#f3f4f6",
                          border: vi === 0 ? `1px solid ${SAGE}` : "1px solid #eef0f2",
                        }}>
                          <span style={{ fontWeight: 700, color: ACCENT }}>{v.name || "..."}</span>
                          {vttc > 0 && <span style={{ color: SAGE, marginLeft: "6px", fontWeight: 600 }}>{Math.round(vttc / (1 + vRate))}€ HT</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {form.composition.length > 0 ? (
                <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #eef0f2" }}>
                  <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" }}>
                    Composition ({form.composition.length})
                  </p>
                  {form.composition.filter(Boolean).map((c, i) => (
                    <p key={i} style={{ fontSize: "0.78rem", color: "#6b7280", margin: "0 0 2px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: SAGE, flexShrink: 0 }} />
                      {c}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Save */}
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                flex: 1,
                padding: "12px",
                background: ACCENT,
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: saving ? "wait" : "pointer",
                opacity: saving ? 0.7 : 1,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 8px rgba(45,74,62,0.2)",
                fontFamily: "var(--font-manrope)",
              }}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <Link
              href="/admin/products"
              style={{
                padding: "12px 20px",
                background: "#f3f4f6",
                color: "#374151",
                border: "none",
                borderRadius: "10px",
                fontSize: "0.85rem",
                fontWeight: 500,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              Annuler
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
