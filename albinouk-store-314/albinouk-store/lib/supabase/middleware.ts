"use client";

import { useState } from "react";
import { X, Flame, Sparkles, Award, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Product, Category } from "@/lib/types";

interface ProductFormProps {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: ProductFormProps) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: product?.name || "",
    category_id: product?.category_id || categories[0]?.id || "",
    price: product?.price ? String(product.price) : "",
    quantity: product?.quantity ?? 0,
    description: product?.description || "",
    images: (product?.images || []).join(", "),
    // ---- نظام العروض ----
    offer_enabled: product?.offer_enabled || false,
    discount_percent: product?.discount_percent ? String(product.discount_percent) : "",
    offer_price: product?.offer_price ? String(product.offer_price) : "",
    offer_starts_at: product?.offer_starts_at ? product.offer_starts_at.slice(0, 16) : "",
    offer_ends_at: product?.offer_ends_at ? product.offer_ends_at.slice(0, 16) : "",
    show_new: product?.show_new || false,
    show_bestseller: product?.show_bestseller || false,
    show_limited: product?.show_limited || false,
    show_on_home: product?.show_on_home ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // يحسب السعر التخفيضي تلقائياً عند تغيير نسبة الخصم
  const setDiscount = (v: string) => {
    const pct = Number(v);
    const base = Number(form.price) || 0;
    const computed = v && base ? String(Math.round(base * (1 - pct / 100))) : "";
    setForm((prev) => ({
      ...prev,
      discount_percent: v,
      offer_price: computed,
    }));
  };

  // يحسب نسبة الخصم تلقائياً عند تغيير السعر بعد الخصم
  const setOfferPrice = (v: string) => {
    const base = Number(form.price) || 0;
    const offer = Number(v);
    const pct = v && base && base > offer ? String(Math.round(((base - offer) / base) * 100)) : "";
    setForm((prev) => ({
      ...prev,
      offer_price: v,
      discount_percent: pct,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");

    const imageArray = form.images
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      category_id: form.category_id,
      price: Number(form.price) || 0,
      quantity: Number(form.quantity) || 0,
      description: form.description,
      images: imageArray,
      offer_enabled: form.offer_enabled,
      discount_percent: form.discount_percent ? Number(form.discount_percent) : null,
      offer_price: form.offer_price ? Number(form.offer_price) : null,
      offer_starts_at: form.offer_starts_at ? new Date(form.offer_starts_at).toISOString() : null,
      offer_ends_at: form.offer_ends_at ? new Date(form.offer_ends_at).toISOString() : null,
      show_new: form.show_new,
      show_bestseller: form.show_bestseller,
      show_limited: form.show_limited,
      show_on_home: form.show_on_home,
    };

    try {
      if (product?.id) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("حدث خطأ أثناء حفظ المنتج");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto text-white dir-rtl">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6">
          {product ? "تعديل منتج" : "إضافة منتج جديد"}
        </h2>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">اسم المنتج</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">القسم</label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">السعر الأصلي (د.ع)</label>
              <input
                type="number"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">الكمية المتوفرة</label>
              <input
                type="number"
                required
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
              />
            </div>

            <div>
              <label className="block text-sm text-zinc-400 mb-1">روابط الصور (مفصولة بفارزة)</label>
              <input
                type="text"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
                placeholder="https://... , https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">الوصف</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
            />
          </div>

          {/* ---- قسم العروض ---- */}
          <div className="border-t border-zinc-800 pt-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold text-amber-400 flex items-center gap-2">
                <Flame className="w-5 h-5" /> قسم العروض والخصومات
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.offer_enabled}
                  onChange={(e) => setForm({ ...form, offer_enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {form.offer_enabled && (
              <div className="space-y-4 bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">نسبة الخصم (%)</label>
                    <input
                      type="number"
                      value={form.discount_percent}
                      onChange={(e) => setDiscount(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">السعر بعد الخصم (د.ع)</label>
                    <input
                      type="number"
                      value={form.offer_price}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">تاريخ بداية العرض</label>
                    <input
                      type="datetime-local"
                      value={form.offer_starts_at}
                      onChange={(e) => setForm({ ...form, offer_starts_at: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">تاريخ نهاية العرض</label>
                    <input
                      type="datetime-local"
                      value={form.offer_ends_at}
                      onChange={(e) => setForm({ ...form, offer_ends_at: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ---- الشارات المعالم ---- */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <label className="flex items-center gap-2 p-3 bg-zinc-800/40 border border-zinc-700/40 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_new}
                onChange={(e) => setForm({ ...form, show_new: e.target.checked })}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm">شارة "جديد"</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-zinc-800/40 border border-zinc-700/40 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_bestseller}
                onChange={(e) => setForm({ ...form, show_bestseller: e.target.checked })}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-sm">شارة "الأكثر مبيعاً"</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-zinc-800/40 border border-zinc-700/40 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={form.show_on_home}
                onChange={(e) => setForm({ ...form, show_on_home: e.target.checked })}
                className="rounded border-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <Home className="w-4 h-4 text-green-400" />
              <span className="text-sm">عرض في الصفحة الرئيسية</span>
            </label>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition text-sm font-medium"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition text-sm font-medium disabled:opacity-50"
            >
              {saving ? "جاري الحفظ..." : product ? "حفظ التعديلات" : "إضافة المنتج"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
