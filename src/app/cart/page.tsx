"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, CheckCircle2 } from "lucide-react";
import {
  useCart,
  cartKey,
  selectSubtotal,
} from "@/store/cartStore";
import { formatMoney } from "@/lib/format";

export default function CartPage() {
  const { items, remove, setQuantity, clear } = useCart();
  const subtotal = useCart(selectSubtotal);
  const currency = items[0]?.currency ?? "USD";

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    address: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Checkout failed");
      setOrderId(json.data.id);
      setStatus("done");
      clear();
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message);
    }
  };

  if (status === "done") {
    return (
      <section className="section">
        <div className="ab-container text-center" style={{ maxWidth: 560 }}>
          <CheckCircle2 size={56} className="text-gold mb-3" />
          <h1 style={{ fontSize: "2.4rem" }}>Order Confirmed</h1>
          <p className="ab-muted">
            Thank you for shopping ABYSS. Your order reference is{" "}
            <span className="text-gold">{orderId}</span>.
          </p>
          <Link href="/shop" className="ab-btn ab-btn--gold mt-3">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="ab-container">
        <span className="ab-eyebrow">Checkout</span>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", margin: "0.4rem 0 2rem" }}>
          Your Bag
        </h1>

        {items.length === 0 ? (
          <div className="ab-muted py-5">
            <p>Your bag is currently empty.</p>
            <Link href="/shop" className="ab-btn ab-btn--ghost mt-2">
              Browse the Collection
            </Link>
          </div>
        ) : (
          <div className="row g-5">
            <div className="col-lg-7">
              {items.map((i) => {
                const key = cartKey(i);
                return (
                  <div className="ab-cart-line" key={key}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={i.image} alt={i.name} />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <strong>{i.name}</strong>
                        <button
                          className="ab-icon-btn"
                          onClick={() => remove(key)}
                          aria-label="Remove"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="ab-muted" style={{ fontSize: "0.82rem" }}>
                        {i.size} · {i.color}
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="ab-chip"
                            onClick={() => setQuantity(key, i.quantity - 1)}
                          >
                            −
                          </button>
                          <span>{i.quantity}</span>
                          <button
                            className="ab-chip"
                            onClick={() => setQuantity(key, i.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <span className="text-gold">
                          {formatMoney(i.unitPrice * i.quantity, i.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="col-lg-5">
              <div className="ab-panel p-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="ab-muted">Subtotal</span>
                  <strong>{formatMoney(subtotal, currency)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-3 ab-muted">
                  <span>Shipping</span>
                  <span>{subtotal >= 15000 ? "Free" : formatMoney(1200, currency)}</span>
                </div>
                <hr style={{ borderColor: "var(--ab-line)" }} />

                <form onSubmit={submit} className="mt-3">
                  <div className="mb-3">
                    <label className="ab-label">Full Name</label>
                    <input
                      className="ab-input"
                      required
                      value={form.customerName}
                      onChange={(e) =>
                        setForm({ ...form, customerName: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="ab-label">Email</label>
                    <input
                      className="ab-input"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label className="ab-label">Shipping Address</label>
                    <textarea
                      className="ab-textarea"
                      rows={3}
                      required
                      value={form.address}
                      onChange={(e) =>
                        setForm({ ...form, address: e.target.value })
                      }
                    />
                  </div>

                  {status === "error" && (
                    <p style={{ color: "var(--ab-danger)" }}>{message}</p>
                  )}

                  <button
                    className="ab-btn ab-btn--gold ab-btn--block"
                    disabled={status === "loading"}
                  >
                    {status === "loading"
                      ? "Placing Order…"
                      : `Place Order · ${formatMoney(subtotal, currency)}`}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
