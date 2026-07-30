"use client";

import { useState, useMemo } from "react";
import { X, Flame, Sparkles, Award, Clock, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/lib/types";

export default function ProductForm({
  product, categories, onClose, onSaved,
}: { product: Product | null; categories: Category[]; onClose: () => void; onSaved: () => void }) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || categories[0]?.id || "",
    price: product?.price || "",
    quantity: product?.quantity ?? 0,
    description: product?.description || "",
    images: (product?.images || []).join(", "),
    // ---- نظام العروض ----
    offer_enabled: product?.offer_enabled || false,
    discount_percent: product?.discount_percent ?? "",
    offer_price: product?.offer_price ?? "",
    offer_starts_at: product?.offer_starts_at ? product.offer_starts_at.slice(0, 16) : "",
    offer_ends_at: product?.offer_ends_at ? product.offer_ends_at.slice(0, 16) : "",
    show_new: product?.show_new || false,
    show_bestseller: product?.show_bestseller || false,
    show_limited: product?.show_limited || false,
    show_on_home: product?.show_on_home ?? true,
  });
  const [saving, setSaving] = useState(false);

  // يحسب السعر الجديد تلقائياً بمجرد إدخال نسبة الخصم
  const setDiscount = (v: string) => {
    const pct = Number(v);
    const base = Number(form.price) || 0;
    const computed = v && base ? Math.round(base * (1 - pct / 100)) : "";
    setForm({ ...form, discount_percent: v, offer_price: computed as any });
  };
  const setOfferPrice = (v: string) => {
    const base = Number(form.price) || 0;
    const op = Number(v);
    const pct = v && base ? Math.round(((base - op) / base) * 100) : "";
    setForm({ ...form, offer_price: v, discount_percent: pct as any });
  };

  const finalPrice = useMemo(() => {
    if (!form.offer_enabled) return Number(form.price) || 0;
    return form.offer_price ? Number(form.offer_price) : Number(form.price) || 0;
  }, [form.offer_enabled, form.offer_price, form.price]);

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      category_id: form.category_id || null,
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      offer_enabled: form.offer_enabled,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      offer_starts_at: form.offer_starts_at || null,
      offer_ends_at: form.offer_ends_at || null,
      show_new: form.show_new,
      show_bestseller: form.show_bestseller,
      show_limited: form.show_limited,
      show_on_home: form.show_on_home,
    };

    if (product) {
      await supabase.from("products").update(payload).eq("id", product.id);
    } else {
      await supabase.from("products").insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="pop-in w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto bg-brand-card border border-brand-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="disp text-lg font-black">{product ? "تعديل منتج" : "منتج جديد"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1f1f1f]"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3">
          <Field label="اسم المنتج" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
          <label className="block">
            <span className="text-xs text-neutral-400 mb-1.5 block">القسم</span>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-[#0f0f0f] border border-[#2a2a2a]">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="السعر الأصلي (د.ع)" type="number" value={form.price} onChange={(v: string) => setForm({ ...form, price: v })} />
            <Field label="الكمية المتوفرة" type="number" value={form.quantity} onChange={(v: string) => setForm({ ...form, quantity: v })} />
          </div>
          <Field label="الوصف" textarea value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />
          <Field label="روابط الصور (افصل بفاصلة)" textarea value={form.images} onChange={(v: string) => setForm({ ...form, images: v })} />

          {/* ============== نظام العروض ============== */}
          <div className="rounded-2xl p-4 mt-2" style={{ background: "linear-gradient(135deg,#1a0f0a,#141414)", border: "1px solid #ff7a1a33" }}>
            <label className="flex items-center justify-between cursor-pointer mb-1">
              <span className="flex items-center gap-2 text-sm font-black" style={{ color: "#ff7a1a" }}>
                <Flame size={16} /> تفعيل العرض
              </span>
              <Toggle checked={form.offer_enabled} onChange={(v) => setForm({ ...form, offer_enabled: v })} />
            </label>

            {form.offer_enabled && (
              <div className="flex flex-col gap-3 mt-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="نسبة الخصم (%)" type="number" value={form.discount_percent} onChange={setDiscount} />
                  <Field label="السعر أثناء العرض" type="number" value={form.offer_price} onChange={setOfferPrice} />
                </div>
                <div className="flex items-center justify-between rounded-xl px-4 py-2.5 text-sm" style={{ background: "#0f0f0f" }}>
                  <span className="text-neutral-400">السعر الجديد للزبون</span>
                  <span className="font-black" style={{ color: "#ff3b30" }}>{finalPrice.toLocaleString()} د.ع</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="تاريخ بداية العرض" type="datetime-local" value={form.offer_starts_at} onChange={(v: string) => setForm({ ...form, offer_starts_at: v })} />
                  <Field label="تاريخ انتهاء العرض" type="datetime-local" value={form.offer_ends_at} onChange={(v: string) => setForm({ ...form, offer_ends_at: v })} />
                </div>
                <p className="text-[11px] text-neutral-500">لو تركت التواريخ فاضية، العرض يضل شغال لين توقفه يدوياً.</p>
              </div>
            )}
          </div>

          {/* ============== الشارات ============== */}
          <div className="rounded-2xl p-4" style={{ background: "#0f0f0f", border: "1px solid #232323" }}>
            <p className="text-xs font-bold text-neutral-400 mb-3">الشارات والعرض بالرئيسية</p>
            <div className="flex flex-col gap-2.5">
              <CheckRow icon={Sparkles} label="جديد" checked={form.show_new} onChange={(v) => setForm({ ...form, show_new: v })} />
              <CheckRow icon={Award} label="الأكثر مبيعاً" checked={form.show_bestseller} onChange={(v) => setForm({ ...form, show_bestseller: v })} />
              <CheckRow icon={Clock} label="لفترة محدودة" checked={form.show_limited} onChange={(v) => setForm({ ...form, show_limited: v })} />
              <CheckRow icon={Home} label="إظهار بالصفحة الرئيسية" checked={form.show_on_home} onChange={(v) => setForm({ ...form, show_on_home: v })} />
            </div>
          </div>

          <button onClick={save} disabled={saving || !form.name || !form.price}
            className="btn-glow w-full py-3 rounded-full font-bold disp mt-2 disabled:opacity-40 bg-brand-orange text-black">
            {saving ? "جاري الحفظ..." : "حفظ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="relative w-11 h-6 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#ff7a1a" : "#333" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
        style={{ right: checked ? 22 : 2 }} />
    </button>
  );
}

function CheckRow({ icon: Icon, label, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="flex items-center gap-2 text-sm">
        <Icon size={14} color="#ff9142" /> {label}
      </span>
      <Toggle checked={checked} onChange={onChange} />
    </label>
  );
}

function Field({ label, value, onChange, type = "text", textarea }: any) {
  const Comp: any = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-xs text-neutral-400 mb-1.5 block">{label}</span>
      <Comp type={type} value={value} onChange={(e: any) => onChange(e.target.value)} rows={textarea ? 2 : undefined}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 bg-[#0f0f0f] border border-[#2a2a2a]" />
    </label>
  );
}
