"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";
import { ProductDTO } from "@/application/dto/ProductDTO";
import { CATEGORY_LABELS } from "@/domain/shared/Category";
import { useWishlist } from "@/store/wishlistStore";

export default function ProductCard({ product }: { product: ProductDTO }) {
  const { toggle, has } = useWishlist();
  const wished = has(product.id);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product.id);
    toast(wished ? "Removed from wishlist" : "Saved to wishlist", {
      icon: wished ? "🤍" : "❤️",
    });
  };

  return (
    <Link href={`/product/${product.slug}`} className="ab-card">
      <div className="ab-card__media">
        {product.featured && <span className="ab-tag ab-tag--gold">Featured</span>}
        {!product.inStock && <span className="ab-tag">Sold Out</span>}
        <button
          className="ab-wishlist-btn"
          onClick={handleWishlist}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={18}
            fill={wished ? "currentColor" : "none"}
            strokeWidth={1.6}
          />
        </button>
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ab-card__body">
        <span className="ab-card__cat">
          {CATEGORY_LABELS[product.category]}
        </span>
        <span className="ab-card__name">{product.name}</span>
        <span className="ab-card__price">{product.priceFormatted}</span>
      </div>
    </Link>
  );
}
