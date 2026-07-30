"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Search, ShoppingCart, Heart, User } from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store-context";
import { createClient } from "@/lib/supabase/client";
import type { Product, StoreSettings } from "@/lib/types";

export default function Header({ settings }: { settings: StoreSettings | null }) {
  const { cartCount, wishlist } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setResults([]); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .ilike("name", `%${search}%`)
        .limit(5);
      setResults(data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(10,10,10,0.92)" : "rgba(10,10,10,0.7)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,122,26,0.15)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo size={38} />
          <span className="disp font-black text-lg hidden sm:block text-brand-orange">
            البنوك <span className="text-white">للألعاب</span>
          </span>
        </Link>

        <div className="flex-1 relative">
          <div className="flex items-center gap-2 rounded-full px-4 py-2 bg-brand-card border border-brand-border">
            <Search size={18} className="text-neutral-500" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              placeholder="دور على منتج..."
              className="bg-transparent outline-none w-full text-sm placeholder:text-neutral-500"
            />
          </div>
          {open && search.trim() && (
            <div className="absolute top-[calc(100%+8px)] right-0 left-0 rounded-2xl overflow-hidden z-50 pop-in bg-[#141414] border border-brand-border">
              {results.length === 0 ? (
                <div className="p-4 text-sm text-neutral-500 text-center">ما لكينا نتائج</div>
              ) : (
                results.map((p) => (
                  <Link key={p.id} href={`/product/${p.id}`} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 p-3 hover:bg-[#1f1f1f] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{p.name}</p>
                      <p className="text-xs text-brand-orange">{p.price.toLocaleString()} د.ع</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <IconBtn href="/wishlist" count={wishlist.length} icon={Heart} />
          <IconBtn href="/cart" count={cartCount} icon={ShoppingCart} accent />
          <IconBtn href="/account" icon={User} />
        </div>
      </div>
    </header>
  );
}

function IconBtn({ icon: Icon, count, href, accent }: any) {
  return (
    <Link href={href} className="relative p-2.5 rounded-full transition-colors hover:bg-[#1f1f1f]">
      <Icon size={20} color={accent ? "#ff7a1a" : "#f2ede6"} />
      {!!count && (
        <span className="absolute -top-0.5 -left-0.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center bg-brand-orange text-black">
          {count}
        </span>
      )}
    </Link>
  );
}
