import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { ProductController } from "@/presentation/controllers/ProductController";
import { CATEGORY_LABELS } from "@/domain/shared/Category";
import ProductGallery from "@/presentation/components/product/ProductGallery";
import AddToCart from "@/presentation/components/product/AddToCart";
import ProductReviews from "@/presentation/components/product/ProductReviews";
import ProductCard from "@/presentation/components/ui/ProductCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await ProductController.show(params.slug);
  if (!product) return { title: "Product Not Found" };
  const description = product.description || `${product.name} — ABYSS`;
  const image = product.images?.[0] ?? undefined;
  return {
    title: `${product.name} — ABYSS`,
    description,
    openGraph: {
      title: `${product.name} — ABYSS`,
      description,
      images: image ? [{ url: image, alt: product.name }] : undefined,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ABYSS`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await ProductController.show(params.slug);
  if (!product) notFound();

  // Fetch related products (same category, exclude current)
  const allProducts = await ProductController.index({
    category: product.category,
  });
  const related = allProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <section className="section">
      <div className="ab-container">
        <div className="ab-muted mb-4" style={{ fontSize: "0.85rem" }}>
          <Link href="/shop">Shop</Link> /{" "}
          <Link href={`/shop?category=${product.category}`}>
            {CATEGORY_LABELS[product.category]}
          </Link>{" "}
          / <span className="text-gold">{product.name}</span>
        </div>

        <div className="row g-5">
          <div className="col-lg-6">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <div className="col-lg-6">
            <span className="ab-eyebrow">
              {CATEGORY_LABELS[product.category]}
            </span>
            <h1
              style={{
                fontSize: "clamp(2rem,4vw,3rem)",
                margin: "0.5rem 0 0.8rem",
              }}
            >
              {product.name}
            </h1>
            <div
              className="text-gold mb-2"
              style={{ fontSize: "1.5rem", fontWeight: 600 }}
            >
              {product.priceFormatted}
            </div>
            {product.stock > 0 ? (
              <div className="mb-4" style={{ fontSize: "0.85rem" }}>
                {product.stock <= 10 ? (
                  <span style={{ color: "var(--ab-danger)" }}>
                    Only {product.stock} left in stock
                  </span>
                ) : (
                  <span style={{ color: "var(--ab-aqua)" }}>In stock</span>
                )}
              </div>
            ) : (
              <div className="mb-4" style={{ fontSize: "0.85rem", color: "var(--ab-danger)" }}>
                Out of stock
              </div>
            )}
            <p className="ab-muted mb-4" style={{ lineHeight: 1.7 }}>
              {product.description}
            </p>

            <AddToCart product={product} />

            <div className="row g-3 mt-4">
              <Perk icon={<Truck size={20} />} text="Free shipping over 15,000 MMK" />
              <Perk icon={<RefreshCw size={20} />} text="30-day returns" />
              <Perk
                icon={<ShieldCheck size={20} />}
                text="Secure checkout"
              />
            </div>
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--ab-line)" }}>
          <ProductReviews productId={product.id} />
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-5 pt-4" style={{ borderTop: "1px solid var(--ab-line)" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "1.5rem" }}>You might also like</h3>
            <div className="row g-3">
              {related.map((p) => (
                <div className="col-6 col-lg-3" key={p.id}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Perk({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="col-12 d-flex align-items-center gap-3 ab-muted">
      <span className="text-gold">{icon}</span>
      <span style={{ fontSize: "0.9rem" }}>{text}</span>
    </div>
  );
}
