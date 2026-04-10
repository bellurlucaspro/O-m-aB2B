"use client";

import { useEffect, useState } from "react";
import type { Submission } from "@/lib/types";
import {
  FileText,
  Package,
  Inbox,
  Clock,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface DashboardData {
  submissionCount: number;
  unreadCount: number;
  productCount: number;
  lastSubmissionDate: string | null;
  recentSubmissions: Submission[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reseeding, setReseeding] = useState(false);
  const [reseedMsg, setReseedMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleReseed = async () => {
    if (!confirm(
      "⚠️ Action destructive !\n\n" +
      "Cette action va ÉCRASER toutes les données en production (Redis) avec le contenu actuel du dépôt Git.\n\n" +
      "Toutes les modifications faites directement via l'admin seront PERDUES.\n\n" +
      "Continuer ?"
    )) return;

    setReseeding(true);
    setReseedMsg(null);
    try {
      const res = await fetch("/api/admin/reseed", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setReseedMsg({
          type: "success",
          text: json.mode === "redis"
            ? `✅ Re-seed OK — ${json.seeded.length} clés synchronisées : ${json.seeded.join(", ")}`
            : "ℹ️ Mode local : aucune action (les fichiers JSON sont la source de vérité).",
        });
      } else {
        setReseedMsg({ type: "error", text: "❌ Erreur lors du re-seed" });
      }
    } catch {
      setReseedMsg({ type: "error", text: "❌ Erreur réseau" });
    }
    setReseeding(false);
    setTimeout(() => setReseedMsg(null), 8000);
  };

  useEffect(() => {
    async function load() {
      try {
        const [subsRes, prodsRes] = await Promise.all([
          fetch("/api/admin/submissions"),
          fetch("/api/admin/products"),
        ]);
        const submissions: Submission[] = await subsRes.json();
        const products = await prodsRes.json();

        const unread = submissions.filter((s) => !s.read).length;
        const sorted = [...submissions].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setData({
          submissionCount: submissions.length,
          unreadCount: unread,
          productCount: Array.isArray(products) ? products.length : 0,
          lastSubmissionDate: sorted.length > 0 ? sorted[0].date : null,
          recentSubmissions: sorted.slice(0, 5),
        });
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
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
    return formatDate(dateStr);
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px", height: "40px",
            border: "3px solid #f1f5f9", borderTop: "3px solid #5F7263",
            borderRadius: "50%", animation: "spin 0.8s linear infinite",
            margin: "0 auto 16px",
          }} />
          <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Chargement...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "300px" }}>
        <p style={{ color: "#ef4444", fontSize: "0.95rem" }}>Erreur de chargement des données.</p>
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

        .dash-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #eef0f2;
          padding: 24px;
          transition: all 0.2s ease;
        }
        .dash-card:hover {
          border-color: #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
        }
        .dash-stat {
          background: white;
          border-radius: 20px;
          border: 1px solid #eef0f2;
          padding: 24px;
          transition: all 0.2s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .dash-stat:hover {
          border-color: #e2e8f0;
          box-shadow: 0 4px 24px rgba(0,0,0,0.04);
          transform: translateY(-2px);
        }
        .dash-stat--primary {
          background: #5F7263;
          border-color: #5F7263;
          color: white;
        }
        .dash-stat--primary:hover {
          border-color: #4A5C4E;
          box-shadow: 0 8px 32px rgba(45,74,62,0.2);
        }
        .dash-link {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          border-radius: 16px;
          border: 1px solid #eef0f2;
          background: white;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .dash-link:hover {
          border-color: #5F7263;
          box-shadow: 0 4px 16px rgba(45,74,62,0.06);
          transform: translateY(-2px);
        }
        .dash-table-row {
          transition: background 0.15s ease;
          cursor: pointer;
        }
        .dash-table-row:hover {
          background: #f8fafc;
        }
      `}</style>

      {/* ---- Header ---- */}
      <div style={{ marginBottom: "32px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-manrope)",
            fontWeight: 800,
            fontSize: "1.75rem",
            color: "#0f172a",
            margin: 0,
            letterSpacing: "-0.03em",
          }}>
            {greeting} 👋
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.92rem", marginTop: "6px" }}>
            {data.unreadCount > 0
              ? `Vous avez ${data.unreadCount} demande${data.unreadCount > 1 ? "s" : ""} non lue${data.unreadCount > 1 ? "s" : ""} à traiter.`
              : "Tout est à jour. Voici un aperçu de votre activité."
            }
          </p>
        </div>

        {/* Re-seed button */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-end" }}>
          <button
            onClick={handleReseed}
            disabled={reseeding}
            style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "10px 18px", borderRadius: "10px",
              background: "white", border: "1.5px solid #FCA5A5",
              color: "#DC2626", fontFamily: "var(--font-manrope)",
              fontWeight: 700, fontSize: "0.78rem",
              cursor: reseeding ? "wait" : "pointer",
              opacity: reseeding ? 0.6 : 1,
              transition: "all 0.2s ease",
            }}
            title="Réécrase Redis (production) avec le contenu Git"
          >
            <RefreshCw size={14} className={reseeding ? "dash-spin" : ""} />
            {reseeding ? "Synchronisation..." : "Re-seed depuis Git"}
          </button>
          <p style={{ fontSize: "0.65rem", color: "#94a3b8", margin: 0, display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle size={10} /> Action destructive
          </p>
          {reseedMsg && (
            <div style={{
              padding: "8px 12px", borderRadius: "8px",
              background: reseedMsg.type === "success" ? "#ecfdf5" : "#fef2f2",
              color: reseedMsg.type === "success" ? "#10b981" : "#dc2626",
              fontSize: "0.72rem", fontWeight: 600,
              maxWidth: "320px", marginTop: "4px",
            }}>
              {reseedMsg.text}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes dashSpin { to { transform: rotate(360deg); } }
        .dash-spin { animation: dashSpin 0.8s linear infinite; }
      `}</style>

      {/* ---- Stat cards (bento row) ---- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px",
      }}>
        {/* Total demandes — primary */}
        <div className="dash-stat dash-stat--primary">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 500, opacity: 0.75 }}>Demandes totales</span>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800,
            fontSize: "2.4rem", margin: 0, lineHeight: 1,
          }}>
            {data.submissionCount}
          </p>
          {data.unreadCount > 0 && (
            <p style={{
              fontSize: "0.78rem", marginTop: "12px",
              display: "flex", alignItems: "center", gap: "6px",
              opacity: 0.7,
            }}>
              <span style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#10b981", animation: "pulse 2s infinite",
              }} />
              {data.unreadCount} non lue{data.unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Coffrets */}
        <div className="dash-stat">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748b" }}>Coffrets</span>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(45,74,62,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#5F7263",
            }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <p style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800,
            fontSize: "2.4rem", color: "#0f172a", margin: 0, lineHeight: 1,
          }}>
            {data.productCount}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "12px" }}>
            Au catalogue
          </p>
        </div>

        {/* Non lues */}
        <div className="dash-stat">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748b" }}>Non lues</span>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: data.unreadCount > 0 ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: data.unreadCount > 0 ? "#ef4444" : "#10b981",
            }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <p style={{
            fontFamily: "var(--font-manrope)", fontWeight: 800,
            fontSize: "2.4rem", color: "#0f172a", margin: 0, lineHeight: 1,
          }}>
            {data.unreadCount}
          </p>
          <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "12px" }}>
            {data.unreadCount > 0 ? "À traiter" : "Tout est lu"}
          </p>
        </div>

        {/* Derniere demande */}
        <div className="dash-stat">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 500, color: "#64748b" }}>Dernière demande</span>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "rgba(45,74,62,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#5F7263",
            }}>
              <Clock size={16} />
            </div>
          </div>
          <p style={{
            fontFamily: "var(--font-manrope)", fontWeight: 700,
            fontSize: "1.15rem", color: "#0f172a", margin: 0, lineHeight: 1.3,
          }}>
            {data.lastSubmissionDate ? relativeTime(data.lastSubmissionDate) : "Aucune"}
          </p>
          {data.lastSubmissionDate && (
            <p style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "8px" }}>
              {formatDate(data.lastSubmissionDate)}
            </p>
          )}
        </div>
      </div>

      {/* ---- Bento grid: recent submissions + quick actions ---- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "2fr 1fr",
        gap: "16px",
      }}>
        {/* Recent submissions */}
        <div className="dash-card">
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: "20px",
          }}>
            <h2 style={{
              fontFamily: "var(--font-manrope)", fontWeight: 700,
              fontSize: "1.1rem", color: "#0f172a", margin: 0,
            }}>
              Dernières demandes
            </h2>
            <a
              href="/admin/submissions"
              style={{
                display: "flex", alignItems: "center", gap: "4px",
                color: "#5F7263", fontSize: "0.82rem", fontWeight: 600,
                textDecoration: "none", padding: "6px 12px",
                borderRadius: "8px", transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(45,74,62,0.06)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Tout voir <ChevronRight size={14} />
            </a>
          </div>

          {data.recentSubmissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
              <Inbox size={32} strokeWidth={1.2} style={{ margin: "0 auto 12px", display: "block", color: "#cbd5e1" }} />
              <p style={{ fontSize: "0.88rem", margin: 0 }}>Aucune demande pour le moment.</p>
            </div>
          ) : (
            <div>
              {data.recentSubmissions.map((sub, index) => (
                <a
                  key={sub.id}
                  href="/admin/submissions"
                  className="dash-table-row"
                  style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "14px 12px",
                    borderRadius: "12px",
                    textDecoration: "none", color: "inherit",
                    borderBottom: index < data.recentSubmissions.length - 1 ? "1px solid #f8fafc" : "none",
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "38px", height: "38px", borderRadius: "10px",
                    background: sub.read ? "#f1f5f9" : "rgba(45,74,62,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 700,
                    color: sub.read ? "#94a3b8" : "#5F7263",
                    flexShrink: 0,
                  }}>
                    {sub.company.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: "0.88rem", fontWeight: sub.read ? 450 : 600,
                      color: "#0f172a", margin: 0,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {sub.company}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: "2px 0 0" }}>
                      {sub.email}
                    </p>
                  </div>

                  {/* Date + status */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>
                      {relativeTime(sub.date)}
                    </p>
                    {!sub.read && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "4px",
                        fontSize: "0.65rem", fontWeight: 600,
                        color: "#5F7263", marginTop: "4px",
                      }}>
                        <span style={{
                          width: "6px", height: "6px", borderRadius: "50%",
                          background: "#10b981",
                        }} />
                        Nouvelle
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="dash-card" style={{ padding: "20px" }}>
            <h3 style={{
              fontFamily: "var(--font-manrope)", fontWeight: 700,
              fontSize: "1rem", color: "#0f172a", margin: "0 0 16px 0",
            }}>
              Accès rapide
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Éditer le contenu", href: "/admin/content", icon: FileText, desc: "Landing page" },
                { label: "Gérer les coffrets", href: "/admin/products", icon: Package, desc: "Produits & tarifs" },
                { label: "Voir les demandes", href: "/admin/submissions", icon: Inbox, desc: "Devis" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <a key={action.href} href={action.href} className="dash-link">
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "12px",
                      background: "rgba(45,74,62,0.06)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#5F7263", flexShrink: 0,
                    }}>
                      <Icon size={18} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "#0f172a", margin: 0 }}>
                        {action.label}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "#94a3b8", margin: "2px 0 0" }}>
                        {action.desc}
                      </p>
                    </div>
                    <ChevronRight size={16} style={{ color: "#cbd5e1", flexShrink: 0 }} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Activity summary card */}
          <div className="dash-card" style={{
            padding: "20px",
            background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
            border: "1px solid rgba(16,185,129,0.12)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(16,185,129,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#10b981",
              }}>
                <TrendingUp size={16} />
              </div>
              <p style={{
                fontFamily: "var(--font-manrope)", fontWeight: 700,
                fontSize: "0.92rem", color: "#064e3b", margin: 0,
              }}>
                Activité
              </p>
            </div>
            <p style={{ fontSize: "0.82rem", color: "#065f46", lineHeight: 1.6, margin: 0 }}>
              <strong>{data.submissionCount}</strong> demande{data.submissionCount !== 1 ? "s" : ""} reçu{data.submissionCount !== 1 ? "es" : "e"} ·{" "}
              <strong>{data.productCount}</strong> coffret{data.productCount !== 1 ? "s" : ""} en ligne
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
