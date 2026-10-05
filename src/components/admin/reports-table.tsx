'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database.types';
import { resolveReportAction } from '@/actions/admin-reports';
import { toast } from 'sonner';
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldAlert,
  EyeOff,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ReportRow = Database['public']['Tables']['reports']['Row'] & {
  profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
    status: string | null;
    is_public: boolean | null;
  } | null;
};

interface ReportsTableProps {
  reports: ReportRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function ReportsTable({
  reports,
  totalCount,
  currentPage,
  pageSize,
}: ReportsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'pending');
  const [isPending, startTransition] = useTransition();

  const [activeReport, setActiveReport] = useState<ReportRow | null>(null);
  const [resolutionType, setResolutionType] = useState<'resolved' | 'rejected'>('resolved');
  const [actionTaken, setActionTaken] = useState<'none' | 'hide_profile' | 'ban_user'>('none');

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handleStatusFilterChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams(searchParams.toString());
    if (status !== 'all') params.set('status', status);
    else params.delete('status');
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleConfirmResolution = () => {
    if (!activeReport) return;
    startTransition(async () => {
      const res = await resolveReportAction(activeReport.id, resolutionType, actionTaken);
      if (res.success) {
        toast.success(
          resolutionType === 'resolved'
            ? 'Đã duyệt và xử lý báo cáo vi phạm thành công'
            : 'Đã bác bỏ báo cáo vi phạm'
        );
        setActiveReport(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Bộ lọc trạng thái */}
      <div className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground mr-1">Lọc trạng thái:</span>
          <Button
            variant={selectedStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('pending')}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Chờ duyệt</span>
          </Button>
          <Button
            variant={selectedStatus === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('resolved')}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Đã xử lý</span>
          </Button>
          <Button
            variant={selectedStatus === 'rejected' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('rejected')}
            className="text-xs h-9 rounded-xl font-semibold gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5 text-zinc-400" />
            <span>Đã bác bỏ</span>
          </Button>
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusFilterChange('all')}
            className="text-xs h-9 rounded-xl font-semibold"
          >
            Tất cả
          </Button>
        </div>
      </div>

      {/* Bảng báo cáo */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="py-3.5 px-4">Trang bị báo cáo</th>
                <th className="py-3.5 px-4">Lý do khiếu nại</th>
                <th className="py-3.5 px-4">Chi tiết tố cáo</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Ngày gửi</th>
                <th className="py-3.5 px-4 text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Không có báo cáo vi phạm nào trong danh sách
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const isPendingStatus = r.status === 'pending';
                  const isResolved = r.status === 'resolved';

                  return (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      {/* Trang bị tố cáo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {r.profile?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={r.profile.avatar_url}
                                alt={r.profile.full_name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (r.profile?.full_name || r.profile?.username || 'U').slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate max-w-[140px]">
                              {r.profile?.full_name || 'Chưa đặt tên'}
                            </p>
                            {r.profile?.username && (
                              <Link
                                href={`/u/${r.profile.username}`}
                                target="_blank"
                                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
                              >
                                <span>@{r.profile.username}</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Lý do */}
                      <td className="py-3.5 px-4">
                        <Badge variant="outline" className="text-xs font-semibold capitalize">
                          {r.reason || 'Khác'}
                        </Badge>
                      </td>

                      {/* Người báo cáo */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground max-w-xs truncate">
                        {r.reporter_email || 'Ẩn danh'}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {isPendingStatus && (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] font-bold">
                            Chờ duyệt
                          </Badge>
                        )}
                        {isResolved && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                            Đã xử lý
                          </Badge>
                        )}
                        {r.status === 'rejected' && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Đã bác bỏ
                          </Badge>
                        )}
                      </td>

                      {/* Ngày gửi */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Nút hành động */}
                      <td className="py-3.5 px-4 text-right">
                        {isPendingStatus ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setActiveReport(r);
                              setResolutionType('resolved');
                              setActionTaken('none');
                            }}
                            className="h-8 px-3 rounded-xl text-xs font-bold gap-1 shadow-xs"
                          >
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Xử lý</span>
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Đã đóng</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex items-center justify-between p-4 border-t border-border/40 text-xs text-muted-foreground">
          <span>
            Hiển thị <strong>{reports.length}</strong> trên tổng số <strong>{totalCount}</strong> báo cáo
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1 || isPending}
              onClick={() => handlePageChange(currentPage - 1)}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <span className="px-2 font-semibold">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages || isPending}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Xử lý báo cáo */}
      {activeReport && (
        <Dialog open={!!activeReport} onOpenChange={() => setActiveReport(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-rose-500" />
                <span>Quyết định xử lý báo cáo vi phạm</span>
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Xem xét và đưa ra hành động chế tài đối với tài khoản bị khiếu nại.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/40 space-y-1.5 border border-border/40">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hồ sơ bị báo cáo:</span>
                  <span className="font-bold">{activeReport.profile?.full_name} (@{activeReport.profile?.username})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lý do:</span>
                  <span className="font-semibold text-rose-500">{activeReport.reason}</span>
                </div>
                {activeReport.reporter_email && (
                  <div className="pt-1 text-muted-foreground">
                    <p className="font-medium text-foreground">Email người báo cáo:</p>
                    <p className="mt-0.5 p-2 rounded-lg bg-background border text-xs font-mono">{activeReport.reporter_email}</p>
                  </div>
                )}
              </div>

              {/* Lựa chọn phán quyết */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">1. Kết luận báo cáo:</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionType('resolved')}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      resolutionType === 'resolved'
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Duyệt vi phạm (Hợp lệ)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setResolutionType('rejected');
                      setActionTaken('none');
                    }}
                    className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                      resolutionType === 'rejected'
                        ? 'border-zinc-500 bg-zinc-500/10 text-foreground'
                        : 'border-border text-muted-foreground'
                    }`}
                  >
                    Bác bỏ (Sai sự thật)
                  </button>
                </div>
              </div>

              {/* Hành động chế tài nếu duyệt vi phạm */}
              {resolutionType === 'resolved' && (
                <div className="space-y-2">
                  <p className="font-semibold text-foreground">2. Biện pháp chế tài tài khoản:</p>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-muted/40">
                      <input
                        type="radio"
                        name="action"
                        checked={actionTaken === 'none'}
                        onChange={() => setActionTaken('none')}
                      />
                      <span>Chỉ ghi nhận đã duyệt, không áp dụng chế tài</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-muted/40 text-amber-600">
                      <input
                        type="radio"
                        name="action"
                        checked={actionTaken === 'hide_profile'}
                        onChange={() => setActionTaken('hide_profile')}
                      />
                      <EyeOff className="w-3.5 h-3.5 shrink-0" />
                      <span>Ẩn trang cá nhân (chuyển sang Riêng tư)</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-xl border cursor-pointer hover:bg-muted/40 text-rose-600">
                      <input
                        type="radio"
                        name="action"
                        checked={actionTaken === 'ban_user'}
                        onChange={() => setActionTaken('ban_user')}
                      />
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>Khóa vĩnh viễn tài khoản người dùng này</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveReport(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmResolution}
                disabled={isPending}
                className="rounded-xl gap-2 font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                <span>Xác nhận phán quyết</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
