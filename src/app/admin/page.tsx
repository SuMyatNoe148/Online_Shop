"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Package, ShoppingCart, Banknote, AlertTriangle, Users } from "lucide-react";
import { phpApi } from "@/lib/phpApi";
import { formatMoney } from "@/lib/format";
import { useAuth } from "@/store/authStore";
import { ProductDTO } from "@/application/dto/ProductDTO";
import { OrderDTO } from "@/application/dto/OrderDTO";

export default function AdminDashboard() {
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function normalizeOrder(raw: any): OrderDTO {
    return {
      id: raw.id ?? "",
      customerName: raw.customer_name ?? raw.customerName ?? "",
      email: raw.email ?? "",
      address: raw.address ?? "",
      total: raw.total ?? 0,
      totalFormatted: raw.total_formatted ?? raw.totalFormatted ?? "",
      currency: raw.currency ?? "MMK",
      status: raw.status ?? "pending",
      createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
      items: (raw.items ?? []).map((it: any) => ({
        productId: it.product_id ?? it.productId ?? "",
        name: it.name ?? "",
        size: it.size ?? "",
        color: it.color ?? "",
        quantity: it.quantity ?? 1,
        unitPrice: it.unit_price ?? it.unitPrice ?? 0,
        unitPriceFormatted: it.unit_price_formatted ?? it.unitPriceFormatted ?? "",
      })),
    };
  }

  useEffect(() => {
    async function load() {
      try {
        const [p, o] = await Promise.all([
          phpApi.getProducts(),
          phpApi.getOrders(),
        ]);
        setProducts(p as ProductDTO[]);
        setOrders((o as any[]).map(normalizeOrder));
      } catch (err) {
        const msg = (err as Error).message || "";
        if (msg.includes("Authentication required") || msg.includes("Admin access required") || msg.includes("401")) {
          logout();
          router.replace("/login");
          return;
        }
        setError(msg || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router, logout]);

  if (loading) {
    return (
      <div>
        <div className="mb-4">
          <span className="ab-eyebrow">Overview</span>
          <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Dashboard</h1>
        </div>
        <p className="ab-muted">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="mb-4">
          <span className="ab-eyebrow">Overview</span>
          <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Dashboard</h1>
        </div>
        <p style={{ color: "var(--ab-danger)" }}>{error}</p>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "cancelled");
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 25);

  const statusColor: Record<string, string> = {
    pending: "var(--ab-gold)",
    processing: "var(--ab-aqua)",
    shipped: "#7aa2f7",
    delivered: "#8bd450",
    cancelled: "var(--ab-danger)",
  };

  const stats = [
    {
      label: "Products",
      value: products.length,
      icon: <Package size={20} />,
    },
    {
      label: "Orders",
      value: orders.length,
      icon: <ShoppingCart size={20} />,
    },
    {
      label: "Revenue",
      value: formatMoney(revenue, activeOrders[0]?.currency ?? "MMK"),
      icon: <Banknote size={20} />,
    },
    {
      label: "Low Stock",
      value: lowStock.length,
      icon: <AlertTriangle size={20} />,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="ab-eyebrow">Overview</span>
          <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Dashboard</h1>
        </div>
        <div className="d-flex gap-2">
          <Link href="/admin/users" className="ab-btn ab-btn--ghost">
            <Users size={18} /> Users
          </Link>
          <Link href="/admin/products" className="ab-btn ab-btn--gold">
            Manage Products
          </Link>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="ab-stat">
              <div className="d-flex justify-content-between align-items-center text-gold mb-2">
                <span className="ab-card__cat">{s.label}</span>
                {s.icon}
              </div>
              <div className="ab-stat__value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="ab-panel">
            <div className="p-3" style={{ borderBottom: "1px solid var(--ab-line)" }}>
              <strong>Recent Orders</strong>
            </div>
            {orders.length === 0 ? (
              <p className="ab-muted p-3 m-0">No orders yet.</p>
            ) : (
              <table className="ab-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 6).map((o) => (
                    <tr key={o.id}>
                      <td>{o.customerName}</td>
                      <td>{o.items.length}</td>
                      <td className="text-gold">{o.totalFormatted}</td>
                      <td>
                        <span
                          className="ab-pill"
                          style={{ color: statusColor[o.status] ?? "var(--ab-paper)" }}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="ab-panel">
            <div className="p-3" style={{ borderBottom: "1px solid var(--ab-line)" }}>
              <strong>Low Stock Alerts</strong>
            </div>
            {lowStock.length === 0 ? (
              <p className="ab-muted p-3 m-0">All products well stocked.</p>
            ) : (
              <table className="ab-table">
                <tbody>
                  {lowStock.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td style={{ textAlign: "right" }}>
                        <span style={{ color: "var(--ab-danger)" }}>
                          {p.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
