import type { ComponentProps } from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { ReportsTable } from '@/components/admin/reports-table';
import { Flag } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    page?: string;
  }>;
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const status = params.status || 'pending';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 15;

  const supabase = await createClient();

  let dbQuery = supabase
    .from('reports')
    .select('*, profile:profiles(id, username, full_name, avatar_url, status, is_public)', {
      count: 'exact',
    });

  if (status !== 'all') {
    dbQuery = dbQuery.eq('status', status);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: reports, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Lỗi khi lấy danh sách báo cáo:', error);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Flag className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Báo cáo vi phạm
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Xem xét và xử lý các khiếu nại, tố cáo nội dung từ cộng đồng người dùng
          </p>
        </div>
      </div>

      {/* Bảng báo cáo */}
      <ReportsTable
        reports={(reports as unknown as ComponentProps<typeof ReportsTable>['reports']) || []}
        totalCount={count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
      />
    </div>
  );
}
