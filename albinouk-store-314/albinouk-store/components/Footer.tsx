import Link from "next/link";
import { Phone, MapPin, Clock } from "lucide-react";
import Logo from "./Logo";
import type { StoreSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: StoreSettings | null }) {
  const s = settings || {
    store_name: "مركز البنوك للألعاب",
    whatsapp_number: "9647735687607",
    address: "بغداد / البنوك",
    hours: "يومياً من 2 مساءً إلى 1 صباحاً",
  };

  return (
    <footer className="mt-10 bg-[#0d0d0d] border-t border-[#1f1f1f]">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Logo size={34} />
            <span className="disp font-black text-brand-orange">
              البنوك <span className="text-white">للألعاب</span>
            </span>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            وجهتك الأولى لمستلزمات الألعاب بأفضل الأسعار وخدمة موثوقة.
          </p>
        </div>

        <div className="flex flex-col gap-3 text-sm">
          <p className="font-bold mb-1 disp">تواصل معنا</p>
          <a href={`https://wa.me/${s.whatsapp_number}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 text-neutral-400 hover:text-brand-orange transition-colors">
            <Phone size={14} /> +{s.whatsapp_number}
          </a>
          <div className="flex items-start gap-2 text-neutral-400">
            <MapPin size={14} className="mt-0.5 shrink-0" />
            <span className="leading-relaxed">{s.address}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <Clock size={14} /> {s.hours}
          </div>
        </div>

        <div>
          <p className="font-bold mb-3 disp text-sm">روابط سريعة</p>
          <div className="flex flex-col gap-2 text-sm text-neutral-400">
            <Link href="/categories" className="hover:text-brand-orange transition-colors w-fit">الأقسام</Link>
            <Link href="/cart" className="hover:text-brand-orange transition-colors w-fit">السلة</Link>
            <Link href="/wishlist" className="hover:text-brand-orange transition-colors w-fit">المفضلة</Link>
          </div>
        </div>
      </div>
      <div className="text-center text-[11px] text-neutral-600 py-4 border-t border-[#1a1a1a]">
        © 2026 {s.store_name} — جميع الحقوق محفوظة · تطوير: جعفر (فريلانسر)
      </div>
    </footer>
  );
}
