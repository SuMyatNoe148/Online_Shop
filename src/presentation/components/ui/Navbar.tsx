"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Search, Menu } from "lucide-react";
import { useCart, selectCount } from "@/store/cartStore";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=SHIRT", label: "Shirts" },
  { href: "/shop?category=HOODIE", label: "Hoodies" },
  { href: "/shop?category=TOP", label: "Tops" },
  { href: "/models", label: "Models" },
];

export default function Navbar() {
  const pathname = usePathname();
  const count = useCart(selectCount);
  const openCart = useCart((s) => s.open);
  const [solid, setSolid] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`ab-nav ${solid ? "ab-nav--solid" : ""}`}>
      <div className="ab-container ab-nav__inner">
        <Link href="/" className="ab-brand" aria-label="ABYSS home">
          ABYSS
        </Link>

        <nav>
          <ul className="ab-nav__links">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className={pathname === l.href ? "active" : ""}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Link href="/shop" className="ab-icon-btn" aria-label="Search">
            <Search size={20} strokeWidth={1.6} />
          </Link>
          <button
            className="ab-icon-btn"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingBag size={20} strokeWidth={1.6} />
            {mounted && count > 0 && <span className="ab-badge">{count}</span>}
          </button>
          <Link
            href="/shop"
            className="ab-icon-btn d-md-none"
            aria-label="Menu"
          >
            <Menu size={22} strokeWidth={1.6} />
          </Link>
        </div>
      </div>
    </header>
  );
}
