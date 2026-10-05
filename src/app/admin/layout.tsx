import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Shield } from 'lucide-react';
import { AdminNav } from '@/components/admin/admin-nav';
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav';
import { UserMenu } from '@/components/user-menu';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = await requireAdmin();

  // Đếm số lượng báo cáo vi phạm đang chờ xử lý
  const supabase = await createClient();
  const { count: pendingReportsCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Admin Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur shrink-0">
        {/* Brand / Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-6">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-indigo-500 to-primary text-white shadow-sm">
              <Shield className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight">
                NFC<span className="text-primary font-black ml-0.5">Admin</span>
              </span>
              <span className="text-[10px] font-mono font-normal text-muted-foreground uppercase tracking-widest">
                Control Panel
              </span>
            </div>
          </Link>
        </div>

        {/* Admin Profile Summary */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/15 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || ''}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                (profile?.full_name || user.email || 'A').slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold text-foreground">
                  {profile?.full_name || 'Quản trị viên'}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-primary/15 text-primary">
                <Shield className="w-2.5 h-2.5" />
                Administrator
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <AdminNav pendingReportsCount={pendingReportsCount || 0} />
        </div>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-border/20 text-[11px] text-muted-foreground flex justify-between items-center">
          <span>Hệ thống bảo mật RLS</span>
          <span className="font-mono text-emerald-500 font-medium">Active</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Nav Button */}
            <AdminMobileNav pendingReportsCount={pendingReportsCount || 0} />

            {/* Mobile Brand */}
            <div className="flex md:hidden items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Shield className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-base">Admin Panel</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Chế độ Quản trị viên Toàn quyền</span>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <UserMenu user={user} profile={profile} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
