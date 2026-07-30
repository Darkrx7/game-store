import type { Product } from "@/lib/types";

/**
 * يتحقق إذا كان عرض المنتج فعّال حالياً (بالتاريخ والوقت الفعلي)
 * إذا انتهى تاريخ العرض، يرجع false تلقائياً — بدون أي تدخل يدوي
 */
export function isOfferActive(p: Product): boolean {
  if (!p.offer_enabled) return false;
  const now = Date.now();
  if (p.offer_starts_at && now < new Date(p.offer_starts_at).getTime()) return false;
  if (p.offer_ends_at && now > new Date(p.offer_ends_at).getTime()) return false;
  return true;
}

/** السعر الفعلي الحالي — يرجع سعر العرض لو فعّال، وإلا السعر الأصلي */
export function getEffectivePrice(p: Product): number {
  if (!isOfferActive(p)) return p.price;
  if (p.offer_price) return p.offer_price;
  if (p.discount_percent) return Math.round(p.price * (1 - p.discount_percent / 100));
  return p.price;
}

/** نسبة الخصم الفعلية المعروضة (تُحسب من السعرين لو ما فيه نسبة محفوظة) */
export function getDiscountPercent(p: Product): number | null {
  if (!isOfferActive(p)) return null;
  if (p.discount_percent) return Math.round(p.discount_percent);
  const effective = getEffectivePrice(p);
  if (effective >= p.price) return null;
  return Math.round(((p.price - effective) / p.price) * 100);
}

/** مقدار التوفير بالدينار */
export function getSavings(p: Product): number {
  if (!isOfferActive(p)) return 0;
  return Math.max(0, p.price - getEffectivePrice(p));
}

/** الوقت المتبقي لانتهاء العرض بالميلي ثانية (null لو ماكو تاريخ انتهاء) */
export function getTimeRemainingMs(p: Product): number | null {
  if (!p.offer_ends_at || !isOfferActive(p)) return null;
  return new Date(p.offer_ends_at).getTime() - Date.now();
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const totalSeconds = Math.floor(ms / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}
