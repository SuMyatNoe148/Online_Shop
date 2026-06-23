"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Search, Menu, Heart, User, X } from "lucide-react";
import { useCart, selectCount } from "@/store/cartStore";
import { useWishlist } from "@/store/wishlistStore";
import { useAuth } from "@/store/authStore";

const LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?category=SHIRT", label: "Shirts" },
  { href: "/shop?category=HOODIE", label: "Hoodies" },
  { href: "/shop?category=TOP", label: "Tops" },
  { href: "/models", label: "Models" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const count    = useCart(selectCount);
  const openCart = useCart((s) => s.open);
  const wishCount = useWishlist((s) => s.ids.length);
  const user     = useAuth((s) => s.user);
  const logout   = useAuth((s) => s.logout);

  const [solid,   setSolid]   = useState(false);
  const [mounted, setMounted] = useState(false);
  const [search,  setSearch]  = useState(false);
  const [query,   setQuery]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (search) setTimeout(() => inputRef.current?.focus(), 60);
  }, [search]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearch(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/shop?search=${encodeURIComponent(query.trim())}`);
      setSearch(false);
      setQuery("");
    }
  };

  const handleLogout = async () => {
    logout();
    router.push("/");
  };

  return (
    <>
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
            <button
              className="ab-icon-btn"
              aria-label="Search"
              onClick={() => setSearch(true)}
            >
              <Search size={20} strokeWidth={1.6} />
            </button>

            {mounted && (
              <Link href="/wishlist" className="ab-icon-btn" aria-label="Wishlist" style={{ position: "relative" }}>
                <Heart size={20} strokeWidth={1.6} />
                {wishCount > 0 && <span className="ab-badge">{wishCount}</span>}
              </Link>
            )}

            {mounted && user ? (
              <>
                <span className="ab-muted d-none d-md-inline" style={{ fontSize: "0.8rem" }}>
                  {user.name.split(" ")[0]}
                </span>
                <button className="ab-icon-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
                  <User size={20} strokeWidth={1.6} />
                </button>
              </>
            ) : (
              <Link href="/login" className="ab-icon-btn" aria-label="Login">
                <User size={20} strokeWidth={1.6} />
              </Link>
            )}

            <button
              className="ab-icon-btn"
              onClick={openCart}
              aria-label="Open cart"
              style={{ position: "relative" }}
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {mounted && count > 0 && <span className="ab-badge">{count}</span>}
            </button>

            <Link href="/shop" className="ab-icon-btn d-md-none" aria-label="Menu">
              <Menu size={22} strokeWidth={1.6} />
            </Link>
          </div>
        </div>
      </header>

      {search && (
        <div className="ab-search-overlay" onClick={() => setSearch(false)}>
          <div className="ab-search-box" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={submitSearch} style={{ position: "relative" }}>
              <input
                ref={inputRef}
                className="ab-search-input"
                placeholder="Search products…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setSearch(false)}
                style={{
                  position: "absolute", right: "1rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", color: "var(--ab-muted)", cursor: "pointer",
                }}
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>
            <p className="ab-muted mt-2" style={{ fontSize: "0.82rem" }}>
              Press Enter to search · Esc to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
