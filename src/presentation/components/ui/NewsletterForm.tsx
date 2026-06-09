"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="d-flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (email.includes("@")) setDone(true);
      }}
    >
      {done ? (
        <span className="text-gold">Thanks — you’re on the list.</span>
      ) : (
        <>
          <input
            className="ab-input"
            type="email"
            required
            placeholder="Email address"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="ab-btn ab-btn--gold" type="submit">
            Join
          </button>
        </>
      )}
    </form>
  );
}
