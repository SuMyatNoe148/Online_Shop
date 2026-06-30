"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Trash2, CheckCircle2, X, RefreshCw, Smartphone } from "lucide-react";
import toast from "react-hot-toast";
import QRCode from "react-qr-code";
import {
  useCart,
  cartKey,
  selectSubtotal,
} from "@/store/cartStore";
import { formatMoney } from "@/lib/format";
import { phpApi } from "@/lib/phpApi";
import { useAuth } from "@/store/authStore";

type PaymentStatus = "idle" | "creating" | "pending" | "success" | "failed" | "cancelled" | "error";

export default function CartPage() {
  const { items, remove, setQuantity, clear } = useCart();
  const subtotal = useCart(selectSubtotal);
  const currency = items[0]?.currency ?? "MMK";
  const user = useAuth((s) => s.user);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    address: "",
  });

  // Pre-fill form when user is logged in
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [orderId, setOrderId] = useState("");
  const [paymentData, setPaymentData] = useState<{
    qr: string | null;
    amount: number;
    currency: string;
    sandbox: boolean;
  } | null>(null);
  const [message, setMessage] = useState("");
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = (oid: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const status = await phpApi.getPaymentStatus(oid) as { status: string };
        if (status.status === "SUCCESS") {
          setPaymentStatus("success");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          clear();
        } else if (status.status === "FAILED" || status.status === "EXPIRED") {
          setPaymentStatus("failed");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
      } catch {
        // ignore polling errors
      }
    }, 2500);
  };

  const cancelPayment = async () => {
    if (!orderId) return;
    try {
      await phpApi.cancelPayment(orderId);
      setPaymentStatus("cancelled");
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    } catch (err) {
      toast.error("Failed to cancel payment");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentStatus("creating");
    setMessage("");
    try {
      const order = await phpApi.createOrder({
        ...form,
        items: items.map((i) => ({
          productId: i.productId,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      }) as { id: string };
      setOrderId(order.id);

      const payment = await phpApi.createPayment(order.id);
      setPaymentData({
        qr: payment.qr,
        amount: payment.amount,
        currency: payment.currency,
        sandbox: payment.sandbox,
      });
      setPaymentStatus("pending");
      startPolling(order.id);
    } catch (err) {
      const msg = (err as Error).message;
      setPaymentStatus("error");
      setMessage(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (paymentStatus === "success") {
    return (
      <section className="section">
        <div className="ab-container text-center" style={{ maxWidth: 560 }}>
          <CheckCircle2 size={56} className="text-gold mb-3" />
          <h1 style={{ fontSize: "2.4rem" }}>Payment Successful</h1>
          <p className="ab-muted">
            Thank you for shopping ABYSS. Your order reference is{" "}
            <span className="text-gold">{orderId}</span>.
          </p>
          <Link href="/profile#orders" className="ab-btn ab-btn--gold mt-3">
            View My Orders
          </Link>
        </div>
      </section>
    );
  }

  if (paymentStatus === "failed") {
    return (
      <section className="section">
        <div className="ab-container text-center" style={{ maxWidth: 560 }}>
          <X size={56} className="ab-danger mb-3" />
          <h1 style={{ fontSize: "2.4rem" }}>Payment Failed</h1>
          <p className="ab-muted">
            The payment could not be completed. Please try again or contact support.
          </p>
          <button
            className="ab-btn ab-btn--gold mt-3"
            onClick={() => {
              setPaymentStatus("idle");
              setOrderId("");
              setPaymentData(null);
            }}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (paymentStatus === "cancelled") {
    return (
      <section className="section">
        <div className="ab-container text-center" style={{ maxWidth: 560 }}>
          <X size={56} className="ab-muted mb-3" />
          <h1 style={{ fontSize: "2.4rem" }}>Payment Cancelled</h1>
          <p className="ab-muted">
            You cancelled the payment. Your order is still pending.
          </p>
          <button
            className="ab-btn ab-btn--gold mt-3"
            onClick={() => {
              setPaymentStatus("idle");
              setOrderId("");
              setPaymentData(null);
            }}
          >
            Try Again
          </button>
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
                  <span>{subtotal >= 5000000 ? "Free" : formatMoney(500000, currency)}</span>
                </div>
                <hr style={{ borderColor: "var(--ab-line)" }} />

                {!user && (
                  <div style={{
                    background: "var(--ab-surface-2)",
                    border: "1px solid var(--ab-gold)",
                    borderRadius: "var(--ab-radius-sm)",
                    padding: "1rem",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}>
                    <p style={{ marginBottom: "0.6rem", fontSize: "0.9rem" }}>
                      Please sign in to place your order.
                    </p>
                    <Link href="/login" className="ab-btn ab-btn--gold" style={{ fontSize: "0.85rem", padding: "0.5rem 1.2rem" }}>
                      Sign In
                    </Link>
                    <span className="ab-muted" style={{ display: "block", fontSize: "0.78rem", marginTop: "0.5rem" }}>
                      No account? <Link href="/register" style={{ color: "var(--ab-gold)" }}>Register free</Link>
                    </span>
                  </div>
                )}

                {paymentStatus === "pending" && paymentData && (
                  <div style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1000,
                    padding: "1rem",
                  }}>
                    <div style={{
                      background: "var(--ab-surface)",
                      border: "1px solid var(--ab-gold)",
                      borderRadius: "var(--ab-radius-md)",
                      padding: "2rem",
                      maxWidth: 400,
                      width: "100%",
                      textAlign: "center",
                    }}>
                      <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                        <Smartphone size={22} className="text-gold" />
                        <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>Scan to Pay</span>
                      </div>
                      <div style={{
                        background: "#fff",
                        padding: "1.5rem",
                        borderRadius: "var(--ab-radius-sm)",
                        display: "inline-block",
                        marginBottom: "1rem",
                      }}>
                        {paymentData.qr && <QRCode value={paymentData.qr} size={200} />}
                      </div>
                      <p className="ab-muted" style={{ fontSize: "1rem", marginBottom: "0.5rem", fontWeight: 500 }}>
                        {formatMoney(paymentData.amount, paymentData.currency)}
                      </p>
                      {paymentData.sandbox && (
                        <p className="ab-muted" style={{ fontSize: "0.8rem", color: "var(--ab-gold)", marginBottom: "1.5rem" }}>
                          Sandbox mode: auto-confirms in 8 seconds
                        </p>
                      )}
                      <div className="d-flex gap-2 justify-content-center">
                        <button
                          type="button"
                          className="ab-btn ab-btn--ghost"
                          onClick={cancelPayment}
                        >
                          Cancel Payment
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {paymentStatus === "creating" && (
                  <div className="mt-3 text-center py-3">
                    <RefreshCw size={24} className="spin text-gold" />
                    <p className="ab-muted mt-2" style={{ fontSize: "0.88rem" }}>Creating payment…</p>
                  </div>
                )}

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

                  {paymentStatus === "error" && (
                    <p style={{ color: "var(--ab-danger)" }}>{message}</p>
                  )}

                  <button
                    className="ab-btn ab-btn--gold ab-btn--block"
                    disabled={paymentStatus === "creating" || paymentStatus === "pending" || !user}
                  >
                    {paymentStatus === "creating"
                      ? "Creating Payment…"
                      : paymentStatus === "pending"
                      ? "Payment Pending"
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
