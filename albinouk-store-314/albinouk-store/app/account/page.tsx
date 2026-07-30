"use client";

import { useState, useEffect } from "react";
import { User, Package, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: orderData } = await supabase
          .from("orders").select("*").eq("user_id", data.user.id).order("created_at", { ascending: false });
        setOrders(orderData || []);
      }
      setLoading(false);
    });
  }, []);

  const handleAuth = async () => {
    setError("");
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name } },
      });
      if (error) setError(error.message);
      else window.location.reload();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (error) setError(error.message);
      else window.location.reload();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <main className="max-w-sm mx-auto px-4 py-16 text-center text-neutral-500 text-sm">جاري التحميل...</main>;

  if (!user) {
    return (
      <main className="max-w-sm mx-auto px-4 py-16">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brand-card border border-brand-border">
            <User size={26} color="#ff7a1a" />
          </div>
          <h2 className="disp text-xl font-black mb-2">حسابي</h2>
          <p className="text-sm text-neutral-500">سجل دخولك عشان تتابع طلباتك ومفضلتك</p>
        </div>

        <div className="flex rounded-full p-1 mb-5 bg-[#141414] border border-brand-border">
          {(["login", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${mode === m ? "bg-brand-orange text-black" : "text-neutral-400"}`}>
              {m === "login" ? "تسجيل الدخول" : "حساب جديد"}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {mode === "signup" && (
            <Field label="الاسم" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} />
          )}
          <Field label="البريد الإلكتروني" type="email" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} />
          <Field label="كلمة المرور" type="password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={handleAuth} className="btn-glow w-full py-3 rounded-full font-bold disp mt-2 bg-brand-orange text-black">
            {mode === "login" ? "دخول" : "إنشاء الحساب"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="disp text-2xl font-black">حسابي</h1>
        <button onClick={logout} className="flex items-center gap-1.5 text-sm text-neutral-400 hover:text-red-400 transition-colors">
          <LogOut size={15} /> خروج
        </button>
      </div>

      <div className="rounded-2xl p-4 mb-6 bg-brand-card border border-brand-border">
        <p className="text-sm text-neutral-400">مسجل بإيميل</p>
        <p className="font-bold">{user.email}</p>
      </div>

      <h2 className="disp font-black mb-3 flex items-center gap-2"><Package size={18} color="#ff7a1a" /> طلباتي</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500">ماكو طلبات سابقة.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl p-4 bg-brand-card border border-brand-border flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{o.total.toLocaleString()} د.ع</p>
                <p className="text-xs text-neutral-500">{new Date(o.created_at).toLocaleDateString("ar-IQ")}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    new: { label: "جديد", color: "#ff9142" },
    processing: { label: "قيد التجهيز", color: "#3b82f6" },
    delivered: { label: "تم التسليم", color: "#4ade80" },
  };
  const s = map[status] || map.new;
  return (
    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: `${s.color}22`, color: s.color }}>
      {s.label}
    </span>
  );
}

function Field({ label, value, onChange, type = "text" }: any) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-400 mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand-orange/40 bg-[#0f0f0f] border border-[#2a2a2a]" />
    </label>
  );
}
