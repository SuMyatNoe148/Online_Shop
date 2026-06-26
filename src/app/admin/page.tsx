import Link from "next/link";
import { Package, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import { ProductController } from "@/presentation/controllers/ProductController";
import { OrderController } from "@/presentation/controllers/OrderController";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [products, orders] = await Promise.all([
    ProductController.index({}),
    OrderController.index(),
  ]);

  const revenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStock = products.filter((p) => p.stock < 25);

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
      value: formatMoney(revenue, orders[0]?.currency ?? "MMK"),
      icon: <DollarSign size={20} />,
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
        <Link href="/admin/products" className="ab-btn ab-btn--gold">
          Manage Products
        </Link>
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
                        <span className="ab-pill">{o.status}</span>
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
