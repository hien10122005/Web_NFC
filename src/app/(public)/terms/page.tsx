import { Metadata } from "next"
import Link from "next/link"
import { Scale, ArrowLeft, ShieldAlert } from "lucide-react"

export const metadata: Metadata = {
  title: "Điều khoản dịch vụ - Trang Cá Nhân NFC",
  description: "Quy định và điều khoản sử dụng nền tảng danh thiếp điện tử Trang Cá Nhân NFC",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về trang chủ</span>
          </Link>
          <span className="text-xs text-muted-foreground font-mono">
            Hiệu lực từ: Tháng 10/2026
          </span>
        </div>

        {/* Header */}
        <div className="space-y-3 border-b border-border/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Scale className="h-4 w-4" />
            <span>Quy chế sử dụng dịch vụ</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Điều Khoản Sử Dụng Dịch Vụ
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Bằng việc đăng ký tài khoản, quét thẻ NFC hoặc sử dụng nền tảng <strong>Trang Cá Nhân NFC</strong>, bạn đồng ý tuân thủ toàn bộ các điều khoản và quy định dưới đây.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {/* Điều 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">1</span>
              Chấp thuận Điều khoản
            </h2>
            <p>
              Nền tảng cung cấp giải pháp lưu trữ, hiển thị danh thiếp và truyền thông tin qua thẻ NFC/mã QR. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng ngưng sử dụng dịch vụ và có thể yêu cầu xóa tài khoản bất kỳ lúc nào.
            </p>
          </section>

          {/* Điều 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">2</span>
              Quy tắc ứng xử và Tiêu chuẩn nội dung
            </h2>
            <p>
              Người dùng chịu trách nhiệm pháp lý cao nhất đối với toàn bộ thông tin, hình ảnh và liên kết mà mình công khai trên trang danh thiếp. <strong>Nghiêm cấm các hành vi sau:</strong>
            </p>
            <div className="space-y-2 pt-1">
              {[
                "Mạo danh cá nhân, tổ chức, cơ quan nhà nước hoặc thương hiệu của người khác mà không có sự ủy quyền hợp pháp.",
                "Đăng tải hoặc dẫn link đến các trang lừa đảo (phishing), phát tán mã độc hại, cờ bạc trực tuyến, hoặc dịch vụ tài chính vi phạm pháp luật.",
                "Chia sẻ các nội dung khiêu dâm, đồi trụy, kích động bạo lực, xúc phạm danh dự, nhân phẩm của cá nhân hoặc tổ chức khác.",
                "Lợi dụng hệ thống để phát tán tin nhắn rác (spam) hoặc thu thập trái phép dữ liệu cá nhân của người quét thẻ.",
              ].map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs text-foreground/90">
                  <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Điều 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">3</span>
              Quản lý thẻ NFC vật lý
            </h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mỗi thẻ NFC vật lý được định danh bằng một mã duy nhất và chỉ được gắn vào một tài khoản tại một thời điểm.</li>
              <li>Trong trường hợp làm mất thẻ, người dùng có trách nhiệm truy cập Dashboard để chuyển trạng thái thẻ sang <strong>&ldquo;Báo mất&rdquo;</strong> nhằm vô hiệu hóa tức thì đường link trên thẻ.</li>
              <li>Hệ thống không chịu trách nhiệm đối với các rủi ro phát sinh do bạn làm rơi hoặc để lộ thẻ mà không kịp thời thao tác báo mất trên hệ thống.</li>
            </ul>
          </section>

          {/* Điều 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">4</span>
              Cơ chế giám sát & Xử lý vi phạm
            </h2>
            <p>
              Để bảo vệ cộng đồng người dùng văn minh và an toàn:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mọi người xem đều có quyền gửi <strong>Báo cáo vi phạm</strong> đối với các trang hồ sơ có dấu hiệu gian lận hoặc nội dung xấu độc.</li>
              <li>Ban Quản Trị có toàn quyền tạm khóa trang, thu hồi thẻ hoặc xóa vĩnh viễn tài khoản vi phạm mà không cần báo trước nếu phát hiện hành vi xâm hại nghiêm trọng đến quyền lợi của người dùng khác.</li>
            </ul>
          </section>

          {/* Điều 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">5</span>
              Giới hạn trách nhiệm & Thay đổi điều khoản
            </h2>
            <p>
              Nền tảng cam kết duy trì dịch vụ hoạt động ổn định và liên tục. Tuy nhiên, chúng tôi không chịu trách nhiệm gián tiếp cho các thiệt hại thương mại phát sinh từ việc gián đoạn đường truyền mạng Internet hoặc sự cố từ nhà mạng viễn thông. Các điều khoản có thể được cập nhật theo định kỳ và có hiệu lực ngay khi đăng tải công khai trên website.
            </p>
          </section>
        </div>

        {/* Footer links */}
        <div className="border-t border-border/60 pt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-primary transition-colors">
            &larr; Xem Chính sách bảo mật
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
