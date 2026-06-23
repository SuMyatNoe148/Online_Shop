"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Option { key: string; label: string; }

export default function ShopSortBar({
  options,
  current,
}: {
  options: Option[];
  current: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = new URLSearchParams(params.toString());
    next.set("sort", e.target.value);
    router.push(`/shop?${next.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={handleChange}
      style={{
        background: "var(--ab-surface-2)",
        border: "1px solid var(--ab-line-strong)",
        borderRadius: "var(--ab-radius-sm)",
        color: "var(--ab-paper)",
        padding: "0.4rem 0.8rem",
        fontSize: "0.82rem",
        cursor: "pointer",
        outline: "none",
      }}
      aria-label="Sort products"
    >
      {options.map((o) => (
        <option key={o.key} value={o.key}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
