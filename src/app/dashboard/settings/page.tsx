import { Metadata } from 'next';
import { requireUser } from '@/lib/auth';
import { SettingsForm } from '@/components/dashboard/settings-form';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Cài đặt tài khoản',
  description: 'Quản lý mật khẩu, email và thông tin tài khoản của bạn',
};

export default async function DashboardSettingsPage() {
  const { user, profile } = await requireUser();

  if (!profile) {
    redirect('/onboarding');
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Cài đặt tài khoản</h2>
        <p className="text-sm text-muted-foreground">
          Quản lý thông tin đăng nhập, bảo mật và quyền riêng tư cá nhân của bạn.
        </p>
      </div>

      <SettingsForm user={user} profile={profile} />
    </div>
  );
}
