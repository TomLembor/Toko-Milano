begin;

select plan(10);

insert into public.categories (id, name, icon_name, sort_order)
values
  ('00000000-0000-4000-8000-000000000001', 'RLS test category', 'Package', 99)
on conflict (id) do nothing;

insert into public.products (
  id,
  category_id,
  name,
  unit,
  price,
  stock,
  is_active
)
values
  (
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000001',
    'Active test product',
    '1 item',
    100,
    5,
    true
  ),
  (
    '00000000-0000-4000-8000-000000000012',
    '00000000-0000-4000-8000-000000000001',
    'Inactive test product',
    '1 item',
    100,
    5,
    false
  )
on conflict (id) do nothing;

select set_config(
  'request.jwt.claims',
  '{"role":"anon","app_metadata":{}}',
  true
);
set local role anon;

select results_eq(
  $$select name from public.categories where name = 'RLS test category'$$,
  array['RLS test category'],
  'anonymous visitors can read categories'
);
select is(
  (select count(*)::integer from public.products where id in (
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000012'
  )),
  1,
  'anonymous visitors only see active products'
);
select throws_ok(
  $$insert into public.categories (name) values ('Anonymous category')$$,
  '42501',
  null,
  'anonymous visitors cannot create categories'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","app_metadata":{"role":"staff"}}',
  true
);
set local role authenticated;

select throws_ok(
  $$insert into public.categories (name) values ('Staff category')$$,
  '42501',
  null,
  'non-admin users cannot create categories'
);
select is(
  (
    with updated as (
      update public.products
      set stock = 3
      where id = '00000000-0000-4000-8000-000000000011'
      returning id
    )
    select count(*)::integer from updated
  ),
  0,
  'non-admin users cannot update products'
);
select is(
  (
    with updated as (
      update public.categories
      set name = 'Staff category update'
      where id = '00000000-0000-4000-8000-000000000001'
      returning id
    )
    select count(*)::integer from updated
  ),
  0,
  'non-admin users cannot update categories'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"role":"authenticated","app_metadata":{"role":"admin"}}',
  true
);
set local role authenticated;

select is(
  (select count(*)::integer from public.products where id in (
    '00000000-0000-4000-8000-000000000011',
    '00000000-0000-4000-8000-000000000012'
  )),
  2,
  'admins can read active and inactive products'
);
select lives_ok(
  $$insert into public.categories (name) values ('Admin category')$$,
  'admins can create categories'
);
select lives_ok(
  $$update public.products set stock = 4 where id = '00000000-0000-4000-8000-000000000011'$$,
  'admins can update products'
);
select lives_ok(
  $$update public.categories set name = 'Admin updated category' where id = '00000000-0000-4000-8000-000000000001'$$,
  'admins can update categories'
);

select * from finish();
rollback;
