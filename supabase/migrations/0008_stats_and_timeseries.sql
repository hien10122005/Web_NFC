-- =====================================================================
-- 0008_stats_and_timeseries.sql — RPC thống kê cho Dashboard User & Admin
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USER: Lấy thống kê trang cá nhân của chính mình (get_my_stats)
-- ---------------------------------------------------------------------
create or replace function public.get_my_stats(p_days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid       uuid := auth.uid();
  v_days      int  := greatest(1, least(coalesce(p_days, 30), 365));
  v_since     timestamptz := date_trunc('day', now()) - ((v_days - 1) || ' days')::interval;
  v_result    jsonb;
begin
  if v_uid is null then
    raise exception 'Bạn cần đăng nhập' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days', v_days,
    'summary', (
      select jsonb_build_object(
        'total_views', coalesce(count(v.id), 0),
        'views_today', coalesce(count(v.id) filter (where v.created_at >= date_trunc('day', now())), 0),
        'total_clicks', (
          select coalesce(count(c.id), 0)
          from public.link_clicks c
          where c.profile_id = v_uid and c.created_at >= v_since
        ),
        'clicks_today', (
          select coalesce(count(c.id), 0)
          from public.link_clicks c
          where c.profile_id = v_uid and c.created_at >= date_trunc('day', now())
        ),
        'ctr', (
          select round(
            coalesce(
              (count(c.id)::numeric / nullif(count(distinct v.id), 0)) * 100,
              0
            ),
            1
          )
          from public.page_views v
          left join public.link_clicks c on c.profile_id = v.profile_id and c.created_at >= v_since
          where v.profile_id = v_uid and v.created_at >= v_since
        )
      )
      from public.page_views v
      where v.profile_id = v_uid and v.created_at >= v_since
    ),

    'views_by_date', (
      with date_series as (
        select generate_series(
          v_since,
          date_trunc('day', now()),
          '1 day'::interval
        )::date as day_date
      ),
      view_counts as (
        select
          date_trunc('day', created_at)::date as day_date,
          count(*) as cnt
        from public.page_views
        where profile_id = v_uid and created_at >= v_since
        group by 1
      )
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'date', to_char(s.day_date, 'YYYY-MM-DD'),
            'label', to_char(s.day_date, 'DD/MM'),
            'views', coalesce(vc.cnt, 0)
          )
          order by s.day_date
        ),
        '[]'::jsonb
      )
      from date_series s
      left join view_counts vc on vc.day_date = s.day_date
    ),

    'views_by_source', (
      select jsonb_build_object(
        'nfc',    coalesce(count(*) filter (where source = 'nfc'), 0),
        'qr',     coalesce(count(*) filter (where source = 'qr'), 0),
        'direct', coalesce(count(*) filter (where source = 'direct'), 0)
      )
      from public.page_views
      where profile_id = v_uid and created_at >= v_since
    ),

    'views_by_device', (
      select jsonb_build_object(
        'mobile',  coalesce(count(*) filter (where lower(coalesce(device, '')) like '%mobile%' or lower(coalesce(device, '')) like '%android%' or lower(coalesce(device, '')) like '%iphone%'), 0),
        'desktop', coalesce(count(*) filter (where lower(coalesce(device, '')) like '%desktop%' or (device is not null and lower(device) not like '%mobile%' and lower(device) not like '%android%' and lower(device) not like '%iphone%')), 0),
        'other',   coalesce(count(*) filter (where device is null), 0)
      )
      from public.page_views
      where profile_id = v_uid and created_at >= v_since
    ),

    'top_links', (
      with click_counts as (
        select link_id, count(*) as clicks
        from public.link_clicks
        where profile_id = v_uid and created_at >= v_since
        group by link_id
      )
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', l.id,
            'title', l.title,
            'url', l.url,
            'platform', l.platform,
            'clicks', coalesce(cc.clicks, 0)
          )
          order by coalesce(cc.clicks, 0) desc, l.position asc
        ),
        '[]'::jsonb
      )
      from public.links l
      left join click_counts cc on cc.link_id = l.id
      where l.profile_id = v_uid and l.is_active
    )
  ) into v_result;

  return v_result;
end;
$$;

comment on function public.get_my_stats(int) is 'Lấy thống kê lượt xem, nguồn truy cập, thiết bị và click liên kết của chính người dùng đăng nhập';

revoke all on function public.get_my_stats(int) from public, anon;
grant execute on function public.get_my_stats(int) to authenticated;


-- ---------------------------------------------------------------------
-- 2. ADMIN: Thống kê chuỗi thời gian toàn hệ thống (admin_get_timeseries)
-- ---------------------------------------------------------------------
create or replace function public.admin_get_timeseries(p_days int default 30)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_days      int  := greatest(1, least(coalesce(p_days, 30), 365));
  v_since     timestamptz := date_trunc('day', now()) - ((v_days - 1) || ' days')::interval;
  v_result    jsonb;
begin
  if not public.is_admin() then
    raise exception 'Không có quyền' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'days', v_days,
    'timeline', (
      with date_series as (
        select generate_series(
          v_since,
          date_trunc('day', now()),
          '1 day'::interval
        )::date as day_date
      ),
      view_counts as (
        select date_trunc('day', created_at)::date as day_date, count(*) as cnt
        from public.page_views
        where created_at >= v_since
        group by 1
      ),
      user_counts as (
        select date_trunc('day', created_at)::date as day_date, count(*) as cnt
        from public.profiles
        where created_at >= v_since
        group by 1
      ),
      card_counts as (
        select date_trunc('day', activated_at)::date as day_date, count(*) as cnt
        from public.nfc_cards
        where activated_at >= v_since
        group by 1
      )
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'date', to_char(s.day_date, 'YYYY-MM-DD'),
            'label', to_char(s.day_date, 'DD/MM'),
            'views', coalesce(vc.cnt, 0),
            'users', coalesce(uc.cnt, 0),
            'cards', coalesce(cc.cnt, 0)
          )
          order by s.day_date
        ),
        '[]'::jsonb
      )
      from date_series s
      left join view_counts vc on vc.day_date = s.day_date
      left join user_counts uc on uc.day_date = s.day_date
      left join card_counts cc on cc.day_date = s.day_date
    ),

    'source_distribution', (
      select jsonb_build_object(
        'nfc',    coalesce(count(*) filter (where source = 'nfc'), 0),
        'qr',     coalesce(count(*) filter (where source = 'qr'), 0),
        'direct', coalesce(count(*) filter (where source = 'direct'), 0)
      )
      from public.page_views
      where created_at >= v_since
    ),

    'device_distribution', (
      select jsonb_build_object(
        'mobile',  coalesce(count(*) filter (where lower(coalesce(device, '')) like '%mobile%' or lower(coalesce(device, '')) like '%android%' or lower(coalesce(device, '')) like '%iphone%'), 0),
        'desktop', coalesce(count(*) filter (where lower(coalesce(device, '')) like '%desktop%' or (device is not null and lower(device) not like '%mobile%' and lower(device) not like '%android%' and lower(device) not like '%iphone%')), 0),
        'other',   coalesce(count(*) filter (where device is null), 0)
      )
      from public.page_views
      where created_at >= v_since
    )
  ) into v_result;

  return v_result;
end;
$$;

comment on function public.admin_get_timeseries(int) is 'Lấy dữ liệu chuỗi thời gian người dùng, lượt xem, thẻ kích hoạt toàn hệ thống cho Admin';

revoke all on function public.admin_get_timeseries(int) from public, anon;
grant execute on function public.admin_get_timeseries(int) to authenticated;
