"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingFeatured, setTogglingFeatured] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Erreur chargement produits:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer le coffret "${name}" ? Cette action est irréversible.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch {
      alert("Erreur réseau");
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleFeatured = async (product: Product) => {
    setTogglingFeatured(product.id);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...product, featured: !product.featured }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p))
        );
      }
    } catch {
      console.error("Erreur toggle featured");
    } finally {
      setTogglingFeatured(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 800,
              color: "#0f172a",
              fontFamily: "var(--font-manrope)",
              margin: 0,
              letterSpacing: "-0.03em",
            }}
          >
            Coffrets
          </h1>
          <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "6px" }}>
            {products.length} coffret{products.length !== 1 ? "s" : ""} au catalogue
          </p>
        </div>
        <Link
          href="/admin/products/new"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "12px 24px",
            background: "#5F7263",
            color: "white",
            border: "none",
            borderRadius: "14px",
            fontSize: "0.88rem",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
        >
          + Ajouter un coffret
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{
            width: "36px",
            height: "36px",
            border: "3px solid #f3f4f6",
            borderTop: "3px solid #5F7263",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 12px",
          }} />
          <p style={{ color: "#6b7280", fontSize: "0.88rem" }}>Chargement des coffrets...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Empty state */}
      {!loading && products.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "80px 24px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(45,74,62,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: "2.5rem",
          }}>
            🎁
          </div>
          <p style={{
            fontSize: "1.1rem",
            fontWeight: 700,
            color: "#5F7263",
            fontFamily: "var(--font-manrope)",
            marginBottom: "8px",
          }}>
            Aucun coffret pour le moment
          </p>
          <p style={{ fontSize: "0.88rem", color: "#6b7280", marginBottom: "24px" }}>
            Commencez par créer votre premier coffret cadeau
          </p>
          <Link
            href="/admin/products/new"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 28px",
              background: "#5F7263",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "0.9rem",
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.2s ease",
            }}
          >
            + Créer un coffret
          </Link>
        </div>
      ) : null}

      {/* Product grid */}
      {!loading && products.length > 0 ? (
        <div
          className="admin-prod-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "20px",
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id || `product-${index}`}
              style={{
                background: "white",
                borderRadius: "20px",
                border: "1px solid #eef0f2",
                padding: "20px",
                display: "flex",
                gap: "20px",
                position: "relative",
                transition: "all 0.2s ease",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#e2e8f0";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(0,0,0,0.04)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "#eef0f2";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "16px",
                  overflow: "hidden",
                  flexShrink: 0,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {product.photo ? (
                  <img
                    src={product.photo}
                    alt={product.photoAlt || product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "2.5rem" }}>
                    {product.iconEmoji || "🎁"}
                  </span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#5F7263",
                      fontFamily: "var(--font-manrope)",
                      margin: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.name}
                  </h3>
                </div>

                {product.subtitle && (
                  <p
                    style={{
                      fontSize: "0.82rem",
                      color: "#6b7280",
                      margin: "0 0 6px 0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {product.subtitle}
                  </p>
                )}

                <p
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "#5F7263",
                    margin: "0 0 10px 0",
                  }}
                >
                  {product.price}
                  {product.priceNote && (
                    <span style={{ fontSize: "0.78rem", fontWeight: 400, color: "#6b7280", marginLeft: "6px" }}>
                      {product.priceNote}
                    </span>
                  )}
                </p>

                {/* Featured toggle */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                  <button
                    onClick={() => handleToggleFeatured(product)}
                    disabled={togglingFeatured === product.id}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 12px",
                      borderRadius: "99px",
                      border: "none",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: togglingFeatured === product.id ? "wait" : "pointer",
                      background: product.featured ? "#ecfdf5" : "#f3f4f6",
                      color: product.featured ? "#10b981" : "#9ca3af",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: product.featured ? "#10b981" : "#d1d5db",
                      transition: "all 0.2s ease",
                    }} />
                    {product.featured ? "Mis en avant" : "Standard"}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <Link
                    href={`/admin/products/${product.id}`}
                    style={{
                      padding: "7px 16px",
                      background: "#f3f4f6",
                      color: "#374151",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      textDecoration: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#e5e7eb";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f3f4f6";
                    }}
                  >
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id, product.name)}
                    disabled={deleting === product.id}
                    style={{
                      padding: "7px 16px",
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: deleting === product.id ? "wait" : "pointer",
                      opacity: deleting === product.id ? 0.5 : 1,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {deleting === product.id ? "..." : "Supprimer"}
                  </button>
                </div>
              </div>

              {/* Tag badge */}
              {product.tag && (
                <span
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: product.tagBg || "#f3f4f6",
                    color: product.tagColor || "#374151",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    padding: "3px 10px",
                    borderRadius: "20px",
                  }}
                >
                  {product.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      ) : null}

      {/* Responsive */}
      <style>{`
        @media (max-width: 800px) {
          .admin-prod-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
