"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/store/authStore";
import CartDrawer from "./CartDrawer";

export default function ConditionalCartDrawer() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);

  // Hide cart drawer for admin users on admin pages
  if (user?.role === "admin" && pathname.startsWith("/admin")) {
    return null;
  }

  return <CartDrawer />;
}
