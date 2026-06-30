"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/authStore";
import AdminSidebar from "@/presentation/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuth((s) => s.user);
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "admin") {
      router.replace("/shop");
      return;
    }
    setChecked(true);
  }, [user, router]);

  if (!checked) {
    return (
      <div className="ab-admin">
        <main className="ab-admin__main">
          <p className="ab-muted p-4">Checking access…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="ab-admin">
      <AdminSidebar />
      <main className="ab-admin__main">{children}</main>
    </div>
  );
}
