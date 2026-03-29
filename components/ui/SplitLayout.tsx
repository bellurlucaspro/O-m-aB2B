"use client";

interface SplitLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftBg?: string;
  rightBg?: string;
  minHeight?: string;
  reverse?: boolean;
  id?: string;
  className?: string;
}

export default function SplitLayout({
  left,
  right,
  leftBg = "var(--pink)",
  rightBg = "var(--green-deep)",
  minHeight = "560px",
  reverse = false,
  id,
  className,
}: SplitLayoutProps) {
  return (
    <section
      id={id}
      className={className}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        .split-layout-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }
        @media (max-width: 900px) {
          .split-layout-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        className="split-layout-grid"
        style={{
          minHeight,
          direction: reverse ? "rtl" : "ltr",
        }}
      >
        <div
          style={{
            background: leftBg,
            direction: "ltr",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {left}
        </div>
        <div
          style={{
            background: rightBg,
            direction: "ltr",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {right}
        </div>
      </div>
    </section>
  );
}
