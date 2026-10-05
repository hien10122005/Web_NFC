-- =====================================================================
-- 0005_seed_data.sql — Dữ liệu mặc định
-- =====================================================================

insert into public.site_settings (key, value) values
  ('allow_registration', 'true'::jsonb),
  ('site_name',          '"Trang Cá Nhân NFC"'::jsonb),
  ('max_links_per_user', '30'::jsonb),
  ('announcement',       'null'::jsonb)
on conflict (key) do nothing;

insert into public.social_platforms (key, name, icon, url_prefix, position) values
  ('phone',     'Điện thoại', 'phone',     'tel:',                       1),
  ('email',     'Email',      'mail',      'mailto:',                    2),
  ('zalo',      'Zalo',       'zalo',      'https://zalo.me/',           3),
  ('facebook',  'Facebook',   'facebook',  'https://facebook.com/',      4),
  ('messenger', 'Messenger',  'messenger', 'https://m.me/',              5),
  ('tiktok',    'TikTok',     'tiktok',    'https://tiktok.com/@',       6),
  ('instagram', 'Instagram',  'instagram', 'https://instagram.com/',     7),
  ('youtube',   'YouTube',    'youtube',   'https://youtube.com/@',      8),
  ('linkedin',  'LinkedIn',   'linkedin',  'https://linkedin.com/in/',   9),
  ('github',    'GitHub',     'github',    'https://github.com/',        10),
  ('x',         'X (Twitter)','x',         'https://x.com/',             11),
  ('telegram',  'Telegram',   'telegram',  'https://t.me/',              12),
  ('website',   'Website',    'globe',     null,                         13),
  ('custom',    'Liên kết khác','link',    null,                         99)
on conflict (key) do nothing;

insert into public.reserved_usernames (username) values
  ('admin'), ('administrator'), ('root'), ('system'), ('support'), ('help'),
  ('api'), ('app'), ('www'), ('mail'), ('dashboard'), ('login'), ('logout'),
  ('register'), ('signup'), ('signin'), ('auth'), ('settings'), ('profile'),
  ('account'), ('user'), ('users'), ('u'), ('c'), ('card'), ('cards'),
  ('nfc'), ('about'), ('contact'), ('terms'), ('privacy'), ('static'),
  ('assets'), ('public'), ('null'), ('undefined'), ('moderator'), ('staff')
on conflict (username) do nothing;
