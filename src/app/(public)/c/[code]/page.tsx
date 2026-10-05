import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import {
  CreditCard,
  AlertTriangle,
  Lock,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';

interface CardPageProps {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ src?: string }>;
}

export default async function CardScanEntryPage({ params, searchParams }: CardPageProps) {
  const { code } = await params;
  const query = await searchParams;
  const cleanCode = code?.trim().toUpperCase();

  if (!cleanCode) {
    redirect('/');
  }

  const headerList = await headers();
  const userAgent = headerList.get('user-agent') || '';
  const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
  const device = isMobile ? 'mobile' : 'desktop';
  const source = query.src === 'qr' ? 'qr' : 'nfc';

  const supabase = await createClient();

  // Gọi RPC resolve_card phân giải trạng thái thẻ & tự động ghi page_views
  const { data: result, error } = await supabase.rpc('resolve_card', {
    p_code: cleanCode,
    p_source: source,
    p_device: device,
    p_user_agent: userAgent.slice(0, 500),
  });

  if (error) {
    console.error('Lỗi khi phân giải thẻ:', error);
  }

  const res = result as {
    status?: string;
    username?: string;
    code?: string;
  } | null;

  const status = res?.status || 'not_found';

  // 1. Thẻ đang hoạt động bình thường -> chuyển tiếp đến trang cá nhân
  if (status === 'active' && res?.username) {
    redirect(`/u/${res.username}?from=card`);
  }

  // 2. Thẻ chưa được kích hoạt -> chuyển sang trang kích hoạt
  if (status === 'unassigned') {
    redirect(`/c/${cleanCode}/activate`);
  }

  // 3. Các trạng thái khác -> hiển thị trang thông báo thân thiện
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="max-w-md w-full p-8 rounded-2xl border bg-card text-card-foreground shadow-lg text-center space-y-4">
        {status === 'lost' && (
          <>
            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Thẻ đã được báo mất</h2>
            <p className="text-sm text-muted-foreground">
              Thẻ NFC này (mã <strong className="font-mono text-foreground">{cleanCode}</strong>) đã được chủ sở hữu đánh dấu là bị thất lạc hoặc rơi mất. Hồ sơ cá nhân đã được tạm thời ẩn đi để bảo vệ thông tin.
            </p>
          </>
        )}

        {status === 'locked' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Thẻ đã bị khóa</h2>
            <p className="text-sm text-muted-foreground">
              Thẻ NFC này hiện đang bị tạm khóa bởi ban quản trị hệ thống. Vui lòng liên hệ với bộ phận hỗ trợ nếu bạn là chủ sở hữu thẻ.
            </p>
          </>
        )}

        {status === 'not_found' && (
          <>
            <div className="w-16 h-16 rounded-full bg-gray-500/10 text-muted-foreground flex items-center justify-center mx-auto">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Mã thẻ không tồn tại</h2>
            <p className="text-sm text-muted-foreground">
              Mã thẻ <strong className="font-mono text-foreground">{cleanCode}</strong> không tìm thấy trong hệ thống của chúng tôi. Vui lòng kiểm tra lại mã hoặc quét thẻ khác.
            </p>
          </>
        )}

        {status === 'profile_unavailable' && (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto">
              <CreditCard className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold">Hồ sơ tạm thời không khả dụng</h2>
            <p className="text-sm text-muted-foreground">
              Hồ sơ liên kết với thẻ này hiện đang được ẩn, chưa hoàn tất hoặc tài khoản đang tạm dừng hoạt động.
            </p>
          </>
        )}

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className={buttonVariants({ variant: 'outline', size: 'sm', className: 'w-full sm:w-auto gap-2' })}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
