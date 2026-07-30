"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { getTimeRemainingMs, formatCountdown } from "@/lib/offers";
import type { Product } from "@/lib/types";

export default function CountdownTimer({ product }: { product: Product }) {
  const [ms, setMs] = useState<number | null>(() => getTimeRemainingMs(product));

  useEffect(() => {
    const t = setInterval(() => setMs(getTimeRemainingMs(product)), 1000);
    return () => clearInterval(t);
  }, [product]);

  if (ms === null || ms <= 0) return null;
  const { days, hours, minutes, seconds } = formatCountdown(ms);

  const Box = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div key={value} className="count-pop w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg"
        style={{ background: "linear-gradient(135deg,#ff3b30,#ff7a1a)", color: "#fff" }}>
        {String(value).padStart(2, "0")}
      </div>
      <span className="text-[10px] text-neutral-500 mt-1">{label}</span>
    </div>
  );

  return (
    <div className="rounded-2xl p-4 mb-5" style={{ background: "linear-gradient(135deg,#1a0f0a,#141414)", border: "1px solid #ff3b3033" }}>
      <div className="flex items-center gap-1.5 mb-3 text-xs font-bold" style={{ color: "#ff7a1a" }}>
        <Timer size={14} /> ينتهي العرض خلال
      </div>
      <div className="flex items-center gap-2">
        {days > 0 && <Box value={days} label="يوم" />}
        <Box value={hours} label="ساعة" />
        <Box value={minutes} label="دقيقة" />
        <Box value={seconds} label="ثانية" />
      </div>
    </div>
  );
}
