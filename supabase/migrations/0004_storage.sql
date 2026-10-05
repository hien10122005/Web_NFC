-- =====================================================================
-- 0004_storage.sql — Bucket lưu ảnh đại diện & ảnh bìa
-- Đường dẫn file: {user_id}/ten-file.webp
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),  -- 2MB
  ('covers',  'covers',  true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])   -- 5MB
on conflict (id) do nothing;

create policy "Users read own profile images"
  on storage.objects for select to authenticated
  using (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users upload own profile images"
  on storage.objects for insert to authenticated
  with check (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users update own profile images"
  on storage.objects for update to authenticated
  using (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete own profile images"
  on storage.objects for delete to authenticated
  using (bucket_id in ('avatars', 'covers') and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Admins manage profile images"
  on storage.objects for all to authenticated
  using (bucket_id in ('avatars', 'covers') and (select public.is_admin()))
  with check (bucket_id in ('avatars', 'covers') and (select public.is_admin()));
