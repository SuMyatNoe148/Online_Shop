"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/store/authStore";
import Navbar from "./Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const user = useAuth((s) => s.user);

  // Hide navbar for admin users on admin pages
  if (user?.role === "admin" && pathname.startsWith("/admin")) {
    return null;
  }

  return <Navbar />;
}
