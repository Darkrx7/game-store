-- ============================================================
-- ترقية نظام العروض والحملات الموسمية
-- شغّل هذا الملف داخل Supabase → SQL Editor (فوق قاعدة بيانات موجودة أصلاً)
-- ============================================================

-- ---------- حقول العروض الجديدة على المنتجات ----------
alter table products
  add column if not exists offer_enabled boolean not null default false,
  add column if not exists discount_percent numeric(5,2),
  add column if not exists offer_price numeric(12,0),
  add column if not exists offer_starts_at timestamptz,
  add column if not exists offer_ends_at timestamptz,
  add column if not exists show_new boolean not null default false,
  add column if not exists show_bestseller boolean not null default false,
  add column if not exists show_limited boolean not null default false,
  add column if not exists show_on_home boolean not null default true;

-- ---------- الحملات الموسمية ----------
create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  emoji text default '🛍️',
  banner_url text,
  color text not null default '#ff7a1a',
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- ربط المنتجات بالحملات (متعدد لمتعدد) ----------
create table if not exists campaign_products (
  campaign_id uuid references campaigns(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (campaign_id, product_id)
);

-- ---------- الحماية ----------
alter table campaigns enable row level security;
alter table campaign_products enable row level security;

drop policy if exists "الكل يشوف الحملات" on campaigns;
create policy "الكل يشوف الحملات" on campaigns for select using (true);

drop policy if exists "الموظف يدير الحملات" on campaigns;
create policy "الموظف يدير الحملات" on campaigns for all using (is_staff_or_owner());

drop policy if exists "الكل يشوف منتجات الحملة" on campaign_products;
create policy "الكل يشوف منتجات الحملة" on campaign_products for select using (true);

drop policy if exists "الموظف يدير منتجات الحملة" on campaign_products;
create policy "الموظف يدير منتجات الحملة" on campaign_products for all using (is_staff_or_owner());

-- ---------- دالة تحسب الحملة النشطة حالياً (لو موجودة) ----------
create or replace function public.active_campaign()
returns setof campaigns as $$
  select * from campaigns
  where active = true
    and now() between starts_at and ends_at
  order by starts_at desc
  limit 1;
$$ language sql stable;
