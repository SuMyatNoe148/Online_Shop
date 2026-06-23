"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/store/authStore";
import { phpApi } from "@/lib/phpApi";

export default function LoginPage() {
  const router  = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await phpApi.login(form) as { id: string; name: string; role: "customer" | "admin" };
      setUser(user);
      toast.success(`Welcome back, ${user.name}!`);
      router.push(user.role === "admin" ? "/admin" : "/shop");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section">
      <div className="ab-container">
        <div className="ab-auth-card">
          <span className="ab-eyebrow">Welcome back</span>
          <h1 style={{ fontSize: "2rem", margin: "0.4rem 0 1.6rem" }}>Sign In</h1>

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

          <p className="ab-muted mt-3 text-center" style={{ fontSize: "0.88rem" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "var(--ab-gold)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
