"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  role: "customer" | "admin";
  token?: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setUser: (user) => set({ user, token: user?.token ?? null }),
      logout: () => set({ user: null, token: null }),
    }),
    { name: "abyss-auth" },
  ),
);
