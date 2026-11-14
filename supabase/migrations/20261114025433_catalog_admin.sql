create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(btrim(name)) > 0),
  icon_name text not null default 'ShoppingBag',
  sort_order integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null check (char_length(btrim(name)) > 0),
  unit text not null check (char_length(btrim(unit)) > 0),
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);
create index categories_sort_order_idx on public.categories (sort_order, name);

create or replace function public.is_store_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

revoke all on function public.is_store_admin() from public, anon;
grant execute on function public.is_store_admin() to authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;

revoke all on table public.categories, public.products from public, anon, authenticated;
grant select on table public.categories, public.products to anon, authenticated;
grant insert, update on table public.categories, public.products to authenticated;

create policy "Anyone can read categories"
on public.categories for select
to anon, authenticated
using (true);

create policy "Admins can add categories"
on public.categories for insert
to authenticated
with check ((select public.is_store_admin()));

create policy "Admins can update categories"
on public.categories for update
to authenticated
using ((select public.is_store_admin()))
with check ((select public.is_store_admin()));

create policy "Visitors can read active products"
on public.products for select
to anon
using (is_active);

create policy "Signed-in users can read active products and admins can read all products"
on public.products for select
to authenticated
using (is_active or (select public.is_store_admin()));

create policy "Admins can add products"
on public.products for insert
to authenticated
with check ((select public.is_store_admin()));

create policy "Admins can update products"
on public.products for update
to authenticated
using ((select public.is_store_admin()))
with check ((select public.is_store_admin()));

insert into public.categories (name, icon_name, sort_order)
values
  ('Sembako', 'ShoppingBasket', 1),
  ('Minuman', 'CupSoda', 2),
  ('Makanan ringan', 'Cookie', 3),
  ('Mandi & cuci', 'Bath', 4),
  ('Bumbu dapur', 'CookingPot', 5),
  ('Obat & lainnya', 'BriefcaseMedical', 6)
on conflict (name) do nothing;