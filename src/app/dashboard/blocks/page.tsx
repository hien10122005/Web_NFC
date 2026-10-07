import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { BlocksManager } from '@/components/dashboard/blocks/blocks-manager';

export const metadata: Metadata = {
  title: 'Khối nội dung phong phú',
  description: 'Thêm video YouTube, Google Maps, ghi chú văn bản và hình ảnh vào trang cá nhân NFC của bạn',
};

export default async function DashboardBlocksPage() {
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  // Lấy danh sách các khối nội dung của người dùng
  const { data: blocks, error: blocksErr } = await supabase
    .from('blocks')
    .select('*')
    .eq('profile_id', user.id)
    .order('position', { ascending: true });

  if (blocksErr) {
    console.error('Lỗi khi lấy danh sách khối nội dung:', blocksErr);
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <BlocksManager
        initialBlocks={blocks || []}
        username={profile?.username}
      />
    </div>
  );
}
