import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase.from("products").select("*").eq("id", params.id).single();

  if (!product) {
    return <main className="max-w-6xl mx-auto px-4 py-20 text-center">ماكو هذا المنتج</main>;
  }

  const { data: category } = product.category_id
    ? await supabase.from("categories").select("*").eq("id", product.category_id).single()
    : { data: null };

  return (
    <main className="max-w-6xl mx-auto px-4 py-10 fade-up">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4 flex-wrap">
        <Link href="/categories" className="hover:text-brand-orange transition-colors">الأقسام</Link>
        {category && (
          <>
            <ChevronLeft size={12} />
            <Link href={`/category/${category.id}`} className="hover:text-brand-orange transition-colors">{category.name}</Link>
          </>
        )}
        <ChevronLeft size={12} />
        <span className="text-brand-orange">{product.name}</span>
      </div>
      <ProductDetailClient product={product} categoryIcon={category?.icon} />
    </main>
  );
}
