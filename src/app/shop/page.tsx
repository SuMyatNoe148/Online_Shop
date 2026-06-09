import Link from "next/link";
import { ProductController } from "@/presentation/controllers/ProductController";
import ProductCard from "@/presentation/components/ui/ProductCard";
import { CATEGORY_LIST, CATEGORY_LABELS } from "@/domain/shared/Category";

export const dynamic = "force-dynamic";

export const metadata = { title: "Shop" };

const FILTERS = [
  { key: "", label: "All" },
  ...CATEGORY_LIST.map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const products = await ProductController.index({
    category: searchParams.category ?? null,
    search: searchParams.search ?? null,
  });
  const active = searchParams.category ?? "";

  return (
    <section className="section">
      <div className="ab-container">
        <span className="ab-eyebrow">The Collection</span>
        <h1 style={{ fontSize: "clamp(2.4rem,6vw,4rem)", margin: "0.5rem 0 1.6rem" }}>
          Shop ABYSS
        </h1>

        <div className="d-flex flex-wrap gap-2 mb-4">
          {FILTERS.map((f) => (
            <Link
              key={f.label}
              href={f.key ? `/shop?category=${f.key}` : "/shop"}
              className={`ab-chip ${active === f.key ? "ab-chip--active" : ""}`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="ab-muted py-5">No products found.</p>
        ) : (
          <div className="row g-4">
            {products.map((p) => (
              <div className="col-6 col-lg-3" key={p.id}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
