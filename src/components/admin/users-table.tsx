'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Database } from '@/types/database.types';
import {
  updateUserStatusAction,
  updateUserRoleAction,
  updateUserVisibilityAction,
  deleteUserByAdminAction,
} from '@/actions/admin-users';
import { toast } from 'sonner';
import {
  Search,
  Shield,
  MoreVertical,
  ExternalLink,
  Lock,
  Unlock,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
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

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface UsersTableProps {
  users: ProfileRow[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentUserId: string;
}

export function UsersTable({
  users,
  totalCount,
  currentPage,
  pageSize,
  currentUserId,
}: UsersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'all');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'all');

  const [isPending, startTransition] = useTransition();
  const [detailUser, setDetailUser] = useState<ProfileRow | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<ProfileRow | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  // Cập nhật bộ lọc lên URL
  const handleApplyFilter = (newQuery?: string, newRole?: string, newStatus?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const q = newQuery !== undefined ? newQuery : searchTerm;
    const r = newRole !== undefined ? newRole : selectedRole;
    const s = newStatus !== undefined ? newStatus : selectedStatus;

    if (q) params.set('q', q);
    else params.delete('q');

    if (r && r !== 'all') params.set('role', r);
    else params.delete('role');

    if (s && s !== 'all') params.set('status', s);
    else params.delete('status');

    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  // 1. Khóa / Mở khóa
  const handleToggleStatus = (user: ProfileRow) => {
    const nextStatus = user.status === 'banned' ? 'active' : 'banned';
    startTransition(async () => {
      const res = await updateUserStatusAction(user.id, nextStatus);
      if (res.success) {
        toast.success(
          nextStatus === 'banned' ? 'Đã khóa tài khoản thành công' : 'Đã mở khóa tài khoản thành công'
        );
      } else {
        toast.error(res.error);
      }
    });
  };

  // 2. Đổi quyền
  const handleToggleRole = (user: ProfileRow) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    startTransition(async () => {
      const res = await updateUserRoleAction(user.id, nextRole);
      if (res.success) {
        toast.success(`Đã đổi quyền thành ${nextRole === 'admin' ? 'Quản trị viên' : 'Người dùng'}`);
      } else {
        toast.error(res.error);
      }
    });
  };

  // 3. Đổi hiển thị
  const handleToggleVisibility = (user: ProfileRow) => {
    const nextVisibility = !user.is_public;
    startTransition(async () => {
      const res = await updateUserVisibilityAction(user.id, nextVisibility);
      if (res.success) {
        toast.success(
          nextVisibility ? 'Đã chuyển sang hồ sơ công khai' : 'Đã ẩn hồ sơ cá nhân'
        );
      } else {
        toast.error(res.error);
      }
    });
  };

  // 4. Xóa người dùng
  const handleDeleteUser = () => {
    if (!deleteConfirmUser) return;
    startTransition(async () => {
      const res = await deleteUserByAdminAction(deleteConfirmUser.id);
      if (res.success) {
        toast.success('Đã xóa người dùng khỏi hệ thống');
        setDeleteConfirmUser(null);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & Bộ lọc */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-2xl border border-border/60 shadow-xs">
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
            placeholder="Tìm theo họ tên, username..."
            className="pl-9 h-10 rounded-xl"
          />
        </form>

        <div className="flex items-center gap-2">
          {/* Lọc Role */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              handleApplyFilter(undefined, e.target.value, undefined);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">Người dùng (User)</option>
            <option value="admin">Quản trị viên (Admin)</option>
          </select>

          {/* Lọc Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              handleApplyFilter(undefined, undefined, e.target.value);
            }}
            className="h-10 px-3 rounded-xl border border-input bg-background text-xs font-semibold"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="banned">Đã bị khóa</option>
          </select>

          {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
                handleApplyFilter('', 'all', 'all');
              }}
              className="text-xs h-10 px-3 rounded-xl"
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Bảng danh sách người dùng */}
      <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="py-3.5 px-4">Người dùng</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Vai trò</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4">Chế độ</th>
                <th className="py-3.5 px-4">Ngày tạo</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentUserId;
                  const isBanned = u.status === 'banned';
                  const isAdmin = u.role === 'admin';

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      {/* Tên & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary shrink-0">
                            {u.avatar_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={u.avatar_url}
                                alt={u.full_name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (u.full_name || u.username || 'U').slice(0, 1).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-foreground truncate max-w-[160px]">
                              {u.full_name || 'Chưa đặt tên'}
                            </p>
                            {isCurrentAdmin && (
                              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                (Tài khoản của bạn)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {u.username ? (
                          <Link
                            href={`/u/${u.username}`}
                            target="_blank"
                            className="text-primary hover:underline flex items-center gap-1 font-semibold"
                          >
                            <span>@{u.username}</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground italic">Chưa tạo</span>
                        )}
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        {isAdmin ? (
                          <Badge className="bg-primary/15 text-primary border-primary/20 gap-1 text-[10px] font-bold">
                            <Shield className="w-3 h-3" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            User
                          </Badge>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isBanned ? (
                          <Badge variant="destructive" className="gap-1 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            Đã khóa
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold">
                            Hoạt động
                          </Badge>
                        )}
                      </td>

                      {/* Chế độ */}
                      <td className="py-3.5 px-4 text-xs">
                        {u.is_public ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Công khai
                          </span>
                        ) : (
                          <span className="text-muted-foreground font-medium flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Riêng tư
                          </span>
                        )}
                      </td>

                      {/* Ngày tạo */}
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('vi-VN')
                          : '—'}
                      </td>

                      {/* Actions */}
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
                            <DropdownMenuLabel className="text-xs">Hành động</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => setDetailUser(u)}
                              className="text-xs gap-2"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Xem chi tiết hồ sơ</span>
                            </DropdownMenuItem>

                            {u.username && (
                              <DropdownMenuItem
                                render={
                                  <Link href={`/u/${u.username}`} target="_blank" className="flex items-center gap-2 text-xs">
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Mở trang cá nhân</span>
                                  </Link>
                                }
                              />
                            )}

                            <DropdownMenuSeparator />

                            {/* Bật/Tắt công khai */}
                            <DropdownMenuItem
                              onClick={() => handleToggleVisibility(u)}
                              disabled={isPending}
                              className="text-xs gap-2"
                            >
                              {u.is_public ? (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>Ẩn trang cá nhân</span>
                                </>
                              ) : (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Công khai trang</span>
                                </>
                              )}
                            </DropdownMenuItem>

                            {/* Đổi quyền */}
                            {!isCurrentAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleToggleRole(u)}
                                disabled={isPending}
                                className="text-xs gap-2"
                              >
                                <Shield className="w-3.5 h-3.5 text-primary" />
                                <span>
                                  {isAdmin ? 'Giáng quyền thành User' : 'Nâng quyền thành Admin'}
                                </span>
                              </DropdownMenuItem>
                            )}

                            {/* Khóa/Mở khóa */}
                            {!isCurrentAdmin && (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(u)}
                                disabled={isPending}
                                className={`text-xs gap-2 ${
                                  isBanned ? 'text-emerald-600' : 'text-amber-600'
                                }`}
                              >
                                {isBanned ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Mở khóa tài khoản</span>
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-3.5 h-3.5" />
                                    <span>Khóa tài khoản</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}

                            {/* Xóa người dùng */}
                            {!isCurrentAdmin && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteConfirmUser(u)}
                                  disabled={isPending}
                                  className="text-xs gap-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/20"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Xóa vĩnh viễn</span>
                                </DropdownMenuItem>
                              </>
                            )}
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
            Hiển thị <strong>{users.length}</strong> trên tổng số <strong>{totalCount}</strong> người dùng
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

      {/* Modal Chi tiết người dùng */}
      {detailUser && (
        <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold">Chi tiết tài khoản người dùng</DialogTitle>
              <DialogDescription className="text-xs">
                Mã định danh (ID): <span className="font-mono text-foreground">{detailUser.id}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-base text-primary shrink-0">
                  {detailUser.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={detailUser.avatar_url}
                      alt={detailUser.full_name || ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (detailUser.full_name || detailUser.username || 'U').slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-base">{detailUser.full_name || 'Chưa đặt tên'}</h4>
                  <p className="font-mono text-xs text-muted-foreground">
                    @{detailUser.username || 'chưa-tạo-username'}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Chức danh / Công ty:</span>
                  <span className="font-medium">
                    {detailUser.job_title || '—'} {detailUser.organization ? `(${detailUser.organization})` : ''}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Số điện thoại:</span>
                  <span className="font-medium">{detailUser.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Email liên hệ:</span>
                  <span className="font-medium">{detailUser.email_public || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Địa chỉ:</span>
                  <span className="font-medium">{detailUser.address || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Trạng thái hồ sơ:</span>
                  <span className="font-bold">
                    {detailUser.status === 'banned' ? '❌ Bị khóa' : '✅ Đang hoạt động'}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Quyền hạn:</span>
                  <span className="font-bold uppercase text-primary">{detailUser.role}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Ngày tham gia:</span>
                  <span>{detailUser.created_at ? new Date(detailUser.created_at).toLocaleString('vi-VN') : '—'}</span>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setDetailUser(null)} className="rounded-xl">
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal Xác nhận Xóa người dùng */}
      {deleteConfirmUser && (
        <Dialog open={!!deleteConfirmUser} onOpenChange={() => setDeleteConfirmUser(null)}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-rose-600 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                <span>Xác nhận xóa tài khoản người dùng</span>
              </DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Hành động này sẽ xóa hoàn toàn hồ sơ của{' '}
                <strong>{deleteConfirmUser.full_name || deleteConfirmUser.username}</strong>, gỡ tất cả thẻ NFC đã gắn và xóa toàn bộ liên kết. Thao tác này <strong>không thể hoàn tác</strong>.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmUser(null)}
                disabled={isPending}
                className="rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteUser}
                disabled={isPending}
                className="rounded-xl gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Xác nhận xóa vĩnh viễn</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
