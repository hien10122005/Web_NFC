-- =====================================================================
-- 0003_rls_policies.sql — Row Level Security cho tất cả các bảng
-- =====================================================================

alter table public.profiles           enable row level security;
alter table public.links              enable row level security;
alter table public.nfc_cards          enable row level security;
alter table public.page_views         enable row level security;
alter table public.link_clicks        enable row level security;
alter table public.leads              enable row level security;
alter table public.reports            enable row level security;
alter table public.reserved_usernames enable row level security;
alter table public.social_platforms   enable row level security;
alter table public.site_settings      enable row level security;
alter table public.admin_logs         enable row level security;

-- ---------------- profiles ----------------
create policy "Public profiles are viewable by everyone"
  on public.profiles for select to anon, authenticated
  using (is_public and status = 'active' and username is not null);

create policy "Users can view own profile"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "Admins manage all profiles"
  on public.profiles for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- links ----------------
create policy "Active links of public profiles are viewable"
  on public.links for select to anon, authenticated
  using (
    is_active and exists (
      select 1 from public.profiles p
      where p.id = links.profile_id and p.is_public and p.status = 'active'
    )
  );

create policy "Users manage own links"
  on public.links for all to authenticated
  using (profile_id = (select auth.uid()))
  with check (profile_id = (select auth.uid()));

create policy "Admins manage all links"
  on public.links for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- nfc_cards ----------------
-- Người dùng chỉ được XEM thẻ của mình; thay đổi qua RPC activate_card / set_my_card_status
create policy "Users view own cards"
  on public.nfc_cards for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "Admins manage all cards"
  on public.nfc_cards for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- page_views (ghi qua RPC) ----------------
create policy "Users view own page views"
  on public.page_views for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "Admins view all page views"
  on public.page_views for select to authenticated
  using ((select public.is_admin()));

-- ---------------- link_clicks (ghi qua RPC) ----------------
create policy "Users view own link clicks"
  on public.link_clicks for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "Admins view all link clicks"
  on public.link_clicks for select to authenticated
  using ((select public.is_admin()));

-- ---------------- leads ----------------
create policy "Anyone can submit a lead to a public profile"
  on public.leads for insert to anon, authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = leads.profile_id and p.is_public and p.status = 'active'
    )
  );

create policy "Users view own leads"
  on public.leads for select to authenticated
  using (profile_id = (select auth.uid()));

create policy "Users delete own leads"
  on public.leads for delete to authenticated
  using (profile_id = (select auth.uid()));

create policy "Admins manage all leads"
  on public.leads for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- reports ----------------
create policy "Anyone can report a profile"
  on public.reports for insert to anon, authenticated
  with check (status = 'pending' and resolved_by is null and resolved_at is null);

create policy "Admins manage reports"
  on public.reports for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- reserved_usernames ----------------
create policy "Admins manage reserved usernames"
  on public.reserved_usernames for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- social_platforms ----------------
create policy "Everyone can view social platforms"
  on public.social_platforms for select to anon, authenticated
  using (true);

create policy "Admins manage social platforms"
  on public.social_platforms for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- site_settings ----------------
create policy "Everyone can view site settings"
  on public.site_settings for select to anon, authenticated
  using (true);

create policy "Admins manage site settings"
  on public.site_settings for all to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- ---------------- admin_logs (ghi qua trigger / function) ----------------
create policy "Admins view admin logs"
  on public.admin_logs for select to authenticated
  using ((select public.is_admin()));
