import { Metadata } from 'next';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { buttonVariants } from '@/components/ui/button';
import { ActivateCardClient } from '@/components/profile/activate-card-client';
import { CreditCard, LogIn, UserPlus } from 'lucide-react';
import { redirect } from 'next/navigation';

interface ActivatePageProps {
  params: Promise<{ code: string }>;
}

export const metadata: Metadata = {
  title: 'Kích hoạt thẻ NFC mới',
  description: 'Gắn thẻ NFC vật lý mới vào tài khoản trang cá nhân của bạn',
};

export default async function ActivateCardPage({ params }: ActivatePageProps) {
  const { code } = await params;
  const cleanCode = code?.trim().toUpperCase();

  if (!cleanCode) {
    redirect('/');
  }

  const supabase = await createClient();

  // Kiểm tra mã thẻ
  const { data: card } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('code', cleanCode)
    .maybeSingle();

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full p-8 rounded-2xl border bg-card text-card-foreground shadow-lg text-center space-y-4">
          <h2 className="text-xl font-bold">Mã thẻ không hợp lệ</h2>
          <p className="text-sm text-muted-foreground">
            Mã thẻ <strong className="font-mono text-foreground">{cleanCode}</strong> không tồn tại trong hệ thống.
          </p>
          <Link href="/" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (card.status !== 'unassigned') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full p-8 rounded-2xl border bg-card text-card-foreground shadow-lg text-center space-y-4">
          <h2 className="text-xl font-bold">Thẻ đã được kích hoạt</h2>
          <p className="text-sm text-muted-foreground">
            Thẻ này đã được kích hoạt hoặc không ở trạng thái sẵn sàng để gán mới.
          </p>
          <Link href={`/c/${cleanCode}`} className={buttonVariants({ size: 'sm' })}>
            Quét lại thẻ
          </Link>
        </div>
      </div>
    );
  }

  const { user, profile } = await getCurrentUser();
  const currentPath = `/c/${cleanCode}/activate`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-muted/40">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border bg-card text-card-foreground shadow-xl text-center space-y-6">
        {/* ICON HERO */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-inner">
          <CreditCard className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Thẻ NFC mới sẵn sàng
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Kích hoạt thẻ NFC</h1>
          <p className="text-xs text-muted-foreground">
            Mã thẻ của bạn:{' '}
            <span className="font-mono font-bold text-sm text-foreground bg-muted px-2 py-0.5 rounded-md">
              {cleanCode}
            </span>
          </p>
        </div>

        {/* NỘI DUNG TÙY THEO ĐÃ ĐĂNG NHẬP HAY CHƯA */}
        {user ? (
          <ActivateCardClient
            code={cleanCode}
            userFullName={profile?.full_name || user.email || ''}
          />
        ) : (
          <div className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Vui lòng đăng nhập hoặc tạo tài khoản mới để liên kết chiếc thẻ này với trang danh thiếp của bạn.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href={`/login?next=${encodeURIComponent(currentPath)}`}
                className={buttonVariants({ size: 'lg', className: 'w-full gap-2 font-semibold shadow-md' })}
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập để gắn thẻ</span>
              </Link>

              <Link
                href={`/register?next=${encodeURIComponent(currentPath)}`}
                className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full gap-2 font-semibold' })}
              >
                <UserPlus className="w-4 h-4" />
                <span>Tạo tài khoản mới</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
