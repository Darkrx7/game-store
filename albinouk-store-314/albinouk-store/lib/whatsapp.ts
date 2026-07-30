import type { CartItem } from "@/lib/types";

export function buildOrderMessage(
  cart: CartItem[],
  form: { name: string; phone: string; address?: string; notes?: string },
  total: number
) {
  let msg = `طلب جديد من: ${form.name}\nالرقم: ${form.phone}\n`;
  if (form.address?.trim()) msg += `العنوان: ${form.address}\n`;
  msg += `المنتجات:\n`;
  cart.forEach((item, i) => {
    msg += `${i + 1}- ${item.name} - ${item.qty} قطعة - ${item.unitPrice * item.qty} د.ع\n`;
  });
  msg += `المجموع: ${total} د.ع`;
  if (form.notes?.trim()) msg += `\nملاحظات: ${form.notes}`;
  return msg;
}

export function whatsappLink(phoneDigitsOnly: string, message: string) {
  return `https://wa.me/${phoneDigitsOnly}?text=${encodeURIComponent(message)}`;
}
