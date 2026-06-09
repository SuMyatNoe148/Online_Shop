"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import {
  useCart,
  cartKey,
  selectSubtotal,
} from "@/store/cartStore";
import { formatMoney } from "@/lib/format";

export default function CartDrawer() {
  const { items, isOpen, close, remove, setQuantity } = useCart();
  const subtotal = useCart(selectSubtotal);
  const currency = items[0]?.currency ?? "USD";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="ab-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            className="ab-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="ab-drawer__head">
              <strong style={{ letterSpacing: "0.1em" }}>
                YOUR BAG ({items.length})
              </strong>
              <button className="ab-icon-btn" onClick={close} aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <div className="ab-drawer__body">
              {items.length === 0 ? (
                <div className="text-center ab-muted py-5">
                  <p>Your bag is empty.</p>
                  <Link href="/shop" className="ab-btn ab-btn--ghost mt-2" onClick={close}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                items.map((i) => {
                  const key = cartKey(i);
                  return (
                    <div className="ab-cart-line" key={key}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={i.image} alt={i.name} />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <strong style={{ fontSize: "0.95rem" }}>{i.name}</strong>
                          <button
                            className="ab-icon-btn"
                            onClick={() => remove(key)}
                            aria-label="Remove"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="ab-muted" style={{ fontSize: "0.78rem" }}>
                          {i.size} · {i.color}
                        </div>
                        <div className="d-flex justify-content-between align-items-center mt-2">
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="ab-icon-btn"
                              onClick={() => setQuantity(key, i.quantity - 1)}
                              aria-label="Decrease"
                            >
                              <Minus size={15} />
                            </button>
                            <span>{i.quantity}</span>
                            <button
                              className="ab-icon-btn"
                              onClick={() => setQuantity(key, i.quantity + 1)}
                              aria-label="Increase"
                            >
                              <Plus size={15} />
                            </button>
                          </div>
                          <span className="text-gold">
                            {formatMoney(i.unitPrice * i.quantity, i.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="ab-drawer__foot">
                <div className="d-flex justify-content-between mb-3">
                  <span className="ab-muted">Subtotal</span>
                  <strong>{formatMoney(subtotal, currency)}</strong>
                </div>
                <Link
                  href="/cart"
                  className="ab-btn ab-btn--gold ab-btn--block"
                  onClick={close}
                >
                  Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
