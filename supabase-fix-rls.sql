-- ============================================================
--  MAJOR STORE — فتح استقبال الطلبات والرسائل من المتجر (anon)
--  شغّل هذا الملف في: Supabase Dashboard → SQL Editor → Run
--  يسمح فقط بالإدراج (INSERT) للزوار، دون أي صلاحيات قراءة/تعديل/حذف
-- ============================================================

-- 1) عمود إثبات الدفع (صورة/سكرين شوت يرفعه الزبون عند الشراء)
alter table public.orders
  add column if not exists country text;
alter table public.orders
  add column if not exists proof_image text;

-- 2) الزبون المجهول (anon) يستطيع إنشاء طلب جديد فقط
--    (الطلبات الجديدة تصل بحالة pending وتحتاج تأكيد المسؤول)
create policy "anon can insert orders"
  on public.orders
  for insert
  to anon
  with check (status = 'pending');

-- 3) الزائر يستطيع إرسال رسالة تواصل فقط
create policy "anon can insert messages"
  on public.messages
  for insert
  to anon
  with check (true);

-- ملاحظة: القراءة والتعديل والحذف للطلبات والرسائل تبقى مقصورة على
-- جلسة المسؤول المُسجّلة (Supabase Auth) بواسطة السياسات الحالية.
-- لاختبار سريع بعد التشغيل:
--   curl -X POST https://vlqdduqgktwaqehkbbsu.supabase.co/rest/v1/orders \
--     -H "apikey: <ANON_KEY>" -H "Authorization: Bearer <ANON_KEY>" \
--     -H "Content-Type: application/json" \
--     -d '{"id":"test-1","email":"t@t.t","total":1,"status":"pending"}'
-- يجب أن يرجع 201.