import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { UsersTable } from '@/components/admin/users-table';
import { Users } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const { user: currentAdmin } = await requireAdmin();
  const params = await searchParams;

  const query = params.q?.trim() || '';
  const role = params.role || 'all';
  const status = params.status || 'all';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 15;

  const supabase = await createClient();

  // Xây dựng câu query Supabase
  let dbQuery = supabase
    .from('profiles')
    .select('*', { count: 'exact' });

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,username.ilike.%${query}%`);
  }

  if (role !== 'all') {
    dbQuery = dbQuery.eq('role', role);
  }

  if (status !== 'all') {
    dbQuery = dbQuery.eq('status', status);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: users, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản lý người dùng
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Tìm kiếm, phân quyền Admin, khóa/mở và quản lý trạng thái hiển thị của toàn bộ tài khoản
          </p>
        </div>
      </div>

      {/* Bảng tương tác người dùng */}
      <UsersTable
        users={users || []}
        totalCount={count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        currentUserId={currentAdmin.id}
      />
    </div>
  );
}
