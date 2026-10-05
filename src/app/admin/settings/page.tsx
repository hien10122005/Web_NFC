import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { SettingsManager } from '@/components/admin/settings-manager';
import { Settings } from 'lucide-react';

export default async function AdminSettingsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [settingsRes, platformsRes, reservedRes] = await Promise.all([
    supabase.from('site_settings').select('*'),
    supabase.from('social_platforms').select('*').order('position', { ascending: true }),
    supabase.from('reserved_usernames').select('*').order('created_at', { ascending: false }),
  ]);

  const settingsMap: Record<string, unknown> = {};
  settingsRes.data?.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cài đặt hệ thống
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản trị đăng ký, thông báo chung, danh mục mạng xã hội và các username được bảo lưu
          </p>
        </div>
      </div>

      <SettingsManager
        settings={settingsMap}
        platforms={platformsRes.data || []}
        reservedUsernames={reservedRes.data || []}
      />
    </div>
  );
}
