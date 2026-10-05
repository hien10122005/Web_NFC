import { requireUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import {
  CreditCard,
  Eye,
  Link2,
  Sparkles,
  User,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Circle,
  TrendingUp,
  QrCode,
} from "lucide-react"

export default async function DashboardPage() {
  const { user, profile } = await requireUser()
  const supabase = await createClient()

  // 1. Thống kê lượt xem (page_views)
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // Tổng lượt xem
  const { count: totalViews } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)

  // Lượt xem hôm nay
  const { count: viewsToday } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .gte("created_at", todayStart)

  // Lượt xem 7 ngày qua
  const { count: views7Days } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .gte("created_at", sevenDaysAgo)

  // 2. Thống kê liên kết (links)
  const { count: linksCount } = await supabase
    .from("links")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("is_active", true)

  // 3. Thống kê thẻ NFC (nfc_cards)
  const { count: cardsCount } = await supabase
    .from("nfc_cards")
    .select("*", { count: "exact", head: true })
    .eq("profile_id", user.id)

  // 4. Checklist hoàn thiện hồ sơ
  const checks = [
    {
      id: "avatar",
      title: "Ảnh đại diện & Ảnh bìa",
      desc: "Tải ảnh đại diện để nhận diện thương hiệu cá nhân",
      done: Boolean(profile?.avatar_url),
      href: "/dashboard/profile",
    },
    {
      id: "info",
      title: "Chức danh & Giới thiệu",
      desc: "Thêm chức danh, đơn vị công tác và tiểu sử ngắn",
      done: Boolean(profile?.job_title && profile?.bio),
      href: "/dashboard/profile",
    },
    {
      id: "contact",
      title: "Thông tin liên hệ nhanh",
      desc: "Số điện thoại hoặc email công khai để người khác liên hệ",
      done: Boolean(profile?.phone || profile?.email_public),
      href: "/dashboard/profile",
    },
    {
      id: "links",
      title: "Thêm liên kết mạng xã hội",
      desc: "Tối thiểu 1 liên kết (Zalo, Facebook, TikTok...)",
      done: (linksCount ?? 0) > 0,
      href: "/dashboard/links",
    },
    {
      id: "card",
      title: "Kích hoạt thẻ NFC hoặc QR Code",
      desc: "Liên kết thẻ vật lý hoặc chia sẻ mã QR trang",
      done: (cardsCount ?? 0) > 0,
      href: "/dashboard/cards",
    },
  ]

  const completedCount = checks.filter((c) => c.done).length
  const progressPercent = Math.round((completedCount / checks.length) * 100)

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-6 border border-primary/20">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Xin chào, {profile?.full_name || "Bạn"}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Trang cá nhân NFC của bạn:{" "}
            <span className="font-mono font-medium text-foreground">
              /u/{profile?.username}
            </span>
          </p>
        </div>

        {profile?.username && (
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/u/${profile.username}`}
              target="_blank"
              className={buttonVariants({
                size: "sm",
                className: "font-semibold gap-1.5 shadow-sm",
              })}
            >
              <ExternalLink className="h-4 w-4" />
              <span>Xem trang thực tế</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tổng lượt xem */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Tổng lượt xem
            </CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Hôm nay: +{viewsToday ?? 0} lượt</p>
          </CardContent>
        </Card>

        {/* Lượt xem 7 ngày */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              7 ngày qua
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{views7Days ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt xem tuần này</p>
          </CardContent>
        </Card>

        {/* Liên kết hoạt động */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Liên kết
            </CardTitle>
            <Link2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linksCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Mục đang hiển thị</p>
          </CardContent>
        </Card>

        {/* Thẻ NFC */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Thẻ NFC
            </CardTitle>
            <CreditCard className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cardsCount ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Đã gắn vào tài khoản</p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Completion Checklist */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg font-bold">
                  Độ hoàn thiện hồ sơ ({progressPercent}%)
                </CardTitle>
              </div>
              <CardDescription className="mt-1">
                Hoàn thành các bước dưới đây để trang danh thiếp của bạn đạt hiệu quả kết nối cao nhất.
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary w-fit">
              Đã xong {completedCount}/{checks.length} bước
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {checks.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                item.done
                  ? "bg-card/50 border-border/40 hover:bg-muted/30"
                  : "bg-muted/20 border-primary/20 hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                {item.done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                )}
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      item.done ? "text-foreground line-through opacity-80" : "text-foreground"
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground shrink-0">
                <span>{item.done ? "Cập nhật" : "Thực hiện"}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Quick Action Navigation */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/dashboard/appearance"
          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent hover:border-primary/40 transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center font-bold">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Tùy biến giao diện</h4>
            <p className="text-xs text-muted-foreground">Màu sắc, kiểu nút & xem trước</p>
          </div>
        </Link>

        <Link
          href="/dashboard/cards"
          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent hover:border-primary/40 transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <QrCode className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Mã QR & Thẻ NFC</h4>
            <p className="text-xs text-muted-foreground">Tải mã QR và kích hoạt thẻ mới</p>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 p-4 rounded-xl border bg-card hover:bg-accent hover:border-primary/40 transition-all"
        >
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">Hồ sơ cá nhân</h4>
            <p className="text-xs text-muted-foreground">Thông tin & bật/tắt hiển thị</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
