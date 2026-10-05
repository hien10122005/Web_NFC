'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';
import {
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
  ChangePasswordFormData,
  ChangeEmailFormData,
  DeleteAccountFormData,
} from '@/lib/validations/settings';
import {
  changePasswordAction,
  changeEmailAction,
  deleteAccountAction,
} from '@/actions/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  KeyRound,
  Mail,
  ShieldAlert,
  Loader2,
  Lock,
  User as UserIcon,
  AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface SettingsFormProps {
  user: User;
  profile: ProfileRow;
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);

  // 1. FORM ĐỔI MẬT KHẨU
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const {
    register: regPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = (data: ChangePasswordFormData) => {
    startPasswordTransition(async () => {
      const res = await changePasswordAction(data);
      if (res.success) {
        toast.success(res.message || 'Đã đổi mật khẩu thành công!');
        resetPassword();
      } else {
        toast.error(res.error || 'Đổi mật khẩu thất bại.');
      }
    });
  };

  // 2. FORM ĐỔI EMAIL
  const [isEmailPending, startEmailTransition] = useTransition();
  const {
    register: regEmail,
    handleSubmit: handleEmailSubmit,
    reset: resetEmail,
    formState: { errors: emailErrors },
  } = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: '',
    },
  });

  const onEmailSubmit = (data: ChangeEmailFormData) => {
    startEmailTransition(async () => {
      const res = await changeEmailAction(data);
      if (res.success) {
        toast.success(res.message || 'Đã gửi yêu cầu đổi email!');
        resetEmail();
      } else {
        toast.error(res.error || 'Đổi email thất bại.');
      }
    });
  };

  // 3. FORM XÓA TÀI KHOẢN
  const [isDeletePending, startDeleteTransition] = useTransition();
  const {
    register: regDelete,
    handleSubmit: handleDeleteSubmit,
    reset: resetDelete,
    formState: { errors: deleteErrors },
  } = useForm<DeleteAccountFormData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: {
      confirmation: '',
    },
  });

  const onDeleteSubmit = (data: DeleteAccountFormData) => {
    startDeleteTransition(async () => {
      const res = await deleteAccountAction(data);
      if (res.success) {
        toast.success('Tài khoản đã được xóa thành công.');
        setDeleteOpen(false);
        router.push('/login?message=deleted');
      } else {
        toast.error(res.error || 'Không thể xóa tài khoản.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. THÔNG TIN TÀI KHOẢN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-primary" /> Thông tin tài khoản
          </CardTitle>
          <CardDescription>
            Chi tiết phiên đăng nhập và định danh tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
              <span className="text-muted-foreground font-medium">Email đăng nhập:</span>
              <p className="font-semibold text-sm truncate">{user.email || 'Chưa có'}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
              <span className="text-muted-foreground font-medium">Username hệ thống:</span>
              <p className="font-semibold text-sm font-mono">@{profile.username || 'chua_co'}</p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
              <span className="text-muted-foreground font-medium">Ngày tham gia:</span>
              <p className="font-semibold text-sm">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </p>
            </div>
            <div className="p-3 rounded-lg border bg-muted/40 space-y-1">
              <span className="text-muted-foreground font-medium">Vai trò:</span>
              <p className="font-semibold text-sm capitalize">{profile.role || 'user'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. ĐỔI MẬT KHẨU */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" /> Đổi mật khẩu
          </CardTitle>
          <CardDescription>
            Cập nhật mật khẩu thường xuyên để bảo vệ tài khoản cá nhân của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="••••••••"
                {...regPassword('currentPassword')}
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                {...regPassword('newPassword')}
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                {...regPassword('confirmPassword')}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPasswordPending} className="gap-2">
              {isPasswordPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Lock className="w-4 h-4" />
              <span>Cập nhật mật khẩu</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 3. ĐỔI ĐỊA CHỈ EMAIL */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Đổi địa chỉ Email
          </CardTitle>
          <CardDescription>
            Sau khi nhập email mới, bạn sẽ nhận được liên kết xác nhận được gửi về hộp thư.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-1.5">
              <Label htmlFor="newEmail">Địa chỉ Email mới</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="email_moi@example.com"
                {...regEmail('newEmail')}
              />
              {emailErrors.newEmail && (
                <p className="text-xs text-destructive">{emailErrors.newEmail.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isEmailPending} variant="outline" className="gap-2">
              {isEmailPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Mail className="w-4 h-4" />
              <span>Gửi liên kết đổi email</span>
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 4. DANGER ZONE: XÓA TÀI KHOẢN */}
      <Card className="border-red-200 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-4 h-4" /> Khu vực nguy hiểm
          </CardTitle>
          <CardDescription className="text-red-900/80 dark:text-red-300/80">
            Hành động này sẽ xóa vĩnh viễn hồ sơ, toàn bộ liên kết, ảnh đại diện và gỡ bỏ liên kết thẻ NFC của bạn. Không thể hoàn tác.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              resetDelete();
              setDeleteOpen(true);
            }}
            className="gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Xóa tài khoản của tôi</span>
          </Button>
        </CardContent>
      </Card>

      {/* DIALOG XÁC NHẬN XÓA TÀI KHOẢN */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Bạn chắc chắn muốn xóa tài khoản?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                Toàn bộ dữ liệu của bạn sẽ bị xóa vĩnh viễn theo chính sách bảo mật cá nhân.
              </p>
              <p className="font-semibold text-xs text-foreground">
                Để xác nhận, vui lòng gõ chính xác dòng chữ <span className="text-destructive font-mono">&quot;XÓA TÀI KHOẢN&quot;</span> vào ô bên dưới:
              </p>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleDeleteSubmit(onDeleteSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Input
                placeholder="XÓA TÀI KHOẢN"
                className="font-mono text-center tracking-wider"
                autoFocus
                {...regDelete('confirmation')}
              />
              {deleteErrors.confirmation && (
                <p className="text-xs text-destructive text-center">
                  {deleteErrors.confirmation.message}
                </p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeletePending}
                onClick={() => setDeleteOpen(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={isDeletePending}
                className="gap-1.5"
              >
                {isDeletePending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận xóa vĩnh viễn
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
