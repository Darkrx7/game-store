"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingCart, X, MessageCircle } from "lucide-react";
import ProductArt from "@/components/ProductArt";
import { useStore } from "@/lib/store-context";
import { createClient } from "@/lib/supabase/client";
import { buildOrderMessage, whatsappLink } from "@/lib/whatsapp";

const WHATSAPP_NUMBER = "9647735687607"; // يتحدث تلقائياً من store_settings عند الربط الكامل

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal, clearCart } = useStore();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="disp text-2xl font-black mb-6">سلة التسوق</h1>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-brand-card border border-brand-border">
            <ShoppingCart size={26} color="#555" />
          </div>
          <p className="text-sm text-neutral-500 mb-5">سلتك فاضية هسه</p>
          <Link href="/categories" className="btn-glow px-6 py-2.5 rounded-full font-bold text-sm disp bg-brand-orange text-black">
            تسوق الآن
          </Link>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 mb-6">
            {cart.map((item, i) => (
              <div key={item.id} className="fade-up flex items-center gap-3 p-3 rounded-2xl bg-brand-card border border-brand-border"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <ProductArt image={item.images?.[0]} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <p className={`text-xs font-black ${item.unitPrice < item.price ? "text-[#ff3b30]" : "text-brand-orange"}`}>
                      {item.unitPrice.toLocaleString()} د.ع
                    </p>
                    {item.unitPrice < item.price && (
                      <p className="text-[10px] text-neutral-600 line-through">{item.price.toLocaleString()} د.ع</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-full p-1 bg-[#1f1f1f]">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2a2a2a]">
                    <Minus size={12} />
                  </button>
                  <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#2a2a2a]">
                    <Plus size={12} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-full hover:bg-[#1f1f1f]">
                  <Trash2 size={16} color="#888" />
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-5 bg-brand-card border border-brand-border">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-neutral-400">المجموع الكلي</span>
              <span className="text-xl font-black text-brand-orange">{cartTotal.toLocaleString()} د.ع</span>
            </div>
            <button onClick={() => setCheckoutOpen(true)}
              className="btn-glow w-full py-3.5 rounded-full font-bold disp bg-brand-orange text-black">
              إتمام الطلب
            </button>
          </div>
        </>
      )}

      {checkoutOpen && (
        <CheckoutModal
          onClose={() => setCheckoutOpen(false)}
          onSent={() => { setCheckoutOpen(false); clearCart(); }}
          cart={cart}
          total={cartTotal}
        />
      )}
    </main>
  );
}

function CheckoutModal({ cart, total, onClose, onSent }: any) {
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [sending, setSending] = useState(false);
  const canSend = form.name.trim() && form.phone.trim() && !sending;

  const send = async () => {
    setSending(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      // نحفظ الطلب بقاعدة البيانات عشان يظهر بلوحة الإدارة
      const { data: order } = await supabase.from("orders").insert({
        user_id: user?.id ?? null,
        customer_name: form.name,
        customer_phone: form.phone,
        customer_address: form.address || null,
        notes: form.notes || null,
        total,
      }).select().single();

      if (order) {
        await supabase.from("order_items").insert(
          cart.map((i: any) => ({
            order_id: order.id,
            product_id: i.id,
            product_name: i.name,
            price: i.unitPrice,
            quantity: i.qty,
          }))
        );
      }
    } catch {
      // إذا فشل الحفظ بقاعدة البيانات، الطلب يوصل بواتساب براحته — ما نوقف العملية
    }

    const message = buildOrderMessage(cart, form, total);
    window.open(whatsappLink(WHATSAPP_NUMBER, message), "_blank");
    setSending(false);
    onSent();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end md:items-center justify-center bg-black/70" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className="pop-in w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 max-h-[90vh] overflow-y-auto bg-brand-card border border-brand-border">
        <div className="flex items-center justify-between mb-5">
          <h3 className="disp text-lg font-black">إتمام الطلب</h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-[#1f1f1f]"><X size={18} /></button>
        </div>

        <div className="flex flex-col gap-3 mb-5">
          <Field label="الاسم" required value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
          <Field label="رقم الهاتف" required type="tel" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} />
          <Field label="العنوان (اختياري)" value={form.address} onChange={(v: string) => setForm({ ...form, address: v })} />
          <Field label="ملاحظات" textarea value={form.notes} onChange={(v: string) => setForm({ ...form, notes: v })} />
        </div>

        <div className="flex items-center justify-between text-sm mb-4 px-1">
          <span className="text-neutral-400">المجموع</span>
          <span className="font-black text-brand-orange">{total.toLocaleString()} د.ع</span>
        </div>

        <button onClick={send} disabled={!canSend}
          className="btn-glow w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-bold disp disabled:opacity-40"
          style={{ background: "#25D366", color: "#0a0a0a" }}>
          <MessageCircle size={18} /> {sending ? "جاري الإرسال..." : "إرسال على واتساب"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, required, type = "text", textarea }: any) {
  const Comp: any = textarea ? "textarea" : "input";
  return (
    <label className="block">
      <span className="text-xs text-neutral-400 mb-1.5 block">
        {label}{required && <span className="text-brand-orange"> *</span>}
      </span>
      <Comp
        type={type}
        value={value}
        onChange={(e: any) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 bg-[#0f0f0f] border border-[#2a2a2a]"
      />
    </label>
  );
}
