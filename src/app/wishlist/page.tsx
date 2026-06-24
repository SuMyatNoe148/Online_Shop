"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { useWishlist } from "@/store/wishlistStore";
import { useCart, type CartItem } from "@/store/cartStore";
import type { ProductDTO } from "@/application/dto/ProductDTO";

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();
  const addToCart = useCart((s) => s.add);

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

        <p className="ab-muted mb-4" style={{ fontSize: "0.9rem" }}>
          Wishlist items are saved locally. To save across devices,{" "}
          <Link href="/login" style={{ color: "var(--ab-gold)" }}>sign in</Link>.
        </p>

        <div className="row g-4">
          {ids.map((id) => (
            <WishlistCard key={id} productId={id} toggle={toggle} addToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WishlistCard({
  productId,
  toggle,
  addToCart,
}: {
  productId: string;
  toggle: (id: string) => void;
  addToCart: (product: ProductDTO, opts: { size: string; color: string; quantity?: number }) => void;
}) {
  return (
    <div className="col-6 col-lg-3">
      <div className="ab-card" style={{ display: "block" }}>
        <div className="ab-card__media" style={{ background: "var(--ab-surface-2)", minHeight: 220 }}>
          <button
            className="ab-wishlist-btn"
            onClick={() => {
              toggle(productId);
              toast("Removed from wishlist", { icon: "🤍" });
            }}
            aria-label="Remove from wishlist"
          >
            <Heart size={18} fill="currentColor" strokeWidth={1.6} />
          </button>
          <div
            style={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >
            <span className="ab-muted" style={{ fontSize: "0.75rem" }}>
              {productId}
            </span>
          </div>
        </div>
        <div className="ab-card__body">
          <span className="ab-card__name" style={{ fontSize: "0.85rem" }}>
            Saved product
          </span>
          <Link href="/shop" className="ab-btn ab-btn--ghost mt-2" style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }}>
            <ShoppingBag size={14} /> View
          </Link>
        </div>
      </div>
    </div>
  );
}
