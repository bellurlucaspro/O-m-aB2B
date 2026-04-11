"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search, Mail, Phone, Building2, User, Calendar, Hash,
  Trash2, Check, MailOpen, Archive, Reply, Download,
  Inbox, MessageSquareText, Package, TrendingUp, X, Filter,
  Euro, ShoppingBag, Sparkles, ChevronRight, Info,
} from "lucide-react";

interface CustomCoffretSubmission {
  products: { id: string; name: string; price: number; qty: number }[];
  totalHT: number;
  totalTTC: number;
  quantity: number;
}

interface Submission {
  id: string;
  date: string;
  company: string;
  representative: string;
  role: string;
  email: string;
  phone: string;
  tva: string;
  siret: string;
  quantity: string;
  message: string;
  read: boolean;
  customCoffret?: CustomCoffretSubmission;
}

const ACCENT = "#5F7263";
const SAGE = "#87A38D";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function relativeTime(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)} sem.`;
  return `il y a ${Math.floor(diffD / 30)} mois`;
}

function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate a consistent pastel color from a string
function colorFromString(str: string): string {
  const colors = ["#87A38D", "#5F7263", "#B8860B", "#C06050", "#D4956B", "#8b9eb0", "#a08fa8"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

type FilterType = "all" | "unread" | "read" | "custom";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const fetchSubmissions = async () => {
    try {
      const res = await fetch("/api/admin/submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
        // Auto-select the first unread, then most recent
        const sorted = [...data].sort((a: Submission, b: Submission) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const firstUnread = sorted.find((s: Submission) => !s.read);
        setSelected(firstUnread || sorted[0] || null);
      }
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubmissions(); }, []);

  const unreadCount = submissions.filter((s) => !s.read).length;
  const customCount = submissions.filter((s) => !!s.customCoffret).length;

  // Total turnover from custom coffret submissions
  const totalTurnover = submissions.reduce((acc, s) => acc + (s.customCoffret?.totalTTC ?? 0), 0);

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];
    if (filter === "unread") list = list.filter((s) => !s.read);
    else if (filter === "read") list = list.filter((s) => s.read);
    else if (filter === "custom") list = list.filter((s) => !!s.customCoffret);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((s) =>
        s.company.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.representative.toLowerCase().includes(q) ||
        s.message?.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [submissions, filter, searchQuery]);

  const markAsRead = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setSubmissions((prev) => prev.map((s) => (s.id === id ? { ...s, read: true } : s)));
        if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, read: true } : null));
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const deleteSubmission = async (id: string) => {
    if (!confirm("Supprimer définitivement cette demande ?")) return;
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        const remaining = submissions.filter((s) => s.id !== id);
        setSubmissions(remaining);
        if (selected?.id === id) {
          setSelected(remaining[0] || null);
        }
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleSelect = (s: Submission) => {
    setSelected(s);
    if (!s.read) markAsRead(s.id);
  };

  const exportCSV = () => {
    const headers = ["Date", "Entreprise", "Contact", "Email", "Téléphone", "Quantité", "Type", "Total TTC", "Statut"];
    const rows = submissions.map((s) => [
      new Date(s.date).toISOString(),
      s.company,
      s.representative,
      s.email,
      s.phone,
      s.quantity,
      s.customCoffret ? "Coffret sur-mesure" : "Devis standard",
      s.customCoffret ? `${(s.customCoffret.totalTTC / 100).toFixed(2)}€` : "",
      s.read ? "Lue" : "Non lue",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `demandes-omea-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="inbox-root">
      <style>{styles}</style>

      {/* ═══════ TOP BAR ═══════ */}
      <div className="inbox-topbar">
        <div className="inbox-topbar__heading">
          <h1 className="inbox-topbar__title">Boîte de réception</h1>
          <p className="inbox-topbar__sub">
            Toutes les demandes de devis reçues via votre site. Cliquez sur une demande pour voir le détail et prendre contact.
          </p>
        </div>
        <button className="inbox-btn-export" onClick={exportCSV} disabled={submissions.length === 0}>
          <Download size={14} strokeWidth={2.2} />
          Exporter en CSV
        </button>
      </div>

      {/* ═══════ STATS BAR ═══════ */}
      <div className="inbox-stats">
        <div className="inbox-stat">
          <div className="inbox-stat__icon" style={{ background: "rgba(95,114,99,0.08)", color: "#5F7263" }}>
            <Inbox size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="inbox-stat__val">{submissions.length}</div>
            <div className="inbox-stat__label">Demandes au total</div>
          </div>
        </div>
        <div className="inbox-stat">
          <div className="inbox-stat__icon" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
            <MailOpen size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="inbox-stat__val">{unreadCount}</div>
            <div className="inbox-stat__label">Non lue{unreadCount !== 1 ? "s" : ""}</div>
          </div>
        </div>
        <div className="inbox-stat">
          <div className="inbox-stat__icon" style={{ background: "rgba(135,163,141,0.12)", color: "#87A38D" }}>
            <Package size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="inbox-stat__val">{customCount}</div>
            <div className="inbox-stat__label">Coffret{customCount !== 1 ? "s" : ""} sur-mesure</div>
          </div>
        </div>
        <div className="inbox-stat">
          <div className="inbox-stat__icon" style={{ background: "rgba(234,179,8,0.1)", color: "#d97706" }}>
            <TrendingUp size={18} strokeWidth={2.2} />
          </div>
          <div>
            <div className="inbox-stat__val">{(totalTurnover / 100).toFixed(0)}€</div>
            <div className="inbox-stat__label">Pipeline potentiel TTC</div>
          </div>
        </div>
      </div>

      {/* ═══════ MAIN CONTENT ═══════ */}
      {loading ? (
        <div className="inbox-loading">
          <div className="inbox-spinner" />
          <p>Chargement des demandes…</p>
        </div>
      ) : submissions.length === 0 ? (
        <div className="inbox-empty">
          <div className="inbox-empty__icon">
            <Inbox size={40} strokeWidth={1.5} />
          </div>
          <h2>Aucune demande pour le moment</h2>
          <p>Dès qu&apos;un visiteur remplit le formulaire de devis sur votre site, sa demande apparaîtra ici en temps réel.</p>
        </div>
      ) : (
        <div className="inbox-main">
          {/* LEFT: List */}
          <div className="inbox-list-col">
            {/* Search + filters */}
            <div className="inbox-search-wrap">
              <div className="inbox-search">
                <Search size={14} strokeWidth={2.2} style={{ color: "#9ca3af", flexShrink: 0 }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher une entreprise, un email…"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="inbox-search__clear">
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="inbox-filters">
                {([
                  { key: "all", label: "Toutes", count: submissions.length },
                  { key: "unread", label: "Non lues", count: unreadCount },
                  { key: "custom", label: "Sur-mesure", count: customCount },
                  { key: "read", label: "Traitées", count: submissions.length - unreadCount },
                ] as { key: FilterType; label: string; count: number }[]).map((f) => (
                  <button
                    key={f.key}
                    className={`inbox-filter ${filter === f.key ? "inbox-filter--active" : ""}`}
                    onClick={() => setFilter(f.key)}
                  >
                    {f.label}
                    <span className="inbox-filter__count">{f.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="inbox-list">
              {filteredSubmissions.length === 0 ? (
                <div className="inbox-list-empty">
                  <Filter size={22} strokeWidth={1.5} />
                  <p>Aucun résultat</p>
                  <button onClick={() => { setSearchQuery(""); setFilter("all"); }} className="inbox-link">
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                filteredSubmissions.map((s) => {
                  const isSelected = selected?.id === s.id;
                  const initials = getInitials(s.representative || s.company || "??");
                  const avatarColor = colorFromString(s.company || s.email);
                  return (
                    <button
                      key={s.id}
                      className={`inbox-item ${isSelected ? "inbox-item--selected" : ""} ${!s.read ? "inbox-item--unread" : ""}`}
                      onClick={() => handleSelect(s)}
                    >
                      {!s.read && <div className="inbox-item__unread-dot" />}
                      <div
                        className="inbox-item__avatar"
                        style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)` }}
                      >
                        {initials}
                      </div>
                      <div className="inbox-item__content">
                        <div className="inbox-item__header">
                          <span className="inbox-item__company">{s.company || s.representative || "(Sans nom)"}</span>
                          <span className="inbox-item__time">{relativeTime(s.date)}</span>
                        </div>
                        <div className="inbox-item__preview">
                          {s.customCoffret ? (
                            <span className="inbox-item__tag inbox-item__tag--custom">
                              <Sparkles size={9} strokeWidth={2.5} />
                              Coffret sur-mesure · {(s.customCoffret.totalTTC / 100).toFixed(0)}€
                            </span>
                          ) : (
                            <span className="inbox-item__tag">
                              <MessageSquareText size={9} strokeWidth={2.5} />
                              Devis standard
                            </span>
                          )}
                          {s.quantity && <span className="inbox-item__qty">· {s.quantity}</span>}
                        </div>
                        <p className="inbox-item__message">
                          {(s.message || "Aucun message").replace(/\n/g, " ").slice(0, 80)}
                          {(s.message?.length || 0) > 80 ? "…" : ""}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* RIGHT: Detail panel */}
          <div className="inbox-detail-col">
            {!selected ? (
              <div className="inbox-detail-empty">
                <MessageSquareText size={40} strokeWidth={1.3} />
                <p>Sélectionnez une demande pour en voir le détail</p>
              </div>
            ) : (
              <DetailPanel
                submission={selected}
                onMarkRead={() => markAsRead(selected.id)}
                onDelete={() => deleteSubmission(selected.id)}
                loading={actionLoading === selected.id}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================ */
/*  Detail panel component                                      */
/* ============================================================ */

function DetailPanel({
  submission, onMarkRead, onDelete, loading,
}: {
  submission: Submission;
  onMarkRead: () => void;
  onDelete: () => void;
  loading: boolean;
}) {
  const s = submission;
  const initials = getInitials(s.representative || s.company || "??");
  const avatarColor = colorFromString(s.company || s.email);
  const mailSubject = encodeURIComponent(`Votre demande de devis O'Méa`);
  const mailBody = encodeURIComponent(`Bonjour ${s.representative || ""},\n\nMerci pour votre demande de devis du ${formatDate(s.date)}.\n\n`);

  return (
    <div className="inbox-detail">
      {/* Header */}
      <div className="inbox-detail__header">
        <div className="inbox-detail__identity">
          <div
            className="inbox-detail__avatar"
            style={{ background: `linear-gradient(135deg, ${avatarColor}, ${avatarColor}dd)` }}
          >
            {initials}
          </div>
          <div>
            <h2 className="inbox-detail__name">{s.company || s.representative || "(Sans nom)"}</h2>
            <p className="inbox-detail__role">
              {s.representative}{s.role ? ` · ${s.role}` : ""}
            </p>
            <p className="inbox-detail__date">
              <Calendar size={11} style={{ verticalAlign: "middle", marginRight: "4px" }} />
              {formatDate(s.date)} · <span style={{ opacity: 0.7 }}>{relativeTime(s.date)}</span>
            </p>
          </div>
        </div>
        <div className="inbox-detail__actions">
          <a href={`mailto:${s.email}?subject=${mailSubject}&body=${mailBody}`} className="inbox-btn inbox-btn--primary">
            <Reply size={14} strokeWidth={2.2} />
            Répondre par email
          </a>
          {!s.read && (
            <button onClick={onMarkRead} disabled={loading} className="inbox-btn inbox-btn--ghost">
              <Check size={14} strokeWidth={2.5} />
              Marquer lue
            </button>
          )}
          <button onClick={onDelete} disabled={loading} className="inbox-btn inbox-btn--danger" title="Supprimer">
            <Trash2 size={14} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="inbox-detail__body">
        {/* Contact info */}
        <div className="inbox-detail__section">
          <h3 className="inbox-detail__section-title">
            <User size={13} strokeWidth={2.2} />
            Informations de contact
          </h3>
          <div className="inbox-detail__info-grid">
            {s.email && (
              <a href={`mailto:${s.email}`} className="inbox-info-card">
                <Mail size={14} strokeWidth={2.2} style={{ color: SAGE }} />
                <div>
                  <div className="inbox-info-card__label">Email pro</div>
                  <div className="inbox-info-card__val">{s.email}</div>
                </div>
              </a>
            )}
            {s.phone && (
              <a href={`tel:${s.phone}`} className="inbox-info-card">
                <Phone size={14} strokeWidth={2.2} style={{ color: SAGE }} />
                <div>
                  <div className="inbox-info-card__label">Téléphone</div>
                  <div className="inbox-info-card__val">{s.phone}</div>
                </div>
              </a>
            )}
            {s.company && (
              <div className="inbox-info-card">
                <Building2 size={14} strokeWidth={2.2} style={{ color: SAGE }} />
                <div>
                  <div className="inbox-info-card__label">Entreprise</div>
                  <div className="inbox-info-card__val">{s.company}</div>
                </div>
              </div>
            )}
            {s.representative && (
              <div className="inbox-info-card">
                <User size={14} strokeWidth={2.2} style={{ color: SAGE }} />
                <div>
                  <div className="inbox-info-card__label">Représentant</div>
                  <div className="inbox-info-card__val">{s.representative}</div>
                </div>
              </div>
            )}
          </div>

          {(s.tva || s.siret) && (
            <div className="inbox-detail__legal">
              {s.tva && <span><Hash size={10} /> TVA : <strong>{s.tva}</strong></span>}
              {s.siret && <span><Hash size={10} /> SIRET : <strong>{s.siret}</strong></span>}
            </div>
          )}
        </div>

        {/* Quantity */}
        {s.quantity && (
          <div className="inbox-detail__section">
            <h3 className="inbox-detail__section-title">
              <ShoppingBag size={13} strokeWidth={2.2} />
              Quantité estimée
            </h3>
            <div className="inbox-quantity-badge">
              <Package size={14} strokeWidth={2.2} />
              {s.quantity}
            </div>
          </div>
        )}

        {/* Custom coffret detail */}
        {s.customCoffret && (
          <div className="inbox-detail__section">
            <h3 className="inbox-detail__section-title">
              <Sparkles size={13} strokeWidth={2.2} style={{ color: "#d97706" }} />
              Coffret sur-mesure composé
            </h3>
            <div className="inbox-custom-coffret">
              <div className="inbox-custom-coffret__header">
                <div>
                  <span className="inbox-custom-coffret__qty">{s.customCoffret.quantity} coffrets</span>
                  <span className="inbox-custom-coffret__products">{s.customCoffret.products.length} produits différents</span>
                </div>
                <div className="inbox-custom-coffret__total">
                  <div className="inbox-custom-coffret__total-val">{(s.customCoffret.totalTTC / 100).toFixed(2)}€</div>
                  <div className="inbox-custom-coffret__total-label">TTC total</div>
                  <div className="inbox-custom-coffret__total-ht">Soit {(s.customCoffret.totalHT / 100).toFixed(2)}€ HT</div>
                </div>
              </div>
              <div className="inbox-custom-coffret__products-list">
                <div className="inbox-custom-coffret__products-label">Produits sélectionnés</div>
                {s.customCoffret.products.map((p) => (
                  <div key={p.id} className="inbox-custom-product">
                    <span className="inbox-custom-product__name">
                      <Package size={11} strokeWidth={2.2} style={{ color: SAGE }} /> {p.name}
                    </span>
                    <span className="inbox-custom-product__qty">×{p.qty}</span>
                    <span className="inbox-custom-product__price">
                      {(p.price / 100).toFixed(2)}€ HT
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <div className="inbox-detail__section">
          <h3 className="inbox-detail__section-title">
            <MessageSquareText size={13} strokeWidth={2.2} />
            Message du visiteur
          </h3>
          {s.message ? (
            <div className="inbox-message">{s.message}</div>
          ) : (
            <div className="inbox-message inbox-message--empty">
              <Info size={14} style={{ opacity: 0.5 }} />
              Aucun message laissé
            </div>
          )}
        </div>

        {/* Quick actions footer */}
        <div className="inbox-quick-actions">
          <a href={`mailto:${s.email}?subject=${mailSubject}&body=${mailBody}`} className="inbox-quick-action">
            <Mail size={13} strokeWidth={2.2} />
            Email
            <ChevronRight size={11} style={{ marginLeft: "auto" }} />
          </a>
          {s.phone && (
            <a href={`tel:${s.phone}`} className="inbox-quick-action">
              <Phone size={13} strokeWidth={2.2} />
              Appeler
              <ChevronRight size={11} style={{ marginLeft: "auto" }} />
            </a>
          )}
          {s.customCoffret && (
            <button className="inbox-quick-action" onClick={() => {
              const txt = `Coffret sur-mesure — ${s.company}\n\nQuantité: ${s.customCoffret!.quantity} coffrets\nTotal HT: ${(s.customCoffret!.totalHT / 100).toFixed(2)}€\nTotal TTC: ${(s.customCoffret!.totalTTC / 100).toFixed(2)}€\n\nProduits:\n${s.customCoffret!.products.map((p) => `• ${p.name} ×${p.qty} — ${(p.price / 100).toFixed(2)}€`).join("\n")}`;
              navigator.clipboard.writeText(txt);
              alert("Détails copiés dans le presse-papier !");
            }}>
              <Archive size={13} strokeWidth={2.2} />
              Copier le récap
              <ChevronRight size={11} style={{ marginLeft: "auto" }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================ */
/*  Styles                                                      */
/* ============================================================ */

const styles = `
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .inbox-root {
    font-family: var(--font-inter);
    display: flex; flex-direction: column;
    min-height: calc(100vh - 64px);
    background: #f8f9fb;
  }

  /* ─── Top bar ─── */
  .inbox-topbar {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 20px;
    padding: 24px 32px 16px;
    background: white;
    border-bottom: 1px solid #eef0f2;
  }
  .inbox-topbar__heading { flex: 1; min-width: 0; }
  .inbox-topbar__title {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.5rem; color: #0f172a;
    margin: 0; letter-spacing: -0.03em;
  }
  .inbox-topbar__sub {
    font-size: 0.84rem; color: #64748b;
    margin: 6px 0 0; line-height: 1.55; max-width: 680px;
  }
  .inbox-btn-export {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px; border-radius: 10px;
    background: white; border: 1.5px solid #e5e7eb;
    color: #5F7263; font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.8rem;
    cursor: pointer; transition: all 0.15s ease;
    white-space: nowrap;
  }
  .inbox-btn-export:hover:not(:disabled) {
    border-color: #87A38D; background: rgba(135,163,141,0.05);
  }
  .inbox-btn-export:disabled { opacity: 0.4; cursor: not-allowed; }

  /* ─── Stats ─── */
  .inbox-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 32px;
    background: white;
    border-bottom: 1px solid #eef0f2;
  }
  .inbox-stat {
    display: flex; align-items: center; gap: 14px;
    padding: 12px 16px;
    background: #fafbfc;
    border: 1px solid #eef0f2;
    border-radius: 12px;
  }
  .inbox-stat__icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .inbox-stat__val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.5rem; color: #0f172a;
    letter-spacing: -0.03em; line-height: 1;
  }
  .inbox-stat__label {
    font-size: 0.72rem; color: #9ca3af;
    font-weight: 600; margin-top: 3px;
  }

  /* ─── Main content ─── */
  .inbox-main {
    flex: 1;
    display: grid;
    grid-template-columns: 420px 1fr;
    min-height: 0;
  }

  /* ─── List column ─── */
  .inbox-list-col {
    border-right: 1px solid #eef0f2;
    background: white;
    display: flex; flex-direction: column;
    min-height: 0;
  }

  .inbox-search-wrap {
    padding: 16px 16px 12px;
    border-bottom: 1px solid #f3f4f6;
  }
  .inbox-search {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 14px;
    background: #f3f4f6;
    border-radius: 10px;
    border: 1.5px solid transparent;
    transition: all 0.15s ease;
    margin-bottom: 10px;
  }
  .inbox-search:focus-within {
    background: white;
    border-color: #87A38D;
    box-shadow: 0 0 0 3px rgba(135,163,141,0.1);
  }
  .inbox-search input {
    flex: 1; border: none; background: transparent;
    font-family: inherit; font-size: 0.84rem;
    color: #1a1f25; outline: none;
  }
  .inbox-search__clear {
    width: 18px; height: 18px; border-radius: 50%;
    background: #9ca3af; color: white; border: none;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; flex-shrink: 0;
  }
  .inbox-filters {
    display: flex; gap: 4px; flex-wrap: wrap;
  }
  .inbox-filter {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; border-radius: 999px;
    background: transparent; border: 1.5px solid #e5e7eb;
    color: #6b7280; font-family: var(--font-manrope);
    font-size: 0.72rem; font-weight: 700;
    cursor: pointer; transition: all 0.15s ease;
  }
  .inbox-filter:hover {
    border-color: #87A38D; color: #5F7263;
  }
  .inbox-filter--active {
    background: #5F7263; color: white; border-color: #5F7263;
  }
  .inbox-filter__count {
    padding: 1px 6px; border-radius: 999px;
    background: rgba(0,0,0,0.08); color: inherit;
    font-size: 0.62rem; font-weight: 800;
  }
  .inbox-filter--active .inbox-filter__count {
    background: rgba(255,255,255,0.25);
  }

  .inbox-list {
    flex: 1;
    overflow-y: auto;
    min-height: 0;
  }
  .inbox-list::-webkit-scrollbar { width: 4px; }
  .inbox-list::-webkit-scrollbar-thumb { background: #d4d8de; border-radius: 2px; }

  .inbox-item {
    display: flex; gap: 12px;
    padding: 14px 16px;
    width: 100%; text-align: left;
    background: white; border: none;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer; transition: all 0.12s ease;
    font-family: inherit;
    position: relative;
  }
  .inbox-item:hover { background: #fafbfc; }
  .inbox-item--selected {
    background: rgba(135,163,141,0.08) !important;
  }
  .inbox-item--selected::before {
    content: ''; position: absolute;
    left: 0; top: 0; bottom: 0; width: 3px;
    background: #5F7263;
  }
  .inbox-item--unread .inbox-item__company {
    color: #0f172a; font-weight: 800;
  }
  .inbox-item__unread-dot {
    position: absolute;
    top: 18px; right: 16px;
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #10b981;
    animation: pulse 2s infinite;
  }

  .inbox-item__avatar {
    width: 40px; height: 40px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-family: var(--font-manrope);
    font-weight: 800; font-size: 0.78rem;
    flex-shrink: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  .inbox-item__content { flex: 1; min-width: 0; }
  .inbox-item__header {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 8px; margin-bottom: 4px;
  }
  .inbox-item__company {
    font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.86rem;
    color: #374151;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .inbox-item__time {
    font-size: 0.68rem; color: #9ca3af;
    font-weight: 500; white-space: nowrap; flex-shrink: 0;
  }
  .inbox-item__preview {
    display: flex; align-items: center; gap: 6px;
    margin-bottom: 4px; font-size: 0.7rem;
  }
  .inbox-item__tag {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px; border-radius: 999px;
    background: #f3f4f6; color: #6b7280;
    font-family: var(--font-manrope);
    font-size: 0.62rem; font-weight: 700;
  }
  .inbox-item__tag--custom {
    background: rgba(234,179,8,0.12); color: #d97706;
  }
  .inbox-item__qty {
    font-size: 0.68rem; color: #9ca3af; font-weight: 500;
  }
  .inbox-item__message {
    font-size: 0.76rem; color: #9ca3af;
    margin: 0; line-height: 1.4;
    overflow: hidden; text-overflow: ellipsis;
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  }

  .inbox-list-empty {
    padding: 60px 24px; text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 10px;
    color: #9ca3af;
  }
  .inbox-list-empty p { margin: 0; font-size: 0.84rem; font-weight: 600; }
  .inbox-link {
    background: transparent; border: none; color: #5F7263;
    font-family: inherit; font-size: 0.8rem; font-weight: 700;
    cursor: pointer; text-decoration: underline;
  }

  /* ─── Detail column ─── */
  .inbox-detail-col {
    background: #f8f9fb;
    overflow-y: auto;
    min-height: 0;
  }
  .inbox-detail-empty {
    height: 100%;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 12px; color: #c4c9d1;
  }
  .inbox-detail-empty p { margin: 0; font-size: 0.9rem; font-weight: 500; }

  .inbox-detail {
    animation: fadeIn 0.2s ease;
  }
  .inbox-detail__header {
    background: white;
    padding: 24px 28px 22px;
    border-bottom: 1px solid #eef0f2;
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 16px;
    flex-wrap: wrap;
  }
  .inbox-detail__identity {
    display: flex; gap: 14px;
    min-width: 0; flex: 1;
  }
  .inbox-detail__avatar {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    color: white;
    font-family: var(--font-manrope);
    font-weight: 900; font-size: 1rem;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
  }
  .inbox-detail__name {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.15rem; color: #0f172a;
    margin: 0; letter-spacing: -0.02em;
  }
  .inbox-detail__role {
    font-size: 0.82rem; color: #5F7263;
    font-weight: 600; margin: 3px 0;
  }
  .inbox-detail__date {
    font-size: 0.7rem; color: #9ca3af;
    margin: 3px 0 0;
  }
  .inbox-detail__actions {
    display: flex; gap: 6px; flex-shrink: 0;
  }
  .inbox-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 16px; border-radius: 9px;
    font-family: var(--font-manrope); font-weight: 700;
    font-size: 0.78rem; border: 1.5px solid transparent;
    cursor: pointer; transition: all 0.15s ease;
    text-decoration: none; white-space: nowrap;
  }
  .inbox-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .inbox-btn--primary {
    background: #5F7263; color: white; border-color: #5F7263;
    box-shadow: 0 2px 8px rgba(95,114,99,0.2);
  }
  .inbox-btn--primary:hover:not(:disabled) { background: #4A5C4E; border-color: #4A5C4E; }
  .inbox-btn--ghost {
    background: white; color: #6b7280; border-color: #e5e7eb;
  }
  .inbox-btn--ghost:hover:not(:disabled) { border-color: #87A38D; color: #5F7263; }
  .inbox-btn--danger {
    background: white; color: #dc2626; border-color: #FCA5A5;
    padding: 9px 11px;
  }
  .inbox-btn--danger:hover:not(:disabled) { background: #fef2f2; }

  .inbox-detail__body { padding: 24px 28px; }
  .inbox-detail__section { margin-bottom: 24px; }
  .inbox-detail__section-title {
    display: flex; align-items: center; gap: 8px;
    font-family: var(--font-manrope);
    font-size: 0.7rem; font-weight: 800;
    color: #9ca3af; text-transform: uppercase;
    letter-spacing: 0.1em; margin: 0 0 12px;
  }

  .inbox-detail__info-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .inbox-info-card {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 14px;
    background: white; border: 1px solid #eef0f2;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.15s ease;
    color: inherit;
  }
  .inbox-info-card[href]:hover {
    border-color: #87A38D;
    background: rgba(135,163,141,0.03);
  }
  .inbox-info-card__label {
    font-size: 0.6rem; font-weight: 700;
    color: #9ca3af; text-transform: uppercase;
    letter-spacing: 0.06em; margin-bottom: 2px;
  }
  .inbox-info-card__val {
    font-size: 0.82rem; color: #1a1f25;
    font-weight: 600;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .inbox-detail__legal {
    display: flex; gap: 16px; margin-top: 10px;
    font-size: 0.72rem; color: #6b7280;
  }
  .inbox-detail__legal span {
    display: inline-flex; align-items: center; gap: 4px;
  }

  .inbox-quantity-badge {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 18px;
    background: white; border: 1px solid #eef0f2;
    border-radius: 10px;
    font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.9rem;
    color: #5F7263;
  }

  /* ─── Custom coffret detail ─── */
  .inbox-custom-coffret {
    background: white;
    border: 1px solid #FDE68A;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(234,179,8,0.08);
  }
  .inbox-custom-coffret__header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 18px 20px;
    background: linear-gradient(135deg, #FFFBEB, #FFF8E7);
    border-bottom: 1px solid #FDE68A;
  }
  .inbox-custom-coffret__qty {
    display: block;
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.1rem; color: #92400E;
    letter-spacing: -0.02em;
  }
  .inbox-custom-coffret__products {
    display: block; font-size: 0.72rem; color: #a16207;
    margin-top: 3px; font-weight: 600;
  }
  .inbox-custom-coffret__total { text-align: right; }
  .inbox-custom-coffret__total-val {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.5rem; color: #5F7263;
    letter-spacing: -0.03em; line-height: 1;
  }
  .inbox-custom-coffret__total-label {
    font-size: 0.6rem; font-weight: 800;
    color: #5F7263; text-transform: uppercase;
    letter-spacing: 0.08em; margin-top: 4px;
  }
  .inbox-custom-coffret__total-ht {
    font-size: 0.68rem; color: #92400E;
    margin-top: 4px; font-weight: 600;
  }
  .inbox-custom-coffret__products-list {
    padding: 14px 20px 18px;
  }
  .inbox-custom-coffret__products-label {
    font-size: 0.6rem; font-weight: 800;
    color: #9ca3af; text-transform: uppercase;
    letter-spacing: 0.08em; margin-bottom: 10px;
  }
  .inbox-custom-product {
    display: flex; align-items: center; justify-content: space-between;
    gap: 12px; padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .inbox-custom-product:last-child { border-bottom: none; }
  .inbox-custom-product__name {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.82rem; color: #1a1f25; font-weight: 600;
    flex: 1; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .inbox-custom-product__qty {
    font-family: var(--font-manrope);
    font-size: 0.78rem; color: #9ca3af;
    font-weight: 700;
  }
  .inbox-custom-product__price {
    font-family: var(--font-manrope); font-weight: 800;
    font-size: 0.82rem; color: #5F7263;
    letter-spacing: -0.01em; min-width: 90px; text-align: right;
  }

  /* ─── Message ─── */
  .inbox-message {
    background: white; border: 1px solid #eef0f2;
    border-radius: 12px; padding: 16px 18px;
    font-size: 0.85rem; color: #374151;
    line-height: 1.65; white-space: pre-wrap;
    min-height: 60px;
  }
  .inbox-message--empty {
    display: flex; align-items: center; gap: 8px;
    color: #9ca3af; font-style: italic;
    min-height: auto;
  }

  /* ─── Quick actions ─── */
  .inbox-quick-actions {
    display: flex; flex-direction: column; gap: 6px;
    margin-top: 28px;
    padding-top: 20px;
    border-top: 1px solid #eef0f2;
  }
  .inbox-quick-action {
    display: flex; align-items: center; gap: 10px;
    padding: 11px 16px;
    background: white; border: 1px solid #eef0f2;
    border-radius: 10px;
    color: #374151; text-decoration: none;
    font-family: var(--font-manrope);
    font-weight: 700; font-size: 0.82rem;
    transition: all 0.15s ease;
    cursor: pointer;
  }
  .inbox-quick-action:hover {
    border-color: #87A38D;
    background: rgba(135,163,141,0.04);
    color: #5F7263;
  }

  /* ─── Empty / loading ─── */
  .inbox-empty {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 60px 24px; text-align: center;
    color: #6b7280;
  }
  .inbox-empty__icon {
    width: 88px; height: 88px; border-radius: 50%;
    background: rgba(135,163,141,0.08); color: #87A38D;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
  }
  .inbox-empty h2 {
    font-family: var(--font-manrope); font-weight: 900;
    font-size: 1.3rem; color: #0f172a;
    margin: 0 0 8px; letter-spacing: -0.02em;
  }
  .inbox-empty p {
    max-width: 400px; margin: 0;
    font-size: 0.88rem; line-height: 1.6;
  }
  .inbox-loading {
    flex: 1;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 14px; color: #6b7280; font-size: 0.88rem;
  }
  .inbox-spinner {
    width: 32px; height: 32px;
    border: 3px solid #eef0f2; border-top-color: #5F7263;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }

  @media (max-width: 1024px) {
    .inbox-stats { grid-template-columns: repeat(2, 1fr); }
    .inbox-main { grid-template-columns: 1fr; }
    .inbox-detail__info-grid { grid-template-columns: 1fr; }
  }
`;
