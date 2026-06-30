"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { useWishlist } from "@/store/wishlistStore";
import { useCart, type CartState } from "@/store/cartStore";
import { useAuth } from "@/store/authStore";
import { phpApi } from "@/lib/phpApi";
import { ProductDTO } from "@/application/dto/ProductDTO";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const addToCart = useCart((s) => s.add);
  const user = useAuth((s) => s.user);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    phpApi
      .getProducts()
      .then((all) => {
        const map = new Map<string, ProductDTO>();
        for (const p of all as ProductDTO[]) map.set(p.id, p);
        setProducts(ids.map((id) => map.get(id)).filter(Boolean) as ProductDTO[]);
      })
      .catch(() => {
        toast.error("Failed to load wishlist items");
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [ids]);

  if (ids.length === 0) {
    return (
      <section className="section">
        <div className="ab-container text-center" style={{ maxWidth: 520 }}>
          <Heart size={48} className="ab-muted mb-3" />
          <h1 style={{ fontSize: "2rem" }}>Your Wishlist</h1>
          <p className="ab-muted">Nothing saved yet. Browse the collection and tap ♡ on any product.</p>
          <Link href="/shop" className="ab-btn ab-btn--gold mt-3">
            Browse Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="ab-container">
        <span className="ab-eyebrow">Saved Items</span>
        <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", margin: "0.4rem 0 2rem" }}>
          Your Wishlist
          <span className="ab-muted" style={{ fontSize: "1rem", marginLeft: "0.8rem" }}>
            ({ids.length})
          </span>
        </h1>

        {!user && (
          <p className="ab-muted mb-4" style={{ fontSize: "0.9rem" }}>
            Wishlist items are saved locally. To save across devices,{" "}
            <Link href="/login" style={{ color: "var(--ab-gold)" }}>sign in</Link>.
          </p>
        )}

        {loading ? (
          <p className="ab-muted">Loading your wishlist…</p>
        ) : (
          <div className="row g-4">
            {products.map((p) => (
              <WishlistCard
                key={p.id}
                product={p}
                toggle={toggle}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function WishlistCard({
  product,
  toggle,
  addToCart,
}: {
  product: ProductDTO;
  toggle: (id: string) => void;
  addToCart: CartState["add"];
}) {
  const img = product.images?.[0];

  return (
    <div className="col-6 col-lg-3">
      <div className="ab-card" style={{ display: "block" }}>
        <div className="ab-card__media" style={{ background: "var(--ab-surface-2)", minHeight: 220 }}>
          <button
            className="ab-wishlist-btn"
            onClick={() => {
              toggle(product.id);
              toast("Removed from wishlist", { icon: "🤍" });
            }}
            aria-label="Remove from wishlist"
          >
            <Heart size={18} fill="currentColor" strokeWidth={1.6} />
          </button>
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {!product.inStock && (
            <span
              style={{
                position: "absolute",
                top: "0.6rem",
                left: "0.6rem",
                background: "var(--ab-danger)",
                color: "#fff",
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                padding: "0.25rem 0.6rem",
                borderRadius: 999,
              }}
            >
              Sold Out
            </span>
          )}
        </div>
        <div className="ab-card__body">
          <span className="ab-card__name">{product.name}</span>
          <span className="text-gold" style={{ fontSize: "0.95rem", fontWeight: 600 }}>
            {product.priceFormatted}
          </span>
          <div className="d-flex gap-2 mt-2">
            <Link
              href={`/product/${product.slug}`}
              className="ab-btn ab-btn--ghost"
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem", flex: 1 }}
            >
              <ShoppingBag size={14} /> View
            </Link>
            <button
              className="ab-btn ab-btn--ghost"
              onClick={() => {
                if (!product.inStock) {
                  toast.error("This item is out of stock");
                  return;
                }
                addToCart(product, {
                  size: product.sizes[0] ?? "ONE SIZE",
                  color: product.colors[0] ?? "Default",
                  quantity: 1,
                });
                toast.success("Added to bag");
              }}
              disabled={!product.inStock}
              style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem", color: product.inStock ? "var(--ab-gold)" : "var(--ab-muted)" }}
            >
              Add to Bag
            </button>
            <button
              className="ab-icon-btn"
              onClick={() => {
                toggle(product.id);
                toast("Removed from wishlist", { icon: "🤍" });
              }}
              aria-label="Remove from wishlist"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
