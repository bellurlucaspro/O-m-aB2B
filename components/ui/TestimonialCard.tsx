"use client";

interface TestimonialCardProps {
  quote: string;
  name: string;
  role: string;
  initials: string;
}

export default function TestimonialCard({
  quote,
  name,
  role,
  initials,
}: TestimonialCardProps) {
  return (
    <div
      style={{
        padding: "24px",
        background: "white",
        borderRadius: "16px",
        border: "1px solid rgba(135,163,141,0.12)",
      }}
    >
      <p
        style={{
          fontSize: "0.88rem",
          color: "var(--text-mid)",
          lineHeight: 1.7,
          fontStyle: "italic",
          marginBottom: "16px",
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--sage), var(--green-deep))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "0.85rem",
            color: "white",
          }}
        >
          {initials}
        </div>
        <div>
          <div
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "var(--text-dark)",
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: "0.73rem", color: "var(--text-light)" }}>
            {role}
          </div>
        </div>
      </div>
    </div>
  );
}
