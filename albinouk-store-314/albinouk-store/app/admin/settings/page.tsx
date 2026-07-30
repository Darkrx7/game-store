"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettings() {
  const supabase = createClient();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase.from("store_settings").select("*").single().then(({ data }) => setForm(data));
  }, []);

  if (!form) return <p className="text-sm text-neutral-500">جاري التحميل...</p>;

  const save = async () => {
    setSaving(true);
    await supabase.from("store_settings").update(form).eq("id", 1);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <h1 className="disp text-2xl font-black mb-6">إعدادات المتجر</h1>
      <div className="rounded-2xl p-5 flex flex-col gap-4 bg-brand-card border border-brand-border max-w-lg">
        <Field label="اسم المتجر" value={form.store_name} onChange={(v: string) => setForm({ ...form, store_name: v })} />
        <Field label="رقم واتساب الطلبات (بدون +)" value={form.whatsapp_number} onChange={(v: string) => setForm({ ...form, whatsapp_number: v })} />
        <Field label="العنوان" textarea value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} />
        <Field label="ساعات العمل" value={form.hours} onChange={(v: string) => setForm({ ...form, hours: v })} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="اللون الأساسي" type="color" value={form.primary_color} onChange={(v: string) => setForm({ ...form, primary_color: v })} />
          <Field label="اللون الثانوي" type="color" value={form.secondary_color} onChange={(v: string) => setForm({ ...form, secondary_color: v })} />
        </div>
        <button onClick={save} disabled={saving}
          className="btn-glow w-full py-3 rounded-full font-bold disp mt-2 bg-brand-orange text-black disabled:opacity-40">
          {saving ? "جاري الحفظ..." : saved ? "تم الحفظ ✓" : "حفظ الإعدادات"}
        </button>
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
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none bg-[#0f0f0f] border border-[#2a2a2a]" />
    </label>
  );
}
