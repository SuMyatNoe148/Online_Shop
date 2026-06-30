"use client";

import { Fragment, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { OrderDTO } from "@/application/dto/OrderDTO";
import { OrderStatus } from "@/domain/order/Order";
import { phpApi } from "@/lib/phpApi";

const STATUSES = Object.values(OrderStatus);

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

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await phpApi.getOrders() as any[];
      setOrders(data.map(normalizeOrder));
    } catch {
      toast.error("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await phpApi.updateOrderStatus(id, status);
      toast.success("Status updated.");
      load();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return (
    <div>
      <div className="mb-4">
        <span className="ab-eyebrow">Fulfilment</span>
        <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Orders</h1>
      </div>

      <div className="ab-panel">
        {loading ? (
          <p className="ab-muted p-3 m-0">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="ab-muted p-3 m-0">No orders yet.</p>
        ) : (
          <table className="ab-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.id}>
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      setExpanded(expanded === o.id ? null : o.id)
                    }
                  >
                    <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      {o.id.slice(0, 8)}
                    </td>
                    <td>
                      {o.customerName}
                      <div className="ab-muted" style={{ fontSize: "0.78rem" }}>
                        {o.email}
                      </div>
                    </td>
                    <td>{o.items.length}</td>
                    <td className="text-gold">{o.totalFormatted}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <select
                        className="ab-select"
                        style={{ padding: "0.4rem 0.6rem", width: "auto" }}
                        value={o.status}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr>
                      <td colSpan={5} style={{ background: "var(--ab-ink-2)" }}>
                        <div className="p-2">
                          <strong className="ab-muted">Shipping:</strong>{" "}
                          {o.address}
                          <div className="mt-2">
                            {o.items.map((i, idx) => (
                              <div
                                key={idx}
                                className="d-flex justify-content-between py-1"
                                style={{ fontSize: "0.88rem" }}
                              >
                                <span>
                                  {i.quantity}× {i.name} ({i.size} · {i.color})
                                </span>
                                <span className="text-gold">
                                  {i.unitPriceFormatted}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
