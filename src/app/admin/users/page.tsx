"use client";

import { useState, useEffect } from "react";
import { Users, Shield, Trash2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { phpApi } from "@/lib/phpApi";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await phpApi.getUsers();
      setUsers(data as User[]);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleRole = async (user: User) => {
    const newRole = user.role === "admin" ? "customer" : "admin";
    try {
      await phpApi.updateUserRole(user.id, newRole);
      toast.success(`User role changed to ${newRole}`);
      loadUsers();
    } catch (err) {
      toast.error("Failed to update role");
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"? This action cannot be undone.`)) return;
    try {
      await phpApi.deleteUser(id);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="ab-eyebrow">User Management</span>
          <h1 style={{ fontSize: "2rem", margin: "0.3rem 0 0" }}>Users</h1>
        </div>
        <button className="ab-btn ab-btn--ghost" onClick={loadUsers}>
          <RefreshCw size={18} /> Refresh
        </button>
      </div>

      <div className="ab-panel">
        {loading ? (
          <p className="ab-muted p-3 m-0">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="ab-muted p-3 m-0">No users found.</p>
        ) : (
          <table className="ab-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td className="ab-muted">{u.email}</td>
                  <td>
                    <span
                      className="ab-pill"
                      style={{
                        background: u.role === "admin" ? "var(--ab-gold)" : "var(--ab-surface-2)",
                        color: u.role === "admin" ? "#000" : "var(--ab-paper)",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="ab-muted" style={{ fontSize: "0.85rem" }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="ab-btn ab-btn--ghost"
                        onClick={() => toggleRole(u)}
                        title="Toggle role"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        className="ab-btn ab-btn--ghost"
                        onClick={() => deleteUser(u.id, u.name)}
                        title="Delete user"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", color: "var(--ab-danger)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
