"use client";

export default function SkipToContent() {
  return (
    <a
      href="#main-content"
      style={{
        position: "absolute",
        left: "-9999px",
        top: "1rem",
        zIndex: 9999,
        background: "var(--ab-gold)",
        color: "#000",
        padding: "0.6rem 1.2rem",
        borderRadius: "var(--ab-radius-sm)",
        fontWeight: 600,
        fontSize: "0.85rem",
        textDecoration: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.left = "1rem")}
      onBlur={(e) => (e.currentTarget.style.left = "-9999px")}
    >
      Skip to content
    </a>
  );
}
