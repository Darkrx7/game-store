"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const STATUSES = [
  { value: "new", label: "جديدة", color: "#ff9142" },
  { value: "processing", label: "قيد التجهيز", color: "#3b82f6" },
  { value: "delivered", label: "تم التسليم", color: "#4ade80" },
];

export default function AdminOrders() {
  const supabase = createClient();
  const [orders, setOrders] = useState<any[]>([]);
  const [items, setItems] = useState<Record<string, any[]>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    setOrders(data || []);
  };
  useEffect(() => { load(); }, []);

  const toggleOpen = async (id: string) => {
    if (openId === id) { setOpenId(null); return; }
    setOpenId(id);
    if (!items[id]) {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", id);
      setItems((prev) => ({ ...prev, [id]: data || [] }));
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="disp text-2xl font-black mb-6">الطلبات</h1>
      <div className="flex flex-col gap-3">
        {orders.map((o) => {
          const s = STATUSES.find((x) => x.value === o.status) || STATUSES[0];
          return (
            <div key={o.id} className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
              <button onClick={() => toggleOpen(o.id)} className="w-full flex items-center gap-3 p-4 text-right">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{o.customer_name} — {o.customer_phone}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {o.total.toLocaleString()} د.ع · {new Date(o.created_at).toLocaleDateString("ar-IQ")}
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${s.color}22`, color: s.color }}>
                  {s.label}
                </span>
                <ChevronDown size={16} className={`transition-transform ${openId === o.id ? "rotate-180" : ""}`} />
              </button>

              {openId === o.id && (
                <div className="px-4 pb-4 pt-1 border-t border-brand-border">
                  {o.customer_address && <p className="text-xs text-neutral-400 mb-1">العنوان: {o.customer_address}</p>}
                  {o.notes && <p className="text-xs text-neutral-400 mb-3">ملاحظات: {o.notes}</p>}
                  <div className="flex flex-col gap-1.5 mb-4">
                    {(items[o.id] || []).map((it) => (
                      <div key={it.id} className="flex items-center justify-between text-xs text-neutral-400">
                        <span>{it.product_name} × {it.quantity}</span>
                        <span>{(it.price * it.quantity).toLocaleString()} د.ع</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {STATUSES.map((st) => (
                      <button key={st.value} onClick={() => updateStatus(o.id, st.value)}
                        className="flex-1 text-xs font-bold py-2 rounded-full border transition-colors"
                        style={{
                          background: o.status === st.value ? st.color : "transparent",
                          color: o.status === st.value ? "#0a0a0a" : st.color,
                          borderColor: st.color,
                        }}>
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {orders.length === 0 && <p className="text-sm text-neutral-500 text-center py-8">ماكو طلبات بعد.</p>}
      </div>
    </div>
  );
}
