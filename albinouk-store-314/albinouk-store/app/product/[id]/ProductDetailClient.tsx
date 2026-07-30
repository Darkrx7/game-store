"use client";

import { useState } from "react";
import { Heart, ShoppingCart, Star, Flame, Sparkles, Award, Clock, Tag } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import CountdownTimer from "@/components/CountdownTimer";
import { useStore } from "@/lib/store-context";
import { isOfferActive, getEffectivePrice, getDiscountPercent, getSavings } from "@/lib/offers";
import type { Product } from "@/lib/types";

export default function ProductDetailClient({ product, categoryIcon }: { product: Product; categoryIcon?: string }) {
  const { addToCart, toggleWish, isWished } = useStore();
  const [imgIdx, setImgIdx] = useState(0);
  const wished = isWished(product.id);
  const images = product.images?.length ? product.images : [null, null, null];

  const onOffer = isOfferActive(product);
  const price = getEffectivePrice(product);
  const discount = getDiscountPercent(product);
  const savings = getSavings(product);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div>
        <div className="relative rounded-2xl overflow-hidden mb-3 border border-brand-border">
          <ProductArt image={images[imgIdx] as string | null} iconName={categoryIcon} badge={!onOffer ? product.badge : null} className="w-full aspect-square" />
          {onOffer && discount && (
            <span className="offer-pulse absolute top-3 right-3 flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl text-white"
              style={{ background: "linear-gradient(135deg,#ff3b30,#ff7a1a)" }}>
              <Flame size={13} /> خصم {discount}%
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {images.map((img, i) => (
            <button key={i} onClick={() => setImgIdx(i)}
              className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
              style={{ border: i === imgIdx ? "2px solid #ff7a1a" : "1px solid #232323" }}>
              <ProductArt image={img as string | null} iconName={categoryIcon} className="w-full h-full" />
            </button>
          ))}
        </div>
      </div>

      <div>
        {/* شارات إضافية */}
        {(product.show_new || product.show_bestseller || product.show_limited) && (
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {product.show_new && <MiniBadge icon={Sparkles} label="جديد" color="#f2ede6" />}
            {product.show_bestseller && <MiniBadge icon={Award} label="الأكثر مبيعاً" color="#ffd447" />}
            {product.show_limited && <MiniBadge icon={Clock} label="لفترة محدودة" color="#ff7a1a" />}
          </div>
        )}

        <h1 className="disp text-2xl font-black mb-2">{product.name}</h1>
        <div className="flex items-center gap-1.5 mb-4">
          <Star size={14} fill="#ff9142" color="#ff9142" />
          <span className="text-sm text-neutral-400">{product.rating ?? 5} تقييم</span>
        </div>

        <div className="flex items-baseline gap-3 mb-1">
          <span className={`text-3xl font-black transition-colors ${onOffer ? "text-[#ff3b30]" : "text-brand-orange"}`}>
            {price.toLocaleString()} د.ع
          </span>
          {onOffer && <span className="text-sm text-neutral-600 line-through">{product.price.toLocaleString()} د.ع</span>}
        </div>

        {onOffer && savings > 0 && (
          <div className="flex items-center gap-1.5 mb-4 text-xs font-bold" style={{ color: "#4ade80" }}>
            <Tag size={13} /> توفر {savings.toLocaleString()} د.ع مع هذا العرض
          </div>
        )}

        {onOffer && <div className="mt-2"><CountdownTimer product={product} /></div>}

        <p className="text-sm text-neutral-400 leading-relaxed mb-5 mt-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-6 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ background: product.quantity > 0 ? "#4ade80" : "#ef4444" }} />
          {product.quantity > 0 ? <span>متوفر — {product.quantity} قطعة</span> : <span>غير متوفر حالياً</span>}
        </div>
        <div className="flex gap-3">
          <button onClick={() => addToCart(product)} disabled={!product.quantity}
            className="btn-glow flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-bold disp disabled:opacity-40 bg-brand-orange text-black">
            <ShoppingCart size={18} /> إضافة للسلة
          </button>
          <button onClick={() => toggleWish(product)}
            className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 bg-brand-card border border-brand-border">
            <Heart size={20} color={wished ? "#ff7a1a" : "#f2ede6"} fill={wished ? "#ff7a1a" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniBadge({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full text-black" style={{ background: color }}>
      <Icon size={11} /> {label}
    </span>
  );
}
