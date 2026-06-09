"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { ProductDTO } from "@/application/dto/ProductDTO";
import { CATEGORY_LIST, CATEGORY_LABELS } from "@/domain/shared/Category";

interface FormState {
  id?: string;
  name: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  images: string;
  sizes: string;
  colors: string;
  featured: boolean;
}

const EMPTY: FormState = {
  name: "",
  category: "SHIRT",
  price: "",
  stock: "",
  description: "",
  images: "",
  sizes: "S, M, L, XL",
  colors: "Black, White",
  featured: false,
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/products");
    const json = await res.json();
    setProducts(json.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(EMPTY);
    setError("");
    setOpen(true);
  };

  const openEdit = (p: ProductDTO) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      price: String(p.price / 100),
      stock: String(p.stock),
      description: p.description,
      images: p.images.join(", "),
      sizes: p.sizes.join(", "),
      colors: p.colors.join(", "),
      featured: p.featured,
    });
    setError("");
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      stock: parseInt(form.stock, 10),
      description: form.description,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
      colors: form.colors.split(",").map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
    };
    const url = form.id ? `/api/products/${form.id}` : "/api/products";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Save failed");
      return;
    }
    setOpen(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="ab-eyebrow">Catalogue</span>
          <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Products</h1>
        </div>
        <button className="ab-btn ab-btn--gold" onClick={openCreate}>
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="ab-panel">
        {loading ? (
          <p className="ab-muted p-3 m-0">Loading…</p>
        ) : (
          <table className="ab-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{CATEGORY_LABELS[p.category]}</td>
                  <td className="text-gold">{p.priceFormatted}</td>
                  <td>{p.stock}</td>
                  <td>{p.featured ? "Yes" : "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className="ab-icon-btn"
                      onClick={() => openEdit(p)}
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="ab-icon-btn"
                      onClick={() => remove(p.id)}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="ab-drawer-backdrop" onClick={() => setOpen(false)}>
          <div
            className="ab-panel p-4"
            style={{
              maxWidth: 560,
              width: "92vw",
              margin: "5vh auto",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 style={{ margin: 0 }}>
                {form.id ? "Edit Product" : "New Product"}
              </h3>
              <button className="ab-icon-btn" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={save}>
              <div className="row g-3">
                <div className="col-12">
                  <label className="ab-label">Name</label>
                  <input
                    className="ab-input"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="col-md-6">
                  <label className="ab-label">Category</label>
                  <select
                    className="ab-select"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {CATEGORY_LIST.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="ab-label">Price ($)</label>
                  <input
                    className="ab-input"
                    type="number"
                    step="0.01"
                    required
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-3">
                  <label className="ab-label">Stock</label>
                  <input
                    className="ab-input"
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="ab-label">Description</label>
                  <textarea
                    className="ab-textarea"
                    rows={2}
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </div>
                <div className="col-12">
                  <label className="ab-label">Image URLs (comma separated)</label>
                  <input
                    className="ab-input"
                    value={form.images}
                    onChange={(e) =>
                      setForm({ ...form, images: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="ab-label">Sizes (comma separated)</label>
                  <input
                    className="ab-input"
                    value={form.sizes}
                    onChange={(e) =>
                      setForm({ ...form, sizes: e.target.value })
                    }
                  />
                </div>
                <div className="col-md-6">
                  <label className="ab-label">Colors (comma separated)</label>
                  <input
                    className="ab-input"
                    value={form.colors}
                    onChange={(e) =>
                      setForm({ ...form, colors: e.target.value })
                    }
                  />
                </div>
                <div className="col-12 d-flex align-items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                  <label htmlFor="featured" className="ab-muted m-0">
                    Featured product
                  </label>
                </div>
              </div>

              {error && (
                <p style={{ color: "var(--ab-danger)" }} className="mt-3">
                  {error}
                </p>
              )}

              <button className="ab-btn ab-btn--gold ab-btn--block mt-4">
                {form.id ? "Save Changes" : "Create Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
