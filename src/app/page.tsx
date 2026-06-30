import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductController } from "@/presentation/controllers/ProductController";
import { ModelController } from "@/presentation/controllers/ModelController";
import ProductCard from "@/presentation/components/ui/ProductCard";
import Reveal from "@/presentation/components/ui/Reveal";
import Marquee from "@/presentation/components/ui/Marquee";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "ABYSS — Premium Streetwear & Fashion",
  description: "Discover ABYSS, a premium streetwear brand. Shop hoodies, shirts, tops and more. Free shipping over 50,000 MMK. Secure checkout via MMPay.",
  openGraph: {
    title: "ABYSS — Premium Streetwear & Fashion",
    description: "Discover ABYSS, a premium streetwear brand. Shop hoodies, shirts, tops and more.",
    type: "website",
  },
};

const CATEGORIES = [
  {
    key: "SHIRT",
    label: "Shirts",
    img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&h=1000&q=80",
  },
  {
    key: "HOODIE",
    label: "Hoodies",
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&h=1000&q=80",
  },
  {
    key: "TOP",
    label: "Tops",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&h=1000&q=80",
  },
];

export default async function HomePage() {
  const [featured, models] = await Promise.all([
    ProductController.index({ featured: "true" }),
    ModelController.index(true),
  ]);

  return (
    <>
      {/* HERO */}
      <section className="ab-hero">
        <div className="ab-hero__bg">
          <Image
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1920&q=80"
            alt="ABYSS campaign"
            fill
            priority
            style={{ objectFit: "cover" }}
          />
        </div>
        <div className="ab-container ab-hero__content">
          <span className="ab-eyebrow">FW / Collection 01</span>
          <h1>
            DEPTH
            <br />
            IN DETAIL
          </h1>
          <p>
            Considered essentials in shirts, hoodies and tops. Cut from premium
            fabric, built for the everyday and beyond.
          </p>
          <div className="d-flex flex-wrap gap-3">
            <Link href="/shop" className="ab-btn ab-btn--gold">
              Shop Collection <ArrowRight size={18} />
            </Link>
            <Link href="/models" className="ab-btn ab-btn--ghost">
              Meet the Models
            </Link>
          </div>
        </div>
      </section>

      <Marquee />

      {/* CATEGORIES */}
      <section className="section">
        <div className="ab-container">
          <Reveal>
            <div className="ab-section-head">
              <div>
                <span className="ab-eyebrow">Browse</span>
                <h2>Shop by Category</h2>
              </div>
              <Link href="/shop" className="ab-btn ab-btn--ghost">
                View All
              </Link>
            </div>
          </Reveal>
          <div className="row g-4">
            {CATEGORIES.map((c, i) => (
              <div className="col-md-4" key={c.key}>
                <Reveal delay={i * 0.08}>
                  <Link
                    href={`/shop?category=${c.key}`}
                    className="ab-cat"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.img} alt={c.label} loading="lazy" />
                    <div className="ab-cat__label">
                      <h3>{c.label}</h3>
                      <ArrowRight size={22} />
                    </div>
                  </Link>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED */}
      <section className="section" style={{ background: "var(--ab-ink-2)" }}>
        <div className="ab-container">
          <Reveal>
            <div className="ab-section-head">
              <div>
                <span className="ab-eyebrow">Curated</span>
                <h2>Featured Pieces</h2>
              </div>
              <Link href="/shop" className="ab-btn ab-btn--ghost">
                All Products
              </Link>
            </div>
          </Reveal>
          <div className="row g-4">
            {featured.map((p, i) => (
              <div className="col-6 col-lg-3" key={p.id}>
                <Reveal delay={i * 0.06}>
                  <ProductCard product={p} />
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODELS */}
      <section className="section">
        <div className="ab-container">
          <Reveal>
            <div className="ab-section-head">
              <div>
                <span className="ab-eyebrow">Faces of ABYSS</span>
                <h2>The Models</h2>
              </div>
              <Link href="/models" className="ab-btn ab-btn--ghost">
                Full Roster
              </Link>
            </div>
          </Reveal>
          <div className="row g-4">
            {models.map((m, i) => (
              <div className="col-md-4" key={m.id}>
                <Reveal delay={i * 0.08}>
                  <div className="ab-model">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.photo} alt={m.name} loading="lazy" />
                    <div className="ab-model__info">
                      <span>{m.role}</span>
                      <h4>{m.name}</h4>
                    </div>
                  </div>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROMO */}
      <section className="section" style={{ background: "var(--ab-ink-2)" }}>
        <div className="ab-container text-center">
          <Reveal>
            <span className="ab-eyebrow">Members</span>
            <h2 style={{ fontSize: "clamp(2rem,5vw,3.4rem)", margin: "0.6rem 0 1rem" }}>
              Join the ABYSS Inner Circle
            </h2>
            <p className="ab-muted mx-auto" style={{ maxWidth: 520 }}>
              Early access to drops, members-only pricing, and free shipping on
              orders over 50,000 MMK.
            </p>
            <Link href="/shop" className="ab-btn ab-btn--gold mt-3">
              Start Shopping <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
