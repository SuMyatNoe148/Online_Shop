"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Shirt, ClipboardList, Users, ExternalLink } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Shirt },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="ab-admin__side">
      <Link href="/" className="ab-brand d-block mb-4" style={{ paddingLeft: 0 }}>
        ABYSS
      </Link>
      <nav className="ab-admin__nav">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={pathname === href ? "active" : ""}
          >
            <Icon size={18} /> {label}
          </Link>
        ))}
        <Link href="/" target="_blank">
          <ExternalLink size={18} /> View Store
        </Link>
      </nav>
    </aside>
  );
}
