"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, X, Calendar, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Campaign, Product } from "@/lib/types";

const PRESETS = [
  { name: "عروض رمضان", emoji: "🌙", color: "#7C3AED" },
  { name: "عروض عيد الفطر", emoji: "🎉", color: "#FF2D78" },
  { name: "عروض عيد الأضحى", emoji: "🐑", color: "#22C55E" },
  { name: "العودة إلى المدارس", emoji: "📚", color: "#3B82F6" },
  { name: "الجمعة البيضاء", emoji: "🛍️", color: "#F5F5F5" },
  { name: "الجمعة السوداء", emoji: "⚫", color: "#1a1a1a" },
  { name: "رأس السنة", emoji: "🎄", color: "#EF4444" },
  { name: "عروض الصيف", emoji: "☀️", color: "#F59E0B" },
  { name: "عروض الشتاء", emoji: "❄️", color: "#0EA5E9" },
];

export default function AdminCampaigns() {
  const supabase = createClient();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Campaign | "new" | null>(null);

  const load = async () => {
    const { data: c } = await supabase.from("campaigns").select("*").order("starts_at", { ascending: false });
    const { data: p } = await supabase.from("products").select("*");
    setCampaigns(c || []);
    setProducts(p || []);
  };
  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("تريد تحذف هذي الحملة؟")) return;
    await supabase.from("campaigns").delete().eq("id", id);
    load();
  };

  const isActiveNow = (c: Campaign) => {
    const now = Date.now();
    return c.active && now >= new Date(c.starts_at).getTime() && now <= new Date(c.ends_at).getTime();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="disp text-2xl font-black">الحملات الموسمية</h1>
        <button onClick={() => setEditing("new")}
          className="btn-glow flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold bg-brand-orange text-black">
          <Plus size={16} /> حملة جديدة
        </button>
      </div>
      <p className="text-xs text-neutral-500 mb-6">الحملة النشطة تظهر تلقائياً بأعلى الصفحة الرئيسية بانر كبير مع منتجاتها.</p>

      <div className="flex flex-col gap-3">
        {campaigns.map((c) => {
          const active = isActiveNow(c);
          return (
            <div key={c.id} className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
              <div className="h-2" style={{ background: c.color }} />
              <div className="flex items-center gap-3 p-4">
                <span className="text-2xl">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm flex items-center gap-2">
                    {c.name}
                    {active && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-black" style={{ background: "#4ade80" }}>نشطة الآن</span>
                    )}
                    {!c.active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-neutral-400 bg-[#232323]">موقوفة</span>}
                  </p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-1">
                    <Calendar size={11} /> {new Date(c.starts_at).toLocaleDateString("ar-IQ")} — {new Date(c.ends_at).toLocaleDateString("ar-IQ")}
                  </p>
                </div>
                <button onClick={() => setEditing(c)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Pencil size={15} color="#ff9142" /></button>
                <button onClick={() => remove(c.id)} className="p-2 rounded-full hover:bg-[#1f1f1f]"><Trash2 size={15} color="#888" /></button>
              </div>
            </div>
          );
        })}
        {campaigns.length === 0 && <p className="p-6 text-sm text-neutral-500 text-center bg-brand-card rounded-2xl border border-brand-border">ماكو حملات بعد — أنشئ وحدة جديدة.</p>}
      </div>

      {editing && (
        <CampaignForm
          campaign={editing === "new" ? null : editing}
          products={products}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function CampaignForm({ campaign, products, onClose, onSaved }: any) {
  const supabase = createClient();
  const [form, setForm] = useState({
    name: campaign?.name || "",
    emoji: campaign?.emoji || "🛍️",
    color: campaign?.color || "#ff7a1a",
    banner_url: campaign?.banner_url || "",
    description: campaign?.description || "",
    starts_at: campaign?.starts_at ? campaign.starts_at.slice(0, 16) : "",
    ends_at: campaign?.ends_at ? campaign.ends_at.slice(0, 16) : "",
    active: campaign?.active ?? true,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    supabase.from("campaign_products").select("product_id").eq("campaign_id", campaign.id)
      .then(({ data }) => setSelectedProducts((data || []).map((d) => d.product_id)));
  }, [campaign]);

  const toggleProduct = (id: string) => {
    setSelectedProducts((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setForm({ ...form, name: preset.name, emoji: preset.emoji, color: preset.color });
  };

  const save = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      emoji: form.emoji,
      color: form.color,
      banner_url: form.banner_url || null,
      description: form.description || null,
      starts_at: form.starts_at,
      ends_at: form.ends_at,
      active: form.active,
    };

    let campaignId = campaign?.id;
    if (campaign) {
      await supabase.from("campaigns").update(payload).eq("id", campaign.id);
    } else {
      const { data } = await supabase.from("campaigns").insert(payload).select().single();
      campaignId = data?.id;
    }

    if (campaignId) {
      await supabase.from("campaign_products").delete().eq("campaign_id", campaignId);
      if (selectedProducts.length) {
        await supabase.from("campaign_products").insert(
          selectedProducts.map((product_id) => ({ campaign_id: campaignId, product_id }))
        );
      }
    }

    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="pop-in w-full max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto bg-brand-card border border-brand-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="disp text-lg font-black">{campaign ? "تعديل الحملة" : "حملة جديدة"}</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1f1f1f]"><X size={18} /></button>
        </div>

        {!campaign && (
          <div className="mb-4">
            <p className="text-xs text-neutral-400 mb-2">اختصارات جاهزة</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  className="text-xs px-3 py-1.5 rounded-full bg-[#0f0f0f] border border-[#2a2a2a] hover:border-brand-orange transition-colors">
                  {p.emoji} {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[1fr,80px] gap-3">
            <Field label="اسم الحملة" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
            <Field label="إيموجي" value={form.emoji} onChange={(v: string) => setForm({ ...form, emoji: v })} />
          </div>
          <label className="block">
            <span className="text-xs text-neutral-400 mb-1.5 block">لون الحملة</span>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
              className="w-full h-11 rounded-xl bg-[#0f0f0f] border border-[#2a2a2a] cursor-pointer" />
          </label>
          <Field label="رابط صورة البانر (اختياري)" value={form.banner_url} onChange={(v: string) => setForm({ ...form, banner_url: v })} />
          <Field label="الوصف" textarea value={form.description} onChange={(v: string) => setForm({ ...form, description: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="تاريخ البداية" type="datetime-local" value={form.starts_at} onChange={(v: string) => setForm({ ...form, starts_at: v })} />
            <Field label="تاريخ النهاية" type="datetime-local" value={form.ends_at} onChange={(v: string) => setForm({ ...form, ends_at: v })} />
          </div>

          <label className="flex items-center justify-between cursor-pointer rounded-xl px-4 py-2.5" style={{ background: "#0f0f0f" }}>
            <span className="text-sm font-bold">الحملة مفعّلة</span>
            <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
              className="relative rounded-full transition-colors" style={{ width: 40, height: 22, background: form.active ? "#ff7a1a" : "#333" }}>
              <span className="absolute top-0.5 rounded-full bg-white transition-all" style={{ width: 18, height: 18, right: form.active ? 20 : 2 }} />
            </button>
          </label>

          <div>
            <p className="text-xs text-neutral-400 mb-2">المنتجات المشاركة بالحملة ({selectedProducts.length})</p>
            <div className="rounded-xl max-h-52 overflow-y-auto" style={{ background: "#0f0f0f", border: "1px solid #2a2a2a" }}>
              {products.map((p: Product) => (
                <button key={p.id} onClick={() => toggleProduct(p.id)}
                  className="w-full flex items-center gap-3 p-2.5 border-b last:border-0 text-right hover:bg-[#1a1a1a]" style={{ borderColor: "#232323" }}>
                  <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                    style={{ background: selectedProducts.includes(p.id) ? "#ff7a1a" : "transparent", border: "1px solid #ff7a1a" }}>
                    {selectedProducts.includes(p.id) && <Check size={13} color="#0a0a0a" />}
                  </span>
                  <span className="text-xs flex-1 truncate">{p.name}</span>
                  <span className="text-[11px] text-neutral-500">{p.price.toLocaleString()} د.ع</span>
                </button>
              ))}
              {products.length === 0 && <p className="p-4 text-xs text-neutral-500 text-center">ماكو منتجات بعد.</p>}
            </div>
          </div>

          <button onClick={save} disabled={saving || !form.name || !form.starts_at || !form.ends_at}
            className="btn-glow w-full py-3 rounded-full font-bold disp mt-2 disabled:opacity-40 bg-brand-orange text-black">
            {saving ? "جاري الحفظ..." : "حفظ الحملة"}
          </button>
        </div>
      </div>
    </div>
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
