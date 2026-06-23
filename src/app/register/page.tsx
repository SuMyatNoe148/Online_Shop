"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/store/authStore";
import { phpApi } from "@/lib/phpApi";

export default function RegisterPage() {
  const router  = useRouter();
  const setUser = useAuth((s) => s.setUser);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const user = await phpApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
      }) as { id: string; name: string; role: "customer" | "admin" };
      setUser(user);
      toast.success(`Account created! Welcome, ${user.name}.`);
      router.push("/shop");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: e.target.value });

  return (
    <section className="section">
      <div className="ab-container">
        <div className="ab-auth-card">
          <span className="ab-eyebrow">Join ABYSS</span>
          <h1 style={{ fontSize: "2rem", margin: "0.4rem 0 1.6rem" }}>Create Account</h1>

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="ab-label">Full Name</label>
              <input
                className="ab-input"
                required
                autoComplete="name"
                value={form.name}
                onChange={set("name")}
              />
            </div>
            <div className="mb-3">
              <label className="ab-label">Email</label>
              <input
                className="ab-input"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={set("email")}
              />
            </div>
            <div className="mb-3">
              <label className="ab-label">Password</label>
              <input
                className="ab-input"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={form.password}
                onChange={set("password")}
              />
            </div>
            <div className="mb-4">
              <label className="ab-label">Confirm Password</label>
              <input
                className="ab-input"
                type="password"
                required
                autoComplete="new-password"
                value={form.confirm}
                onChange={set("confirm")}
              />
            </div>
            <button
              className="ab-btn ab-btn--gold ab-btn--block"
              disabled={loading}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="ab-muted mt-3 text-center" style={{ fontSize: "0.88rem" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "var(--ab-gold)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
