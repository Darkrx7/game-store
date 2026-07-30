"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Flame, Pencil, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";
import { isOfferActive, getEffectivePrice, getDiscountPercent } from "@/lib/offers";
import type { Product, Category } from "@/lib/types";

type FilterMode = "all" | "active" | "scheduled" | "expired" | "off";

export default function AdminOffers() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [editing, setEditing] = useState<Product | null>(null);

  const load = async () => {
    const { data: p } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    const { data: c } = await supabase.from("categories").select("*").order("sort_order");
    setProducts(p || []);
    setCategories(c || []);
  };
  useEffect(() => { load(); }, []);

  const statusOf = (p: Product): FilterMode => {
    if (!p.offer_enabled) return "off";
    if (isOfferActive(p)) return "active";
    const now = Date.now();
    if (p.offer_starts_at && now < new Date(p.offer_starts_at).getTime()) return "scheduled";
    if (p.offer_ends_at && now > new Date(p.offer_ends_at).getTime()) return "expired";
    return "off";
  };

  const filtered = useMemo(() => {
    return products
      .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => filter === "all" || statusOf(p) === filter);
  }, [products, search, filter]);

  const toggleOffer = async (p: Product) => {
    await supabase.from("products").update({ offer_enabled: !p.offer_enabled }).eq("id", p.id);
    load();
  };

  const removeOffer = async (p: Product) => {
    if (!confirm("تريد تحذف العرض من هذا المنتج؟ (المنتج نفسه يبقى، بس يرجع لسعره الأصلي)")) return;
    await supabase.from("products").update({
      offer_enabled: false, discount_percent: null, offer_price: null, offer_starts_at: null, offer_ends_at: null,
    }).eq("id", p.id);
    load();
  };

  const stats = {
    active: products.filter((p) => statusOf(p) === "active").length,
    scheduled: products.filter((p) => statusOf(p) === "scheduled").length,
    expired: products.filter((p) => statusOf(p) === "expired").length,
  };

  const FILTERS: { id: FilterMode; label: string }[] = [
    { id: "all", label: "الكل" },
    { id: "active", label: "نشطة" },
    { id: "scheduled", label: "مجدولة" },
    { id: "expired", label: "منتهية" },
    { id: "off", label: "متوقفة" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="disp text-2xl font-black flex items-center gap-2">
          <Flame size={22} color="#ff7a1a" /> إدارة العروض
        </h1>
      </div>
      <p className="text-xs text-neutral-500 mb-6">
        العروض تُدار من نموذج المنتج (زر تعديل) — من هنا تراقب كل العروض وتشغّل/توقف وتحذف بضغطة وحدة.
      </p>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard label="عروض نشطة" value={stats.active} color="#4ade80" icon={CheckCircle2} />
        <StatCard label="مجدولة" value={stats.scheduled} color="#3b82f6" icon={Clock} />
        <StatCard label="منتهية" value={stats.expired} color="#77758a" icon={XCircle} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 rounded-full px-4 py-2.5 bg-brand-card border border-brand-border">
          <Search size={16} className="text-neutral-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="دور عن منتج ضمن العروض..."
            className="bg-transparent outline-none w-full text-sm" />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-colors"
            style={{
              background: filter === f.id ? "linear-gradient(135deg,#ff3b30,#ff7a1a)" : "#141414",
              color: filter === f.id ? "#fff" : "#8a889c",
              border: "1px solid " + (filter === f.id ? "transparent" : "#232323"),
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
        {filtered.map((p) => {
          const status = statusOf(p);
          const discount = getDiscountPercent(p);
          return (
            <div key={p.id} className="flex items-center gap-3 p-4 border-b border-brand-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <StatusPill status={status} />
                  {status === "active" && discount && (
                    <span className="text-[11px] font-black" style={{ color: "#ff3b30" }}>-{discount}%</span>
                  )}
                  {status === "active" && (
                    <span className="text-[11px] text-neutral-500">{getEffectivePrice(p).toLocaleString()} د.ع</span>
                  )}
                </div>
              </div>
              <ToggleBtn checked={p.offer_enabled} onClick={() => toggleOffer(p)} />
              <button onClick={() => setEditing(p)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Pencil size={15} color="#ff9142" /></button>
              <button onClick={() => removeOffer(p)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Trash2 size={15} color="#888" /></button>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="p-6 text-sm text-neutral-500 text-center">ماكو نتائج تطابق البحث/الفلتر.</p>}
      </div>

      {editing && (
        <ProductForm product={editing} categories={categories} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }: any) {
  return (
    <div className="rounded-2xl p-4 bg-brand-card border border-brand-border">
      <Icon size={18} color={color} className="mb-2" />
      <p className="text-xl font-black">{value}</p>
      <p className="text-[11px] text-neutral-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusPill({ status }: { status: FilterMode }) {
  const map: Record<FilterMode, { label: string; color: string }> = {
    active: { label: "نشط", color: "#4ade80" },
    scheduled: { label: "مجدول", color: "#3b82f6" },
    expired: { label: "منتهي", color: "#77758a" },
    off: { label: "متوقف", color: "#555" },
    all: { label: "", color: "#555" },
  };
  const s = map[status];
  return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${s.color}22`, color: s.color }}>{s.label}</span>;
}

function ToggleBtn({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="relative w-10 h-5.5 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#ff7a1a" : "#333", width: 40, height: 22 }}>
      <span className="absolute top-0.5 w-4.5 h-4.5 rounded-full bg-white transition-all" style={{ width: 18, height: 18, right: checked ? 20 : 2 }} />
    </button>
  );
}
