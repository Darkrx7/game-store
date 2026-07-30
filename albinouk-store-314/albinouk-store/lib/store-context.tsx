"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { CartItem, Product } from "@/lib/types";
import { getEffectivePrice } from "@/lib/offers";

type StoreCtx = {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (p: Product) => void;
  updateQty: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  toggleWish: (p: Product) => void;
  isWished: (id: string) => boolean;
  cartTotal: number;
  cartCount: number;
};

const Ctx = createContext<StoreCtx | null>(null);

const CART_KEY = "albinouk_cart";
const WISH_KEY = "albinouk_wishlist";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // نخزن السلة والمفضلة محلياً (localStorage) — تجربة زائر بدون تسجيل دخول إجباري
  useEffect(() => {
    try {
      const c = localStorage.getItem(CART_KEY);
      const w = localStorage.getItem(WISH_KEY);
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  const addToCart = (p: Product) => {
    const unitPrice = getEffectivePrice(p);
    setCart((c) => {
      const found = c.find((i) => i.id === p.id);
      if (found) return c.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i));
      return [...c, { ...p, qty: 1, unitPrice }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((c) =>
      c.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
    );
  };

  const removeFromCart = (id: string) => setCart((c) => c.filter((i) => i.id !== id));
  const clearCart = () => setCart([]);

  const toggleWish = (p: Product) => {
    setWishlist((w) => (w.find((i) => i.id === p.id) ? w.filter((i) => i.id !== p.id) : [...w, p]));
  };

  const isWished = (id: string) => !!wishlist.find((i) => i.id === id);

  const cartTotal = cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider
      value={{ cart, wishlist, addToCart, updateQty, removeFromCart, clearCart, toggleWish, isWished, cartTotal, cartCount }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore يجب أن يُستخدم داخل StoreProvider");
  return ctx;
}
