import Link from "next/link";
import { notFound } from "next/navigation";
import { Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { ProductController } from "@/presentation/controllers/ProductController";
import { CATEGORY_LABELS } from "@/domain/shared/Category";
import ProductGallery from "@/presentation/components/product/ProductGallery";
import AddToCart from "@/presentation/components/product/AddToCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const product = await ProductController.show(params.slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await ProductController.show(params.slug);
  if (!product) notFound();

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
              className="text-gold mb-4"
              style={{ fontSize: "1.5rem", fontWeight: 600 }}
            >
              {product.priceFormatted}
            </div>
            <p className="ab-muted mb-4" style={{ lineHeight: 1.7 }}>
              {product.description}
            </p>

            <AddToCart product={product} />

            <div className="row g-3 mt-4">
              <Perk icon={<Truck size={20} />} text="Free shipping over $150" />
              <Perk icon={<RefreshCw size={20} />} text="30-day returns" />
              <Perk
                icon={<ShieldCheck size={20} />}
                text="Secure checkout"
              />
            </div>
          </div>
        </div>
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
