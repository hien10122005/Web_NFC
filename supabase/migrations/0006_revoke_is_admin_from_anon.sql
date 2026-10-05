-- 0006_revoke_is_admin_from_anon.sql — anon không cần gọi is_admin()
revoke execute on function public.is_admin() from anon;
