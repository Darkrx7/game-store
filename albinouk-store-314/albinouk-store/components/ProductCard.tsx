"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star, Flame, Clock, Sparkles, Award } from "lucide-react";
import ProductArt from "./ProductArt";
import { useStore } from "@/lib/store-context";
import { isOfferActive, getEffectivePrice, getDiscountPercent } from "@/lib/offers";
import type { Product } from "@/lib/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) return <p className="text-sm text-neutral-500">ماكو منتجات هسه.</p>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
    </div>
  );
}

export function ProductCard({ p, i = 0 }: { p: Product; i?: number }) {
  const { addToCart, toggleWish, isWished } = useStore();
  const wished = isWished(p.id);
  const onOffer = isOfferActive(p);
  const price = getEffectivePrice(p);
  const discount = getDiscountPercent(p);

  return (
    <Link
      href={`/product/${p.id}`}
      className="fade-up card-hover rounded-2xl overflow-hidden flex flex-col bg-brand-card border border-brand-border relative"
      style={{ animationDelay: `${i * 70}ms` }}
    >
      <div className="relative">
        <ProductArt image={p.images?.[0]} badge={!onOffer ? p.badge : null} className="w-full aspect-square" />

        {/* شارات العروض الفخمة — أعلى يمين */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 items-end">
          {onOffer && discount && (
            <span className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg text-white shadow-lg"
              style={{ background: "linear-gradient(135deg,#ff3b30,#ff7a1a)" }}>
              <Flame size={10} /> {discount}%-
            </span>
          )}
          {p.show_limited && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-black bg-brand-orange shadow">
              <Clock size={9} /> لفترة محدودة
            </span>
          )}
          {p.show_new && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-black bg-white shadow">
              <Sparkles size={9} /> جديد
            </span>
          )}
          {p.show_bestseller && (
            <span className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full text-black shadow" style={{ background: "#ffd447" }}>
              <Award size={9} /> الأكثر مبيعاً
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); toggleWish(p); }}
          className="absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/60 transition-transform hover:scale-110"
        >
          <Heart size={15} color={wished ? "#ff7a1a" : "#f2ede6"} fill={wished ? "#ff7a1a" : "none"} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-xs font-bold leading-snug line-clamp-2 min-h-[2.2em]">{p.name}</p>
        <div className="flex items-center gap-1">
          <Star size={11} fill="#ff9142" color="#ff9142" />
          <span className="text-[10px] text-neutral-500">{p.rating ?? 5}</span>
        </div>
        <div className="flex items-baseline gap-2 mt-auto">
          <span className={`text-sm font-black transition-colors ${onOffer ? "text-[#ff3b30]" : "text-brand-orange"}`}>
            {price.toLocaleString()} د.ع
          </span>
          {onOffer && (
            <span className="text-[10px] text-neutral-600 line-through">{p.price.toLocaleString()} د.ع</span>
          )}
        </div>
        <button
          onClick={(e) => { e.preventDefault(); addToCart(p); }}
          className="btn-glow mt-1 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-brand-orange border border-brand-orange/20 bg-[#1f1f1f]"
        >
          <ShoppingCart size={13} /> إضافة للسلة
        </button>
      </div>
    </Link>
  );
}
