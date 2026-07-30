"use client";

import { useState } from "react";
import { Filter } from "lucide-react";
import { ProductGrid } from "@/components/ProductCard";
import { getEffectivePrice } from "@/lib/offers";
import type { Product } from "@/lib/types";

export default function CategoryFilter({ products }: { products: Product[] }) {
  const maxPrice = Math.max(...products.map((p) => getEffectivePrice(p)), 100000);
  const [max, setMax] = useState(maxPrice);
  const filtered = products.filter((p) => getEffectivePrice(p) <= max);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <aside className="md:w-56 shrink-0">
        <div className="rounded-2xl p-4 bg-brand-card border border-brand-border">
          <div className="flex items-center gap-2 mb-3 text-sm font-bold">
            <Filter size={15} color="#ff7a1a" /> فلتر السعر
          </div>
          <input type="range" min={0} max={maxPrice} value={max}
            onChange={(e) => setMax(+e.target.value)} className="w-full accent-orange-500" />
          <p className="text-xs text-neutral-400 mt-2">لغاية {max.toLocaleString()} د.ع</p>
        </div>
      </aside>
      <div className="flex-1">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
}
