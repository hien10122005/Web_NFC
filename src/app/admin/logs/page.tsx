import type { ComponentProps } from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { LogsTable } from '@/components/admin/logs-table';
import { Activity } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    page?: string;
  }>;
}

export default async function AdminLogsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 20;

  const supabase = await createClient();

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: logs, count, error } = await supabase
    .from('admin_logs')
    .select('*, admin:profiles!admin_logs_admin_id_fkey(id, full_name, username, avatar_url)', {
      count: 'exact',
    })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Lỗi khi lấy nhật ký admin_logs:', error);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Activity className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Nhật ký quản trị (Audit Logs)
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi chi tiết mọi thay đổi trên hệ thống, phân quyền, khóa thẻ và can thiệp dữ liệu
          </p>
        </div>
      </div>

      {/* Bảng nhật ký */}
      <LogsTable
        logs={(logs as unknown as ComponentProps<typeof LogsTable>['logs']) || []}
        totalCount={count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
