import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { AppearanceEditor } from '@/components/dashboard/appearance-editor';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Tùy biến giao diện',
  description: 'Thay đổi phong cách màu sắc, hiệu ứng nút và xem trước trực tiếp trên điện thoại',
};

export default async function DashboardAppearancePage() {
  const { user, profile } = await requireUser();

  if (!profile) {
    redirect('/onboarding');
  }

  const supabase = await createClient();

  // Lấy danh sách liên kết của người dùng
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', user.id)
    .order('position', { ascending: true });

  return (
    <div className="max-w-6xl mx-auto">
      <AppearanceEditor
        profile={profile}
        links={links || []}
      />
    </div>
  );
}
