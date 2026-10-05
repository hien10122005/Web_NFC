-- =====================================================================
-- 0002_functions_triggers.sql — Hàm nghiệp vụ & trigger
-- =====================================================================

-- ---------------------------------------------------------------------
-- is_admin(): kiểm tra người dùng hiện tại có phải admin (đang active)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- ---------------------------------------------------------------------
-- Tự tạo profile khi có user mới đăng ký (tôn trọng cài đặt allow_registration)
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_allow jsonb;
begin
  select value into v_allow from public.site_settings where key = 'allow_registration';
  if v_allow is not null and v_allow = 'false'::jsonb then
    raise exception 'Hệ thống đang tạm đóng đăng ký' using errcode = '42501';
  end if;

  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Bảo vệ cột nhạy cảm của profiles + chuẩn hoá username + updated_at
-- ---------------------------------------------------------------------
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is not null then
    new.username := lower(trim(new.username));
    if new.username = '' then new.username := null; end if;
  end if;

  -- auth.uid() null = gọi từ service_role / SQL editor -> cho phép
  if auth.uid() is not null and not public.is_admin() then
    if new.id is distinct from old.id
       or new.role is distinct from old.role
       or new.status is distinct from old.status then
      raise exception 'Bạn không có quyền thay đổi trường này' using errcode = '42501';
    end if;

    if new.username is distinct from old.username
       and new.username is not null
       and exists (select 1 from public.reserved_usernames r where r.username = new.username) then
      raise exception 'Tên người dùng "%" không được phép sử dụng', new.username using errcode = '23514';
    end if;
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_protect_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- ---------------------------------------------------------------------
-- Kiểm tra username còn trống (dùng cho form đăng ký / chỉnh sửa)
-- ---------------------------------------------------------------------
create or replace function public.is_username_available(p_username text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_name text := lower(trim(p_username));
begin
  if v_name is null or v_name !~ '^[a-z0-9_.]{3,30}$' then
    return false;
  end if;
  if exists (select 1 from public.reserved_usernames where username = v_name) then
    return false;
  end if;
  return not exists (
    select 1 from public.profiles
    where username = v_name and id is distinct from auth.uid()
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Sinh mã thẻ ngẫu nhiên (bỏ ký tự dễ nhầm: 0 O 1 I)
-- ---------------------------------------------------------------------
create or replace function public.generate_card_code(p_len int default 8)
returns text
language plpgsql
volatile
set search_path = ''
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- 32 ký tự
  bytes  bytea := extensions.gen_random_bytes(p_len);
  result text := '';
  i      int;
begin
  for i in 0 .. p_len - 1 loop
    result := result || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------
-- ADMIN: tạo hàng loạt thẻ NFC
-- ---------------------------------------------------------------------
create or replace function public.admin_generate_cards(
  p_count     int,
  p_batch_id  text default null,
  p_card_type text default 'plastic'
)
returns setof public.nfc_cards
language plpgsql
security definer
set search_path = ''
as $$
declare
  i      int := 0;
  v_row  public.nfc_cards;
begin
  if not public.is_admin() then
    raise exception 'Không có quyền' using errcode = '42501';
  end if;
  if p_count is null or p_count < 1 or p_count > 1000 then
    raise exception 'Số lượng phải từ 1 đến 1000';
  end if;

  while i < p_count loop
    insert into public.nfc_cards (code, batch_id, card_type)
    values (public.generate_card_code(8), p_batch_id, coalesce(p_card_type, 'plastic'))
    on conflict (code) do nothing
    returning * into v_row;

    if found then
      i := i + 1;
      return next v_row;
    end if;
  end loop;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details)
  values (auth.uid(), 'generate_cards', 'nfc_cards', p_batch_id,
          jsonb_build_object('count', p_count, 'card_type', p_card_type));
end;
$$;

-- ---------------------------------------------------------------------
-- PUBLIC: phân giải mã thẻ khi quét (route /c/[code]) + ghi lượt quét
-- ---------------------------------------------------------------------
create or replace function public.resolve_card(
  p_code       text,
  p_source     text default 'nfc',
  p_device     text default null,
  p_user_agent text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_card    public.nfc_cards;
  v_profile public.profiles;
begin
  select * into v_card from public.nfc_cards where code = upper(trim(p_code));
  if not found then
    return jsonb_build_object('status', 'not_found');
  end if;

  if v_card.status = 'unassigned' then
    return jsonb_build_object('status', 'unassigned', 'code', v_card.code);
  end if;

  if v_card.status in ('locked', 'lost') then
    return jsonb_build_object('status', v_card.status);
  end if;

  select * into v_profile from public.profiles where id = v_card.profile_id;
  if not found or v_profile.status <> 'active' or not v_profile.is_public or v_profile.username is null then
    return jsonb_build_object('status', 'profile_unavailable');
  end if;

  insert into public.page_views (profile_id, card_id, source, device, user_agent)
  values (
    v_profile.id, v_card.id,
    case when p_source in ('nfc', 'qr') then p_source else 'nfc' end,
    left(p_device, 20), left(p_user_agent, 500)
  );

  return jsonb_build_object('status', 'active', 'username', v_profile.username);
end;
$$;

-- ---------------------------------------------------------------------
-- PUBLIC: ghi lượt xem trang trực tiếp (/u/[username])
-- ---------------------------------------------------------------------
create or replace function public.log_profile_view(
  p_username   text,
  p_source     text default 'direct',
  p_device     text default null,
  p_user_agent text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
begin
  select id into v_id from public.profiles
  where username = lower(trim(p_username)) and is_public and status = 'active';
  if v_id is null then return; end if;

  insert into public.page_views (profile_id, source, device, user_agent)
  values (
    v_id,
    case when p_source in ('nfc', 'qr', 'direct') then p_source else 'direct' end,
    left(p_device, 20), left(p_user_agent, 500)
  );
end;
$$;

-- ---------------------------------------------------------------------
-- PUBLIC: ghi lượt bấm liên kết
-- ---------------------------------------------------------------------
create or replace function public.log_link_click(p_link_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
begin
  select l.profile_id into v_profile_id
  from public.links l
  join public.profiles p on p.id = l.profile_id
  where l.id = p_link_id and l.is_active and p.is_public and p.status = 'active';
  if v_profile_id is null then return; end if;

  insert into public.link_clicks (link_id, profile_id) values (p_link_id, v_profile_id);
end;
$$;

-- ---------------------------------------------------------------------
-- USER: kích hoạt thẻ (gắn thẻ chưa sở hữu vào tài khoản hiện tại)
-- ---------------------------------------------------------------------
create or replace function public.activate_card(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_card public.nfc_cards;
begin
  if v_uid is null then
    raise exception 'Bạn cần đăng nhập' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles where id = v_uid and status = 'banned') then
    raise exception 'Tài khoản của bạn đã bị khóa' using errcode = '42501';
  end if;

  select * into v_card from public.nfc_cards where code = upper(trim(p_code)) for update;
  if not found then
    raise exception 'Mã thẻ không tồn tại';
  end if;

  if v_card.profile_id = v_uid then
    return jsonb_build_object('status', 'already_yours', 'card_id', v_card.id);
  end if;

  if v_card.status <> 'unassigned' or v_card.profile_id is not null then
    raise exception 'Thẻ đã được kích hoạt bởi người khác hoặc đang bị khóa';
  end if;

  update public.nfc_cards
  set profile_id = v_uid, status = 'active', activated_at = now()
  where id = v_card.id;

  return jsonb_build_object('status', 'activated', 'card_id', v_card.id);
end;
$$;

-- ---------------------------------------------------------------------
-- USER: báo mất / mở lại thẻ của mình (trạng thái 'locked' chỉ admin đặt)
-- ---------------------------------------------------------------------
create or replace function public.set_my_card_status(p_card_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Bạn cần đăng nhập' using errcode = '42501';
  end if;
  if p_status not in ('active', 'lost') then
    raise exception 'Trạng thái không hợp lệ';
  end if;

  update public.nfc_cards
  set status = p_status
  where id = p_card_id
    and profile_id = auth.uid()
    and status in ('active', 'lost');

  if not found then
    raise exception 'Không tìm thấy thẻ hoặc thẻ đang bị admin khóa';
  end if;
end;
$$;

-- ---------------------------------------------------------------------
-- ADMIN: số liệu tổng quan cho dashboard
-- ---------------------------------------------------------------------
create or replace function public.admin_get_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Không có quyền' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total_users',      (select count(*) from public.profiles),
    'new_users_today',  (select count(*) from public.profiles where created_at >= date_trunc('day', now())),
    'new_users_7d',     (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'banned_users',     (select count(*) from public.profiles where status = 'banned'),
    'total_cards',      (select count(*) from public.nfc_cards),
    'active_cards',     (select count(*) from public.nfc_cards where status = 'active'),
    'unassigned_cards', (select count(*) from public.nfc_cards where status = 'unassigned'),
    'locked_cards',     (select count(*) from public.nfc_cards where status in ('locked', 'lost')),
    'total_views',      (select count(*) from public.page_views),
    'views_today',      (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
    'pending_reports',  (select count(*) from public.reports where status = 'pending')
  );
end;
$$;

-- ---------------------------------------------------------------------
-- Audit log: tự ghi lại thay đổi do admin thực hiện
-- ---------------------------------------------------------------------
create or replace function public.audit_admin_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not public.is_admin() then
    return coalesce(new, old);
  end if;

  -- Admin tự sửa trang của chính mình thì không cần log
  if tg_table_name = 'profiles' and tg_op = 'UPDATE' and new.id = v_uid then
    return new;
  end if;

  insert into public.admin_logs (admin_id, action, target_type, target_id, details)
  values (
    v_uid,
    lower(tg_op),
    tg_table_name,
    (case when tg_op = 'DELETE' then old.id else new.id end)::text,
    jsonb_build_object(
      'old', case when tg_op <> 'INSERT' then to_jsonb(old) end,
      'new', case when tg_op <> 'DELETE' then to_jsonb(new) end
    )
  );
  return coalesce(new, old);
end;
$$;

create trigger profiles_audit
  after update or delete on public.profiles
  for each row execute function public.audit_admin_changes();

create trigger nfc_cards_audit
  after update or delete on public.nfc_cards
  for each row execute function public.audit_admin_changes();

-- ---------------------------------------------------------------------
-- updated_at cho site_settings
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Phân quyền EXECUTE
-- ---------------------------------------------------------------------
revoke execute on function public.handle_new_user()        from public, anon, authenticated;
revoke execute on function public.protect_profile_fields() from public, anon, authenticated;
revoke execute on function public.audit_admin_changes()    from public, anon, authenticated;
revoke execute on function public.set_updated_at()         from public, anon, authenticated;
revoke execute on function public.generate_card_code(int)  from public, anon, authenticated;

revoke execute on function public.admin_generate_cards(int, text, text) from public, anon;
revoke execute on function public.admin_get_overview()                  from public, anon;
revoke execute on function public.activate_card(text)                   from public, anon;
revoke execute on function public.set_my_card_status(uuid, text)        from public, anon;
grant  execute on function public.admin_generate_cards(int, text, text) to authenticated;
grant  execute on function public.admin_get_overview()                  to authenticated;
grant  execute on function public.activate_card(text)                   to authenticated;
grant  execute on function public.set_my_card_status(uuid, text)        to authenticated;

grant execute on function public.is_admin()                                  to anon, authenticated;
grant execute on function public.is_username_available(text)                to anon, authenticated;
grant execute on function public.resolve_card(text, text, text, text)        to anon, authenticated;
grant execute on function public.log_profile_view(text, text, text, text)    to anon, authenticated;
grant execute on function public.log_link_click(uuid)                        to anon, authenticated;
