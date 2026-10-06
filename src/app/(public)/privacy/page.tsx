import { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: "Chính sách bảo mật - Trang Cá Nhân NFC",
  description: "Chính sách bảo vệ dữ liệu cá nhân tuân thủ Nghị định 13/2023/NĐ-CP của hệ thống Trang Cá Nhân NFC",
}

export default function PrivacyPage() {
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
            <ShieldCheck className="h-4 w-4" />
            <span>Tuân thủ Nghị định 13/2023/NĐ-CP</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Chính Sách Bảo Mật Dữ Liệu Cá Nhân
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hệ thống <strong>Trang Cá Nhân NFC</strong> cam kết tôn trọng quyền riêng tư và bảo vệ tuyệt đối an toàn thông tin dữ liệu của tất cả người dùng và đối tác quét thẻ.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          {/* Điều 1 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">1</span>
              Mục đích thu thập và xử lý dữ liệu
            </h2>
            <p>
              Hệ thống thu thập dữ liệu nhằm cung cấp giải pháp danh thiếp thông minh, giúp người dùng quản lý hồ sơ cá nhân và chia sẻ thông tin liên lạc thông qua thao tác chạm thẻ NFC hoặc quét mã QR. Các mục đích chính bao gồm:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Khởi tạo, kích hoạt và quản lý trang hồ sơ cá nhân theo yêu cầu của bạn.</li>
              <li>Hiển thị các thông tin bạn chủ động chia sẻ cho người khác khi họ quét thẻ NFC hoặc truy cập đường link của bạn.</li>
              <li>Thống kê tổng quan lượt truy cập, nguồn quét (NFC / QR) và mức độ tương tác liên kết.</li>
              <li>Hỗ trợ người xem gửi lại thông tin danh thiếp kết nối (Lead) cho chủ thẻ.</li>
            </ul>
          </section>

          {/* Điều 2 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">2</span>
              Phạm vi dữ liệu cá nhân thu thập
            </h2>
            <p>
              Tùy thuộc vào việc bạn là chủ sở hữu tài khoản hay người xem trang, chúng tôi chỉ thu thập các dữ liệu tối thiểu cần thiết:
            </p>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20">
                <strong className="text-foreground block text-xs uppercase tracking-wide">A. Dữ liệu tài khoản của chủ thẻ:</strong>
                <span className="text-xs">Địa chỉ email (đăng ký/đăng nhập), họ tên, ảnh đại diện, thông tin công tác, tiểu sử ngắn, số điện thoại, tài khoản mạng xã hội và thông tin tài khoản ngân hàng (nếu bạn chủ động thiết lập nhận chuyển khoản).</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20">
                <strong className="text-foreground block text-xs uppercase tracking-wide">B. Dữ liệu khi khách để lại thông tin liên hệ:</strong>
                <span className="text-xs">Họ và tên, số điện thoại hoặc email, và nội dung lời nhắn do chính khách hàng tự nguyện nhập vào mẫu liên hệ.</span>
              </div>
              <div className="p-3.5 rounded-xl border border-border/50 bg-muted/20">
                <strong className="text-foreground block text-xs uppercase tracking-wide">C. Dữ liệu kỹ thuật thống kê:</strong>
                <span className="text-xs">Loại thiết bị (Di động / Máy tính), phương thức truy cập (Chạm thẻ NFC / Quét QR / Đường dẫn). Hệ thống <strong>không lưu địa chỉ IP cá nhân</strong> của người xem.</span>
              </div>
            </div>
          </section>

          {/* Điều 3 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">3</span>
              Quyền của chủ thể dữ liệu (Nghị định 13/2023/NĐ-CP)
            </h2>
            <p>
              Bạn có đầy đủ các quyền pháp lý đối với dữ liệu của mình:
            </p>
            <div className="grid gap-2 sm:grid-cols-2 pt-1">
              {[
                { title: "Quyền xem & chỉnh sửa", desc: "Tự do cập nhật mọi thông tin hồ sơ bất kỳ lúc nào tại Dashboard." },
                { title: "Quyền ẩn/hiện thông tin", desc: "Tùy chọn bật hoặc tắt hiển thị từng số điện thoại, email hay mạng xã hội." },
                { title: "Quyền tạm khóa trang", desc: "Chuyển trang sang trạng thái Riêng tư để ngừng chia sẻ tạm thời." },
                { title: "Quyền xóa vĩnh viễn", desc: "Chức năng tự xóa tài khoản một chạm, dọn sạch toàn bộ dữ liệu máy chủ." },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border/40 bg-card/50">
                  <div className="flex items-center gap-1.5 text-foreground font-semibold text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{item.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Điều 4 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">4</span>
              Bảo mật và Lưu trữ dữ liệu
            </h2>
            <p>
              Toàn bộ dữ liệu được lưu trữ trên hạ tầng điện toán đám mây Supabase đặt tại khu vực Singapore (ap-southeast-1) với các cơ chế bảo mật cao cấp:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mã hóa toàn bộ lưu lượng kết nối qua giao thức HTTPS / TLS 1.3.</li>
              <li>Chính sách phân quyền cấp hàng (Row Level Security - RLS) ngăn chặn triệt để mọi hành vi can thiệp trái phép giữa người dùng với nhau.</li>
              <li>Cam kết <strong>không bao giờ bán hoặc chia sẻ</strong> cơ sở dữ liệu khách hàng cho bên thứ ba vì mục đích tiếp thị hoặc spam.</li>
            </ul>
          </section>

          {/* Điều 5 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span className="flex h-6 w-6 rounded-full bg-primary/10 text-primary items-center justify-center text-xs font-bold">5</span>
              Thông tin liên hệ & Khiếu nại
            </h2>
            <p>
              Nếu có bất kỳ câu hỏi nào về chính sách bảo mật hoặc muốn thực hiện quyền bảo vệ dữ liệu của bạn, vui lòng liên hệ với Ban Quản Trị qua:
            </p>
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-1 text-xs text-foreground">
              <p><strong>Dự án:</strong> Hệ Thống Danh Thiếp Thông Minh Trang Cá Nhân NFC</p>
              <p><strong>Email hỗ trợ:</strong> support@trangcanhannfc.vn</p>
              <p><strong>Website:</strong> trangcanhannfc.vn</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="border-t border-border/60 pt-6 flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/terms" className="hover:text-primary transition-colors">
            Xem Điều khoản dịch vụ &rarr;
          </Link>
          <Link href="/" className="hover:text-primary transition-colors">
            Về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
