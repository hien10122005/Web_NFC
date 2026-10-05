'use client';

import React, { useState, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Database } from '@/types/database.types';
import { PlatformIcon } from '@/components/platform-icon';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Pencil,
  Trash2,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { toggleLinkActiveAction, deleteLinkAction } from '@/actions/links';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type LinkRow = Database['public']['Tables']['links']['Row'];
type SocialPlatform = Database['public']['Tables']['social_platforms']['Row'];

interface SortableLinkItemProps {
  link: LinkRow;
  platforms: SocialPlatform[];
  onEdit: (link: LinkRow) => void;
}

export function SortableLinkItem({
  link,
  platforms,
  onEdit,
}: SortableLinkItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const [isPending, startTransition] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const platformInfo = platforms.find((p) => p.key === link.platform);
  const displayName = link.title || platformInfo?.name || link.platform;

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const res = await toggleLinkActiveAction(link.id, checked);
      if (res.success) {
        toast.success(checked ? 'Đã bật liên kết' : 'Đã ẩn liên kết');
      } else {
        toast.error('Lỗi: ' + res.error);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteLinkAction(link.id);
      if (res.success) {
        toast.success('Đã xóa liên kết!');
        setDeleteOpen(false);
      } else {
        toast.error('Không thể xóa: ' + res.error);
      }
    });
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl border bg-card text-card-foreground shadow-xs transition-shadow hover:shadow-sm ${
          !link.is_active ? 'opacity-60 bg-muted/30' : ''
        }`}
      >
        {/* Nút kéo thả */}
        <button
          type="button"
          aria-label="Kéo để sắp xếp"
          className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Biểu tượng nền tảng */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
          <PlatformIcon platform={link.platform} size={20} />
        </div>

        {/* Thông tin link */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold truncate">{displayName}</h4>
            {!link.is_active && (
              <span className="text-[10px] font-medium bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                Đang ẩn
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <span className="truncate">{link.url}</span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Mở liên kết trong tab mới"
              className="hover:text-primary shrink-0"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </div>

        {/* Các nút hành động */}
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={link.is_active}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Bật tắt hiển thị liên kết"
          />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(link)}
            aria-label="Sửa liên kết"
          >
            <Pencil className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
            aria-label="Xóa liên kết"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Dialog xác nhận xóa */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Xóa liên kết này?</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa liên kết &quot;{displayName}&quot;? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
