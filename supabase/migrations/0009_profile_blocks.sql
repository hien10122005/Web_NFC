-- =====================================================================
-- 0009_profile_blocks.sql — Khối nội dung mở rộng (YouTube, Map, Text, Image)
-- =====================================================================

create table if conception_blocks_exists as null; -- placeholder check if needed
drop table if exists public.blocks cascade;

create table public.blocks (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('youtube', 'map', 'text', 'image')),
  title       text,
  content     jsonb not null default '{}'::jsonb,
  position    int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.blocks is 'Các khối nội dung mở rộng trên trang cá nhân (YouTube, Google Maps, Văn bản, Ảnh)';

-- Index tăng tốc truy vấn theo người dùng và thứ tự hiển thị
create index blocks_profile_position_idx on public.blocks(profile_id, position);

-- Bật RLS
alter table public.blocks enable row level security;

-- Policies
create policy "Active blocks of public profiles are viewable"
  on public.blocks for select to anon, authenticated
  using (
    is_active = true
    and exists (
      select 1 from public.profiles p
      where p.id = blocks.profile_id and p.is_public and p.status = 'active'
    )
  );

create policy "Users manage own blocks"
  on public.blocks for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Admins manage all blocks"
  on public.blocks for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));
