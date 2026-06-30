"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  ShieldCheck,
  Package,
  Heart,
  ShoppingBag,
  LogOut,
  LayoutDashboard,
  Lock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/store/authStore";
import { useWishlist } from "@/store/wishlistStore";
import { phpApi } from "@/lib/phpApi";
import { formatMoney } from "@/lib/format";

interface OrderRow {
  id: string;
  customer_name: string;
  email: string;
  total: number;
  currency: string;
  status: string;
  created_at: string;
  item_count: number;
  items: { name: string; quantity: number; image: string | null }[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#d9c08a",
  processing: "#6ee7d6",
  shipped: "#7aa2f7",
  delivered: "#8bd450",
  cancelled: "#ef6461",
};

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const wishCount = useWishlist((s) => s.ids.length);
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Password change state
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwdError, setPwdError] = useState("");
  const [changingPwd, setChangingPwd] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.replace("/login");
    }
  }, [mounted, user, router]);

  useEffect(() => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    phpApi
      .getOrders(user.email)
      .then((data) => setOrders(data as OrderRow[]))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user?.email]);

  const handleLogout = () => {
    logout();
    toast.success("Signed out");
    router.push("/");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError("");
    if (pwdForm.newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters.");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError("New passwords do not match.");
      return;
    }
    setChangingPwd(true);
    try {
      await phpApi.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      toast.success("Password changed successfully");
      setShowPwdForm(false);
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwdError((err as Error).message);
    } finally {
      setChangingPwd(false);
    }
  };

  if (!mounted || !user) {
    return (
      <section className="section">
        <div className="ab-container">
          <p className="ab-muted">Loading…</p>
        </div>
      </section>
    );
  }

  const initials = user.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <section className="section">
      <div className="ab-container" style={{ maxWidth: 900 }}>
        {/* Centered header */}
        <div className="text-center mb-5">
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "var(--ab-gold)",
              color: "#000",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--font-display)",
              fontSize: "2.2rem",
              fontWeight: 700,
              margin: "0 auto 1.2rem",
            }}
          >
            {initials}
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.4rem)", margin: "0.4rem 0 0.6rem" }}>
            {user.name}
          </h1>
          <p className="ab-muted" style={{ fontSize: "0.95rem" }}>
            {user.email} · {user.role} account
          </p>
        </div>

        {/* Quick actions */}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-5">
          <Link href="/wishlist" className="ab-btn ab-btn--ghost" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Heart size={18} /> Wishlist ({wishCount})
          </Link>
          <Link href="/shop" className="ab-btn ab-btn--ghost" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShoppingBag size={18} /> Continue Shopping
          </Link>
          {user.role === "admin" && (
            <Link href="/admin" className="ab-btn ab-btn--ghost" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <LayoutDashboard size={18} /> Admin Dashboard
            </Link>
          )}
          <button className="ab-btn ab-btn--ghost" onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--ab-danger)" }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Order history */}
        <div className="ab-panel p-4" id="orders">
          <div className="d-flex align-items-center gap-2 mb-4">
            <Package size={22} className="text-gold" />
            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Order History</h2>
          </div>

          {loading ? (
            <p className="ab-muted m-0">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <p className="ab-muted mb-3">You have not placed any orders yet.</p>
              <Link href="/shop" className="ab-btn ab-btn--gold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  style={{
                    border: "1px solid var(--ab-line)",
                    borderRadius: "var(--ab-radius-md)",
                    overflow: "hidden",
                    background: "var(--ab-surface)",
                  }}
                >
                  {/* Order header */}
                  <div
                    style={{
                      padding: "1rem 1.3rem",
                      background: "var(--ab-surface-2)",
                      borderBottom: "1px solid var(--ab-line)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }} className="ab-muted">
                          Order #{o.id.slice(-8)}
                        </div>
                        <div className="ab-muted" style={{ fontSize: "0.8rem", marginTop: "0.15rem" }}>
                          {new Date(o.created_at).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          padding: "0.35rem 0.8rem",
                          borderRadius: 999,
                          color: "#000",
                          background: STATUS_COLORS[o.status] ?? "#999",
                        }}
                      >
                        {o.status}
                      </span>
                    </div>
                  </div>

                  {/* Order items */}
                  <div style={{ padding: "1.3rem" }}>
                    <div className="d-flex flex-column gap-3">
                      {o.items?.map((it, idx) => (
                        <div
                          key={idx}
                          className="d-flex align-items-center gap-3"
                          style={{
                            padding: "0.8rem",
                            background: "var(--ab-surface-2)",
                            borderRadius: "var(--ab-radius-sm)",
                          }}
                        >
                          {it.image ? (
                            <img
                              src={it.image}
                              alt={it.name}
                              style={{
                                width: 56,
                                height: 56,
                                objectFit: "cover",
                                borderRadius: "var(--ab-radius-sm)",
                                background: "var(--ab-line)",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                borderRadius: "var(--ab-radius-sm)",
                                background: "var(--ab-line)",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <Package size={24} className="ab-muted" />
                            </div>
                          )}
                          <div className="flex-grow-1">
                            <div style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                              {it.name}
                            </div>
                            <div className="ab-muted" style={{ fontSize: "0.8rem", marginTop: "0.2rem" }}>
                              Qty: {it.quantity}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order footer */}
                  <div
                    style={{
                      padding: "0.9rem 1.3rem",
                      background: "var(--ab-surface-2)",
                      borderTop: "1px solid var(--ab-line)",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="ab-muted" style={{ fontSize: "0.85rem" }}>
                        {o.item_count} item{o.item_count > 1 ? "s" : ""}
                      </span>
                      <strong className="text-gold" style={{ fontSize: "1.15rem" }}>{formatMoney(o.total, o.currency)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Password change */}
        <div className="ab-panel p-4 mt-4" id="security">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Lock size={22} className="text-gold" />
            <h2 style={{ fontSize: "1.4rem", margin: 0 }}>Security</h2>
          </div>
          {!showPwdForm ? (
            <button
              className="ab-btn ab-btn--ghost"
              onClick={() => setShowPwdForm(true)}
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} style={{ maxWidth: 400 }}>
              <div className="mb-3">
                <label className="ab-label">Current Password</label>
                <input
                  className="ab-input"
                  type="password"
                  required
                  value={pwdForm.currentPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="ab-label">New Password</label>
                <input
                  className="ab-input"
                  type="password"
                  required
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label className="ab-label">Confirm New Password</label>
                <input
                  className="ab-input"
                  type="password"
                  required
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                />
              </div>
              {pwdError && (
                <p style={{ color: "var(--ab-danger)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>{pwdError}</p>
              )}
              <div className="d-flex gap-2">
                <button className="ab-btn ab-btn--gold" disabled={changingPwd}>
                  {changingPwd ? "Changing…" : "Change Password"}
                </button>
                <button
                  type="button"
                  className="ab-btn ab-btn--ghost"
                  onClick={() => {
                    setShowPwdForm(false);
                    setPwdError("");
                    setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
