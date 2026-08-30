-- ============================================================
-- MAJOR STORE — إصلاح نشر لوحة التحكم وطلبات المتجر
-- شغّل الملف كاملاً مرة واحدة في Supabase Dashboard > SQL Editor
-- هذا الملف آمن لإعادة التشغيل أكثر من مرة.
-- ============================================================

begin;

-- الأعمدة التي تحتاجها النسخة الحالية من المتجر
alter table public.orders add column if not exists country text;
alter table public.orders add column if not exists proof_image text;

-- تفعيل RLS والتأكد من صلاحيات PostgREST الأساسية
alter table public.store_data enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;

grant select on public.store_data to anon, authenticated;
grant insert, update, delete on public.store_data to authenticated;
grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant insert on public.messages to anon, authenticated;
grant select, update, delete on public.messages to authenticated;

-- حذف كل السياسات القديمة على الجداول الثلاثة، مهما كانت أسماؤها.
-- هذا يمنع تعارض السياسات القديمة التي سببت RLS rejected the write.
do $$
declare p record;
begin
  for p in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('store_data', 'orders', 'messages')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- الزوار: قراءة بيانات المتجر فقط.
create policy major_store_public_read
  on public.store_data
  for select
  to anon, authenticated
  using (true);

-- الإدارة: نشر/تعديل بيانات المتجر من جلسة Supabase Auth فقط.
-- لا يوجد service_role في المتصفح؛ auth.uid() يضمن أنها جلسة authenticated حقيقية.
create policy major_store_authenticated_write
  on public.store_data
  for all
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

-- الزبون: إنشاء طلب pending فقط، ولا يستطيع قراءة أو تعديل الطلبات.
create policy major_orders_public_insert
  on public.orders
  for insert
  to anon, authenticated
  with check (status = 'pending');

-- الإدارة: قراءة وتعديل وحذف الطلبات.
create policy major_orders_authenticated_read
  on public.orders
  for select
  to authenticated
  using (auth.uid() is not null);

create policy major_orders_authenticated_update
  on public.orders
  for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy major_orders_authenticated_delete
  on public.orders
  for delete
  to authenticated
  using (auth.uid() is not null);

-- الزبون: إرسال رسالة فقط.
create policy major_messages_public_insert
  on public.messages
  for insert
  to anon, authenticated
  with check (length(message) between 1 and 3000);

-- الإدارة: قراءة وتعديل وحذف الرسائل.
create policy major_messages_authenticated_read
  on public.messages
  for select
  to authenticated
  using (auth.uid() is not null);

create policy major_messages_authenticated_update
  on public.messages
  for update
  to authenticated
  using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy major_messages_authenticated_delete
  on public.messages
  for delete
  to authenticated
  using (auth.uid() is not null);

commit;

-- تحقق اختياري بعد التنفيذ:
-- select tablename, policyname, roles, cmd
-- from pg_policies
-- where schemaname = 'public'
--   and tablename in ('store_data', 'orders', 'messages')
-- order by tablename, policyname;
