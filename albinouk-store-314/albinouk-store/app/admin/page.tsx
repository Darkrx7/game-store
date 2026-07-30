import { createClient } from "@/lib/supabase/server";
import { Package, ClipboardList, LayoutGrid } from "lucide-react";

export default async function AdminHome() {
  const supabase = createClient();
  const [{ count: productCount }, { count: orderCount }, { count: catCount }, { count: newOrders }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const stats = [
    { label: "المنتجات", value: productCount ?? 0, icon: Package },
    { label: "الأقسام", value: catCount ?? 0, icon: LayoutGrid },
    { label: "كل الطلبات", value: orderCount ?? 0, icon: ClipboardList },
    { label: "طلبات جديدة", value: newOrders ?? 0, icon: ClipboardList, accent: true },
  ];

  return (
    <div>
      <h1 className="disp text-2xl font-black mb-6">لوحة التحكم</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl p-5 bg-brand-card border border-brand-border">
            <s.icon size={20} color={s.accent ? "#ff3b30" : "#ff7a1a"} className="mb-3" />
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-neutral-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
