export type Category = {
  id: string;
  name: string;
  icon: string;
  cover_image: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  old_price: number | null;
  quantity: number;
  images: string[];
  badge: string | null;
  rating: number | null;
  // ---- نظام العروض ----
  offer_enabled: boolean;
  discount_percent: number | null;
  offer_price: number | null;
  offer_starts_at: string | null;
  offer_ends_at: string | null;
  show_new: boolean;
  show_bestseller: boolean;
  show_limited: boolean;
  show_on_home: boolean;
};

export type Campaign = {
  id: string;
  name: string;
  emoji: string;
  banner_url: string | null;
  color: string;
  description: string | null;
  starts_at: string;
  ends_at: string;
  active: boolean;
};

export type StoreSettings = {
  store_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  address: string;
  hours: string;
  primary_color: string;
  secondary_color: string;
};

export type CartItem = Product & { qty: number; unitPrice: number };

export type OrderStatus = "new" | "processing" | "delivered";

export type UserRole = "customer" | "staff" | "owner";
