"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Flame } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";
import { isOfferActive, getEffectivePrice } from "@/lib/offers";
import type { Product, Category } from "@/lib/types";

export default function AdminProducts() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const load = async () => {
    const { data: p } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    const { data: c } = await supabase.from("categories").select("*").order("sort_order");
    setProducts(p || []);
    setCategories(c || []);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("تريد تحذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="disp text-2xl font-black">المنتجات</h1>
        <button onClick={() => setEditing("new")}
          className="btn-glow flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold bg-brand-orange text-black">
          <Plus size={16} /> إضافة منتج
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
        {products.map((p) => {
          const onOffer = isOfferActive(p);
          return (
            <div key={p.id} className="flex items-center gap-3 p-4 border-b border-brand-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate flex items-center gap-2">
                  {p.name}
                  {onOffer && (
                    <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ background: "linear-gradient(135deg,#ff3b30,#ff7a1a)" }}>
                      <Flame size={9} /> عرض نشط
                    </span>
                  )}
                </p>
                <p className="text-xs text-neutral-500">
                  {onOffer ? (
                    <>
                      <span style={{ color: "#ff3b30" }} className="font-bold">{getEffectivePrice(p).toLocaleString()} د.ع</span>
                      {" "}<span className="line-through">{p.price.toLocaleString()} د.ع</span>
                    </>
                  ) : (
                    <>{p.price.toLocaleString()} د.ع</>
                  )}
                  {" "}· الكمية: {p.quantity}
                </p>
              </div>
              <button onClick={() => setEditing(p)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Pencil size={15} color="#ff9142" /></button>
              <button onClick={() => remove(p.id)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Trash2 size={15} color="#888" /></button>
            </div>
          );
        })}
        {products.length === 0 && <p className="p-6 text-sm text-neutral-500 text-center">ماكو منتجات بعد.</p>}
      </div>

      {editing && (
        <ProductForm
          product={editing === "new" ? null : editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}
