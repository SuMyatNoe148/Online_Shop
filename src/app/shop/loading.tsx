export default function ShopLoading() {
  return (
    <section className="section">
      <div className="ab-container">
        <div
          style={{
            height: "2.5rem",
            width: "180px",
            borderRadius: "var(--ab-radius-sm)",
            background: "var(--ab-surface)",
            marginBottom: "0.5rem",
          }}
        />
        <div
          style={{
            height: "clamp(2.4rem,6vw,4rem)",
            width: "300px",
            borderRadius: "var(--ab-radius-sm)",
            background: "var(--ab-surface)",
            marginBottom: "2rem",
          }}
        />
        <div className="d-flex gap-2 mb-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              style={{
                height: "2.2rem",
                width: "80px",
                borderRadius: "999px",
                background: "var(--ab-surface)",
              }}
            />
          ))}
        </div>
        <div className="row g-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div className="col-6 col-lg-3" key={n}>
              <div
                style={{
                  aspectRatio: "3/4",
                  borderRadius: "var(--ab-radius-md)",
                  background: "var(--ab-surface)",
                }}
              />
              <div
                style={{
                  height: "1rem",
                  width: "70%",
                  borderRadius: "var(--ab-radius-sm)",
                  background: "var(--ab-surface)",
                  marginTop: "0.8rem",
                }}
              />
              <div
                style={{
                  height: "0.9rem",
                  width: "50%",
                  borderRadius: "var(--ab-radius-sm)",
                  background: "var(--ab-surface)",
                  marginTop: "0.4rem",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
