-- MAJOR STORE / Supabase setup
-- Run this whole script in Supabase Dashboard > SQL Editor.
-- It creates shared products/settings/orders/messages and safe RLS policies.

create extension if not exists pgcrypto;

create table if not exists public.store_data (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  name text not null,
  phone text not null,
  email text,
  address text,
  payment text,
  note text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric default 0,
  coupon text,
  total numeric default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  visitor_name text not null,
  visitor_email text,
  message text not null,
  reply text,
  status text not null default 'new',
  created_at timestamptz not null default now(),
  replied_at timestamptz
);

insert into public.store_data (id, data)
values ('main', '{"products": [], "categories": [], "settings": {}, "coupons": []}'::jsonb)
on conflict (id) do nothing;

alter table public.store_data enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;

-- Remove old policies if this script is re-run.
drop policy if exists store_public_read on public.store_data;
drop policy if exists store_admin_write on public.store_data;
drop policy if exists orders_public_insert on public.orders;
drop policy if exists orders_admin_read on public.orders;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists orders_admin_delete on public.orders;
drop policy if exists messages_public_insert on public.messages;
drop policy if exists messages_admin_read on public.messages;
drop policy if exists messages_admin_update on public.messages;
drop policy if exists messages_admin_delete on public.messages;

-- Public visitors may read the store and create orders/messages.
create policy store_public_read on public.store_data
  for select to anon, authenticated using (true);

create policy orders_public_insert on public.orders
  for insert to anon, authenticated with check (true);

create policy messages_public_insert on public.messages
  for insert to anon, authenticated with check (length(message) between 1 and 3000);

-- Only authenticated Supabase users can manage store, orders and messages.
create policy store_admin_write on public.store_data
  for all to authenticated using (true) with check (true);

create policy orders_admin_read on public.orders
  for select to authenticated using (true);

create policy orders_admin_update on public.orders
  for update to authenticated using (true) with check (true);

create policy orders_admin_delete on public.orders
  for delete to authenticated using (true);

create policy messages_admin_read on public.messages
  for select to authenticated using (true);

create policy messages_admin_update on public.messages
  for update to authenticated using (true) with check (true);

create policy messages_admin_delete on public.messages
  for delete to authenticated using (true);

-- Optional realtime for dashboard/store clients.
alter publication supabase_realtime add table public.store_data;
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.messages;

-- After running this SQL, create the admin user in:
-- Authentication > Users > Add user
-- Email: admin@majorstore.store
-- Password: yemavava91@@@@#####
-- Then the dashboard login fields admin / password will use Supabase Auth.
