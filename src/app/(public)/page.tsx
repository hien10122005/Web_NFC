import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Smartphone,
  QrCode,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Users,
  CreditCard,
  Download,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>
            <span>
              NFC<span className="text-primary font-black ml-0.5">Card</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">
              Tính năng
            </a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">
              Cách hoạt động
            </a>
            <a href="#benefits" className="hover:text-foreground transition-colors">
              Lợi ích
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              Đăng nhập
            </Link>
            <Link
              href="/register"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Đăng ký
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 items-center">
              {/* Left Column: Text & CTA */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left lg:col-span-7">
                <Badge variant="secondary" className="mb-4 px-3 py-1 gap-1.5 text-xs font-semibold rounded-full border border-border">
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  Công nghệ NFC & QR một chạm thế hệ mới
                </Badge>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Danh thiếp số thông minh cho thời đại số
                </h1>

                <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                  Thay thế hoàn toàn danh thiếp giấy truyền thống. Chỉ cần một chạm thẻ NFC hoặc quét mã QR là đối tác có thể lưu ngay danh bạ của bạn về điện thoại trong 1 giây mà không cần cài app.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                  <Link
                    href="/register"
                    className={buttonVariants({
                      variant: "default",
                      size: "lg",
                      className: "px-6 py-6 text-base font-semibold shadow-md",
                    })}
                  >
                    Bắt đầu miễn phí ngay
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Link
                    href="/login"
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "px-6 py-6 text-base font-semibold",
                    })}
                  >
                    Đăng nhập tài khoản
                  </Link>
                </div>

                {/* Social Proof / Micro Highlights */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground lg:justify-start">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Không cần cài ứng dụng</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Tương thích iOS & Android</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Lưu danh bạ vCard 1 chạm</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup */}
              <div className="flex justify-center lg:col-span-5">
                <div className="relative mx-auto w-full max-w-[320px] rounded-[40px] border-8 border-slate-900 bg-slate-950 p-3 shadow-2xl dark:border-slate-800">
                  {/* Phone Notch */}
                  <div className="absolute left-1/2 top-3 h-4 w-28 -translate-x-1/2 rounded-full bg-slate-900 dark:bg-slate-800" />

                  {/* Phone Screen */}
                  <div className="overflow-hidden rounded-[28px] bg-background text-foreground border border-border/40 p-4 pt-8">
                    {/* Mock Profile Card */}
                    <div className="text-center">
                      <div className="relative mx-auto h-20 w-20 overflow-hidden rounded-full border-2 border-primary/20 bg-gradient-to-tr from-primary/30 to-violet-500/30 p-1">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                          NV
                        </div>
                      </div>

                      <h3 className="mt-3 font-bold text-base">Nguyễn Văn An</h3>
                      <p className="text-xs text-primary font-medium">Trưởng phòng Kinh Doanh</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Công ty Công Nghệ NFC Việt</p>
                      <p className="mt-2 text-xs text-muted-foreground italic px-2">
                        &quot;Kết nối nhanh chóng, mở rộng mạng lưới kinh doanh.&quot;
                      </p>

                      {/* Quick Contact Buttons */}
                      <div className="mt-4 grid grid-cols-4 gap-2 px-1">
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted text-[10px]">
                          <Phone className="h-3.5 w-3.5 text-primary" />
                          <span>Gọi</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted text-[10px]">
                          <Mail className="h-3.5 w-3.5 text-primary" />
                          <span>Email</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted text-[10px]">
                          <QrCode className="h-3.5 w-3.5 text-primary" />
                          <span>QR</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-muted/60 text-muted-foreground hover:bg-muted text-[10px]">
                          <Share2 className="h-3.5 w-3.5 text-primary" />
                          <span>Chia sẻ</span>
                        </div>
                      </div>

                      {/* Action Button: Save Contact */}
                      <div className="mt-3">
                        <div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-xs font-semibold text-primary-foreground shadow-sm">
                          <Download className="h-3.5 w-3.5" />
                          Lưu vào danh bạ
                        </div>
                      </div>

                      {/* Social Links Mock */}
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-2 text-xs font-medium">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            Facebook cá nhân
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-2 text-xs font-medium">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500" />
                            LinkedIn kết nối
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-2 text-xs font-medium">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Zalo Chat
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works (3 Steps) */}
        <section id="how-it-works" className="border-t border-border/40 bg-muted/30 py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-2">
                Quy trình đơn giản
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Hoạt động như thế nào?
              </h2>
              <p className="mt-3 text-muted-foreground">
                Chỉ 3 bước đơn giản để sở hữu và vận hành danh thiếp thông minh cá nhân
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Step 1 */}
              <Card className="relative overflow-hidden p-6 border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg mb-4">
                  1
                </div>
                <h3 className="text-lg font-bold">Đăng ký & Tạo hồ sơ</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Tạo tài khoản miễn phí, cập nhật ảnh đại diện, chức danh, thông tin liên hệ và các liên kết mạng xã hội theo phong cách cá nhân của bạn.
                </p>
              </Card>

              {/* Step 2 */}
              <Card className="relative overflow-hidden p-6 border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg mb-4">
                  2
                </div>
                <h3 className="text-lg font-bold">Gắn thẻ NFC hoặc QR</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Kích hoạt thẻ vật lý thông minh chỉ với 1 thao tác hoặc sử dụng mã QR động được tạo tự động để in ấn hoặc hiển thị bất cứ đâu.
                </p>
              </Card>

              {/* Step 3 */}
              <Card className="relative overflow-hidden p-6 border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg mb-4">
                  3
                </div>
                <h3 className="text-lg font-bold">Chạm để kết nối</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Chạm nhẹ thẻ vào điện thoại của đối tác. Trang hồ sơ cá nhân sẽ mở ngay tức thì, đối tác có thể lưu danh bạ chỉ bằng một cú nhấp chuột.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="mb-2">
                Đặc quyền vượt trội
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Mọi thứ bạn cần cho một hồ sơ chuyên nghiệp
              </h2>
              <p className="mt-3 text-muted-foreground">
                Tối ưu hóa từng điểm chạm với đối tác, khách hàng và bạn bè
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 mb-4">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Không cần cài ứng dụng</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mọi smartphone hiện đại đều hỗ trợ đọc NFC tự nhiên hoặc quét qua camera tiêu chuẩn.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 mb-4">
                  <Download className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Lưu danh bạ 1 chạm (.vcf)</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Xuất đầy đủ họ tên, điện thoại, email, chức danh thẳng vào danh bạ điện thoại mà không cần gõ tay.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500 mb-4">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Thống kê lượt xem & quét thẻ</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Theo dõi số lượng lượt xem trang, tỷ lệ bấm link và phân loại theo thiết bị truy cập theo thời gian thực.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Thu thập liên hệ (Leads)</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Cho phép đối tác gửi lại thông tin liên hệ ngay trên trang của bạn để thuận tiện trao đổi công việc sau cuộc gặp.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 mb-4">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Bảo mật & Tự do quản lý</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Khóa thẻ từ xa ngay lập tức khi vô tình làm mất, dễ dàng đổi username hoặc ẩn hiện từng mục thông tin riêng tư.
                </p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-teal-500 mb-4">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-semibold text-base">Cập nhật tức thì</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Thay đổi số điện thoại, đổi vị trí công tác mà không bao giờ phải in lại hàng trăm tấm danh thiếp giấy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="border-t border-border/40 bg-muted/20 py-16">
          <div className="container mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sẵn sàng sở hữu danh thiếp thông minh của bạn?
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Tạo tài khoản hoàn toàn miễn phí chỉ trong 2 phút. Bắt đầu ngay hôm nay để khẳng định phong cách chuyên nghiệp.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/register"
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "px-8 py-6 text-base font-semibold shadow-md",
                })}
              >
                Tạo trang cá nhân ngay
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-medium">
            <CreditCard className="h-4 w-4 text-primary" />
            <span>Trang Cá Nhân NFC © 2026. Mọi quyền được bảo lưu.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Chính sách bảo mật
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
