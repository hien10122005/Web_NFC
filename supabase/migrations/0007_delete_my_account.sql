-- =====================================================================
-- 0007_delete_my_account.sql — Cho phép người dùng tự xóa tài khoản
-- =====================================================================

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Bạn cần đăng nhập' using errcode = '42501';
  end if;

  -- 1. Xóa ảnh avatar / cover của người dùng trong storage
  delete from storage.objects
  where bucket_id in ('avatars', 'covers')
    and (name like (v_uid::text || '/%') or owner = v_uid);

  -- 2. Đưa các thẻ NFC của người dùng về trạng thái chưa gán
  update public.nfc_cards
  set profile_id = null,
      status = 'unassigned',
      activated_at = null,
      note = null
  where profile_id = v_uid;

  -- 3. Xóa người dùng trong auth.users
  -- (khóa ngoại ON DELETE CASCADE sẽ tự động xóa dòng tương ứng trong profiles và links)
  delete from auth.users where id = v_uid;
end;
$$;

comment on function public.delete_my_account() is 'Người dùng tự xóa tài khoản của chính mình theo Nghị định 13/2023/NĐ-CP';

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
