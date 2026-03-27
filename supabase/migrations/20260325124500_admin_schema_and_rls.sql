begin;

create extension if not exists pgcrypto;

-- =========================
-- ENUM TYPES
-- =========================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('customer', 'staff', 'admin');
  else
    begin
      alter type public.user_role add value if not exists 'staff';
    exception
      when duplicate_object then null;
    end;
  end if;

  if not exists (select 1 from pg_type where typname = 'product_status') then
    create type public.product_status as enum ('draft', 'active', 'inactive', 'sold_out');
  end if;

  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum (
      'pending',
      'paid',
      'preparing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum (
      'pending',
      'paid',
      'failed',
      'cancelled',
      'refunded'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum (
      'card',
      'bank_transfer',
      'virtual_account',
      'kakao_pay',
      'naver_pay',
      'toss_payments',
      'manual'
    );
  end if;
end
$$;

-- =========================
-- UPDATED_AT TRIGGER
-- =========================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================
-- PROFILES
-- =========================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists phone text,
  add column if not exists is_active boolean not null default true;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========================
-- CATEGORIES
-- =========================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

-- =========================
-- PRODUCTS
-- =========================

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  sku text not null unique,
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12,2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  status public.product_status not null default 'draft',
  is_active boolean not null default false,
  thumbnail_url text,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

-- =========================
-- ORDERS
-- =========================

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.profiles(id) on delete restrict,
  status public.order_status not null default 'pending',
  subtotal_amount numeric(12,2) not null default 0 check (subtotal_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  total_amount numeric(12,2) not null default 0 check (total_amount >= 0),
  receiver_name text not null,
  receiver_phone text,
  shipping_postal_code text,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_message text,
  paid_at timestamptz,
  cancelled_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- =========================
-- ORDER ITEMS
-- =========================

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_sku text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12,2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_order_items_updated_at on public.order_items;
create trigger trg_order_items_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

-- =========================
-- PAYMENTS
-- =========================

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete restrict,
  payment_key text unique,
  method public.payment_method not null default 'card',
  status public.payment_status not null default 'pending',
  amount numeric(12,2) not null check (amount >= 0),
  provider text,
  provider_transaction_id text,
  approved_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at
before update on public.payments
for each row
execute function public.set_updated_at();

-- =========================
-- INDEXES
-- =========================

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_categories_is_active on public.categories(is_active);
create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_product_id on public.order_items(product_id);
create index if not exists idx_payments_order_id on public.payments(order_id);
create index if not exists idx_payments_user_id on public.payments(user_id);
create index if not exists idx_payments_status on public.payments(status);

-- =========================
-- RLS HELPER FUNCTIONS
-- =========================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.is_admin_or_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('admin', 'staff')
      and is_active = true
  );
$$;

-- =========================
-- ENABLE RLS
-- =========================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- =========================
-- DROP OLD POLICIES
-- =========================

drop policy if exists "Users can view their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin_select_all" on public.profiles;

drop policy if exists "categories_public_select" on public.categories;
drop policy if exists "categories_admin_staff_manage" on public.categories;

drop policy if exists "products_public_select_active" on public.products;
drop policy if exists "products_admin_staff_select_all" on public.products;
drop policy if exists "products_admin_staff_insert" on public.products;
drop policy if exists "products_admin_staff_update" on public.products;
drop policy if exists "products_admin_staff_delete" on public.products;
drop policy if exists "products_select_active" on public.products;

drop policy if exists "orders_select_own" on public.orders;
drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "orders_admin_staff_select_all" on public.orders;
drop policy if exists "orders_admin_staff_update" on public.orders;

drop policy if exists "order_items_select_own" on public.order_items;
drop policy if exists "order_items_insert_own" on public.order_items;
drop policy if exists "order_items_admin_staff_select_all" on public.order_items;
drop policy if exists "order_items_admin_staff_manage" on public.order_items;
drop policy if exists "order_items_admin_staff_delete" on public.order_items;

drop policy if exists "payments_admin_select_all" on public.payments;
drop policy if exists "payments_insert_own" on public.payments;

-- =========================
-- PROFILES POLICIES
-- =========================

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (
    select p.role
    from public.profiles p
    where p.id = auth.uid()
  )
);

create policy "profiles_admin_select_all"
on public.profiles
for select
to authenticated
using (public.is_admin());

-- =========================
-- CATEGORIES POLICIES
-- =========================

create policy "categories_public_select"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "categories_admin_staff_manage"
on public.categories
for all
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

-- =========================
-- PRODUCTS POLICIES
-- =========================

create policy "products_public_select_active"
on public.products
for select
to anon, authenticated
using (is_active = true and status = 'active');

create policy "products_admin_staff_select_all"
on public.products
for select
to authenticated
using (public.is_admin_or_staff());

create policy "products_admin_staff_insert"
on public.products
for insert
to authenticated
with check (public.is_admin_or_staff());

create policy "products_admin_staff_update"
on public.products
for update
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

create policy "products_admin_staff_delete"
on public.products
for delete
to authenticated
using (public.is_admin_or_staff());

-- =========================
-- ORDERS POLICIES
-- =========================

create policy "orders_select_own"
on public.orders
for select
to authenticated
using (auth.uid() = user_id);

create policy "orders_insert_own"
on public.orders
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "orders_admin_staff_select_all"
on public.orders
for select
to authenticated
using (public.is_admin_or_staff());

create policy "orders_admin_staff_update"
on public.orders
for update
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

-- =========================
-- ORDER ITEMS POLICIES
-- =========================

create policy "order_items_select_own"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "order_items_insert_own"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "order_items_admin_staff_select_all"
on public.order_items
for select
to authenticated
using (public.is_admin_or_staff());

create policy "order_items_admin_staff_manage"
on public.order_items
for update
to authenticated
using (public.is_admin_or_staff())
with check (public.is_admin_or_staff());

create policy "order_items_admin_staff_delete"
on public.order_items
for delete
to authenticated
using (public.is_admin_or_staff());

-- =========================
-- PAYMENTS POLICIES
-- =========================

create policy "payments_admin_select_all"
on public.payments
for select
to authenticated
using (public.is_admin());

create policy "payments_insert_own"
on public.payments
for insert
to authenticated
with check (auth.uid() = user_id);

commit;
