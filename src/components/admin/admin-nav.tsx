'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Flag,
  Settings,
  ArrowLeft,
  Activity,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    title: 'Tổng quan',
    href: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: 'Người dùng',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Thẻ NFC',
    href: '/admin/cards',
    icon: CreditCard,
  },
  {
    title: 'Báo cáo vi phạm',
    href: '/admin/reports',
    icon: Flag,
  },
  {
    title: 'Cài đặt hệ thống',
    href: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Nhật ký quản trị',
    href: '/admin/logs',
    icon: Activity,
  },
];

interface AdminNavProps {
  pendingReportsCount?: number;
}

export function AdminNav({ pendingReportsCount = 0 }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1.5">
      <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Quản trị hệ thống
      </div>

      {ADMIN_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform group-hover:scale-110',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              <span>{item.title}</span>
            </div>

            {item.href === '/admin/reports' && pendingReportsCount > 0 && (
              <span
                className={cn(
                  'ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold',
                  isActive
                    ? 'bg-primary-foreground text-primary'
                    : 'bg-rose-500 text-white'
                )}
              >
                {pendingReportsCount}
              </span>
            )}
          </Link>
        );
      })}

      <div className="pt-4 pb-2 px-3 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
        Lối tắt
      </div>

      <Link
        href="/dashboard"
        className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-150"
      >
        <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-transform group-hover:-translate-x-1" />
        <span>Về Dashboard cá nhân</span>
      </Link>
    </nav>
  );
}
