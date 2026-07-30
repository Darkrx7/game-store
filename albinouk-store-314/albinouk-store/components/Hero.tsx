"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SLIDES = [
  { title: "عالمك بالألعاب يبدأ من هنا", sub: "أفضل أذرع التحكم والأجهزة بگلب بغداد", cta: "تسوق الآن", href: "/categories" },
  { title: "عروض حصرية هالأسبوع", sub: "خصومات توصل 15% على مستلزمات الألعاب", cta: "شوف العروض", href: "/categories" },
];

function ShatterField() {
  const shards = useMemo(
    () => Array.from({ length: 22 }).map((_, i) => ({
      id: i, left: Math.random() * 100, top: Math.random() * 100,
      size: 4 + Math.random() * 10, delay: Math.random() * 4, dur: 4 + Math.random() * 3,
    })), []
  );
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-[0.15]">
        <defs>
          <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
            <path d="M 46 0 L 0 0 0 46" fill="none" stroke="#ff7a1a" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      {shards.map((s) => (
        <span key={s.id} className="absolute rounded-[2px] animate-floaty"
          style={{
            left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
            background: "linear-gradient(135deg,#ff7a1a,#ffb347)", opacity: 0.35,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function Hero() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);
  const s = SLIDES[idx];

  return (
    <div className="relative overflow-hidden" style={{ background: "linear-gradient(180deg,#120d08 0%, #0a0a0a 100%)" }}>
      <ShatterField />
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <div key={idx} className="fade-up">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold mb-4 bg-brand-orange/10 text-brand-orangeLight border border-brand-orange/25">
            مركز البنوك للألعاب
          </span>
          <h1 className="disp text-3xl md:text-5xl font-black leading-tight mb-3">{s.title}</h1>
          <p className="text-neutral-400 mb-7 text-sm md:text-base">{s.sub}</p>
          <Link href={s.href}
            className="btn-glow inline-flex items-center gap-2 px-7 py-3 rounded-full font-bold text-sm disp bg-brand-orange text-black">
            {s.cta} <ArrowRight size={16} className="rotate-180" />
          </Link>
        </div>
        <div className="flex items-center justify-center gap-1.5 mt-8">
          {SLIDES.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} className="h-1.5 rounded-full transition-all"
              style={{ width: i === idx ? 22 : 7, background: i === idx ? "#ff7a1a" : "#3a3a3a" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
