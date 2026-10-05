'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlatformIcon } from '@/components/platform-icon';
import { linkSchema, LinkFormData } from '@/lib/validations/links';
import { createLinkAction, updateLinkAction } from '@/actions/links';
import { toast } from 'sonner';
import { Database } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

type SocialPlatform = Database['public']['Tables']['social_platforms']['Row'];
type LinkRow = Database['public']['Tables']['links']['Row'];

interface LinkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platforms: SocialPlatform[];
  editingLink?: LinkRow | null;
  initialPlatform?: string;
}

export function LinkDialog({
  open,
  onOpenChange,
  platforms,
  editingLink,
  initialPlatform,
}: LinkDialogProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      platform: 'website',
      title: '',
      url: '',
      is_active: true,
    },
  });

  const selectedPlatform = watch('platform');
  const isActive = watch('is_active');

  useEffect(() => {
    if (editingLink) {
      reset({
        platform: editingLink.platform,
        title: editingLink.title || '',
        url: editingLink.url,
        is_active: editingLink.is_active,
      });
    } else {
      reset({
        platform: initialPlatform || (platforms[0]?.key ?? 'website'),
        title: '',
        url: '',
        is_active: true,
      });
    }
  }, [editingLink, initialPlatform, open, reset, platforms]);

  const currentPlatformInfo = platforms.find((p) => p.key === selectedPlatform);

  const getPlaceholder = () => {
    switch (selectedPlatform) {
      case 'phone':
        return '0912 345 678';
      case 'email':
        return 'ban@example.com';
      case 'zalo':
        return '0912345678 hoặc link Zalo';
      case 'facebook':
        return 'username hoặc fb.com/username';
      case 'messenger':
        return 'username';
      case 'tiktok':
        return '@username';
      case 'instagram':
        return 'username';
      case 'youtube':
        return '@kenhcua ban';
      case 'linkedin':
        return 'in/username';
      case 'github':
        return 'username';
      case 'x':
        return 'username';
      case 'telegram':
        return 'username';
      default:
        return 'https://example.com';
    }
  };

  const onSubmit = (data: LinkFormData) => {
    startTransition(async () => {
      if (editingLink) {
        const res = await updateLinkAction({
          id: editingLink.id,
          ...data,
        });
        if (res.success) {
          toast.success('Cập nhật liên kết thành công!');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Cập nhật thất bại.');
        }
      } else {
        const res = await createLinkAction(data);
        if (res.success) {
          toast.success('Đã thêm liên kết mới!');
          onOpenChange(false);
        } else {
          toast.error(res.error || 'Thêm liên kết thất bại.');
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingLink ? 'Chỉnh sửa liên kết' : 'Thêm liên kết mới'}
          </DialogTitle>
          <DialogDescription>
            {editingLink
              ? 'Thay đổi thông tin liên kết hiển thị trên trang cá nhân của bạn.'
              : 'Chọn nền tảng và nhập đường dẫn hoặc tên tài khoản của bạn.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Nền tảng */}
          <div className="space-y-1.5">
            <Label htmlFor="platform">Nền tảng / Loại liên kết</Label>
            <Select
              value={selectedPlatform}
              onValueChange={(val) => {
                if (!val) return;
                setValue('platform', val, { shouldValidate: true });
                // Gợi ý title mặc định nếu title hiện tại đang rỗng
                const cur = watch('title');
                if (!cur || cur.trim() === '') {
                  const plat = platforms.find((p) => p.key === val);
                  if (plat && plat.key !== 'website' && plat.key !== 'custom') {
                    setValue('title', plat.name);
                  }
                }
              }}
            >
              <SelectTrigger id="platform" className="w-full">
                <SelectValue placeholder="Chọn nền tảng" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {platforms.map((p) => (
                  <SelectItem key={p.key} value={p.key}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={p.key} size={16} />
                      <span>{p.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.platform && (
              <p className="text-xs text-destructive">{errors.platform.message}</p>
            )}
          </div>

          {/* Tiêu đề hiển thị */}
          <div className="space-y-1.5">
            <Label htmlFor="title">
              Tiêu đề hiển thị{' '}
              <span className="text-xs text-muted-foreground font-normal">(tùy chọn)</span>
            </Label>
            <Input
              id="title"
              placeholder={currentPlatformInfo?.name || 'Ví dụ: Facebook cá nhân'}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Đường dẫn / Tài khoản */}
          <div className="space-y-1.5">
            <Label htmlFor="url">
              Đường dẫn / Tài khoản <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="url"
                placeholder={getPlaceholder()}
                className="pr-10"
                {...register('url')}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <PlatformIcon platform={selectedPlatform} size={16} />
              </div>
            </div>
            {currentPlatformInfo?.url_prefix && (
              <p className="text-xs text-muted-foreground">
                Gợi ý: Chỉ cần nhập username, hệ thống sẽ tự gắn tiền tố{' '}
                <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono">
                  {currentPlatformInfo.url_prefix}
                </code>
              </p>
            )}
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          {/* Bật/Tắt hiển thị */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="is_active" className="text-sm cursor-pointer">
                Hiển thị liên kết
              </Label>
              <p className="text-xs text-muted-foreground">
                Tắt nếu bạn muốn tạm thời ẩn liên kết này trên trang cá nhân
              </p>
            </div>
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editingLink ? 'Lưu thay đổi' : 'Thêm liên kết'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
