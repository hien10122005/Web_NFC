import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CardsManager } from '@/components/dashboard/cards-manager';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Quản lý thẻ NFC',
  description: 'Quản lý, kích hoạt thẻ NFC và mã QR cho trang cá nhân của bạn',
};

export default async function DashboardCardsPage() {
  const { user, profile } = await requireUser();

  if (!profile) {
    redirect('/onboarding');
  }

  const supabase = await createClient();

  // Lấy danh sách thẻ của người dùng
  const { data: cards, error } = await supabase
    .from('nfc_cards')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Lỗi khi lấy danh sách thẻ:', error);
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="max-w-4xl mx-auto">
      <CardsManager
        cards={cards || []}
        profile={profile}
        baseUrl={baseUrl}
      />
    </div>
  );
}
