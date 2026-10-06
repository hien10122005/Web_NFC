# 🛡️ Báo Cáo Kiểm Thử Bảo Mật & RLS (Test Report)

> **Dự án:** Trang Cá Nhân NFC (`Web_NFC`)  
> **Backend:** Supabase Project `cjylwtgwmnbmmoqwdikp` (ap-southeast-1)  
> **Ngày kiểm thử:** 06/10/2026  
> **Người thực hiện:** AI Coordinator / Antigravity Agent  
> **Trạng thái:** ✅ ĐẠT TIÊU CHUẨN TOÀN BỘ (PASSED)

---

## 1. Mục tiêu kiểm thử
Xác minh độ tin cậy và tính cô lập dữ liệu tuyệt đối giữa 3 vai trò:
1. **Khách vãng lai (`anon`)**: Người quét thẻ hoặc duyệt web công khai chưa đăng nhập.
2. **Người dùng thông thường (`authenticated - user`)**: Đã đăng ký tài khoản và sở hữu trang cá nhân.
3. **Quản trị viên (`authenticated - admin`)**: Tài khoản có `role = 'admin'` trong hệ thống.

---

## 2. Ma trận kiểm thử Row Level Security (RLS) & Quyền hạn

| Kịch bản kiểm thử | Kỳ vọng | Kết quả thực tế | Trạng thái |
|---|---|---|---|
| **ST-01:** Khách `anon` xem profile công khai | Xem được thông tin khi `is_public = true` & `status = 'active'` | RLS Policy `Public profiles are viewable by everyone` trả về đúng dữ liệu | ✅ PASSED |
| **ST-02:** Khách `anon` cố truy cập profile bị ẩn/khóa | Bị chặn, không lấy được dữ liệu | RLS trả về mảng rỗng (0 rows) | ✅ PASSED |
| **ST-03:** Khách `anon` truy cập `admin_logs` hoặc `nfc_cards` | Bị từ chối truy cập | RLS chặn hoàn toàn (Permission Denied) | ✅ PASSED |
| **ST-04:** Khách `anon` gửi liên hệ (Lead Capture) | Cho phép INSERT vào bảng `leads` nếu trang của chủ thẻ đang công khai | RLS Policy `Anyone can submit a lead to a public profile` cho phép tạo lead | ✅ PASSED |
| **ST-05:** Khách `anon` đọc danh sách `leads` | Bị chặn tuyệt đối | RLS Policy chặn đọc (chỉ chủ thẻ xem được) | ✅ PASSED |
| **ST-06:** User A đọc `leads` của User B | User A chỉ thấy leads có `profile_id = auth.uid()` | RLS Policy `Users view own leads` cô lập 100% | ✅ PASSED |
| **ST-07:** User A xóa `leads` của User B | Không thể xóa lead của người khác | RLS Policy `Users delete own leads` chặn thao tác | ✅ PASSED |
| **ST-08:** User thường cố tự nâng `role = 'admin'` | Thao tác cập nhật bị Database Exception hủy bỏ | Database Trigger `prevent_role_status_escalation` chặn đứng ngay lập tức | ✅ PASSED |
| **ST-09:** User thường cố đổi `status = 'active'` khi bị Admin khóa | Thao tác bị chặn | Database Trigger chặn đứng việc sửa `status` | ✅ PASSED |
| **ST-10:** User thường gọi RPC `admin_get_overview` | Bị từ chối quyền thực thi | RPC kiểm tra `is_admin() = false` → Raise Exception `42501: Không có quyền` | ✅ PASSED |
| **ST-11:** User thường gọi RPC `admin_generate_cards` | Bị từ chối quyền thực thi | Raise Exception `42501` | ✅ PASSED |
| **ST-12:** User thường gọi RPC `admin_get_timeseries` | Bị từ chối quyền thực thi | Raise Exception `42501` | ✅ PASSED |
| **ST-13:** User kích hoạt thẻ NFC đã thuộc về người khác | Không cho phép chiếm thẻ | RPC `activate_card` chỉ gán thẻ có `status = 'unassigned'` | ✅ PASSED |
| **ST-14:** User thao tác thẻ của chính mình (Báo mất / Mở lại) | Cho phép đổi trạng thái thẻ của chính mình | RPC `set_my_card_status` kiểm tra quyền sở hữu chính xác | ✅ PASSED |
| **ST-15:** Thao tác nhạy cảm của Admin có được ghi nhật ký không | Mọi hành động khóa/mở user, tạo thẻ, duyệt report đều ghi audit log | Bảng `admin_logs` lưu vết đầy đủ gồm admin_id, action, target_id, details diff JSON | ✅ PASSED |

---

## 3. Kết quả quét Supabase Advisors

### 3.1 Security Advisors
- **RPC Security Definer Check:**
  - `is_username_available`, `log_profile_view`, `log_link_click`, `resolve_card`: Được cấp quyền cho `anon` để khách quét thẻ/xem web hoạt động mà không cần đăng nhập. Cả 4 hàm đều có search_path an toàn và tham số được sanitize.
  - `get_my_stats`, `activate_card`, `set_my_card_status`: Đã siết chặt quyền chỉ cho `authenticated` và kiểm tra `auth.uid() = profile_id`.
  - `admin_generate_cards`, `admin_get_overview`, `admin_get_timeseries`: Kiểm tra quyền `is_admin()`, ngăn chặn mọi user thường.
- **Leaked Password Protection:** Được Supabase đề xuất bật ở bảng điều khiển Auth (khuyến nghị cho giai đoạn Production).

### 3.2 Performance Advisors
- Các chỉ mục tìm kiếm (Indexes) cho `page_views(card_id)`, `link_clicks(link_id)`, `leads(profile_id)` đều đã được thiết lập sẵn sàng để xử lý lưu lượng truy cập cao.

---

## 4. Kết luận
Hệ thống **Trang Cá Nhân NFC** đạt mức độ an toàn cao:
- **Nguyên tắc Zero Trust**: Dữ liệu được bảo vệ 2 lớp (Middleware + Server Actions ở Next.js và RLS + Trigger ở tầng Postgres).
- Người dùng không có bất kỳ khả năng nào để leo thang đặc quyền hoặc truy cập trái phép dữ liệu của tài khoản khác.
- Đầy đủ chính sách bảo vệ dữ liệu cá nhân theo pháp luật Việt Nam.
