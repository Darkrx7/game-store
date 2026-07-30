"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, GripVertical } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getIcon, ICON_MAP } from "@/components/icon-map";
import type { Category } from "@/lib/types";

export default function AdminCategories() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | "new" | null>(null);

  const load = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("تريد تحذف هذا القسم؟ المنتجات بداخله تبقى بدون قسم.")) return;
    await supabase.from("categories").delete().eq("id", id);
    load();
  };

  const move = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= categories.length) return;
    const a = categories[index], b = categories[target];
    await supabase.from("categories").update({ sort_order: b.sort_order }).eq("id", a.id);
    await supabase.from("categories").update({ sort_order: a.sort_order }).eq("id", b.id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="disp text-2xl font-black">الأقسام</h1>
        <button onClick={() => setEditing("new")}
          className="btn-glow flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold bg-brand-orange text-black">
          <Plus size={16} /> إضافة قسم
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
        {categories.map((c, i) => {
          const Icon = getIcon(c.icon);
          return (
            <div key={c.id} className="flex items-center gap-3 p-4 border-b border-brand-border last:border-0">
              <button onClick={() => move(i, -1)} className="text-neutral-600 hover:text-brand-orange"><GripVertical size={16} /></button>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-brand-orange/10">
                <Icon size={17} color="#ff7a1a" />
              </div>
              <p className="flex-1 font-bold text-sm">{c.name}</p>
              <button onClick={() => setEditing(c)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Pencil size={15} color="#ff9142" /></button>
              <button onClick={() => remove(c.id)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Trash2 size={15} color="#888" /></button>
            </div>
          );
        })}
        {categories.length === 0 && <p className="p-6 text-sm text-neutral-500 text-center">ماكو أقسام بعد.</p>}
      </div>

      {editing && (
        <CategoryForm
          category={editing === "new" ? null : editing}
          nextOrder={categories.length}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function CategoryForm({ category, nextOrder, onClose, onSaved }: any) {
  const supabase = createClient();
  const [name, setName] = useState(category?.name || "");
  const [icon, setIcon] = useState(category?.icon || "Gamepad2");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    if (category) {
      await supabase.from("categories").update({ name, icon }).eq("id", category.id);
    } else {
      await supabase.from("categories").insert({ name, icon, sort_order: nextOrder });
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="pop-in w-full max-w-sm rounded-3xl p-6 bg-brand-card border border-brand-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="disp text-lg font-black">{category ? "تعديل القسم" : "قسم جديد"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1f1f1f]"><X size={18} /></button>
        </div>
        <div className="flex flex-col gap-3">
          <label className="block">
            <span className="text-xs text-neutral-400 mb-1.5 block">اسم القسم</span>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-[#0f0f0f] border border-[#2a2a2a]" />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-400 mb-1.5 block">الأيقونة</span>
            <select value={icon} onChange={(e) => setIcon(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-[#0f0f0f] border border-[#2a2a2a]">
              {Object.keys(ICON_MAP).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </label>
          <button onClick={save} disabled={saving || !name}
            className="btn-glow w-full py-3 rounded-full font-bold disp mt-2 disabled:opacity-40 bg-brand-orange text-black">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}
