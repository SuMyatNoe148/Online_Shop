import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="ab-container text-center" style={{ paddingBlock: "8vh" }}>
        <div
          className="display-font text-gold"
          style={{ fontSize: "clamp(4rem,18vw,11rem)", lineHeight: 1 }}
        >
          404
        </div>
        <h1 style={{ fontSize: "1.8rem", marginTop: "1rem" }}>
          Lost in the Abyss
        </h1>
        <p className="ab-muted">The page you’re looking for doesn’t exist.</p>
        <Link href="/" className="ab-btn ab-btn--gold mt-3">
          Back Home
        </Link>
      </div>
    </section>
  );
}
