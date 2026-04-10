"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Save, Check, Sparkles, BarChart3, Heart, Target,
  Palette, MessageCircle, ChevronDown, Plus, Trash2, GripVertical,
  Type, AlignLeft, MousePointerClick, ListChecks, Quote,
  ShieldCheck, Columns2, LayoutGrid, Eye, Monitor, RefreshCw,
  PanelLeft, PanelRight, Megaphone,
  MessageSquare, Users, HelpCircle, Footprints, Handshake,
  Star, Truck, Image as ImageIcon, Link2, MapPin,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface BenefitItem { title: string; description: string; iconName: string; image: string; }
interface Feature { title: string; desc: string; iconName: string; }
interface ImpactItem { title: string; desc: string; iconName: string; }
interface Stat { value: string; label: string; }
interface Step { title: string; desc: string; iconName: string; }
interface Testimonial { quote: string; name: string; role: string; initials: string; }
interface TestimonialItem { quote: string; name: string; role: string; company: string; initials: string; highlight: string; }
interface PartnerItem { quote: string; name: string; role: string; employees: string; initials: string; metric: string; metricLabel: string; logo: string; photo: string; avatar: string; }
interface ProcessStep { icon: string; title: string; desc: string; badge: string; image: string; }
interface ProcessGuarantee { icon: string; label: string; }
interface FAQItem { q: string; a: string; }
interface TopCoffretItem { rank: number; name: string; occasion: string; price: string; desc: string; badge: string; photo: string; stats: string; }
interface FooterLink { label: string; href: string; }
interface FooterSocialLink { icon: string; href: string; }

interface SiteContent {
  banner: { enabled: boolean; text: string; bgColor: string; textColor: string; };
  hero: {
    tagline: string; headline: string; highlightedText: string;
    headlineEnd: string; subtitle: string; keyPoints: string[];
    ctaPrimary: string; ctaSecondary: string; socialProofCount: string;
    carouselImages?: { src: string; alt: string }[];
    carouselBadgeUrssaf?: string;
    carouselBadgeProducts?: string;
  };
  benefits: { sectionTitle: string; sectionSubtitle: string; items: BenefitItem[]; };
  whyOmea: { leftFeatures: Feature[]; rightFeatures: Feature[]; centerTitle: string; centerSubtitle: string; };
  impact: { sectionTitle: string; subtitle: string; stats: Stat[]; description: string | ImpactItem[]; };
  personalization: { sectionTitle: string; sectionSubtitle: string; steps: Step[]; };
  cta: { sectionTitle: string; subtitle: string; guarantees: string[]; testimonial: Testimonial; };
  testimonials: { sectionLabel: string; items: TestimonialItem[]; };
  partners: { tag: string; title: string; titleHighlight: string; counter: string; counterLabel: string; ctaText: string; ctaHref: string; items: PartnerItem[]; };
  process: { label: string; title: string; titleItalic: string; subtitle: string; timeBadge: string; ctaText: string; ctaHref: string; steps: ProcessStep[]; guarantees: ProcessGuarantee[]; };
  faq: { label: string; title: string; subtitle: string; image: string; ctaText: string; ctaHref: string; ctaAdditionalText: string; items: FAQItem[]; };
  topCoffrets: { label: string; title: string; ctaText: string; ctaHref: string; trustText: string; items: TopCoffretItem[]; };
  footer: { description: string; socialLinks: FooterSocialLink[]; navigationTitle: string; navigationLinks: FooterLink[]; servicesTitle: string; services: string[]; servicesHref: string; contactTitle: string; contactEmail: string; contactLocation: string; contactCtaText: string; contactCtaHref: string; legalLinks: FooterLink[]; };
}

/* ------------------------------------------------------------------ */
/*  Section config                                                     */
/* ------------------------------------------------------------------ */

interface SectionDef {
  key: string;
  label: string;
  icon: LucideIcon;
  color: string;
}

const SECTIONS: SectionDef[] = [
  { key: "banner", label: "Bannière", icon: Megaphone, color: "#5F7263" },
  { key: "hero", label: "Hero", icon: Sparkles, color: "#87A38D" },
  { key: "topCoffrets", label: "Top Coffrets", icon: Star, color: "#d97706" },
  { key: "benefits", label: "Avantages", icon: Heart, color: "#E8A87C" },
  { key: "whyOmea", label: "Pourquoi O'Méa", icon: Columns2, color: "#5F7263" },
  { key: "impact", label: "Impact", icon: BarChart3, color: "#6366f1" },
  { key: "testimonials", label: "Témoignages", icon: MessageSquare, color: "#8b5cf6" },
  { key: "personalization", label: "Personnalisation", icon: Palette, color: "#ec4899" },
  { key: "partners", label: "Partenaires", icon: Handshake, color: "#0ea5e9" },
  { key: "process", label: "Processus", icon: Truck, color: "#14b8a6" },
  { key: "cta", label: "Appel à l'action", icon: Target, color: "#f59e0b" },
  { key: "faq", label: "FAQ", icon: HelpCircle, color: "#f97316" },
  { key: "footer", label: "Footer", icon: Footprints, color: "#64748b" },
];

/* Section selectors on the landing page for preview scroll sync */
const SECTION_ANCHORS: Record<string, string> = {
  banner: "[data-section='banner'], .announcement-bar, header",
  hero: "[data-section='hero'], main > section:first-of-type",
  benefits: "[data-section='benefits'], main > section:nth-of-type(2)",
  whyOmea: "#pourquoi, [data-section='whyOmea']",
  impact: "#impact, [data-section='impact']",
  testimonials: "[data-section='testimonials'], main > section:nth-of-type(5)",
  personalization: "#personnalisation, [data-section='personalization']",
  partners: "[data-section='partners'], main > section:nth-of-type(7)",
  process: "#processus, [data-section='process']",
  cta: "#devis, [data-section='cta']",
  faq: "#faq, [data-section='faq']",
  footer: "footer",
};

/* Check how "complete" a section is */
function getSectionStatus(content: SiteContent, key: string): "complete" | "partial" | "empty" {
  const c = content[key as keyof SiteContent];
  if (!c) return "empty";
  const values = Object.values(c);
  const filled = values.filter((v) => {
    if (typeof v === "string") return v.trim().length > 0;
    if (typeof v === "boolean") return true;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "object" && v !== null) {
      return Object.values(v).some((sv) => typeof sv === "string" ? sv.trim().length > 0 : true);
    }
    return false;
  });
  if (filled.length === 0) return "empty";
  if (filled.length === values.length) return "complete";
  return "partial";
}

/* ------------------------------------------------------------------ */
/*  Reusable field                                                     */
/* ------------------------------------------------------------------ */

