-- MAJOR STORE — إنشاء مستخدم الإدارة في Supabase مباشرة
-- Run this file in Supabase Dashboard > SQL Editor  (بعد supabase-setup.sql)
-- ينشئ مستخدم الإدارة: admin@majorstore.store
-- كلمة السر: yemavava91@@@@@#####   (عدّلها من الخط A إن شئت)

-- يوجد طريقتان:
-- 1) الطريقة الحديثة (موصى بها لمعظم المشاريع)
select auth.admin_create_user(
  jsonb_build_object(
    'email', 'admin@majorstore.store',
    'password', 'yemavava91@@@@@#####',
    'email_confirm', true
  )
);

-- 2) إن ظهرت رسالة خطأ في الطريقة 1 (دالة غير موجودة)، نفّذ الطريقة البديلة فقط (اختر الطريقة 1 أو 2):
-- do $$
-- declare new_id uuid := gen_random_uuid();
-- begin
--   if not exists (select 1 from auth.users where email = 'admin@majorstore.store') then
--     insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_sso_user)
--     values ('00000000-0000-0000-0000-000000000000', new_id, 'authenticated', 'authenticated',
--             'admin@majorstore.store',
--             crypt('yemavava91@@@@@#####', gen_salt('bf')),
--             now(), now(), now(), now(),
--             '{"provider":"email","providers":["email"]}',
--             '{"email":"admin@majorstore.store"}',
--             false);
--     insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
--     values (new_id::text, new_id,
--             jsonb_build_object('sub', new_id::text, 'email', 'admin@majorstore.store', 'email_verified', true),
--             'email', now(), now(), now());
--   end if;
-- end $$;

-- (اختياري) إذا كان المستخدم موجوداً ونسيت كلمة السر، فعّل السطر التالي لإعادة تعيينها:
-- update auth.users
--    set encrypted_password = crypt('yemavava91@@@@@#####', gen_salt('bf')), updated_at = now()
--  where email = 'admin@majorstore.store';

-- بعد التنفيذ: سجّل الدخول في لوحة التحكم بـ
-- User: admin        (أو admin@majorstore.store)
-- Pass: yemavava91@@@@@#####