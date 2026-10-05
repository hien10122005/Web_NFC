'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database.types';
import {
  generateCardsAction,
  updateCardStatusByAdminAction,
  assignCardToUserAction,
  unassignCardAction,
  deleteCardByAdminAction,
} from '@/actions/admin-cards';
import { toast } from 'sonner';
import {
  Search,
  PlusCircle,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  MoreVertical,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

type CardWithProfile = Database['public']['Tables']['nfc_cards']['Row'] & {
  profile?: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

interface CardsTableProps {
  cards: CardWithProfile[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  siteUrl: string;
  batches: string[];
}

export function CardsTable({
  cards,
  totalCount,
  currentPage,
  pageSize,
  siteUrl,
  batches,
}: CardsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');
  const [selectedBatch, setSelectedBatch] = useState(searchParams.get('batch') || 'all');

  const [isPending, startTransition] = useTransition();

  // Dialog states
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState('50');
  const [generateBatchId, setGenerateBatchId] = useState(`BATCH-${new Date().toISOString().slice(0, 10)}`);
  const [generateCardType, setGenerateCardType] = useState('plastic');

  const [assignModalCard, setAssignModalCard] = useState<CardWithProfile | null>(null);
  const [assignUsername, setAssignUsername] = useState('');

  const [deleteConfirmCard, setDeleteConfirmCard] = useState<CardWithProfile | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Lọc URL
  const handleApplyFilter = (newQuery?: string, newStatus?: string, newBatch?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const q = newQuery !== undefined ? newQuery : searchTerm;
    const s = newStatus !== undefined ? newStatus : selectedStatus;
    const b = newBatch !== undefined ? newBatch : selectedBatch;

    if (q) params.set('q', q);
    else params.delete('q');

    if (s && s !== 'all') params.set('status', s);
    else params.delete('status');

    if (b && b !== 'all') params.set('batch', b);
    else params.delete('batch');

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 1. Tạo thẻ hàng loạt
  const handleGenerateCards = () => {
    const count = parseInt(generateCount, 10);
    if (!count || count < 1 || count > 1000) {
      toast.error('Số lượng thẻ phải từ 1 đến 1000');
      return;
    }

    startTransition(async () => {
      const res = await generateCardsAction(count, generateBatchId, generateCardType);
      if (res.success) {
        toast.success(`Đã tạo thành công ${res.count} thẻ NFC thuộc lô "${res.batchId}"!`);
        setShowGenerateModal(false);
      } else {
        toast.error(res.error);
      }
    });
  };

  // 2. Xuất CSV
  const handleExportCsv = () => {
    if (cards.length === 0) {
      toast.error('Không có thẻ nào để xuất file');
      return;
    }

    const headers = ['Mã thẻ (Code)', 'URL quét NFC/QR', 'Loại thẻ', 'Trạng thái', 'Chủ sở hữu', 'Lô thẻ', 'Ngày tạo'];
    const rows = cards.map((c) => [
      c.code,
      `${siteUrl}/c/${c.code}`,
      c.card_type || 'plastic',
      c.status,
      c.profile?.full_name ? `${c.profile.full_name} (@${c.profile.username})` : 'Chưa gán',
      c.batch_id || '',
      c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join(
        '\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `nfc-cards-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Đã tải xuống file CSV thành công!');
  };

  // 3. Khóa / Mở khóa thẻ
  const handleToggleCardLock = (card: CardWithProfile) => {
    const nextStatus = card.status === 'locked' ? (card.profile_id ? 'active' : 'unassigned') : 'locked';
    startTransition(async () => {
      const res = await updateCardStatusByAdminAction(
        card.id,
        nextStatus as 'active' | 'unassigned' | 'locked' | 'lost'
      );
      if (res.success) {
        toast.success(nextStatus === 'locked' ? 'Đã khóa thẻ NFC' : 'Đã mở khóa thẻ NFC');
      } else {
        toast.error(res.error);
      }
    });
  };

  // 4. Gán thẻ cho người dùng
  const handleAssignCard = () => {
    if (!assignModalCard || !assignUsername.trim()) return;
    startTransition(async () => {
      const res = await assignCardToUserAction(assignModalCard.id, assignUsername);
      if (res.success) {
        toast.success(`Đã gán thẻ ${assignModalCard.code} cho @${res.user?.username}!`);
        setAssignModalCard(null);
        setAssignUsername('');
      } else {
        toast.error(res.error);
      }
    });
  };

  // 5. Gỡ thẻ về kho
  const handleUnassignCard = (card: CardWithProfile) => {
    startTransition(async () => {
      const res = await unassignCardAction(card.id);
      if (res.success) {
        toast.success(`Đã gỡ thẻ ${card.code} về kho trống`);
      } else {
        toast.error(res.error);
      }
    });
  };

  // 6. Xóa thẻ
  const handleDeleteCard = () => {
    if (!deleteConfirmCard) return;
    startTransition(async () => {
      const res = await deleteCardByAdminAction(deleteConfirmCard.id);
      if (res.success) {
        toast.success('Đã xóa thẻ khỏi hệ thống');
        setDeleteConfirmCard(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Thanh công cụ: Tìm kiếm, Bộ lọc & Nút hành động */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleApplyFilter();
          }}
          className="relative flex-1"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã thẻ (vd: CARD1234)..."
            className="pl-9 h-10 rounded-xl"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Lọc Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleApplyFilter(undefined, e.target.value, undefined);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động (Active)</option>
            <option value="unassigned">Kho trống (Unassigned)</option>
            <option value="locked">Bị khóa (Locked)</option>
            <option value="lost">Báo mất (Lost)</option>
          </select>

          {/* Lọc Lô thẻ */}
          {batches.length > 0 && (
            <select
              value={selectedBatch}
              onChange={(e) => {
                setSelectedBatch(e.target.value);
                handleApplyFilter(undefined, undefined, e.target.value);
              }}
              className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
            >
              <option value="all">Tất cả các lô</option>
              {batches.map((b) => (
                <option key={b} value={b}>
                  Lô: {b}
                </option>
              ))}
            </select>
          )}

          {/* Nút Xuất CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-10 px-3 rounded-xl gap-1.5 text-xs font-semibold"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Xuất CSV</span>
          </Button>

          {/* Nút Tạo thẻ hàng loạt */}
          <Button
            size="sm"
            onClick={() => setShowGenerateModal(true)}
            className="h-10 px-4 rounded-xl gap-1.5 text-xs font-bold shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo thẻ hàng loạt</span>
          </Button>
        </div>
      </div>

      {/* Bảng danh sách thẻ NFC */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="py-3.5 px-4">Mã thẻ (Code)</th>
                <th className="py-3.5 px-4">Loại thẻ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Chủ sở hữu</th>
                <th className="py-3.5 px-4">Lô sản xuất</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy thẻ NFC nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                cards.map((c) => {
                  const isLocked = c.status === 'locked';
                  const isLost = c.status === 'lost';
                  const isUnassigned = c.status === 'unassigned';
                  const isActive = c.status === 'active';

                  return (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      {/* Mã thẻ */}
                      <td className="py-3.5 px-4 font-mono font-bold text-sm">
                        <Link
                          href={`/c/${c.code}`}
                          target="_blank"
                          className="hover:underline text-primary inline-flex items-center gap-1.5"
                        >
                          <span>{c.code}</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </Link>
                      </td>

                      {/* Loại thẻ */}
                      <td className="py-3.5 px-4 text-xs font-medium">
                        <span className="capitalize">{c.card_type || 'plastic'}</span>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {isActive && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                            Hoạt động
                          </Badge>
                        )}
                        {isUnassigned && (
                          <Badge variant="outline" className="text-blue-500 border-blue-500/30 text-[10px] font-bold">
                            Kho trống
                          </Badge>
                        )}
                        {isLocked && (
                          <Badge variant="destructive" className="gap-1 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            Đã khóa
                          </Badge>
                        )}
                        {isLost && (
                          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] font-bold">
                            Báo mất
                          </Badge>
                        )}
                      </td>

                      {/* Chủ sở hữu */}
                      <td className="py-3.5 px-4">
                        {c.profile?.username ? (
                          <Link
                            href={`/u/${c.profile.username}`}
                            target="_blank"
                            className="text-xs font-semibold text-foreground hover:text-primary hover:underline flex items-center gap-1.5"
                          >
                            <span>{c.profile.full_name || `@${c.profile.username}`}</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Chưa kích hoạt</span>
                        )}
                      </td>

                      {/* Lô sản xuất */}
                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {c.batch_id || '—'}
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('vi-VN') : '—'}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48 rounded-xl">
                            <DropdownMenuLabel className="text-xs">Quản lý thẻ</DropdownMenuLabel>
                            <DropdownMenuItem
                              render={
                                <Link href={`/c/${c.code}`} target="_blank" className="flex items-center gap-2 text-xs">
                                  <ExternalLink className="w-3.5 h-3.5" />
                                  <span>Thử quét thẻ (/c/{c.code})</span>
                                </Link>
                              }
                            />

                            <DropdownMenuSeparator />

                            {/* Gán thẻ */}
                            <DropdownMenuItem
                              onClick={() => {
                                setAssignModalCard(c);
                                setAssignUsername('');
                              }}
                              className="text-xs gap-2"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-primary" />
                              <span>Gán cho người dùng</span>
                            </DropdownMenuItem>

                            {/* Gỡ thẻ nếu đã có chủ */}
                            {c.profile_id && (
                              <DropdownMenuItem
                                onClick={() => handleUnassignCard(c)}
                                disabled={isPending}
                                className="text-xs gap-2 text-amber-600"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Gỡ thẻ về kho trống</span>
                              </DropdownMenuItem>
                            )}

                            {/* Khóa/Mở khóa */}
                            <DropdownMenuItem
                              onClick={() => handleToggleCardLock(c)}
                              disabled={isPending}
                              className={`text-xs gap-2 ${isLocked ? 'text-emerald-600' : 'text-amber-600'}`}
                            >
                              {isLocked ? (
                                <>
                                  <Unlock className="w-3.5 h-3.5" />
                                  <span>Mở khóa thẻ</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Khóa thẻ này</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {/* Xóa thẻ */}
                            <DropdownMenuItem
                              onClick={() => setDeleteConfirmCard(c)}
                              disabled={isPending}
                              className="text-xs gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Xóa thẻ vĩnh viễn</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
            Hiển thị <strong>{cards.length}</strong> trên tổng số <strong>{totalCount}</strong> thẻ NFC
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

      {/* Modal Tạo thẻ hàng loạt */}
      {showGenerateModal && (
        <Dialog open={showGenerateModal} onOpenChange={setShowGenerateModal}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>Tạo hàng loạt mã thẻ NFC</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Hệ thống sẽ tự động sinh mã thẻ bảo mật ngẫu nhiên 8 ký tự và lưu vào kho thẻ.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="count" className="text-xs font-semibold">
                  Số lượng thẻ cần tạo (1 - 1000):
                </Label>
                <Input
                  id="count"
                  type="number"
                  min={1}
                  max={1000}
                  value={generateCount}
                  onChange={(e) => setGenerateCount(e.target.value)}
                  className="rounded-xl h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="batch" className="text-xs font-semibold">
                  Mã định danh lô sản xuất (Batch ID):
                </Label>
                <Input
                  id="batch"
                  value={generateBatchId}
                  onChange={(e) => setGenerateBatchId(e.target.value)}
                  placeholder="vd: BATCH-HN-2026-01"
                  className="rounded-xl h-10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs font-semibold">
                  Loại chất liệu thẻ:
                </Label>
                <select
                  id="type"
                  value={generateCardType}
                  onChange={(e) => setGenerateCardType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
                >
                  <option value="plastic">Nhựa PVC thông thường (Plastic)</option>
                  <option value="metal">Kim loại cao cấp (Metallic / Black Card)</option>
                  <option value="wood">Gỗ sinh thái thân thiện (Wood)</option>
                </select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGenerateModal(false)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleGenerateCards}
                disabled={isPending}
                className="rounded-xl gap-2 font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                <span>Bắt đầu tạo thẻ</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Gán thẻ cho người dùng */}
      {assignModalCard && (
        <Dialog open={!!assignModalCard} onOpenChange={() => setAssignModalCard(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" />
                <span>Gán thẻ {assignModalCard.code} cho người dùng</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Nhập username người dùng bạn muốn liên kết thẻ NFC này vào tài khoản của họ.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="assign-user" className="text-xs font-semibold">
                  Username người dùng (không bao gồm @):
                </Label>
                <Input
                  id="assign-user"
                  value={assignUsername}
                  onChange={(e) => setAssignUsername(e.target.value)}
                  placeholder="vd: hien, ducthang..."
                  className="rounded-xl h-10 font-mono"
                  autoFocus
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignModalCard(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                onClick={handleAssignCard}
                disabled={isPending || !assignUsername.trim()}
                className="rounded-xl gap-2 font-bold"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                <span>Gán thẻ ngay</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Xác nhận Xóa thẻ */}
      {deleteConfirmCard && (
        <Dialog open={!!deleteConfirmCard} onOpenChange={() => setDeleteConfirmCard(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Xác nhận xóa thẻ NFC {deleteConfirmCard.code}</span>
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Hành động này sẽ xóa hoàn toàn mã thẻ này khỏi hệ thống. Người quét thẻ này trong tương lai sẽ nhận được thông báo &quot;Mã thẻ không tồn tại&quot;.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmCard(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteCard}
                disabled={isPending}
                className="rounded-xl gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Xác nhận xóa</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
