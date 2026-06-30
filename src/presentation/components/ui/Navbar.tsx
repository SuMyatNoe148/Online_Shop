"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Search, Menu, Heart, User, X, UserCircle, Package, LogOut, LayoutDashboard } from "lucide-react";
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

  const [solid,    setSolid]   = useState(false);
  const [mounted,  setMounted] = useState(false);
  const [search,   setSearch]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [query,    setQuery]   = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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
      if (e.key === "Escape") { setSearch(false); setMobileOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => { setUserMenu(false); }, [pathname]);

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

            {mounted && user && user.role !== "admin" && (
              <Link href="/wishlist" className="ab-icon-btn" aria-label="Wishlist" style={{ position: "relative" }}>
                <Heart size={20} strokeWidth={1.6} />
                {wishCount > 0 && <span className="ab-badge">{wishCount}</span>}
              </Link>
            )}

            {mounted && user ? (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  className="ab-icon-btn"
                  onClick={() => setUserMenu((o) => !o)}
                  aria-label="Account menu"
                  aria-expanded={userMenu}
                  title={user.name}
                >
                  <User size={20} strokeWidth={1.6} />
                </button>
                {userMenu && (
                  <div
                    style={{
                      position: "absolute", top: "calc(100% + 0.6rem)", right: 0,
                      minWidth: 200, zIndex: 120,
                      background: "var(--ab-surface)",
                      border: "1px solid var(--ab-line-strong)",
                      borderRadius: "var(--ab-radius-sm)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
                      padding: "0.5rem",
                    }}
                  >
                    <div style={{ padding: "0.5rem 0.7rem", borderBottom: "1px solid var(--ab-line)" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{user.name}</div>
                      <div className="ab-muted" style={{ fontSize: "0.74rem", textTransform: "capitalize" }}>{user.role} account</div>
                    </div>
                    {user.role !== "admin" && (
                      <>
                        <Link href="/profile" className="ab-menu-item" onClick={() => setUserMenu(false)}>
                          <UserCircle size={16} /> My Profile
                        </Link>
                        <Link href="/profile#orders" className="ab-menu-item" onClick={() => setUserMenu(false)}>
                          <Package size={16} /> My Orders
                        </Link>
                        <Link href="/wishlist" className="ab-menu-item" onClick={() => setUserMenu(false)}>
                          <Heart size={16} /> Wishlist
                        </Link>
                      </>
                    )}
                    {user.role === "admin" && (
                      <Link href="/admin" className="ab-menu-item" onClick={() => setUserMenu(false)}>
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      className="ab-menu-item"
                      onClick={() => { setUserMenu(false); handleLogout(); }}
                      style={{ width: "100%", color: "var(--ab-danger)" }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="ab-icon-btn" aria-label="Login">
                <User size={20} strokeWidth={1.6} />
              </Link>
            )}

            {user && user.role !== "admin" && (
              <button
                className="ab-icon-btn"
                onClick={openCart}
                aria-label="Open cart"
                style={{ position: "relative" }}
              >
                <ShoppingBag size={20} strokeWidth={1.6} />
                {mounted && count > 0 && <span className="ab-badge">{count}</span>}
              </button>
            )}

            <button
              className="ab-icon-btn d-md-none"
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} strokeWidth={1.6} />
            </button>
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

      {mobileOpen && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
          }}
          onClick={() => setMobileOpen(false)}
        >
          <div
            style={{
              position: "absolute", top: 0, right: 0, bottom: 0,
              width: "min(320px, 85vw)",
              background: "var(--ab-surface)",
              borderLeft: "1px solid var(--ab-line-strong)",
              padding: "2rem 1.6rem",
              display: "flex", flexDirection: "column", gap: "0.2rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.6rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700 }}>ABYSS</span>
              <button className="ab-icon-btn" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <X size={22} strokeWidth={1.6} />
              </button>
            </div>

            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "0.9rem 0",
                  borderBottom: "1px solid var(--ab-line)",
                  fontSize: "1.05rem",
                  fontFamily: "var(--font-display)",
                  color: pathname === l.href ? "var(--ab-gold)" : "var(--ab-paper)",
                }}
              >
                {l.label}
              </Link>
            ))}

            <div style={{ marginTop: "auto", paddingTop: "1.6rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {mounted && user ? (
                <>
                  <span className="ab-muted" style={{ fontSize: "0.85rem" }}>Signed in as {user.name}</span>
                  {user.role !== "admin" && (
                    <Link href="/profile" className="ab-btn ab-btn--ghost" onClick={() => setMobileOpen(false)}>My Profile</Link>
                  )}
                  {user.role !== "admin" && (
                    <Link href="/wishlist" className="ab-btn ab-btn--ghost" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                  )}
                  {user.role === "admin" && (
                    <Link href="/admin" className="ab-btn ab-btn--ghost" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button className="ab-btn ab-btn--ghost" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="ab-btn ab-btn--gold" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  <Link href="/register" className="ab-btn ab-btn--ghost" onClick={() => setMobileOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
