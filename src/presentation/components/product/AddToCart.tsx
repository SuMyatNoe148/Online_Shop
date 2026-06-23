"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import toast from "react-hot-toast";
import { ProductDTO } from "@/application/dto/ProductDTO";
import { useCart } from "@/store/cartStore";

export default function AddToCart({ product }: { product: ProductDTO }) {
  const add = useCart((s) => s.add);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!size || !color) return;
    add(product, { size, color });
    setAdded(true);
    toast.success(`${product.name} added to bag`);
    setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div>
      <div className="mb-4">
        <span className="ab-label">Size</span>
        <div className="d-flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              className={`ab-chip ${size === s ? "ab-chip--active" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <span className="ab-label">Color</span>
        <div className="d-flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c}
              className={`ab-chip ${color === c ? "ab-chip--active" : ""}`}
              onClick={() => setColor(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        className="ab-btn ab-btn--gold ab-btn--block"
        onClick={handleAdd}
        disabled={!product.inStock}
      >
        {!product.inStock ? (
          "Sold Out"
        ) : added ? (
          <>
            <Check size={18} /> Added to Bag
          </>
        ) : (
          <>
            <ShoppingBag size={18} /> Add to Bag
          </>
        )}
      </button>
    </div>
  );
}
