export default function ProductSkeleton() {
  return (
    <div className="ab-card" style={{ pointerEvents: "none" }}>
      <div
        className="ab-skeleton"
        style={{ aspectRatio: "3/4", width: "100%", borderRadius: "var(--ab-radius) var(--ab-radius) 0 0" }}
      />
      <div className="ab-card__body" style={{ gap: "0.5rem", display: "flex", flexDirection: "column" }}>
        <div className="ab-skeleton" style={{ height: 12, width: "40%", borderRadius: 4 }} />
        <div className="ab-skeleton" style={{ height: 16, width: "80%", borderRadius: 4 }} />
        <div className="ab-skeleton" style={{ height: 14, width: "30%", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="row g-4">
      {Array.from({ length: count }).map((_, i) => (
        <div className="col-6 col-lg-3" key={i}>
          <ProductSkeleton />
        </div>
      ))}
    </div>
  );
}
