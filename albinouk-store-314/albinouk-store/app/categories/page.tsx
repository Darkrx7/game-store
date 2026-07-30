import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getIcon } from "@/components/icon-map";

export default async function CategoriesPage() {
  const supabase = createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("sort_order");
  const { data: products } = await supabase.from("products").select("id, category_id");

  const countFor = (catId: string) => (products || []).filter((p) => p.category_id === catId).length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="disp text-2xl font-black mb-6">كل الأقسام</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {(categories || []).map((c, i) => {
          const Icon = getIcon(c.icon);
          return (
            <Link key={c.id} href={`/category/${c.id}`}
              className="fade-up card-hover rounded-2xl p-6 flex flex-col items-center gap-3 text-center bg-brand-card border border-brand-border"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-brand-orange/10">
                <Icon size={28} color="#ff7a1a" />
              </div>
              <div>
                <p className="font-black disp">{c.name}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{countFor(c.id)} منتج</p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
