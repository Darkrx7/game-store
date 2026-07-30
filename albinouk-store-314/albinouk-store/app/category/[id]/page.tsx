import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import CategoryFilter from "./CategoryFilter";

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: category } = await supabase.from("categories").select("*").eq("id", params.id).single();
  const { data: products } = await supabase.from("products").select("*").eq("category_id", params.id);

  if (!category) {
    return <main className="max-w-6xl mx-auto px-4 py-20 text-center">ماكو هذا القسم</main>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-4">
        <Link href="/categories" className="hover:text-brand-orange transition-colors">الأقسام</Link>
        <ChevronLeft size={12} />
        <span className="text-brand-orange">{category.name}</span>
      </div>
      <h1 className="disp text-2xl font-black mb-6">{category.name}</h1>
      <CategoryFilter products={products || []} />
    </main>
  );
}
