"use client";

interface BadgeRSEProps {
  label: string;
  style?: React.CSSProperties;
}

export default function BadgeRSE({ label, style }: BadgeRSEProps) {
  return (
    <span
      style={{
        fontSize: "0.7rem",
        fontWeight: 700,
        padding: "5px 12px",
        borderRadius: "999px",
        background: "rgba(135,163,141,0.1)",
        color: "var(--sage-dark)",
        border: "1px solid rgba(135,163,141,0.2)",
        letterSpacing: "0.03em",
        textTransform: "uppercase",
        display: "inline-block",
        ...style,
      }}
    >
      {label}
    </span>
  );
}
