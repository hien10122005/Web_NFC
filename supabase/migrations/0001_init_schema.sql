-- =====================================================================
-- 0001_init_schema.sql — Tạo các bảng chính cho hệ thống Trang cá nhân NFC
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- profiles: hồ sơ / trang cá nhân (1-1 với auth.users)
-- ---------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique,
  full_name     text,
  job_title     text,
  organization  text,
  bio           text,
  phone         text,
  email_public  text,
  address       text,
  avatar_url    text,
  cover_url     text,
  theme         jsonb not null default '{}'::jsonb,
  bank_info     jsonb,
  visibility    jsonb not null default '{}'::jsonb,
  is_public     boolean not null default true,
  role          text not null default 'user'   check (role in ('user', 'moderator', 'admin')),
  status        text not null default 'active' check (status in ('active', 'banned')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint profiles_username_format check (username is null or username ~ '^[a-z0-9_.]{3,30}$'),
  constraint profiles_bio_length      check (bio is null or char_length(bio) <= 1000)
);
comment on table public.profiles is 'Hồ sơ / trang cá nhân của người dùng';

-- ---------------------------------------------------------------------
-- links: liên kết mạng xã hội / website trên trang cá nhân
-- ---------------------------------------------------------------------
create table public.links (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  platform    text not null default 'custom',
  title       text,
  url         text not null,
  position    int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint links_url_length check (char_length(url) <= 2048)
);
create index links_profile_id_idx on public.links(profile_id, position);

-- ---------------------------------------------------------------------
-- nfc_cards: thẻ NFC vật lý. code được ghi vào thẻ: https://domain/c/{code}
-- ---------------------------------------------------------------------
create table public.nfc_cards (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  profile_id    uuid references public.profiles(id) on delete set null,
  batch_id      text,
  card_type     text not null default 'plastic',
  status        text not null default 'unassigned'
                check (status in ('unassigned', 'active', 'locked', 'lost')),
  note          text,
  activated_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index nfc_cards_profile_id_idx on public.nfc_cards(profile_id);
create index nfc_cards_batch_id_idx   on public.nfc_cards(batch_id);

-- ---------------------------------------------------------------------
-- page_views: lượt xem trang / lượt quét thẻ
-- ---------------------------------------------------------------------
create table public.page_views (
  id          bigint generated always as identity primary key,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  card_id     uuid references public.nfc_cards(id) on delete set null,
  source      text not null default 'direct' check (source in ('nfc', 'qr', 'direct')),
  device      text,
  user_agent  text,
  country     text,
  city        text,
  created_at  timestamptz not null default now()
);
create index page_views_profile_created_idx on public.page_views(profile_id, created_at desc);
create index page_views_card_id_idx         on public.page_views(card_id);

-- ---------------------------------------------------------------------
-- link_clicks: lượt bấm vào liên kết
-- ---------------------------------------------------------------------
create table public.link_clicks (
  id          bigint generated always as identity primary key,
  link_id     uuid not null references public.links(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index link_clicks_link_id_idx         on public.link_clicks(link_id);
create index link_clicks_profile_created_idx on public.link_clicks(profile_id, created_at desc);

-- ---------------------------------------------------------------------
-- leads: khách để lại thông tin liên hệ cho chủ trang
-- ---------------------------------------------------------------------
create table public.leads (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 100),
  phone       text check (phone is null or char_length(phone) <= 30),
  email       text check (email is null or char_length(email) <= 255),
  note        text check (note  is null or char_length(note)  <= 1000),
  created_at  timestamptz not null default now()
);
create index leads_profile_created_idx on public.leads(profile_id, created_at desc);

-- ---------------------------------------------------------------------
-- reports: báo cáo trang vi phạm
-- ---------------------------------------------------------------------
create table public.reports (
  id              uuid primary key default gen_random_uuid(),
  profile_id      uuid not null references public.profiles(id) on delete cascade,
  reason          text not null check (char_length(reason) between 1 and 1000),
  reporter_email  text check (reporter_email is null or char_length(reporter_email) <= 255),
  status          text not null default 'pending' check (status in ('pending', 'resolved', 'rejected')),
  resolved_by     uuid references public.profiles(id) on delete set null,
  resolved_at     timestamptz,
  created_at      timestamptz not null default now()
);
create index reports_profile_id_idx  on public.reports(profile_id);
create index reports_status_idx      on public.reports(status, created_at desc);
create index reports_resolved_by_idx on public.reports(resolved_by);

-- ---------------------------------------------------------------------
-- reserved_usernames: username bị cấm / giữ chỗ
-- ---------------------------------------------------------------------
create table public.reserved_usernames (
  username    text primary key,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- social_platforms: danh mục nền tảng mạng xã hội (admin quản lý)
-- ---------------------------------------------------------------------
create table public.social_platforms (
  key         text primary key,
  name        text not null,
  icon        text,
  url_prefix  text,
  position    int not null default 0,
  is_active   boolean not null default true
);

-- ---------------------------------------------------------------------
-- site_settings: cấu hình hệ thống dạng key/value
-- ---------------------------------------------------------------------
create table public.site_settings (
  key         text primary key,
  value       jsonb not null,
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- admin_logs: nhật ký thao tác của admin
-- ---------------------------------------------------------------------
create table public.admin_logs (
  id           bigint generated always as identity primary key,
  admin_id     uuid references public.profiles(id) on delete set null,
  action       text not null,
  target_type  text,
  target_id    text,
  details      jsonb,
  created_at   timestamptz not null default now()
);
create index admin_logs_admin_id_idx on public.admin_logs(admin_id);
create index admin_logs_created_idx  on public.admin_logs(created_at desc);
