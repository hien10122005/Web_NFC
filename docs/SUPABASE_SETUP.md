# ⚙️ Cấu hình Supabase — Trang Cá Nhân NFC

| Thông tin | Giá trị |
|---|---|
| Tên dự án | `trang-ca-nhan-nfc` |
| Project ref | `cjylwtgwmnbmmoqwdikp` |
| Khu vực | `ap-southeast-1` (Singapore) |
| API URL | https://cjylwtgwmnbmmoqwdikp.supabase.co |
| Dashboard | https://supabase.com/dashboard/project/cjylwtgwmnbmmoqwdikp |

## 1. Các migration đã áp dụng (thư mục `supabase/migrations`)
| File | Nội dung |
|---|---|
| `0001_init_schema.sql` | 11 bảng: profiles, links, nfc_cards, page_views, link_clicks, leads, reports, reserved_usernames, social_platforms, site_settings, admin_logs |
| `0002_functions_triggers.sql` | Hàm nghiệp vụ, trigger tự tạo profile, bảo vệ cột role/status, audit log |
| `0003_rls_policies.sql` | Bật RLS + 25 policy phân quyền khách / user / admin |
| `0004_storage.sql` | Bucket `avatars` (2MB) & `covers` (5MB), mỗi user chỉ ghi vào thư mục `{user_id}/` |
| `0005_seed_data.sql` | Cấu hình mặc định, 14 nền tảng MXH, 38 username cấm |
| `0006_revoke_is_admin_from_anon.sql` | Siết quyền gọi hàm `is_admin` |
| `0007_delete_my_account.sql` | Người dùng tự xóa tài khoản của chính mình (xóa storage, nfc_cards, auth.users) |

## 2. Các hàm RPC để frontend gọi
| Hàm | Ai gọi | Mục đích |
|---|---|---|
| `resolve_card(p_code, p_source, p_device, p_user_agent)` | Khách | Route `/c/[code]`: trả `{status, username}` và ghi lượt quét |
| `log_profile_view(p_username, p_source, p_device, p_user_agent)` | Khách | Ghi lượt xem `/u/[username]` |
| `log_link_click(p_link_id)` | Khách | Ghi lượt bấm liên kết |
| `is_username_available(p_username)` | Tất cả | Kiểm tra username còn trống |
| `activate_card(p_code)` | User | Gắn thẻ chưa kích hoạt vào tài khoản |
| `set_my_card_status(p_card_id, p_status)` | User | Báo mất (`lost`) / mở lại (`active`) thẻ |
| `delete_my_account()` | User | Xóa tài khoản, dọn storage và đưa thẻ về unassigned |
| `admin_generate_cards(p_count, p_batch_id, p_card_type)` | Admin | Tạo hàng loạt mã thẻ (tối đa 1000/lần) |
| `admin_get_overview()` | Admin | Số liệu tổng quan cho dashboard |
| `is_admin()` | User | Kiểm tra quyền admin |

Giá trị `status` mà `resolve_card` trả về: `active` | `unassigned` | `locked` | `lost` | `not_found` | `profile_unavailable`.

## 3. ⚠️ Những việc bạn cần tự làm trên Dashboard (MCP không cấu hình được)

### 3.1 Auth → URL Configuration
- **Site URL:** `http://localhost:3000` (đổi thành tên miền thật khi deploy)
- **Redirect URLs:** `http://localhost:3000/**`, `https://<ten-mien>/**`

### 3.2 Auth → Providers
- **Email:** bật "Confirm email"
- **Google:** tạo OAuth Client trên Google Cloud Console → dán Client ID / Secret.
  Callback URL: `https://cjylwtgwmnbmmoqwdikp.supabase.co/auth/v1/callback`

### 3.3 Auth → SMTP (khuyến nghị trước khi chạy thật)
SMTP mặc định của Supabase chỉ gửi được vài email/giờ. Nên dùng Resend / Brevo / Gmail SMTP.

### 3.4 Tạo tài khoản ADMIN đầu tiên
1. Đăng ký tài khoản bình thường trên web (hoặc Auth → Users → Add user).
2. Vào **SQL Editor**, chạy:
```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'email-cua-ban@gmail.com');
```

## 4. Ghi chú
- Đóng/mở đăng ký: `update public.site_settings set value = 'false' where key = 'allow_registration';`
- Người dùng **không** thể tự sửa `role`/`status` (trigger chặn). Admin sửa sẽ tự ghi vào `admin_logs`.
- Kiểu TypeScript đã sinh ở `src/types/database.types.ts`. Khi đổi schema thì sinh lại.
- `.env.local` chứa URL + publishable key (khóa công khai, an toàn cho frontend). **Không** commit file này.
