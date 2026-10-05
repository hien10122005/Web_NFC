'use client';

import React, { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database.types';
import {
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileCode,
  Layers,
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

type AdminLogRow = Database['public']['Tables']['admin_logs']['Row'] & {
  admin?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface LogsTableProps {
  logs: AdminLogRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}

export function LogsTable({
  logs,
  totalCount,
  currentPage,
  pageSize,
}: LogsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedLog, setSelectedLog] = useState<AdminLogRow | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'insert':
      case 'generate_cards':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'update':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'delete':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="space-y-4">
      {/* Bảng danh sách nhật ký */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Quản trị viên</th>
                <th className="py-3.5 px-4">Hành động</th>
                <th className="py-3.5 px-4">Bảng / Mục tiêu</th>
                <th className="py-3.5 px-4">Mã đối tượng (Target ID)</th>
                <th className="py-3.5 px-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Chưa có nhật ký hoạt động nào được ghi lại
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  return (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      {/* Thời gian */}
                      <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 opacity-60" />
                          <span>
                            {log.created_at
                              ? new Date(log.created_at).toLocaleString('vi-VN')
                              : '—'}
                          </span>
                        </div>
                      </td>

                      {/* Admin */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {log.admin?.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={log.admin.avatar_url}
                                alt={log.admin.full_name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (log.admin?.full_name || log.admin?.username || 'A').slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate">
                              {log.admin?.full_name || 'Admin'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold uppercase ${getActionBadgeColor(
                            log.action
                          )}`}
                        >
                          {log.action}
                        </Badge>
                      </td>

                      {/* Đối tượng */}
                      <td className="py-3.5 px-4 text-xs font-mono font-semibold">
                        <div className="flex items-center gap-1 text-foreground">
                          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{log.target_type}</span>
                        </div>
                      </td>

                      {/* Target ID */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                        {log.target_id || '—'}
                      </td>

                      {/* Nút xem chi tiết */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                          className="h-8 px-2.5 rounded-lg text-xs font-semibold gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem diff</span>
                        </Button>
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
            Hiển thị <strong>{logs.length}</strong> trên tổng số <strong>{totalCount}</strong> nhật ký
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
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
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="h-8 px-2.5 rounded-lg"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal xem chi tiết Diff */}
      {selectedLog && (
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                <span>Chi tiết thay đổi dữ liệu (Audit Log Diff)</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Ghi nhận vào{' '}
                {selectedLog.created_at
                  ? new Date(selectedLog.created_at).toLocaleString('vi-VN')
                  : ''}{' '}
                bởi{' '}
                <strong>{selectedLog.admin?.full_name || 'Quản trị viên'}</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/40 font-mono text-[11px]">
                <div>
                  <span className="text-muted-foreground block">Hành động:</span>
                  <span className="font-bold text-foreground uppercase">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Bảng bị ảnh hưởng:</span>
                  <span className="font-bold text-foreground">{selectedLog.target_type}</span>
                </div>
              </div>

              {/* So sánh Old / New */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Dữ liệu chi tiết (JSON):</p>
                <div className="rounded-xl border border-border/60 bg-zinc-950 text-zinc-100 p-4 font-mono text-[11px] overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl"
              >
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