function Field({
  label, hint, value, onChange, multiline = false, icon: Icon,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; multiline?: boolean; icon?: LucideIcon;
}) {
  return (
    <div className="ce-field">
      <label className="ce-label">
        {Icon ? <Icon size={13} strokeWidth={2} style={{ opacity: 0.5 }} /> : null}
        {label}
      </label>
      {multiline ? (
        <textarea className="ce-input ce-textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ce-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint ? <p className="ce-hint">{hint}</p> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline list item                                                   */
/* ------------------------------------------------------------------ */

function ListItem({
  value, onChange, onDelete, placeholder,
}: {
  value: string; onChange: (v: string) => void; onDelete: () => void; placeholder?: string;
}) {
  return (
    <div className="ce-list-item">
      <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
      <input
        className="ce-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ flex: 1 }}
      />
      <button className="ce-btn-icon ce-btn-icon--danger" onClick={onDelete} title="Supprimer">
        <Trash2 size={14} />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card for array items                                               */
/* ------------------------------------------------------------------ */

function ItemCard({ label, index, onDelete, children }: {
  label: string; index: number; onDelete: () => void; children: React.ReactNode;
}) {
  return (
    <div className="ce-item-card">
      <div className="ce-item-card__header">
        <div className="ce-item-card__title">
          <span className="ce-item-card__index">{String(index + 1).padStart(2, "0")}</span>
          {label}
        </div>
        <button className="ce-btn-icon ce-btn-icon--danger" onClick={onDelete} title="Supprimer">
          <Trash2 size={14} />
        </button>
      </div>
      <div className="ce-item-card__body">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast                                                              */
/* ------------------------------------------------------------------ */

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const isSuccess = message.toLowerCase().includes("succes");
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`ce-toast ${isSuccess ? "ce-toast--success" : "ce-toast--error"}`}>
      {isSuccess ? (
        <div className="ce-toast__icon"><Check size={14} strokeWidth={3} /></div>
      ) : null}
      {message}
    </div>
  );
}

/* ================================================================== */
/*  Live Preview Panel (iframe)                                        */
/* ================================================================== */

function LivePreview({ iframeRef, onRefresh, refreshing }: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="cp-root">
      <div className="cp-header">
        <Monitor size={14} />
        <span>Aperçu en direct</span>
        <button
          className="cp-refresh"
          onClick={onRefresh}
          title="Rafraîchir l'aperçu"
          disabled={refreshing}
        >
          <RefreshCw size={13} style={{ animation: refreshing ? "spin 0.7s linear infinite" : "none" }} />
        </button>
      </div>
      <div className="cp-viewport">
        <iframe
          ref={iframeRef}
          src="/"
          className="cp-iframe"
          title="Aperçu du site"
        />
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function AdminContentPage() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [panelMode, setPanelMode] = useState<"both" | "editor" | "preview">("both");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoad = useRef(true);

  /* Select a section → open editor + scroll preview */
  const selectSection = useCallback((key: string) => {
    setActiveSection(key);
    /* Scroll preview iframe to the corresponding section */
    if (iframeRef.current?.contentWindow) {
      const anchor = SECTION_ANCHORS[key];
      if (anchor) {
        iframeRef.current.contentWindow.postMessage(
          { type: "omea-scroll-to", selector: anchor, highlight: true },
          "*"
        );
      }
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => { if (!r.ok) throw new Error("Erreur de chargement"); return r.json(); })
      .then((data) => { setContent(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  const refreshPreview = useCallback(() => {
    if (iframeRef.current) {
      setRefreshing(true);
      iframeRef.current.src = "/?t=" + Date.now();
      iframeRef.current.onload = () => setRefreshing(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      setToast("Modifications enregistrées avec succès !");
      refreshPreview();
    } catch (err: unknown) {
      setToast(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  }, [content, refreshPreview]);

  const set = <K extends keyof SiteContent>(section: K, patch: Partial<SiteContent[K]>) => {
    setContent((prev) => prev ? { ...prev, [section]: { ...prev[section], ...patch } } : prev);
  };

  /* debounced auto-save → refresh preview */
  useEffect(() => {
    if (!content || initialLoad.current) {
      initialLoad.current = false;
      return;
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus("saving");
    autoSaveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/admin/content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(content),
        });
        if (res.ok) {
          refreshPreview();
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        }
      } catch { setAutoSaveStatus("idle"); }
    }, 1500);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [content, refreshPreview]);

  /* Ctrl+S / Cmd+S keyboard shortcut */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleSave]);

  /* ---- guards ---- */
  if (loading) return (
    <div className="ce-loading">
      <div className="ce-spinner" />
      <span>Chargement du contenu...</span>
    </div>
  );
  if (error || !content) return (
    <div className="ce-loading" style={{ color: "#dc2626" }}>
      {error || "Impossible de charger le contenu."}
    </div>
  );

  /* ================================================================ */
  /*  Section renderers                                                */
  /* ================================================================ */

  const renderBanner = () => {
    const b = content.banner;
    return (
      <>
        <div style={{
          display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px",
          padding: "12px 16px", borderRadius: "10px",
          background: b.enabled ? "#f0fdf4" : "#f3f4f6",
          border: `1.5px solid ${b.enabled ? "#86efac" : "#e5e7eb"}`,
          transition: "all 0.2s ease",
        }}>
          <button
            onClick={() => set("banner", { enabled: !b.enabled })}
            style={{
              width: "40px", height: "22px", borderRadius: "11px", border: "none",
              background: b.enabled ? "#5F7263" : "#d1d5db", cursor: "pointer",
              position: "relative", transition: "background 0.2s ease", flexShrink: 0,
            }}
          >
            <span style={{
              position: "absolute", top: "2px",
              left: b.enabled ? "20px" : "2px",
              width: "18px", height: "18px", borderRadius: "50%",
              background: "white", transition: "left 0.2s ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
            }} />
          </button>
          <span style={{
            fontSize: "0.84rem", fontWeight: 600,
            color: b.enabled ? "#5F7263" : "#9ca3af",
          }}>
            {b.enabled ? "Bannière active" : "Bannière désactivée"}
          </span>
        </div>
        <Field label="Texte de la bannière" hint="Affiché au-dessus de la navigation" value={b.text} onChange={(v) => set("banner", { text: v })} />
        <div className="ce-row">
          <Field label="Couleur de fond" hint="Code hex (ex: #5F7263)" value={b.bgColor} onChange={(v) => set("banner", { bgColor: v })} />
          <Field label="Couleur du texte" hint="Code hex (ex: #ffffff)" value={b.textColor} onChange={(v) => set("banner", { textColor: v })} />
        </div>
        {b.text && (
          <div style={{ marginTop: "16px" }}>
            <p className="ce-label" style={{ marginBottom: "8px" }}>Aperçu</p>
            <div style={{
              background: b.bgColor || "#5F7263",
              color: b.textColor || "#ffffff",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "0.82rem",
              fontWeight: 500,
              textAlign: "center",
              fontFamily: "'Inter', sans-serif",
            }}>
              {b.text}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderHero = () => {
    const h = content.hero;
    return (
      <>
        <div className="ce-row">
          <Field icon={Type} label="Accroche" hint="Petit texte au-dessus du titre" value={h.tagline} onChange={(v) => set("hero", { tagline: v })} />
          <Field icon={ListChecks} label="Preuve sociale" hint="Ex: +50 entreprises..." value={h.socialProofCount} onChange={(v) => set("hero", { socialProofCount: v })} />
        </div>
        <Field icon={Type} label="Titre principal" value={h.headline} onChange={(v) => set("hero", { headline: v })} />
        <div className="ce-row">
          <Field label="Texte mis en avant" hint="Partie colorée du titre" value={h.highlightedText} onChange={(v) => set("hero", { highlightedText: v })} />
          <Field label="Fin du titre" value={h.headlineEnd} onChange={(v) => set("hero", { headlineEnd: v })} />
        </div>
        <Field icon={AlignLeft} label="Sous-titre" value={h.subtitle} onChange={(v) => set("hero", { subtitle: v })} multiline />
        <div className="ce-row">
          <Field icon={MousePointerClick} label="Bouton principal" value={h.ctaPrimary} onChange={(v) => set("hero", { ctaPrimary: v })} />
          <Field label="Bouton secondaire" value={h.ctaSecondary} onChange={(v) => set("hero", { ctaSecondary: v })} />
        </div>
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ListChecks size={15} />
            <span>Points cles</span>
            <span className="ce-badge">{h.keyPoints.length}</span>
          </div>
          {h.keyPoints.map((kp, i) => (
            <ListItem key={i} value={kp} onChange={(v) => {
              const arr = [...h.keyPoints]; arr[i] = v; set("hero", { keyPoints: arr });
            }} onDelete={() => set("hero", { keyPoints: h.keyPoints.filter((_, idx) => idx !== i) })} />
          ))}
          <button className="ce-btn-add" onClick={() => set("hero", { keyPoints: [...h.keyPoints, ""] })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {/* Carousel images */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ImageIcon size={15} />
            <span>Images du carrousel</span>
            <span className="ce-badge">{(h.carouselImages || []).length}</span>
          </div>
          {(h.carouselImages || []).map((img: { src: string; alt: string }, i: number) => (
            <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
              {img.src && (
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: "1px solid #e5e7eb" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <input
                className="ce-input"
                value={img.src}
                onChange={(e) => {
                  const arr = [...(h.carouselImages || [])];
                  arr[i] = { ...arr[i], src: e.target.value };
                  set("hero", { carouselImages: arr });
                }}
                placeholder="/uploads/image.jpg"
                style={{ flex: 1 }}
              />
              <input
                className="ce-input"
                value={img.alt}
                onChange={(e) => {
                  const arr = [...(h.carouselImages || [])];
                  arr[i] = { ...arr[i], alt: e.target.value };
                  set("hero", { carouselImages: arr });
                }}
                placeholder="Description (alt)"
                style={{ flex: 1 }}
              />
              <label style={{ cursor: "pointer", padding: "6px 10px", background: "#f3f4f6", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 600, color: "#6B7280", whiteSpace: "nowrap" }}>
                Upload
                <input type="file" accept="image/*" hidden onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData(); fd.append("file", file);
                  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                  if (res.ok) {
                    const data = await res.json();
                    const arr = [...(h.carouselImages || [])];
                    arr[i] = { ...arr[i], src: data.url };
                    set("hero", { carouselImages: arr });
                  }
                }} />
              </label>
              <button className="ce-btn-del" onClick={() => {
                set("hero", { carouselImages: (h.carouselImages || []).filter((_: unknown, idx: number) => idx !== i) });
              }}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("hero", { carouselImages: [...(h.carouselImages || []), { src: "", alt: "" }] })}>
            <Plus size={14} /> Ajouter une image
          </button>
        </div>

        {/* Carousel badges */}
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Sparkles size={15} />
            <span>Badges du carrousel</span>
          </div>
          <div className="ce-row">
            <Field label="Badge conformité" hint="Texte du badge vert en bas à gauche" value={h.carouselBadgeUrssaf || ""} onChange={(v) => set("hero", { carouselBadgeUrssaf: v })} />
            <Field label="Badge produits" hint="Texte du badge en haut à droite" value={h.carouselBadgeProducts || ""} onChange={(v) => set("hero", { carouselBadgeProducts: v })} />
          </div>
        </div>
      </>
    );
  };

  const renderTopCoffrets = () => {
    const tc = content.topCoffrets;
    if (!tc) return <p className="ce-hint">Section non initialisee. Sauvegardez pour creer la structure.</p>;
    return (
      <>
        <div className="ce-row">
          <Field label="Label" hint="Ex: Les plus demandes" value={tc.label} onChange={(v) => set("topCoffrets", { label: v })} />
          <Field label="Titre" hint="Ex: Top 3 des coffrets" value={tc.title} onChange={(v) => set("topCoffrets", { title: v })} />
        </div>
        <div className="ce-row">
          <Field label="CTA texte" value={tc.ctaText} onChange={(v) => set("topCoffrets", { ctaText: v })} />
          <Field label="CTA lien" value={tc.ctaHref} onChange={(v) => set("topCoffrets", { ctaHref: v })} />
        </div>
        <Field label="Texte confiance" hint="Ex: 98% de satisfaction" value={tc.trustText} onChange={(v) => set("topCoffrets", { trustText: v })} />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Star size={15} />
            <span>Coffrets</span>
            <span className="ce-badge">{tc.items?.length || 0}</span>
          </div>
          {(tc.items || []).map((item, i) => (
            <ItemCard key={i} index={i} label={`#${item.rank} ${item.name || "Sans nom"}`} onDelete={() => {
              set("topCoffrets", { items: tc.items.filter((_, idx) => idx !== i) });
            }}>
              <div className="ce-row">
                <Field label="Rang" hint="1, 2, 3..." value={String(item.rank)} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], rank: parseInt(v) || i + 1 }; set("topCoffrets", { items: arr });
                }} />
                <Field label="Nom" value={item.name} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], name: v }; set("topCoffrets", { items: arr });
                }} />
              </div>
              <div className="ce-row">
                <Field label="Occasion" hint="Ex: Maternite" value={item.occasion} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], occasion: v }; set("topCoffrets", { items: arr });
                }} />
                <Field label="Prix" hint="Ex: 33€ HT" value={item.price} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], price: v }; set("topCoffrets", { items: arr });
                }} />
              </div>
              <Field label="Description" hint="Pour le coffret principal (rang 1)" value={item.desc} onChange={(v) => {
                const arr = [...tc.items]; arr[i] = { ...arr[i], desc: v }; set("topCoffrets", { items: arr });
              }} multiline />
              <div className="ce-row">
                <Field label="Badge" hint="Ex: N°1 des commandes" value={item.badge} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], badge: v }; set("topCoffrets", { items: arr });
                }} />
                <Field label="Statistique" hint="Ex: Commande par 68% de nos clients" value={item.stats} onChange={(v) => {
                  const arr = [...tc.items]; arr[i] = { ...arr[i], stats: v }; set("topCoffrets", { items: arr });
                }} />
              </div>
              {/* Image upload */}
              <div className="ce-field">
                <label className="ce-label">Photo du coffret</label>
                {item.photo && (
                  <div style={{ width: "100%", height: "80px", borderRadius: "8px", overflow: "hidden", marginBottom: "8px", border: "1.5px solid #e5e7eb" }}>
                    <img src={item.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input className="ce-input" value={item.photo || ""} onChange={(e) => {
                    const arr = [...tc.items]; arr[i] = { ...arr[i], photo: e.target.value }; set("topCoffrets", { items: arr });
                  }} placeholder="/uploads/photo.jpg" style={{ flex: 1 }} />
                  <label style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, background: "#5F7263", color: "white", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
                    Choisir
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const fd = new FormData(); fd.append("file", file);
                      try {
                        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                        if (res.ok) { const data = await res.json(); const arr = [...tc.items]; arr[i] = { ...arr[i], photo: data.url }; set("topCoffrets", { items: arr }); }
                      } catch { /* silent */ }
                    }} />
                  </label>
                </div>
              </div>
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("topCoffrets", { items: [...(tc.items || []), { rank: (tc.items?.length || 0) + 1, name: "", occasion: "", price: "", desc: "", badge: "", photo: "", stats: "" }] })}>
            <Plus size={14} /> Ajouter un coffret
          </button>
        </div>
      </>
    );
  };

  const renderBenefits = () => {
    const b = content.benefits;
    return (
      <>
        <Field label="Titre de la section" value={b.sectionTitle} onChange={(v) => set("benefits", { sectionTitle: v })} />
        <Field label="Sous-titre" value={b.sectionSubtitle} onChange={(v) => set("benefits", { sectionSubtitle: v })} multiline />
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <LayoutGrid size={15} />
            <span>Éléments</span>
            <span className="ce-badge">{b.items.length}</span>
          </div>
          <div className="ce-grid-2">
            {b.items.map((item, i) => (
              <ItemCard key={i} index={i} label={item.title || "Sans titre"} onDelete={() => {
                set("benefits", { items: b.items.filter((_, idx) => idx !== i) });
              }}>
                <div className="ce-row">
                  <Field label="Titre" value={item.title} onChange={(v) => {
                    const arr = [...b.items]; arr[i] = { ...arr[i], title: v }; set("benefits", { items: arr });
                  }} />
                  <Field label="Icône" hint="Nom lucide-react" value={item.iconName} onChange={(v) => {
                    const arr = [...b.items]; arr[i] = { ...arr[i], iconName: v }; set("benefits", { items: arr });
                  }} />
                </div>
                <Field label="Description" value={item.description} onChange={(v) => {
                  const arr = [...b.items]; arr[i] = { ...arr[i], description: v }; set("benefits", { items: arr });
                }} multiline />
                {/* Image du panneau */}
                <div className="ce-field">
                  <label className="ce-label">Image du panneau</label>
                  {item.image && (
                    <div style={{
                      width: "100%", height: "80px", borderRadius: "8px", overflow: "hidden",
                      marginBottom: "8px", border: "1.5px solid #e5e7eb",
                    }}>
                      <img src={item.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      className="ce-input"
                      value={item.image || ""}
                      onChange={(e) => {
                        const arr = [...b.items]; arr[i] = { ...arr[i], image: e.target.value }; set("benefits", { items: arr });
                      }}
                      placeholder="/uploads/mon-image.jpg"
                      style={{ flex: 1 }}
                    />
                    <label
                      style={{
                        padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
                        background: "#5F7263", color: "white", cursor: "pointer", whiteSpace: "nowrap",
                        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
                      }}
                    >
                      Choisir
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const fd = new FormData();
                          fd.append("file", file);
                          try {
                            const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                            if (res.ok) {
                              const data = await res.json();
                              const arr = [...b.items]; arr[i] = { ...arr[i], image: data.url }; set("benefits", { items: arr });
                            }
                          } catch { /* silent */ }
                        }}
                      />
                    </label>
                  </div>
                  <p className="ce-hint">Image affichée en fond du panneau accordéon</p>
                </div>
              </ItemCard>
            ))}
          </div>
          <button className="ce-btn-add" onClick={() => set("benefits", { items: [...b.items, { title: "", description: "", iconName: "", image: "" }] })}>
            <Plus size={14} /> Ajouter un élément
          </button>
        </div>
      </>
    );
  };

  const renderFeatureCol = (features: Feature[], sectionKey: "leftFeatures" | "rightFeatures", label: string) => (
    <div>
      <div className="ce-subsection__header" style={{ marginBottom: 10 }}>
        <span>{label}</span>
        <span className="ce-badge">{features.length}</span>
      </div>
      {features.map((f, i) => (
        <ItemCard key={i} index={i} label={f.title || "Sans titre"} onDelete={() => {
          set("whyOmea", { [sectionKey]: features.filter((_, idx) => idx !== i) } as Partial<SiteContent["whyOmea"]>);
        }}>
          <Field label="Titre" value={f.title} onChange={(v) => {
            const arr = [...features]; arr[i] = { ...arr[i], title: v };
            set("whyOmea", { [sectionKey]: arr } as Partial<SiteContent["whyOmea"]>);
          }} />
          <Field label="Description" value={f.desc} onChange={(v) => {
            const arr = [...features]; arr[i] = { ...arr[i], desc: v };
            set("whyOmea", { [sectionKey]: arr } as Partial<SiteContent["whyOmea"]>);
          }} multiline />
        </ItemCard>
      ))}
      <button className="ce-btn-add" onClick={() => {
        set("whyOmea", { [sectionKey]: [...features, { title: "", desc: "", iconName: "CheckCircle2" }] } as Partial<SiteContent["whyOmea"]>);
      }}>
        <Plus size={14} /> Ajouter
      </button>
    </div>
  );

  const renderWhyOmea = () => {
    const w = content.whyOmea;
    return (
      <>
        <div className="ce-row">
          <Field label="Titre central" value={w.centerTitle} onChange={(v) => set("whyOmea", { centerTitle: v })} />
          <Field label="Sous-titre central" value={w.centerSubtitle} onChange={(v) => set("whyOmea", { centerSubtitle: v })} />
        </div>
        <div className="ce-grid-2" style={{ marginTop: 16 }}>
          {renderFeatureCol(w.leftFeatures, "leftFeatures", "Colonne gauche")}
          {renderFeatureCol(w.rightFeatures, "rightFeatures", "Colonne droite")}
        </div>
      </>
    );
  };

  const renderImpact = () => {
    const im = content.impact;
    return (
      <>
        <Field label="Titre de la section" value={im.sectionTitle} onChange={(v) => set("impact", { sectionTitle: v })} />
        <Field label="Sous-titre" value={im.subtitle} onChange={(v) => set("impact", { subtitle: v })} multiline />
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <BarChart3 size={15} />
            <span>Statistiques</span>
            <span className="ce-badge">{im.stats.length}</span>
          </div>
          <div className="ce-grid-3">
            {im.stats.map((s, i) => (
              <ItemCard key={i} index={i} label={s.value || "---"} onDelete={() => {
                set("impact", { stats: im.stats.filter((_, idx) => idx !== i) });
              }}>
                <Field label="Valeur" value={s.value} onChange={(v) => {
                  const arr = [...im.stats]; arr[i] = { ...arr[i], value: v }; set("impact", { stats: arr });
                }} />
                <Field label="Libellé" value={s.label} onChange={(v) => {
                  const arr = [...im.stats]; arr[i] = { ...arr[i], label: v }; set("impact", { stats: arr });
                }} />
              </ItemCard>
            ))}
          </div>
          <button className="ce-btn-add" onClick={() => set("impact", { stats: [...im.stats, { value: "", label: "" }] })}>
            <Plus size={14} /> Ajouter une statistique
          </button>
        </div>
      </>
    );
  };

  const renderPersonalization = () => {
    const p = content.personalization;
    return (
      <>
        <Field label="Titre de la section" value={p.sectionTitle} onChange={(v) => set("personalization", { sectionTitle: v })} />
        <Field label="Sous-titre" value={p.sectionSubtitle} onChange={(v) => set("personalization", { sectionSubtitle: v })} multiline />

        {/* Image de la section */}
        <div className="ce-field">
          <label className="ce-label"><ImageIcon size={13} style={{ opacity: 0.5 }} /> Image principale</label>
          {(p as Record<string, unknown>).image && (
            <div style={{ width: "100%", height: "120px", borderRadius: "12px", overflow: "hidden", marginBottom: "8px", border: "1.5px solid #e5e7eb" }}>
              <img src={String((p as Record<string, unknown>).image)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          )}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <input className="ce-input" value={String((p as Record<string, unknown>).image || "")} onChange={(e) => {
              set("personalization", { image: e.target.value } as Partial<SiteContent["personalization"]>);
            }} placeholder="/uploads/photo.jpg" style={{ flex: 1 }} />
            <label style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600, background: "#5F7263", color: "white", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
              Choisir
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const fd = new FormData(); fd.append("file", file);
                try {
                  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                  if (res.ok) { const data = await res.json(); set("personalization", { image: data.url } as Partial<SiteContent["personalization"]>); }
                } catch { /* silent */ }
              }} />
            </label>
          </div>
          <p className="ce-hint">Photo affichée à gauche de la section personnalisation (pleine hauteur)</p>
        </div>
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Palette size={15} />
            <span>Etapes</span>
            <span className="ce-badge">{p.steps.length}</span>
          </div>
          <div className="ce-grid-3">
            {p.steps.map((s, i) => (
              <ItemCard key={i} index={i} label={s.title || "Sans titre"} onDelete={() => {
                set("personalization", { steps: p.steps.filter((_, idx) => idx !== i) });
              }}>
                <Field label="Titre" value={s.title} onChange={(v) => {
                  const arr = [...p.steps]; arr[i] = { ...arr[i], title: v }; set("personalization", { steps: arr });
                }} />
                <Field label="Description" value={s.desc} onChange={(v) => {
                  const arr = [...p.steps]; arr[i] = { ...arr[i], desc: v }; set("personalization", { steps: arr });
                }} multiline />
                <Field label="Icône" value={s.iconName} onChange={(v) => {
                  const arr = [...p.steps]; arr[i] = { ...arr[i], iconName: v }; set("personalization", { steps: arr });
                }} />
              </ItemCard>
            ))}
          </div>
          <button className="ce-btn-add" onClick={() => set("personalization", { steps: [...p.steps, { title: "", desc: "", iconName: "" }] })}>
            <Plus size={14} /> Ajouter une etape
          </button>
        </div>
      </>
    );
  };

  const renderCTA = () => {
    const c = content.cta;
    const t = c.testimonial;
    return (
      <>
        <Field label="Titre de la section" value={c.sectionTitle} onChange={(v) => set("cta", { sectionTitle: v })} />
        <Field label="Sous-titre" value={c.subtitle} onChange={(v) => set("cta", { subtitle: v })} multiline />

        <div className="ce-grid-2" style={{ marginTop: 16, gap: "24px" }}>
          <div className="ce-subsection" style={{ margin: 0 }}>
            <div className="ce-subsection__header">
              <ShieldCheck size={15} />
              <span>Garanties</span>
              <span className="ce-badge">{c.guarantees.length}</span>
            </div>
            {c.guarantees.map((g, i) => (
              <ListItem key={i} value={g} onChange={(v) => {
                const arr = [...c.guarantees]; arr[i] = v; set("cta", { guarantees: arr });
              }} onDelete={() => set("cta", { guarantees: c.guarantees.filter((_, idx) => idx !== i) })} />
            ))}
            <button className="ce-btn-add" onClick={() => set("cta", { guarantees: [...c.guarantees, ""] })}>
              <Plus size={14} /> Ajouter
            </button>
          </div>

          <div className="ce-testimonial-card">
            <div className="ce-subsection__header" style={{ marginBottom: 12 }}>
              <Quote size={15} />
              <span>Temoignage</span>
            </div>
            <Field label="Citation" value={t.quote} onChange={(v) => set("cta", { testimonial: { ...t, quote: v } })} multiline />
            <div className="ce-row">
              <Field label="Nom" value={t.name} onChange={(v) => set("cta", { testimonial: { ...t, name: v } })} />
              <Field label="Fonction" value={t.role} onChange={(v) => set("cta", { testimonial: { ...t, role: v } })} />
            </div>
            <Field label="Initiales" hint="Affichées dans l'avatar" value={t.initials} onChange={(v) => set("cta", { testimonial: { ...t, initials: v } })} />
          </div>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Testimonials                                                     */
  /* ================================================================ */

  const renderTestimonials = () => {
    const t = content.testimonials;
    if (!t) return <p className="ce-hint">Section non initialisée. Sauvegardez pour créer la structure.</p>;
    return (
      <>
        <Field label="Label de la section" value={t.sectionLabel} onChange={(v) => set("testimonials", { sectionLabel: v })} />
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Quote size={15} />
            <span>Témoignages</span>
            <span className="ce-badge">{t.items.length}</span>
          </div>
          {t.items.map((item, i) => (
            <ItemCard key={i} index={i} label={item.name || "Sans nom"} onDelete={() => {
              set("testimonials", { items: t.items.filter((_, idx) => idx !== i) });
            }}>
              <Field label="Citation" value={item.quote} onChange={(v) => {
                const arr = [...t.items]; arr[i] = { ...arr[i], quote: v }; set("testimonials", { items: arr });
              }} multiline />
              <div className="ce-row">
                <Field label="Nom" value={item.name} onChange={(v) => {
                  const arr = [...t.items]; arr[i] = { ...arr[i], name: v }; set("testimonials", { items: arr });
                }} />
                <Field label="Fonction" value={item.role} onChange={(v) => {
                  const arr = [...t.items]; arr[i] = { ...arr[i], role: v }; set("testimonials", { items: arr });
                }} />
              </div>
              <div className="ce-row">
                <Field label="Entreprise" value={item.company} onChange={(v) => {
                  const arr = [...t.items]; arr[i] = { ...arr[i], company: v }; set("testimonials", { items: arr });
                }} />
                <Field label="Initiales" value={item.initials} onChange={(v) => {
                  const arr = [...t.items]; arr[i] = { ...arr[i], initials: v }; set("testimonials", { items: arr });
                }} />
              </div>
              <Field label="Mot mis en avant" hint="Le mot surligné dans la citation" value={item.highlight} onChange={(v) => {
                const arr = [...t.items]; arr[i] = { ...arr[i], highlight: v }; set("testimonials", { items: arr });
              }} />
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("testimonials", { items: [...t.items, { quote: "", name: "", role: "", company: "", initials: "", highlight: "" }] })}>
            <Plus size={14} /> Ajouter un temoignage
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Partners                                                         */
  /* ================================================================ */

  /* Helper: upload an image and update a partner field */
  const uploadPartnerImage = async (file: File, index: number, field: "photo" | "logo" | "avatar") => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        const p = content.partners;
        const arr = [...p.items];
        arr[index] = { ...arr[index], [field]: data.url };
        set("partners", { items: arr });
      }
    } catch { /* silent */ }
  };

  /* Reusable image upload block for partner cards */
  const PartnerImageField = ({ label, hint, value, index, field, previewHeight = 80, previewRound = false }: {
    label: string; hint: string; value: string; index: number; field: "photo" | "logo" | "avatar";
    previewHeight?: number; previewRound?: boolean;
  }) => (
    <div className="ce-field">
      <label className="ce-label">
        <ImageIcon size={13} strokeWidth={2} style={{ opacity: 0.5 }} />
        {label}
      </label>
      {value && (
        <div style={{
          width: previewRound ? `${previewHeight}px` : "100%",
          height: `${previewHeight}px`,
          borderRadius: previewRound ? "50%" : "8px",
          overflow: "hidden",
          marginBottom: "8px",
          border: "1.5px solid #e5e7eb",
          background: "#f9fafb",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src={value} alt="" style={{
            width: "100%", height: "100%",
            objectFit: previewRound ? "cover" : "contain",
          }} />
        </div>
      )}
      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <input
          className="ce-input"
          value={value || ""}
          onChange={(e) => {
            const p = content.partners;
            const arr = [...p.items]; arr[index] = { ...arr[index], [field]: e.target.value }; set("partners", { items: arr });
          }}
          placeholder={hint}
          style={{ flex: 1 }}
        />
        <label style={{
          padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: 600,
          background: "#5F7263", color: "white", cursor: "pointer", whiteSpace: "nowrap",
          flexShrink: 0, display: "inline-flex", alignItems: "center", gap: "6px",
        }}>
          Choisir
          <input type="file" accept="image/*" style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadPartnerImage(file, index, field);
            }}
          />
        </label>
        {value && (
          <button className="ce-btn-icon ce-btn-icon--danger" title="Supprimer l'image" onClick={() => {
            const p = content.partners;
            const arr = [...p.items]; arr[index] = { ...arr[index], [field]: "" }; set("partners", { items: arr });
          }}>
            <Trash2 size={14} />
          </button>
        )}
      </div>
      <p className="ce-hint">{hint}</p>
    </div>
  );

  const renderPartners = () => {
    const p = content.partners;
    if (!p) return <p className="ce-hint">Section non initialisée. Sauvegardez pour créer la structure.</p>;
    return (
      <>
        <div className="ce-row">
          <Field label="Tag" value={p.tag} onChange={(v) => set("partners", { tag: v })} />
          <Field label="Compteur" hint="Ex: +50" value={p.counter} onChange={(v) => set("partners", { counter: v })} />
        </div>
        <div className="ce-row">
          <Field label="Titre" value={p.title} onChange={(v) => set("partners", { title: v })} />
          <Field label="Titre accent" value={p.titleHighlight} onChange={(v) => set("partners", { titleHighlight: v })} />
        </div>
        <div className="ce-row">
          <Field label="Label compteur" value={p.counterLabel} onChange={(v) => set("partners", { counterLabel: v })} />
          <Field label="CTA texte" value={p.ctaText} onChange={(v) => set("partners", { ctaText: v })} />
        </div>
        <Field label="CTA lien" value={p.ctaHref} onChange={(v) => set("partners", { ctaHref: v })} />
        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Users size={15} />
            <span>Avis partenaires</span>
            <span className="ce-badge">{p.items.length}</span>
          </div>
          {p.items.map((item, i) => (
            <ItemCard key={i} index={i} label={item.name || "Sans nom"} onDelete={() => {
              set("partners", { items: p.items.filter((_, idx) => idx !== i) });
            }}>
              {/* ── Image générale (fond) ── */}
              <PartnerImageField label="Image générale (fond)" hint="Image affichée en arrière-plan de l'avis" value={item.photo} index={i} field="photo" previewHeight={100} />

              {/* ── Logo client ── */}
              <PartnerImageField label="Logo client" hint="Logo de l'entreprise (auto-redimensionné à 120x36px)" value={item.logo} index={i} field="logo" previewHeight={50} />

              {/* ── Commentaire ── */}
              <Field label="Commentaire / Avis" value={item.quote} onChange={(v) => {
                const arr = [...p.items]; arr[i] = { ...arr[i], quote: v }; set("partners", { items: arr });
              }} multiline />

              {/* ── Identite de la personne ── */}
              <div style={{ marginTop: "12px", padding: "14px", borderRadius: "10px", background: "#f9fafb", border: "1px solid #eef0f2" }}>
                <div className="ce-subsection__header" style={{ marginBottom: 10 }}>
                  <Star size={14} />
                  <span>Personne qui temoigne</span>
                </div>
                <div className="ce-row">
                  <Field label="Nom complet" value={item.name} onChange={(v) => {
                    const arr = [...p.items]; arr[i] = { ...arr[i], name: v }; set("partners", { items: arr });
                  }} />
                  <Field label="Poste / Statut" hint="Ex: DRH — EasyVista" value={item.role} onChange={(v) => {
                    const arr = [...p.items]; arr[i] = { ...arr[i], role: v }; set("partners", { items: arr });
                  }} />
                </div>
                <div className="ce-row">
                  <Field label="Nombre d'employés" hint="Ex: 450 collaborateurs" value={item.employees} onChange={(v) => {
                    const arr = [...p.items]; arr[i] = { ...arr[i], employees: v }; set("partners", { items: arr });
                  }} />
                  <Field label="Initiales" hint="Fallback si pas de photo" value={item.initials} onChange={(v) => {
                    const arr = [...p.items]; arr[i] = { ...arr[i], initials: v }; set("partners", { items: arr });
                  }} />
                </div>
                {/* ── Photo de la personne (avatar) ── */}
                <PartnerImageField label="Photo de la personne" hint="Photo ronde à la place des initiales" value={item.avatar || ""} index={i} field="avatar" previewHeight={64} previewRound />
              </div>

              {/* ── Metriques ── */}
              <div className="ce-row" style={{ marginTop: "12px" }}>
                <Field label="Métrique" hint="Ex: 98%" value={item.metric} onChange={(v) => {
                  const arr = [...p.items]; arr[i] = { ...arr[i], metric: v }; set("partners", { items: arr });
                }} />
                <Field label="Label métrique" hint="Ex: satisfaction" value={item.metricLabel} onChange={(v) => {
                  const arr = [...p.items]; arr[i] = { ...arr[i], metricLabel: v }; set("partners", { items: arr });
                }} />
              </div>
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("partners", { items: [...p.items, { quote: "", name: "", role: "", employees: "", initials: "", metric: "", metricLabel: "", logo: "", photo: "", avatar: "" }] })}>
            <Plus size={14} /> Ajouter un avis partenaire
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Process                                                          */
  /* ================================================================ */

  const renderProcess = () => {
    const pr = content.process;
    if (!pr) return <p className="ce-hint">Section non initialisée. Sauvegardez pour créer la structure.</p>;
    return (
      <>
        <div className="ce-row">
          <Field label="Label" value={pr.label} onChange={(v) => set("process", { label: v })} />
          <Field label="Badge temps" value={pr.timeBadge} onChange={(v) => set("process", { timeBadge: v })} />
        </div>
        <div className="ce-row">
          <Field label="Titre" value={pr.title} onChange={(v) => set("process", { title: v })} />
          <Field label="Titre italique" value={pr.titleItalic} onChange={(v) => set("process", { titleItalic: v })} />
        </div>
        <Field label="Sous-titre" value={pr.subtitle} onChange={(v) => set("process", { subtitle: v })} multiline />
        <div className="ce-row">
          <Field label="CTA texte" value={pr.ctaText} onChange={(v) => set("process", { ctaText: v })} />
          <Field label="CTA lien" value={pr.ctaHref} onChange={(v) => set("process", { ctaHref: v })} />
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ListChecks size={15} />
            <span>Etapes</span>
            <span className="ce-badge">{pr.steps.length}</span>
          </div>
          {pr.steps.map((step, i) => (
            <ItemCard key={i} index={i} label={step.title || "Sans titre"} onDelete={() => {
              set("process", { steps: pr.steps.filter((_, idx) => idx !== i) });
            }}>
              <div className="ce-row">
                <Field label="Titre" value={step.title} onChange={(v) => {
                  const arr = [...pr.steps]; arr[i] = { ...arr[i], title: v }; set("process", { steps: arr });
                }} />
                <Field label="Badge" value={step.badge} onChange={(v) => {
                  const arr = [...pr.steps]; arr[i] = { ...arr[i], badge: v }; set("process", { steps: arr });
                }} />
              </div>
              <Field label="Description" value={step.desc} onChange={(v) => {
                const arr = [...pr.steps]; arr[i] = { ...arr[i], desc: v }; set("process", { steps: arr });
              }} multiline />
              <div className="ce-row">
                <Field label="Icône" hint="MessageSquare, Package, Truck..." value={step.icon} onChange={(v) => {
                  const arr = [...pr.steps]; arr[i] = { ...arr[i], icon: v }; set("process", { steps: arr });
                }} />
                <Field label="Image (URL)" value={step.image} onChange={(v) => {
                  const arr = [...pr.steps]; arr[i] = { ...arr[i], image: v }; set("process", { steps: arr });
                }} />
              </div>
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("process", { steps: [...pr.steps, { icon: "", title: "", desc: "", badge: "", image: "" }] })}>
            <Plus size={14} /> Ajouter une etape
          </button>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ShieldCheck size={15} />
            <span>Garanties</span>
            <span className="ce-badge">{pr.guarantees.length}</span>
          </div>
          {pr.guarantees.map((g, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={g.icon} onChange={(e) => {
                const arr = [...pr.guarantees]; arr[i] = { ...arr[i], icon: e.target.value }; set("process", { guarantees: arr });
              }} placeholder="Icone" style={{ flex: "0 0 120px" }} />
              <input className="ce-input" value={g.label} onChange={(e) => {
                const arr = [...pr.guarantees]; arr[i] = { ...arr[i], label: e.target.value }; set("process", { guarantees: arr });
              }} placeholder="Libellé" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("process", { guarantees: pr.guarantees.filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("process", { guarantees: [...pr.guarantees, { icon: "", label: "" }] })}>
            <Plus size={14} /> Ajouter une garantie
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  FAQ                                                              */
  /* ================================================================ */

  const renderFAQ = () => {
    const f = content.faq;
    if (!f) return <p className="ce-hint">Section non initialisée. Sauvegardez pour créer la structure.</p>;
    return (
      <>
        <div className="ce-row">
          <Field label="Label" value={f.label} onChange={(v) => set("faq", { label: v })} />
          <Field label="Titre" value={f.title} onChange={(v) => set("faq", { title: v })} />
        </div>
        <Field label="Sous-titre" value={f.subtitle} onChange={(v) => set("faq", { subtitle: v })} multiline />
        <Field label="Image (URL)" value={f.image} onChange={(v) => set("faq", { image: v })} />
        <div className="ce-row">
          <Field label="CTA texte" value={f.ctaText} onChange={(v) => set("faq", { ctaText: v })} />
          <Field label="CTA lien" value={f.ctaHref} onChange={(v) => set("faq", { ctaHref: v })} />
        </div>
        <Field label="Texte additionnel CTA" value={f.ctaAdditionalText} onChange={(v) => set("faq", { ctaAdditionalText: v })} />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <HelpCircle size={15} />
            <span>Questions / Reponses</span>
            <span className="ce-badge">{f.items.length}</span>
          </div>
          {f.items.map((item, i) => (
            <ItemCard key={i} index={i} label={item.q || "Sans question"} onDelete={() => {
              set("faq", { items: f.items.filter((_, idx) => idx !== i) });
            }}>
              <Field label="Question" value={item.q} onChange={(v) => {
                const arr = [...f.items]; arr[i] = { ...arr[i], q: v }; set("faq", { items: arr });
              }} />
              <Field label="Réponse" value={item.a} onChange={(v) => {
                const arr = [...f.items]; arr[i] = { ...arr[i], a: v }; set("faq", { items: arr });
              }} multiline />
            </ItemCard>
          ))}
          <button className="ce-btn-add" onClick={() => set("faq", { items: [...f.items, { q: "", a: "" }] })}>
            <Plus size={14} /> Ajouter une question
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Footer                                                           */
  /* ================================================================ */

  const renderFooter = () => {
    const ft = content.footer;
    if (!ft) return <p className="ce-hint">Section non initialisée. Sauvegardez pour créer la structure.</p>;
    return (
      <>
        <Field label="Description marque" value={ft.description} onChange={(v) => set("footer", { description: v })} multiline />

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <Link2 size={15} />
            <span>Liens sociaux</span>
            <span className="ce-badge">{ft.socialLinks.length}</span>
          </div>
          {ft.socialLinks.map((link, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={link.icon} onChange={(e) => {
                const arr = [...ft.socialLinks]; arr[i] = { ...arr[i], icon: e.target.value }; set("footer", { socialLinks: arr });
              }} placeholder="Icone (Linkedin, Mail...)" style={{ flex: "0 0 140px" }} />
              <input className="ce-input" value={link.href} onChange={(e) => {
                const arr = [...ft.socialLinks]; arr[i] = { ...arr[i], href: e.target.value }; set("footer", { socialLinks: arr });
              }} placeholder="URL" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("footer", { socialLinks: ft.socialLinks.filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("footer", { socialLinks: [...ft.socialLinks, { icon: "", href: "" }] })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <MapPin size={15} />
            <span>Navigation</span>
            <span className="ce-badge">{ft.navigationLinks.length}</span>
          </div>
          <Field label="Titre de la colonne" value={ft.navigationTitle} onChange={(v) => set("footer", { navigationTitle: v })} />
          {ft.navigationLinks.map((link, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={link.label} onChange={(e) => {
                const arr = [...ft.navigationLinks]; arr[i] = { ...arr[i], label: e.target.value }; set("footer", { navigationLinks: arr });
              }} placeholder="Label" style={{ flex: 1 }} />
              <input className="ce-input" value={link.href} onChange={(e) => {
                const arr = [...ft.navigationLinks]; arr[i] = { ...arr[i], href: e.target.value }; set("footer", { navigationLinks: arr });
              }} placeholder="Lien" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("footer", { navigationLinks: ft.navigationLinks.filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("footer", { navigationLinks: [...ft.navigationLinks, { label: "", href: "" }] })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <LayoutGrid size={15} />
            <span>Services / Coffrets</span>
            <span className="ce-badge">{ft.services.length}</span>
          </div>
          <Field label="Titre de la colonne" value={ft.servicesTitle} onChange={(v) => set("footer", { servicesTitle: v })} />
          <Field label="Lien des services" value={ft.servicesHref} onChange={(v) => set("footer", { servicesHref: v })} />
          {ft.services.map((s, i) => (
            <ListItem key={i} value={s} onChange={(v) => {
              const arr = [...ft.services]; arr[i] = v; set("footer", { services: arr });
            }} onDelete={() => set("footer", { services: ft.services.filter((_, idx) => idx !== i) })} placeholder="Nom du coffret" />
          ))}
          <button className="ce-btn-add" onClick={() => set("footer", { services: [...ft.services, ""] })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <MessageCircle size={15} />
            <span>Contact</span>
          </div>
          <Field label="Titre de la colonne" value={ft.contactTitle} onChange={(v) => set("footer", { contactTitle: v })} />
          <div className="ce-row">
            <Field label="Email" value={ft.contactEmail} onChange={(v) => set("footer", { contactEmail: v })} />
            <Field label="Localisation" value={ft.contactLocation} onChange={(v) => set("footer", { contactLocation: v })} />
          </div>
          <div className="ce-row">
            <Field label="CTA texte" value={ft.contactCtaText} onChange={(v) => set("footer", { contactCtaText: v })} />
            <Field label="CTA lien" value={ft.contactCtaHref} onChange={(v) => set("footer", { contactCtaHref: v })} />
          </div>
        </div>

        <div className="ce-subsection">
          <div className="ce-subsection__header">
            <ShieldCheck size={15} />
            <span>Liens legaux</span>
            <span className="ce-badge">{ft.legalLinks.length}</span>
          </div>
          {ft.legalLinks.map((link, i) => (
            <div key={i} className="ce-list-item">
              <GripVertical size={14} style={{ color: "#c4c9d1", flexShrink: 0 }} />
              <input className="ce-input" value={link.label} onChange={(e) => {
                const arr = [...ft.legalLinks]; arr[i] = { ...arr[i], label: e.target.value }; set("footer", { legalLinks: arr });
              }} placeholder="Label" style={{ flex: 1 }} />
              <input className="ce-input" value={link.href} onChange={(e) => {
                const arr = [...ft.legalLinks]; arr[i] = { ...arr[i], href: e.target.value }; set("footer", { legalLinks: arr });
              }} placeholder="URL" style={{ flex: 1 }} />
              <button className="ce-btn-icon ce-btn-icon--danger" onClick={() => set("footer", { legalLinks: ft.legalLinks.filter((_, idx) => idx !== i) })} title="Supprimer">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button className="ce-btn-add" onClick={() => set("footer", { legalLinks: [...ft.legalLinks, { label: "", href: "" }] })}>
            <Plus size={14} /> Ajouter
          </button>
        </div>
      </>
    );
  };

  /* ================================================================ */
  /*  Main render                                                      */
  /* ================================================================ */

  /* Section render functions map */
  const renderFn: Record<string, () => React.ReactNode> = {
    banner: renderBanner, hero: renderHero, topCoffrets: renderTopCoffrets, benefits: renderBenefits,
    whyOmea: renderWhyOmea, impact: renderImpact, testimonials: renderTestimonials,
    personalization: renderPersonalization, partners: renderPartners,
    process: renderProcess, cta: renderCTA, faq: renderFAQ, footer: renderFooter,
  };

  /* Progress stats */
  const completedCount = SECTIONS.filter((s) => getSectionStatus(content, s.key) === "complete").length;
  const progressPercent = Math.round((completedCount / SECTIONS.length) * 100);

  return (
    <div className="ce-root">
      <style>{`
        /* ---- animations ---- */
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ============================================================ */
        /*  3-COLUMN BUILDER LAYOUT                                      */
        /* ============================================================ */
        .ce-root {
          font-family: 'Inter', sans-serif;
          position: relative;
        }

        /* ---- top bar ---- */
        .ce-topbar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 20px;
          background: white;
          border-bottom: 1px solid #eef0f2;
          z-index: 40;
        }
        .ce-topbar__title {
          font-family: 'Manrope', sans-serif; font-weight: 750;
          font-size: 0.95rem; color: #1a1f25; margin: 0;
        }
        .ce-topbar__progress {
          display: flex; align-items: center; gap: 8px;
          margin-left: 16px;
        }
        .ce-topbar__bar {
          width: 120px; height: 4px; background: #eef0f2;
          border-radius: 2px; overflow: hidden;
        }
        .ce-topbar__bar-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, #87A38D, #5F7263);
          transition: width 0.4s ease;
        }
        .ce-topbar__percent {
          font-size: 0.68rem; font-weight: 600; color: #6b7280;
          white-space: nowrap;
        }
        .ce-topbar__actions {
          display: flex; align-items: center; gap: 6px;
          margin-left: auto;
        }
        .ce-topbar__autosave {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.68rem; font-weight: 500; color: #9ca3af;
          padding: 0 10px; white-space: nowrap;
        }
        .ce-topbar__dot {
          width: 6px; height: 6px; border-radius: 50%;
          transition: background 0.3s ease;
        }
        .ce-topbar__dot--idle { background: #d1d5db; }
        .ce-topbar__dot--saving { background: #f59e0b; animation: pulse 1s infinite; }
        .ce-topbar__dot--saved { background: #10b981; }
        .ce-panel-btn {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 5px 10px; border-radius: 7px; cursor: pointer;
          font-size: 0.72rem; font-weight: 550; color: #6b7280;
          border: 1.5px solid #e5e7eb; background: white;
          transition: all 0.15s ease; font-family: inherit;
          white-space: nowrap;
        }
        .ce-panel-btn:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }
        .ce-panel-btn--active {
          background: #5F7263; color: white; border-color: #5F7263;
        }
        .ce-panel-btn--active:hover { background: #4A5C4E; border-color: #4A5C4E; color: white; }

        /* ---- 3-column body ---- */
        .ce-builder {
          display: flex;
        }

        /* ---- LEFT SIDEBAR (section list) ---- */
        .ce-sidebar {
          width: 240px; flex-shrink: 0;
          background: #fafbfc;
          border-right: 1px solid #eef0f2;
          overflow-y: auto;
          padding: 16px 0;
          height: calc(100vh - 64px - 50px);
          position: sticky; top: 0;
        }
        .ce-sidebar__label {
          font-size: 0.6rem; font-weight: 650; text-transform: uppercase;
          letter-spacing: 0.1em; color: #9ca3af;
          padding: 0 16px; margin-bottom: 8px;
        }
        .ce-sidebar__item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 16px; cursor: pointer;
          border: none; background: none; width: 100%; text-align: left;
          font-family: inherit; font-size: 0.8rem; font-weight: 450;
          color: #6b7280; transition: all 0.15s ease;
          position: relative; border-left: 3px solid transparent;
        }
        .ce-sidebar__item:hover {
          background: rgba(135,163,141,0.06); color: #374151;
        }
        .ce-sidebar__item--active {
          background: rgba(135,163,141,0.1);
          border-left-color: #5F7263;
          color: #5F7263; font-weight: 600;
        }
        .ce-sidebar__icon {
          width: 30px; height: 30px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; transition: all 0.15s ease;
        }
        .ce-sidebar__status {
          width: 7px; height: 7px; border-radius: 50%;
          margin-left: auto; flex-shrink: 0;
        }
        .ce-sidebar__status--complete { background: #10b981; }
        .ce-sidebar__status--partial { background: #f59e0b; }
        .ce-sidebar__status--empty { background: #e5e7eb; }

        .ce-sidebar__kbd {
          font-size: 0.58rem; font-weight: 500; color: #c4c9d1;
          margin-left: auto; font-family: 'SF Mono', monospace;
          padding: 1px 4px; border-radius: 3px;
          border: 1px solid #e5e7eb; background: white;
          display: none;
        }
        .ce-sidebar__item:hover .ce-sidebar__kbd { display: block; }
        .ce-sidebar__item--active .ce-sidebar__kbd { display: block; color: #87A38D; }

        /* ---- CENTER EDITOR ---- */
        .ce-editor {
          flex: 1; min-width: 0;
        }
        .ce-editor--hidden { display: none; }

        /* Section header in editor */
        .ce-section-header {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 28px; padding-bottom: 20px;
          border-bottom: 2px solid #f3f5f7;
        }
        .ce-section-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .ce-section-title {
          font-family: 'Manrope', sans-serif; font-weight: 800;
          font-size: 1.3rem; color: #1a1f25; letter-spacing: -0.02em;
          margin: 0;
        }
        .ce-section-subtitle {
          font-size: 0.75rem; color: #9ca3af; font-weight: 450; margin-top: 2px;
        }
        .ce-section-nav {
          display: flex; align-items: center; gap: 6px;
          margin-left: auto;
        }
        .ce-section-nav-btn {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px; border-radius: 8px;
          border: 1.5px solid #e5e7eb; background: white;
          color: #6b7280; cursor: pointer; transition: all 0.15s ease;
          font-family: inherit;
        }
        .ce-section-nav-btn:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }
        .ce-section-nav-btn:disabled { opacity: 0.3; cursor: default; }

        /* Editor body — animate entrance */
        .ce-editor__body {
          animation: fadeIn 0.25s ease;
        }

        /* ---- field ---- */
        .ce-field { margin-bottom: 14px; }
        .ce-label {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.73rem; font-weight: 580; color: #4b5563;
          margin-bottom: 5px; letter-spacing: 0.01em;
        }
        .ce-input {
          padding: 9px 13px; border: 1.5px solid #e5e7eb; border-radius: 8px;
          font-size: 0.86rem; width: 100%; font-family: inherit;
          box-sizing: border-box; transition: all 0.15s ease; outline: none;
          background: #fafbfc; color: #1a1f25;
        }
        .ce-input:focus {
          border-color: #87A38D;
          box-shadow: 0 0 0 3px rgba(135,163,141,0.12);
          background: white;
        }
        .ce-textarea { min-height: 72px; resize: vertical; line-height: 1.55; }
        .ce-hint {
          font-size: 0.7rem; color: #b0b5be; margin: 3px 0 0; font-weight: 400;
        }

        /* ---- rows / grids ---- */
        .ce-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .ce-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ce-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }

        /* ---- subsection ---- */
        .ce-subsection {
          margin-top: 18px; padding-top: 18px;
          border-top: 1px solid #f3f5f7;
        }
        .ce-subsection__header {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.78rem; font-weight: 620; color: #374151;
          margin-bottom: 12px;
        }
        .ce-badge {
          font-size: 0.65rem; font-weight: 600;
          background: #f0f1f3; color: #6b7280;
          padding: 2px 7px; border-radius: 10px;
        }

        /* ---- list item ---- */
        .ce-list-item {
          display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
        }

        /* ---- item card ---- */
        .ce-item-card {
          background: #f9fafb; border-radius: 10px;
          border: 1px solid #eef0f2; overflow: hidden;
          transition: border-color 0.15s;
        }
        .ce-item-card:hover { border-color: #d4d8de; }
        .ce-item-card__header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; background: #f3f5f7;
          border-bottom: 1px solid #eef0f2;
        }
        .ce-item-card__title {
          display: flex; align-items: center; gap: 8px;
          font-weight: 600; font-size: 0.78rem; color: #374151;
        }
        .ce-item-card__index {
          font-size: 0.65rem; font-weight: 700; color: #9ca3af;
          font-family: 'SF Mono', 'Fira Code', monospace;
        }
        .ce-item-card__body { padding: 14px; }

        /* ---- buttons ---- */
        .ce-btn-add {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 8px;
          font-size: 0.78rem; font-weight: 580;
          border: 1.5px dashed #d4d8de; background: transparent;
          color: #6b7280; cursor: pointer; margin-top: 10px;
          transition: all 0.15s ease; font-family: inherit;
        }
        .ce-btn-add:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }

        .ce-btn-icon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 6px;
          border: none; cursor: pointer; transition: all 0.15s ease;
          background: transparent; color: #9ca3af;
        }
        .ce-btn-icon:hover { background: #f3f4f6; }
        .ce-btn-icon--danger:hover { background: #fef2f2; color: #ef4444; }

        /* ---- testimonial card ---- */
        .ce-testimonial-card {
          background: #f9fafb; border-radius: 12px; padding: 18px;
          border: 1px solid #eef0f2;
        }

        /* ---- floating save ---- */
        .ce-save {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 18px; border-radius: 10px;
          border: none; font-family: 'Manrope', sans-serif;
          font-weight: 700; font-size: 0.8rem; cursor: pointer;
          transition: all 0.15s ease;
        }
        .ce-save--default { background: #5F7263; color: white; }
        .ce-save--default:hover { background: #4A5C4E; }
        .ce-save--saving { background: #6b7280; color: white; cursor: wait; opacity: 0.8; }
        .ce-save--saved { background: #10b981; color: white; }

        /* ---- toast ---- */
        .ce-toast {
          position: fixed; bottom: 28px; right: 28px;
          padding: 12px 20px; border-radius: 10px;
          font-weight: 550; font-size: 0.84rem;
          font-family: inherit; z-index: 9999;
          animation: toastSlide 0.3s ease;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
        .ce-toast--success { background: #065f46; color: white; }
        .ce-toast--error { background: #991b1b; color: white; }
        .ce-toast__icon {
          width: 20px; height: 20px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }

        /* ---- loading ---- */
        .ce-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 60vh; gap: 12px; color: #6b7280; font-size: 0.88rem;
        }
        .ce-spinner {
          width: 28px; height: 28px;
          border: 2.5px solid #eef0f2; border-top-color: #5F7263;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }

        /* ============================================================ */
        /*  Live Preview panel (cp- namespace)                           */
        /* ============================================================ */
        .cp-root {
          flex-shrink: 0; width: 50%;
          display: flex; flex-direction: column;
          overflow: hidden;
          border-left: 1px solid #eef0f2;
          height: calc(100vh - 64px - 50px);
          position: sticky; top: 0;
        }
        .ce-builder--editor .cp-root { display: none; }
        .ce-builder--preview .ce-sidebar { display: none; }
        .ce-builder--preview .ce-editor { display: none; }
        .ce-builder--preview .cp-root { width: 100%; }
        .cp-header {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.72rem; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.06em; color: #87A38D;
          padding: 12px 16px 12px; margin: 0;
          border-bottom: 1px solid #eef0f2;
          background: #fafbfc;
        }
        .cp-refresh {
          margin-left: auto; display: flex; align-items: center;
          justify-content: center; width: 28px; height: 28px;
          border-radius: 8px; border: 1.5px solid #e5e7eb;
          background: white; color: #6b7280; cursor: pointer;
          transition: all 0.15s ease;
        }
        .cp-refresh:hover { border-color: #87A38D; color: #5F7263; background: #f0fdf4; }
        .cp-refresh:disabled { opacity: 0.5; cursor: wait; }
        .cp-viewport {
          background: white;
          overflow: hidden;
          flex: 1; min-height: 0;
        }
        .cp-iframe {
          width: 100%; height: 100%; border: none;
          transform-origin: top left;
        }
      `}</style>

      {/* ============================================================ */}
      {/*  TOP BAR — Title + Progress + Actions                         */}
      {/* ============================================================ */}
      <div className="ce-topbar">
        <h1 className="ce-topbar__title">Éditeur de contenu</h1>

        {/* Progress bar */}
        <div className="ce-topbar__progress">
          <div className="ce-topbar__bar">
            <div className="ce-topbar__bar-fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="ce-topbar__percent">{completedCount}/{SECTIONS.length} sections</span>
        </div>

        <div className="ce-topbar__actions">
          {/* Autosave indicator */}
          <div className="ce-topbar__autosave">
            <span className={`ce-topbar__dot ce-topbar__dot--${autoSaveStatus}`} />
            {autoSaveStatus === "saving" ? "Sauvegarde..." : autoSaveStatus === "saved" ? "Sauvegarde" : "Auto-save actif"}
          </div>

          {/* Save button */}
          <button
            className={`ce-save ${saving ? "ce-save--saving" : saved ? "ce-save--saved" : "ce-save--default"}`}
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? (
              <><div className="ce-spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Sauvegarde...</>
            ) : saved ? (
              <><Check size={14} strokeWidth={3} /> OK</>
            ) : (
              <><Save size={14} /> Enregistrer</>
            )}
          </button>

          {/* View mode toggle */}
          <div style={{ display: "flex", gap: "3px" }}>
            <button
              className={`ce-panel-btn ${panelMode === "editor" ? "ce-panel-btn--active" : ""}`}
              onClick={() => setPanelMode("editor")}
              title="Éditeur seul"
            >
              <PanelLeft size={13} />
            </button>
            <button
              className={`ce-panel-btn ${panelMode === "both" ? "ce-panel-btn--active" : ""}`}
              onClick={() => setPanelMode("both")}
              title="Éditeur + Aperçu"
            >
              <Columns2 size={13} />
            </button>
            <button
              className={`ce-panel-btn ${panelMode === "preview" ? "ce-panel-btn--active" : ""}`}
              onClick={() => setPanelMode("preview")}
              title="Aperçu seul"
            >
              <Eye size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  3-COLUMN BUILDER                                              */}
      {/* ============================================================ */}
      <div className={`ce-builder ce-builder--${panelMode}`}>

        {/* ---- LEFT: Section sidebar ---- */}
        <aside className="ce-sidebar">
          <p className="ce-sidebar__label">Structure de la page</p>
          {SECTIONS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = activeSection === s.key;
            const status = getSectionStatus(content, s.key);
            return (
              <button
                key={s.key}
                className={`ce-sidebar__item ${isActive ? "ce-sidebar__item--active" : ""}`}
                onClick={() => selectSection(s.key)}
                onMouseEnter={() => {
                  /* Hover → highlight in preview */
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      { type: "omea-highlight", selector: SECTION_ANCHORS[s.key], on: true },
                      "*"
                    );
                  }
                }}
                onMouseLeave={() => {
                  if (iframeRef.current?.contentWindow) {
                    iframeRef.current.contentWindow.postMessage(
                      { type: "omea-highlight", selector: SECTION_ANCHORS[s.key], on: false },
                      "*"
                    );
                  }
                }}
              >
                <div
                  className="ce-sidebar__icon"
                  style={{
                    background: isActive ? s.color + "18" : "rgba(0,0,0,0.03)",
                    color: isActive ? s.color : "#9ca3af",
                  }}
                >
                  <Icon size={15} strokeWidth={isActive ? 2.2 : 1.6} />
                </div>
                <span>{s.label}</span>
                <span className={`ce-sidebar__status ce-sidebar__status--${status}`} title={
                  status === "complete" ? "Complet" : status === "partial" ? "Partiel" : "Vide"
                } />
                <span className="ce-sidebar__kbd">{idx + 1}</span>
              </button>
            );
          })}
        </aside>

        {/* ---- CENTER: Active section editor ---- */}
        <div
          className={`ce-editor ${panelMode === "preview" ? "ce-editor--hidden" : ""}`}
          style={{
            padding: "24px 32px 120px",
            height: "calc(100vh - 114px)",
            overflowY: "scroll",
            overflowX: "hidden",
            overscrollBehavior: "contain",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {(() => {
            const s = SECTIONS.find((sec) => sec.key === activeSection);
            if (!s) return null;
            const Icon = s.icon;
            const idx = SECTIONS.indexOf(s);
            return (
              <>
                {/* Section header */}
                <div className="ce-section-header">
                  <div className="ce-section-icon" style={{ background: s.color + "14", color: s.color }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <h2 className="ce-section-title">{s.label}</h2>
                    <p className="ce-section-subtitle">Section {idx + 1} sur {SECTIONS.length}</p>
                  </div>
                  <div className="ce-section-nav">
                    <button
                      className="ce-section-nav-btn"
                      onClick={() => selectSection(SECTIONS[idx - 1]?.key)}
                      disabled={idx === 0}
                      title="Section precedente"
                    >
                      <ChevronDown size={14} style={{ transform: "rotate(90deg)" }} />
                    </button>
                    <button
                      className="ce-section-nav-btn"
                      onClick={() => selectSection(SECTIONS[idx + 1]?.key)}
                      disabled={idx === SECTIONS.length - 1}
                      title="Section suivante"
                    >
                      <ChevronDown size={14} style={{ transform: "rotate(-90deg)" }} />
                    </button>
                  </div>
                </div>

                {/* Section content */}
                <div className="ce-editor__body" key={activeSection}>
                  {renderFn[activeSection]?.()}
                </div>

                {/* Next section CTA */}
                {idx < SECTIONS.length - 1 && (
                  <div style={{
                    marginTop: "32px", paddingTop: "24px",
                    borderTop: "2px solid #f3f5f7",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: "0.78rem", color: "#9ca3af" }}>
                      Section suivante : <strong style={{ color: "#374151" }}>{SECTIONS[idx + 1].label}</strong>
                    </span>
                    <button
                      onClick={() => selectSection(SECTIONS[idx + 1].key)}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "10px 20px", borderRadius: "10px",
                        border: "1.5px solid #e5e7eb", background: "white",
                        color: "#5F7263", fontSize: "0.82rem", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s ease",
                        fontFamily: "inherit",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#5F7263";
                        (e.currentTarget as HTMLElement).style.background = "rgba(45,74,62,0.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb";
                        (e.currentTarget as HTMLElement).style.background = "white";
                      }}
                    >
                      Continuer →
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>

        {/* ---- RIGHT: Live preview ---- */}
        <LivePreview iframeRef={iframeRef} onRefresh={refreshPreview} refreshing={refreshing} />
      </div>

      {toast ? <Toast message={toast} onClose={() => setToast(null)} /> : null}
    </div>
  );
}
