"use client";

import { Building2, Globe, Link2, Shield, FileText, Mail, MapPin, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function LegalContent() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sections = [
    { id: "edition", label: "Édition", icon: Building2 },
    { id: "contenu", label: "Contenu du site", icon: FileText },
    { id: "liens", label: "Liens hypertextes", icon: Link2 },
    { id: "rgpd", label: "Données personnelles", icon: Shield },
  ];

  return (
    <div style={{ maxWidth: "920px", margin: "0 auto", padding: "140px 32px 80px", position: "relative" }}>
      <style>{`
        .ml-section {
          scroll-margin-top: 120px;
        }
        .ml-toc a:hover {
          background: rgba(135,163,141,0.1) !important;
          color: var(--green-deep) !important;
        }
        .ml-back-top {
          position: fixed;
          bottom: 100px;
          right: 28px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--green-deep);
          color: white;
          border: none;
          box-shadow: 0 8px 24px rgba(45,74,62,0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          z-index: 99;
        }
        .ml-back-top:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(45,74,62,0.3);
        }
        @media (max-width: 768px) {
          .ml-toc {
            position: static !important;
            margin-bottom: 40px !important;
          }
          .ml-back-top { bottom: 90px; right: 20px; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: "center", marginBottom: "56px" }}>
        <span style={{
          display: "inline-block",
          fontSize: "0.62rem",
          fontWeight: 800,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--sage)",
          fontFamily: "'Manrope', sans-serif",
          marginBottom: "18px",
          padding: "6px 16px",
          background: "rgba(135,163,141,0.08)",
          borderRadius: "999px",
        }}>
          Informations légales
        </span>
        <h1 style={{
          fontSize: "clamp(2rem, 4vw, 2.8rem)",
          fontWeight: 900,
          letterSpacing: "-0.035em",
          color: "var(--text-dark)",
          marginBottom: "14px",
          lineHeight: 1.1,
          fontFamily: "'Manrope', sans-serif",
        }}>
          Mentions légales
        </h1>
        <p style={{
          fontSize: "0.95rem",
          color: "var(--text-mid)",
          maxWidth: "520px",
          margin: "0 auto",
          lineHeight: 1.7,
        }}>
          Informations éditeur, hébergement et politique de protection des données personnelles du site O&apos;Méa.
        </p>
      </div>

      {/* Table of contents */}
      <nav className="ml-toc" style={{
        background: "white",
        borderRadius: "20px",
        padding: "24px 28px",
        marginBottom: "40px",
        border: "1px solid rgba(135,163,141,0.1)",
        boxShadow: "0 2px 12px rgba(45,74,62,0.04)",
      }}>
        <p style={{
          fontSize: "0.62rem",
          fontWeight: 800,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--sage-dark)",
          fontFamily: "'Manrope', sans-serif",
          margin: "0 0 14px",
        }}>
          Sommaire
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "8px" }}>
          {sections.map((s, i) => {
            const Icon = s.icon;
            return (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 14px",
                  borderRadius: "12px",
                  fontSize: "0.85rem",
                  color: "var(--text-mid)",
                  textDecoration: "none",
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  transition: "all 0.2s ease",
                  background: "transparent",
                }}
              >
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "9px",
                  background: "rgba(135,163,141,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--green-deep)",
                  flexShrink: 0,
                }}>
                  <Icon size={15} strokeWidth={2.2} />
                </div>
                <span>
                  <span style={{ fontSize: "0.62rem", color: "var(--text-light)", fontWeight: 700, display: "block", letterSpacing: "0.05em" }}>
                    0{i + 1}
                  </span>
                  {s.label}
                </span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* ── Section: Édition ── */}
      <section id="edition" className="ml-section" style={sectionStyle}>
        <SectionHeader icon={Building2} number="01" title="Édition" />
        <div style={contentStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" }}>
            <InfoBlock label="Raison sociale" value="O'MÉA" />
            <InfoBlock label="Adresse" value="35 chemin du Collet de l'Hubac" sub="06800 Cagnes-sur-Mer" icon={MapPin} />
            <InfoBlock label="Téléphone" value="09 84 48 11 55" />
            <InfoBlock label="SIRET" value="977 608 496 00013" />
            <InfoBlock label="Représentant légal" value="Catherine REY" />
            <InfoBlock label="Contact" value="pro@o-mea.fr" icon={Mail} isLink />
          </div>

          <div style={{
            marginTop: "28px",
            padding: "20px 24px",
            background: "rgba(135,163,141,0.06)",
            borderRadius: "14px",
            borderLeft: "3px solid var(--sage)",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
              <div>
                <p style={metaLabelStyle}>Réalisation du site</p>
                <a
                  href="https://otika.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "var(--green-deep)",
                    textDecoration: "none",
                    fontFamily: "'Manrope', sans-serif",
                    borderBottom: "1.5px solid var(--sage)",
                    transition: "all 0.2s ease",
                  }}
                >
                  Otika — Agence digitale
                </a>
              </div>
              <div>
                <p style={metaLabelStyle}>Hébergement</p>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--green-deep)", margin: 0, fontFamily: "'Manrope', sans-serif" }}>
                  O2Switch
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-light)", margin: "2px 0 0" }}>
                  222-224 boulevard Gustave Flaubert, 63000 Clermont-Ferrand
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Contenu du site ── */}
      <section id="contenu" className="ml-section" style={sectionStyle}>
        <SectionHeader icon={FileText} number="02" title="Contenu du site" />
        <div style={contentStyle}>
          <p style={paragraphStyle}>
            Les informations contenues sur le site <strong style={{ color: "var(--green-deep)" }}>www.o-mea.fr</strong> ont un caractère strictement informatif. Cette société se réserve le droit d&apos;en modifier le contenu.
          </p>
          <p style={paragraphStyle}>
            Le contenu du site (textes, images, sons, graphismes, documents téléchargeables…) sont la propriété exclusive de <strong>O&apos;Méa</strong>. Le contenu des actualités est non contractuel et fourni à titre informatif.
          </p>
          <p style={paragraphStyle}>
            L&apos;ensemble de ce site relève de la législation française et internationale sur les droits d&apos;auteur et de la propriété intellectuelle. Toute utilisation ou reproduction, totale ou partielle du site constitue une contrefaçon sanctionnée par le Code de la propriété intellectuelle.
          </p>
        </div>
      </section>

      {/* ── Section: Liens hypertextes ── */}
      <section id="liens" className="ml-section" style={sectionStyle}>
        <SectionHeader icon={Link2} number="03" title="Liens hypertextes" />
        <div style={contentStyle}>
          <p style={paragraphStyle}>
            Les liens hypertextes vers d&apos;autres sites ainsi que leurs contenus ne sauraient, en aucun cas, engager la responsabilité de O&apos;Méa.
          </p>
          <p style={paragraphStyle}>
            O&apos;Méa autorise d&apos;autres sites internet à mettre en place un lien hypertexte pointant vers ses contenus. Cette autorisation est valable pour tout site, à l&apos;exception de ceux diffusant des informations à caractère polémique, pornographique, xénophobe ou susceptibles de porter atteinte à la sensibilité du plus grand nombre.
          </p>
        </div>
      </section>

      {/* ── Section: RGPD ── */}
      <section id="rgpd" className="ml-section" style={sectionStyle}>
        <SectionHeader icon={Shield} number="04" title="Politique de protection des données personnelles" />
        <div style={contentStyle}>
          <p style={paragraphStyle}>
            La société <strong>O&apos;Méa</strong> s&apos;engage à ce que la collecte et le traitement de vos données, effectués à partir du site <strong style={{ color: "var(--green-deep)" }}>https://www.o-mea.fr</strong>, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés.
          </p>
          <p style={paragraphStyle}>
            Chaque formulaire ou téléservice limite la collecte des données personnelles au strict nécessaire (minimisation des données) et indique notamment :
          </p>

          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 20px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {[
              "quels sont les objectifs du recueil de ces données (finalités) ;",
              "si ces données sont obligatoires ou facultatives pour la gestion de votre demande ;",
              "qui pourra en prendre connaissance (uniquement O'Méa en principe, sauf précision dans le formulaire lorsqu'une transmission à un tiers est nécessaire à la gestion de votre demande).",
            ].map((item, i) => (
              <li key={i} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                fontSize: "0.92rem",
                color: "var(--text-mid)",
                lineHeight: 1.7,
              }}>
                <div style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "rgba(135,163,141,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--green-deep)",
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  flexShrink: 0,
                  marginTop: "2px",
                  fontFamily: "'Manrope', sans-serif",
                }}>
                  {i + 1}
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p style={paragraphStyle}>
            Les données personnelles recueillies dans le cadre des services proposés sur <strong>https://www.o-mea.fr</strong> sont traitées selon des protocoles sécurisés et permettent à O&apos;Méa de gérer les demandes reçues dans ses applications informatiques.
          </p>

          <div style={{
            marginTop: "24px",
            padding: "24px 28px",
            background: "linear-gradient(135deg, rgba(135,163,141,0.08) 0%, rgba(255,239,218,0.4) 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(135,163,141,0.15)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <Shield size={16} strokeWidth={2.2} style={{ color: "var(--green-deep)" }} />
              <p style={{
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--green-deep)",
                margin: 0,
                fontFamily: "'Manrope', sans-serif",
              }}>
                Exercice de vos droits
              </p>
            </div>
            <p style={{ fontSize: "0.88rem", color: "var(--text-dark)", lineHeight: 1.7, margin: "0 0 12px" }}>
              Pour toute information ou exercice de vos droits Informatique et Libertés sur les traitements de données personnelles gérés par O&apos;Méa, et notamment la suppression de vos données personnelles, vous pouvez contacter notre délégué à la protection des données (DPO) :
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "var(--text-mid)" }}>
                <Mail size={14} style={{ color: "var(--sage)", flexShrink: 0 }} />
                <span>Par email à{" "}
                  <a href="mailto:pro@o-mea.fr" style={{
                    color: "var(--green-deep)",
                    fontWeight: 700,
                    textDecoration: "none",
                    borderBottom: "1.5px solid var(--sage)",
                  }}>
                    pro@o-mea.fr
                  </a>
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.85rem", color: "var(--text-mid)" }}>
                <MapPin size={14} style={{ color: "var(--sage)", flexShrink: 0, marginTop: "3px" }} />
                <span>
                  Par courrier signé accompagné de la copie d&apos;un titre d&apos;identité à :<br />
                  <strong style={{ color: "var(--text-dark)" }}>
                    O&apos;Méa — 35 chemin du Collet de l&apos;Hubac, 06800 Cagnes-sur-Mer
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to top */}
      {showTop && (
        <button
          className="ml-back-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Retour en haut"
        >
          <ArrowUp size={18} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionHeader({ icon: Icon, number, title }: { icon: typeof Globe; number: string; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
      <div style={{
        width: "48px",
        height: "48px",
        borderRadius: "14px",
        background: "var(--green-deep)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        flexShrink: 0,
        boxShadow: "0 6px 20px rgba(45,74,62,0.15)",
      }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div>
        <p style={{
          fontSize: "0.6rem",
          fontWeight: 800,
          letterSpacing: "0.2em",
          color: "var(--sage)",
          textTransform: "uppercase",
          margin: "0 0 2px",
          fontFamily: "'Manrope', sans-serif",
        }}>
          Article {number}
        </p>
        <h2 style={{
          fontSize: "clamp(1.2rem, 2.4vw, 1.55rem)",
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: "var(--text-dark)",
          margin: 0,
          fontFamily: "'Manrope', sans-serif",
          lineHeight: 1.2,
        }}>
          {title}
        </h2>
      </div>
    </div>
  );
}

function InfoBlock({ label, value, sub, icon: Icon, isLink = false }: {
  label: string;
  value: string;
  sub?: string;
  icon?: typeof Globe;
  isLink?: boolean;
}) {
  return (
    <div>
      <p style={metaLabelStyle}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {Icon && <Icon size={14} style={{ color: "var(--sage)", flexShrink: 0 }} />}
        {isLink ? (
          <a href={`mailto:${value}`} style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "var(--green-deep)",
            textDecoration: "none",
            fontFamily: "'Manrope', sans-serif",
            borderBottom: "1.5px solid var(--sage)",
          }}>
            {value}
          </a>
        ) : (
          <p style={{
            fontSize: "0.92rem",
            fontWeight: 700,
            color: "var(--text-dark)",
            margin: 0,
            fontFamily: "'Manrope', sans-serif",
          }}>
            {value}
          </p>
        )}
      </div>
      {sub && (
        <p style={{ fontSize: "0.78rem", color: "var(--text-light)", margin: "2px 0 0", paddingLeft: Icon ? "22px" : 0 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─── Shared styles ─── */
const sectionStyle: React.CSSProperties = {
  background: "white",
  borderRadius: "24px",
  padding: "36px 40px",
  marginBottom: "24px",
  border: "1px solid rgba(135,163,141,0.08)",
  boxShadow: "0 2px 12px rgba(45,74,62,0.03)",
};

const contentStyle: React.CSSProperties = {
  paddingLeft: "64px",
};

const paragraphStyle: React.CSSProperties = {
  fontSize: "0.92rem",
  color: "var(--text-mid)",
  lineHeight: 1.8,
  margin: "0 0 16px",
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: "0.62rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "var(--text-light)",
  margin: "0 0 6px",
  fontFamily: "'Manrope', sans-serif",
};
