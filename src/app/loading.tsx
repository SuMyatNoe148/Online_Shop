export default function Loading() {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          className="display-font"
          style={{
            fontSize: "2.4rem",
            letterSpacing: "0.4em",
            paddingLeft: "0.4em",
            color: "var(--ab-paper)",
            animation: "ab-pulse 1.2s ease-in-out infinite",
          }}
        >
          ABYSS
        </div>
        <style>{`
          @keyframes ab-pulse {
            0%, 100% { opacity: 0.35; }
            50% { opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}
