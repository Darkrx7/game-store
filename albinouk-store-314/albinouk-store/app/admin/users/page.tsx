"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "customer", label: "زبون" },
  { value: "staff", label: "موظف" },
  { value: "owner", label: "مالك" },
];

export default function AdminUsers() {
  const supabase = createClient();
  const [profiles, setProfiles] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setProfiles(data || []);
  };
  useEffect(() => { load(); }, []);

  const changeRole = async (id: string, role: string) => {
    await supabase.from("profiles").update({ role }).eq("id", id);
    load();
  };

  return (
    <div>
      <h1 className="disp text-2xl font-black mb-2">المستخدمون</h1>
      <p className="text-xs text-neutral-500 mb-6">
        هذي الصفحة تظهر بس للمالك. تقدر تحول أي زبون إلى موظف عنده صلاحية إدارة المنتجات والطلبات.
      </p>
      <div className="rounded-2xl overflow-hidden bg-brand-card border border-brand-border">
        {profiles.map((p) => (
          <div key={p.id} className="flex items-center gap-3 p-4 border-b border-brand-border last:border-0">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm">{p.full_name || "بدون اسم"}</p>
              <p className="text-xs text-neutral-500">{p.phone || "—"}</p>
            </div>
            <select value={p.role} onChange={(e) => changeRole(p.id, e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-bold outline-none bg-[#0f0f0f] border border-[#2a2a2a]">
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        ))}
        {profiles.length === 0 && <p className="p-6 text-sm text-neutral-500 text-center">ماكو مستخدمين بعد.</p>}
      </div>
    </div>
  );
}
