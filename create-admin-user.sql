-- MAJOR STORE — create your admin user in Supabase
-- Edit the email and password below BEFORE running this script.
-- Recommended: run after supabase-setup.sql

-- Change these two values:
--   owner@example.com
--   CHANGE_ME_STRONG_PASSWORD_123!

select auth.admin_create_user(
  jsonb_build_object(
    'email', 'owner@example.com',
    'password', 'CHANGE_ME_STRONG_PASSWORD_123!',
    'email_confirm', true
  )
);

-- If auth.admin_create_user is not available in your project,
-- create the user manually in Supabase Authentication > Users.
