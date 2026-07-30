import Link from "next/link";
import { Package, LayoutGrid, ClipboardList, Users, Settings, ArrowRight, Flame, PartyPopper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null };

  const isOwner = profile?.role === "owner";

  const links = [
    { href: "/admin/products", label: "المنتجات", icon: Package },
    { href: "/admin/offers", label: "إدارة العروض", icon: Flame },
    { href: "/admin/campaigns", label: "الحملات الموسمية", icon: PartyPopper },
    { href: "/admin/categories", label: "الأقسام", icon: LayoutGrid },
    { href: "/admin/orders", label: "الطلبات", icon: ClipboardList },
    ...(isOwner ? [
      { href: "/admin/users", label: "المستخدمون", icon: Users },
      { href: "/admin/settings", label: "الإعدادات", icon: Settings },
    ] : []),
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <aside className="md:w-56 shrink-0">
        <Link href="/" className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-brand-orange mb-4">
          <ArrowRight size={14} /> رجوع للموقع
        </Link>
        <div className="rounded-2xl p-3 flex flex-col gap-1 bg-brand-card border border-brand-border">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1f1f1f] transition-colors">
              <l.icon size={17} color="#ff7a1a" /> {l.label}
            </Link>
          ))}
        </div>
        <p className="text-[11px] text-neutral-600 mt-3 px-1">
          الدور الحالي: {isOwner ? "مالك" : "موظف"}
        </p>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
