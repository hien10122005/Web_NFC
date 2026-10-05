import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LinksManager } from '@/components/dashboard/links-manager';

export const metadata: Metadata = {
  title: 'Quản lý liên kết',
  description: 'Thêm, sửa, sắp xếp các liên kết trên trang cá nhân NFC của bạn',
};

export default async function DashboardLinksPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  // Lấy danh sách liên kết của người dùng
  const { data: links, error: linksErr } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', user.id)
    .order('position', { ascending: true });

  if (linksErr) {
    console.error('Lỗi lấy danh sách liên kết:', linksErr);
  }

  // Lấy danh sách nền tảng hoạt động
  const { data: platforms, error: platformsErr } = await supabase
    .from('social_platforms')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true });

  if (platformsErr) {
    console.error('Lỗi lấy nền tảng mạng xã hội:', platformsErr);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <LinksManager
        initialLinks={links || []}
        platforms={platforms || []}
      />
    </div>
  );
}
