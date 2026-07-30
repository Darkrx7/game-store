"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/ProductCard";
import { useStore } from "@/lib/store-context";

export default function WishlistPage() {
  const { wishlist } = useStore();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="disp text-2xl font-black mb-6">المفضلة</h1>
      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-brand-card border border-brand-border">
            <Heart size={26} color="#555" />
          </div>
          <p className="text-sm text-neutral-500 mb-5">ماكو منتجات مفضلة هسه</p>
          <Link href="/categories" className="btn-glow px-6 py-2.5 rounded-full font-bold text-sm disp bg-brand-orange text-black">
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <ProductGrid products={wishlist} />
      )}
    </main>
  );
}
