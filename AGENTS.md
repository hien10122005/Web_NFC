# 🤖 AGENTS.md — Hướng dẫn cho mọi AI Agent làm việc trong dự án này

> **ĐỌC FILE NÀY TRƯỚC KHI LÀM BẤT CỨ VIỆC GÌ.**
> Dự án: **Trang Cá Nhân NFC** — quét thẻ NFC/QR → mở trang cá nhân. Người dùng thật đăng ký & tự tạo trang, Admin quản lý toàn hệ thống.

---

## 1. Tài liệu bắt buộc phải đọc (theo thứ tự)
1. [`docs/ROADMAP.md`](docs/ROADMAP.md) — **Lộ trình & bảng phân công task** (nguồn sự thật duy nhất về tiến độ)
2. [`docs/DE_XUAT_TINH_NANG.md`](docs/DE_XUAT_TINH_NANG.md) — Đặc tả tính năng
3. [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) — Cấu hình backend, danh sách hàm RPC
4. [`src/types/database.types.ts`](src/types/database.types.ts) — Kiểu dữ liệu DB

## 2. Quy trình nhận & làm task

```
1. Mở docs/ROADMAP.md → tìm task có trạng thái ⬜ TODO mà mọi task phụ thuộc (Depends) đã ✅ DONE
2. Đổi trạng thái task sang 🟨 IN PROGRESS + ghi tên agent + ngày giờ vào cột "Agent"
3. Làm task — CHỈ sửa các file thuộc phạm vi task (xem cột "Phạm vi")
4. Tự kiểm tra theo "Tiêu chí hoàn thành" của task (chạy `npm run build` + `npm run lint` không lỗi)
5. Đổi trạng thái sang ✅ DONE, thêm 1 dòng vào mục "Nhật ký thay đổi" cuối ROADMAP.md
6. Nếu bị chặn → đổi sang 🟥 BLOCKED và ghi rõ lý do trong mục "Vấn đề cần điều phối"
```

**Quy tắc vàng:**
- ❌ Không nhận task đang 🟨 của agent khác.
- ❌ Không tự ý thay đổi kiến trúc, công nghệ, cấu trúc thư mục đã chốt. Muốn đổi → ghi đề xuất vào mục "Vấn đề cần điều phối" và chờ Điều phối viên duyệt.
- ❌ Không sửa file migration đã áp dụng (`supabase/migrations/0001..0006`). Thay đổi DB = **tạo migration mới** số tiếp theo.
- ✅ Mỗi task nhỏ, hoàn thành trọn vẹn rồi mới sang task khác.
- ✅ Giữ nguyên comment/tài liệu không liên quan đến thay đổi của bạn.

## 3. Công nghệ đã chốt (KHÔNG thay đổi)

| Thành phần | Công nghệ |
|---|---|
| Framework | **Next.js 15 (App Router)** + **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** + **shadcn/ui** |
| Backend | **Supabase** (Auth, Postgres, Storage) — project ref `cjylwtgwmnbmmoqwdikp` |
| Supabase client | `@supabase/supabase-js` + `@supabase/ssr` |
| Form | `react-hook-form` + `zod` |
| Icon | `lucide-react` |
| Biểu đồ | `recharts` |
| Kéo thả | `@dnd-kit/core` + `@dnd-kit/sortable` |
| QR | `qrcode` |
| Package manager | **npm** |
| Deploy | Vercel |

## 4. Cấu trúc thư mục chuẩn

```
src/
├─ app/
│  ├─ (public)/              # Landing page, trang công khai
│  │  ├─ page.tsx            # /
│  │  ├─ u/[username]/       # Trang cá nhân công khai
│  │  └─ c/[code]/           # Điểm vào từ thẻ NFC
│  ├─ (auth)/                # login, register, forgot-password, reset-password
│  ├─ auth/callback/         # OAuth / email confirm callback
│  ├─ dashboard/             # Khu vực người dùng (cần đăng nhập)
│  └─ admin/                 # Khu vực admin (cần role = admin)
├─ components/
│  ├─ ui/                    # shadcn/ui (sinh tự động — không sửa tay nhiều)
│  ├─ profile/               # Component trang cá nhân công khai
│  ├─ dashboard/             # Component dashboard người dùng
│  └─ admin/                 # Component admin
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts           # createBrowserClient
│  │  ├─ server.ts           # createServerClient (Server Components / Actions)
│  │  └─ middleware.ts       # refresh session
│  ├─ validations/           # zod schema
│  └─ utils.ts
├─ actions/                  # Server Actions ("use server")
├─ types/
│  └─ database.types.ts      # Sinh từ Supabase — KHÔNG sửa tay
└─ middleware.ts             # Bảo vệ /dashboard, /admin
supabase/migrations/         # SQL migration (đánh số tăng dần)
docs/                        # Tài liệu
```

## 5. Quy ước code
- **Ngôn ngữ giao diện:** Tiếng Việt. Code, tên biến, tên file: tiếng Anh.
- Tên file component: `kebab-case.tsx`; tên component: `PascalCase`.
- Ưu tiên **Server Components**; chỉ dùng `"use client"` khi cần tương tác.
- Ghi dữ liệu qua **Server Actions** trong `src/actions/`, validate bằng zod trước khi gọi Supabase.
- Luôn dùng kiểu `Database` từ `database.types.ts` khi tạo Supabase client.
- Gọi logic nghiệp vụ qua RPC đã có (`activate_card`, `resolve_card`, …) — **không** tự viết lại bằng query trực tiếp.
- Xử lý lỗi: hiển thị thông báo tiếng Việt thân thiện (dùng toast `sonner`).
- Mobile-first: trang công khai `/u/[username]` phải đẹp trên màn hình 375px.
- Commit message: `feat: ...`, `fix: ...`, `docs: ...`, `chore: ...` + mã task, ví dụ `feat(T2.3): trang chỉnh sửa hồ sơ`.

## 6. Bảo mật — BẮT BUỘC
- Chỉ dùng **publishable key** ở frontend. **Không bao giờ** dùng/commit `service_role` / secret key.
- Không commit `.env.local`.
- Kiểm tra quyền admin ở **cả** middleware **và** server (gọi RPC `is_admin()`); RLS là lớp bảo vệ cuối.
- Không tắt RLS, không thêm policy `using (true)` cho thao tác ghi.

## 7. Thay đổi Database
- Có quyền dùng **Supabase MCP** (`apply_migration`, `execute_sql`, `generate_typescript_types`, `get_advisors`).
- Quy trình: viết file `supabase/migrations/00XX_ten.sql` → áp dụng bằng `apply_migration` (cùng nội dung) → chạy `get_advisors` (security) → sinh lại `src/types/database.types.ts` → cập nhật `docs/SUPABASE_SETUP.md`.
- Thay đổi DB phải được ghi trong ROADMAP (task có nhãn `[DB]`).

## 8. Vai trò Điều phối viên (Coordinator)
Agent Điều phối viên chịu trách nhiệm: chia task, duyệt đề xuất thay đổi kiến trúc, giải quyết xung đột, cập nhật ROADMAP, review trước khi chuyển giai đoạn. Khi có nghi ngờ → **hỏi Điều phối viên / người dùng, không tự đoán.**
