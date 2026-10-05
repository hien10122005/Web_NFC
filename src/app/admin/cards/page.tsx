import type { ComponentProps } from 'react';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CardsTable } from '@/components/admin/cards-table';
import { CreditCard } from 'lucide-react';

interface PageProps {
  searchParams: Promise<{
    q?: string;
    status?: string;
    batch?: string;
    page?: string;
  }>;
}

export default async function AdminCardsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const params = await searchParams;

  const query = params.q?.trim() || '';
  const status = params.status || 'all';
  const batch = params.batch || 'all';
  const currentPage = Math.max(1, parseInt(params.page || '1', 10) || 1);
  const pageSize = 20;

  const supabase = await createClient();

  // 1. Lấy danh sách batch_id duy nhất
  const { data: batchData } = await supabase
    .from('nfc_cards')
    .select('batch_id')
    .not('batch_id', 'is', null);

  const batches = Array.from(
    new Set((batchData || []).map((b) => b.batch_id).filter(Boolean))
  ) as string[];

  // 2. Query danh sách thẻ kèm thông tin chủ sở hữu
  let dbQuery = supabase
    .from('nfc_cards')
    .select('*, profile:profiles(id, username, full_name, avatar_url)', {
      count: 'exact',
    });

  if (query) {
    dbQuery = dbQuery.ilike('code', `%${query}%`);
  }

  if (status !== 'all') {
    dbQuery = dbQuery.eq('status', status);
  }

  if (batch !== 'all') {
    dbQuery = dbQuery.eq('batch_id', batch);
  }

  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data: cards, count, error } = await dbQuery
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    console.error('Lỗi khi lấy danh sách thẻ NFC:', error);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Quản lý thẻ NFC
            </h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Quản lý kho thẻ, tạo mã hàng loạt, xuất file CSV in ấn và gán thẻ cho người dùng
          </p>
        </div>
      </div>

      {/* Bảng danh sách thẻ */}
      <CardsTable
        cards={(cards as unknown as ComponentProps<typeof CardsTable>['cards']) || []}
        totalCount={count || 0}
        currentPage={currentPage}
        pageSize={pageSize}
        siteUrl={siteUrl}
        batches={batches}
      />
    </div>
  );
}
