"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/store/authStore";
import { phpApi } from "@/lib/phpApi";
import { X } from "lucide-react";

export default function LoginPage() {
  const router  = useRouter();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    if (user) {
      router.replace(user.role === "admin" ? "/admin" : "/shop");
    }
  }, [user, router]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [resetForm, setResetForm] = useState({ newPassword: "", confirmPassword: "" });
  const [resetError, setResetError] = useState("");
  const [resetting, setResetting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const user = await phpApi.login(form) as { id: string; name: string; role: "customer" | "admin" };
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === "admin" ? "/admin" : "/shop");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const data = await phpApi.requestReset(forgotEmail);
      setForgotSent(true);
      if (data.devToken) {
        setResetToken(data.devToken);
      }
      toast.success("Password reset link sent to your email");
    } catch (err) {
      toast.error("Failed to send reset link");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");
    if (resetForm.newPassword.length < 6) {
      setResetError("Password must be at least 6 characters.");
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetting(true);
    try {
      await phpApi.resetPassword(forgotEmail, resetToken, resetForm.newPassword);
      toast.success("Password reset successfully! You can now sign in.");
      setForgotOpen(false);
      setForgotSent(false);
      setResetToken("");
      setResetForm({ newPassword: "", confirmPassword: "" });
    } catch (err) {
      setResetError((err as Error).message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <section className="section">
      <div className="ab-container">
        <div className="ab-auth-card">
          <span className="ab-eyebrow">Welcome back</span>
          <h1 style={{ fontSize: "2rem", margin: "0.4rem 0 1.6rem" }}>Sign In</h1>

          {error && (
            <div style={{
              background: "rgba(239, 100, 97, 0.15)",
              border: "1px solid var(--ab-danger)",
              borderRadius: "var(--ab-radius-sm)",
              padding: "0.8rem 1rem",
              marginBottom: "1.2rem",
              color: "var(--ab-danger)",
              fontSize: "0.9rem",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="ab-label">Email</label>
              <input
                className="ab-input"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="mb-4">
              <label className="ab-label">Password</label>
              <input
                className="ab-input"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              className="ab-btn ab-btn--gold ab-btn--block"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="d-flex justify-content-between mt-3" style={{ fontSize: "0.85rem" }}>
            <Link href="/register" style={{ color: "var(--ab-gold)" }}>
              Create account
            </Link>
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              style={{ background: "none", border: "none", color: "var(--ab-muted)", cursor: "pointer", padding: 0 }}
            >
              Forgot password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setForgotOpen(false)}
        >
          <div
            style={{
              background: "var(--ab-surface)",
              border: "1px solid var(--ab-line)",
              borderRadius: "var(--ab-radius-md)",
              padding: "2rem",
              maxWidth: 400,
              width: "100%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 style={{ fontSize: "1.3rem", margin: 0 }}>Reset Password</h2>
              <button
                onClick={() => setForgotOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            {forgotSent ? (
              <div className="py-3">
                {resetToken ? (
                  <>
                    <p className="ab-muted mb-3" style={{ fontSize: "0.85rem" }}>
                      Dev mode: Enter your new password below. (In production, the reset link would be emailed.)
                    </p>
                    <form onSubmit={handleResetPassword}>
                      <div className="mb-3">
                        <label className="ab-label">New Password</label>
                        <input
                          className="ab-input"
                          type="password"
                          required
                          value={resetForm.newPassword}
                          onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="ab-label">Confirm Password</label>
                        <input
                          className="ab-input"
                          type="password"
                          required
                          value={resetForm.confirmPassword}
                          onChange={(e) => setResetForm({ ...resetForm, confirmPassword: e.target.value })}
                        />
                      </div>
                      {resetError && (
                        <p style={{ color: "var(--ab-danger)", fontSize: "0.85rem", marginBottom: "0.8rem" }}>{resetError}</p>
                      )}
                      <button className="ab-btn ab-btn--gold ab-btn--block" disabled={resetting}>
                        {resetting ? "Resetting…" : "Reset Password"}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="ab-muted">Password reset link sent to your email. Check your inbox.</p>
                    <button
                      className="ab-btn ab-btn--gold mt-3"
                      onClick={() => setForgotOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div className="mb-3">
                  <label className="ab-label">Email</label>
                  <input
                    className="ab-input"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <button
                  className="ab-btn ab-btn--gold ab-btn--block"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
