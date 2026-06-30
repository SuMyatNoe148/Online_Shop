"use client";

import { useState } from "react";
import { phpApi } from "@/lib/phpApi";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await phpApi.subscribeNewsletter(email);
      setStatus("done");
      setMessage(res.message);
    } catch (err) {
      setStatus("error");
      setMessage((err as Error).message || "Something went wrong.");
    }
  };

  if (status === "done" || status === "error") {
    return (
      <span
        className="text-gold"
        style={status === "error" ? { color: "var(--ab-danger)" } : undefined}
      >
        {message}
      </span>
    );
  }

  return (
    <form className="d-flex gap-2" onSubmit={handleSubmit}>
      <input
        className="ab-input"
        type="email"
        required
        placeholder="Email address"
        aria-label="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={status === "loading"}
      />
      <button className="ab-btn ab-btn--gold" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Joining..." : "Join"}
      </button>
    </form>
  );
}
