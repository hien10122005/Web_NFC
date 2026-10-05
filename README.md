# Web_NFC — Trang Cá Nhân NFC

Hệ thống quản lý trang hồ sơ cá nhân và danh thiếp thông minh NFC / QR Code.

Người dùng quét thẻ NFC hoặc mã QR (`/c/[code]`) sẽ được chuyển hướng tự động đến trang cá nhân của chủ thẻ (`/u/[username]`). Người dùng có thể đăng ký tài khoản, tự thiết kế trang cá nhân, gắn thẻ NFC và quản trị viên quản lý toàn bộ hệ thống.

---

## 🛠 Công nghệ sử dụng

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/) + **TypeScript** (Strict mode)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Backend:** [Supabase](https://supabase.com/) (Auth, PostgreSQL, Storage, Row-Level Security, RPC Functions)
- **Kéo thả liên kết:** `@dnd-kit/core`, `@dnd-kit/sortable`
- **Mã QR:** `qrcode` (Hỗ trợ tải PNG HD và SVG in ấn)
- **Biểu đồ:** `recharts`
- **Xác thực dữ liệu:** `zod` + `react-hook-form`

---

## 🚀 Cài đặt & Khởi chạy

### 1. Cài đặt thư viện
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc với nội dung:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt.

### 4. Kiểm tra Build & Lint
```bash
npm run lint
npm run build
```

---

## 📂 Cấu trúc thư mục

```
src/
├── app/
│   ├── (public)/          # Landing page (/), trang công khai (/u/[username]), điểm quét (/c/[code])
│   ├── (auth)/            # Đăng nhập, đăng ký, quên mật khẩu
│   ├── auth/callback/     # Callback PKCE xác thực OAuth / Email
│   ├── dashboard/         # Khu vực người dùng (Hồ sơ, Liên kết, Giao diện, Thẻ NFC, Cài đặt)
│   └── admin/             # Khu vực quản trị viên
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── profile/           # Hiển thị hồ sơ công khai & live preview
│   └── dashboard/         # Các form quản lý và kéo thả
├── actions/               # Server Actions ("use server")
├── lib/
│   ├── supabase/          # Supabase client (client, server, middleware)
│   ├── validations/       # Zod schemas
│   └── auth.ts            # Helpers xác thực
└── types/
    ├── database.types.ts  # Types sinh từ Supabase
    └── theme.ts           # Types giao diện & theme presets
supabase/
└── migrations/            # SQL migrations
```

---

## 📄 Bản quyền & Giấy phép

Dự án phát triển bởi nhóm Trang Cá Nhân NFC.
