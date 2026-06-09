"use client";

const WORDS = [
  "SHIRTS",
  "HOODIES",
  "TOPS",
  "NEW DROP",
  "FREE SHIPPING OVER $150",
  "DEPTH IN DETAIL",
];

export default function Marquee() {
  const line = [...WORDS, ...WORDS];
  return (
    <div
      style={{
        overflow: "hidden",
        borderBlock: "1px solid var(--ab-line)",
        background: "var(--ab-ink-2)",
        padding: "0.9rem 0",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          gap: "2.4rem",
          whiteSpace: "nowrap",
          animation: "ab-marquee 26s linear infinite",
          fontFamily: "var(--font-display)",
          letterSpacing: "0.18em",
          fontSize: "0.95rem",
          color: "var(--ab-muted)",
        }}
      >
        {line.map((w, i) => (
          <span key={i}>
            {w}
            <span style={{ color: "var(--ab-gold)", marginLeft: "2.4rem" }}>
              ✦
            </span>
          </span>
        ))}
      </div>
      <style jsx>{`
        @keyframes ab-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
