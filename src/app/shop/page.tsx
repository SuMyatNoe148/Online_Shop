import Link from "next/link";
import { ProductController } from "@/presentation/controllers/ProductController";
import ProductCard from "@/presentation/components/ui/ProductCard";
import ShopSortBar from "@/presentation/components/ui/ShopSortBar";
import { CATEGORY_LIST, CATEGORY_LABELS } from "@/domain/shared/Category";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { category?: string; search?: string };
}) {
  const q = searchParams.search;
  const c = searchParams.category ? CATEGORY_LABELS[searchParams.category as keyof typeof CATEGORY_LABELS] : null;
  return {
    title: q ? `Search: "${q}"` : c ? `${c}s` : "Shop",
    description: "Browse the full ABYSS collection — premium shirts, hoodies and tops.",
  };
}

const FILTERS = [
  { key: "", label: "All" },
  ...CATEGORY_LIST.map((c) => ({ key: c, label: CATEGORY_LABELS[c] })),
];

const SORT_OPTIONS = [
  { key: "created_at_desc", label: "Newest" },
  { key: "price_asc",       label: "Price: Low → High" },
  { key: "price_desc",      label: "Price: High → Low" },
  { key: "name_asc",        label: "Name A–Z" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; sort?: string };
}) {
  const products = await ProductController.index({
    category: searchParams.category ?? null,
    search: searchParams.search ?? null,
    sort: searchParams.sort ?? null,
  });

  const active = searchParams.category ?? "";
  const sort   = searchParams.sort ?? "created_at_desc";
  const search = searchParams.search ?? "";

  return (
    <section className="section">
      <div className="ab-container">
        <span className="ab-eyebrow">The Collection</span>
        <h1 style={{ fontSize: "clamp(2.4rem,6vw,4rem)", margin: "0.5rem 0 1rem" }}>
          {search ? `Results for "${search}"` : "Shop ABYSS"}
        </h1>

        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div className="d-flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const href = f.key
                ? `/shop?category=${f.key}${search ? `&search=${encodeURIComponent(search)}` : ""}`
                : `/shop${search ? `?search=${encodeURIComponent(search)}` : ""}`;
              return (
                <Link
                  key={f.label}
                  href={href}
                  className={`ab-chip ${active === f.key ? "ab-chip--active" : ""}`}
                >
                  {f.label}
                </Link>
              );
            })}
          </div>

          <ShopSortBar options={SORT_OPTIONS} current={sort} />
        </div>

        <p className="ab-muted mb-3" style={{ fontSize: "0.82rem" }}>
          {products.length} product{products.length !== 1 ? "s" : ""}
        </p>

        {products.length === 0 ? (
          <div className="py-5">
            <p className="ab-muted">No products found.</p>
            <Link href="/shop" className="ab-btn ab-btn--ghost mt-2">Clear filters</Link>
          </div>
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
