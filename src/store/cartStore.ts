"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductDTO } from "@/application/dto/ProductDTO";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number; // minor units
  currency: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  add: (
    product: ProductDTO,
    opts: { size: string; color: string; quantity?: number },
  ) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const cartKey = (i: Pick<CartItem, "productId" | "size" | "color">) =>
  `${i.productId}::${i.size}::${i.color}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (product, opts) =>
        set((state) => {
          const item: CartItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0] ?? "",
            size: opts.size,
            color: opts.color,
            unitPrice: product.price,
            currency: product.currency,
            quantity: opts.quantity ?? 1,
          };
          const key = cartKey(item);
          const existing = state.items.find((i) => cartKey(i) === key);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                cartKey(i) === key
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { isOpen: true, items: [...state.items, item] };
        }),
      remove: (key) =>
        set((state) => ({
          items: state.items.filter((i) => cartKey(i) !== key),
        })),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            cartKey(i) === key
              ? { ...i, quantity: Math.max(1, quantity) }
              : i,
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    { name: "abyss-cart" },
  ),
);

export const selectCount = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const selectSubtotal = (s: CartState) =>
  s.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
