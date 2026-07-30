-- ============================================================
-- مركز البنوك للألعاب — قاعدة البيانات الكاملة
-- شغّل هذا الملف كامل داخل Supabase → SQL Editor
-- ============================================================

-- ---------- الأنواع (Enums) ----------
create type user_role as enum ('customer', 'staff', 'owner');
create type order_status as enum ('new', 'processing', 'delivered');

-- ---------- جدول الملفات الشخصية (يمتد من auth.users) ----------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role user_role not null default 'customer',
  created_at timestamptz not null default now()
);

-- عند إنشاء مستخدم جديد بالمصادقة، ينشئ له بروفايل تلقائياً كـ customer
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data->>'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- الأقسام ----------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null default 'Gamepad2',
  cover_image text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ---------- المنتجات ----------
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  description text,
  price numeric(12,0) not null,
  old_price numeric(12,0),
  quantity int not null default 0,
  images text[] not null default '{}',
  badge text,
  rating numeric(2,1) default 5.0,
  created_at timestamptz not null default now(),
  -- ---- نظام العروض ----
  offer_enabled boolean not null default false,
  discount_percent numeric(5,2),
  offer_price numeric(12,0),
  offer_starts_at timestamptz,
  offer_ends_at timestamptz,
  show_new boolean not null default false,
  show_bestseller boolean not null default false,
  show_limited boolean not null default false,
  show_on_home boolean not null default true
);

-- ---------- الحملات الموسمية ----------
create table campaigns (
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

create table campaign_products (
  campaign_id uuid references campaigns(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  primary key (campaign_id, product_id)
);

-- ---------- المفضلة ----------
create table wishlists (
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

-- ---------- الطلبات ----------
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  notes text,
  status order_status not null default 'new',
  total numeric(12,0) not null,
  created_at timestamptz not null default now()
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_name text not null,
  price numeric(12,0) not null,
  quantity int not null
);

-- ---------- إعدادات المتجر العامة (صف واحد فقط) ----------
create table store_settings (
  id int primary key default 1,
  store_name text not null default 'مركز البنوك للألعاب',
  logo_url text,
  whatsapp_number text not null default '9647735687607',
  address text not null default 'بغداد / البنوك، الشارع مقابل معجنات عبد الرضا، مجاور أسواق أميرة - شارع نادي النجدة',
  hours text not null default 'يومياً من 2 مساءً إلى 1 صباحاً',
  primary_color text not null default '#ff7a1a',
  secondary_color text not null default '#0a0a0a',
  constraint single_row check (id = 1)
);

insert into store_settings (id) values (1);

-- ============================================================
-- دالة مساعدة: تتحقق من دور المستخدم الحالي
-- ============================================================
create function public.current_role()
returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

create function public.is_staff_or_owner()
returns boolean as $$
  select public.current_role() in ('staff', 'owner');
$$ language sql stable security definer;

create function public.is_owner()
returns boolean as $$
  select public.current_role() = 'owner';
$$ language sql stable security definer;

-- ============================================================
-- تفعيل الحماية (Row Level Security) على كل الجداول
-- ============================================================
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table wishlists enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table store_settings enable row level security;
alter table campaigns enable row level security;
alter table campaign_products enable row level security;

-- ---------- profiles ----------
create policy "المستخدم يشوف بروفايله" on profiles
  for select using (auth.uid() = id or is_staff_or_owner());

create policy "المستخدم يعدل بروفايله" on profiles
  for update using (auth.uid() = id);

create policy "المالك يعدل أي بروفايل (أدوار الموظفين)" on profiles
  for update using (is_owner());

-- ---------- categories: قراءة عامة، تعديل للموظف/المالك ----------
create policy "الكل يشوف الأقسام" on categories for select using (true);
create policy "الموظف يدير الأقسام" on categories for all using (is_staff_or_owner());

-- ---------- products: قراءة عامة، تعديل للموظف/المالك ----------
create policy "الكل يشوف المنتجات" on products for select using (true);
create policy "الموظف يدير المنتجات" on products for all using (is_staff_or_owner());

-- ---------- wishlists: كل مستخدم يشوف ويدير مفضلته بس ----------
create policy "المستخدم يدير مفضلته" on wishlists for all using (auth.uid() = user_id);

-- ---------- orders ----------
create policy "الزبون يشوف طلباته" on orders
  for select using (auth.uid() = user_id or is_staff_or_owner());

create policy "أي زائر يقدر يسوي طلب" on orders
  for insert with check (true);

create policy "الموظف يعدل حالة الطلب" on orders
  for update using (is_staff_or_owner());

-- ---------- order_items ----------
create policy "قراءة عناصر الطلب لصاحبه أو الموظف" on order_items
  for select using (
    exists (
      select 1 from orders o
      where o.id = order_items.order_id
      and (o.user_id = auth.uid() or is_staff_or_owner())
    )
  );

create policy "إضافة عناصر الطلب مسموحة عند إنشاء الطلب" on order_items
  for insert with check (true);

-- ---------- store_settings: قراءة عامة، تعديل للمالك بس ----------
create policy "الكل يشوف إعدادات المتجر" on store_settings for select using (true);
create policy "المالك بس يعدل الإعدادات" on store_settings for update using (is_owner());

-- ---------- campaigns / campaign_products ----------
create policy "الكل يشوف الحملات" on campaigns for select using (true);
create policy "الموظف يدير الحملات" on campaigns for all using (is_staff_or_owner());
create policy "الكل يشوف منتجات الحملة" on campaign_products for select using (true);
create policy "الموظف يدير منتجات الحملة" on campaign_products for all using (is_staff_or_owner());

-- دالة تحسب الحملة النشطة حالياً (لو موجودة)
create function public.active_campaign()
returns setof campaigns as $$
  select * from campaigns
  where active = true
    and now() between starts_at and ends_at
  order by starts_at desc
  limit 1;
$$ language sql stable;

-- ============================================================
-- بيانات تجريبية أولية (أقسام) — يقدر الأدمن يعدلها من اللوحة
-- ============================================================
insert into categories (name, icon, sort_order) values
  ('أذرع تحكم', 'Joystick', 1),
  ('كيبوردات', 'Keyboard', 2),
  ('سماعات', 'Headphones', 3),
  ('ماوسات', 'Mouse', 4),
  ('شاشات', 'Monitor', 5),
  ('أجهزة ألعاب', 'Cpu', 6);
