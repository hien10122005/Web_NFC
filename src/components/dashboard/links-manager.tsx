'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SortableLinkItem } from './sortable-link-item';
import { LinkDialog } from './link-dialog';
import { PlatformIcon } from '@/components/platform-icon';
import { Plus, GripVertical, Link2, Sparkles } from 'lucide-react';
import { reorderLinksAction } from '@/actions/links';
import { toast } from 'sonner';

type LinkRow = Database['public']['Tables']['links']['Row'];
type SocialPlatform = Database['public']['Tables']['social_platforms']['Row'];

interface LinksManagerProps {
  initialLinks: LinkRow[];
  platforms: SocialPlatform[];
}

export function LinksManager({ initialLinks, platforms }: LinksManagerProps) {
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkRow | null>(null);
  const [quickPlatform, setQuickPlatform] = useState<string | undefined>(undefined);

  // Đồng bộ khi server props thay đổi
  useEffect(() => {
    setLinks(initialLinks);
  }, [initialLinks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = links.findIndex((item) => item.id === active.id);
    const newIndex = links.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newItems = arrayMove(links, oldIndex, newIndex);
      setLinks(newItems);

      // Cập nhật vị trí lên cơ sở dữ liệu
      const orderedIds = newItems.map((item) => item.id);
      const res = await reorderLinksAction(orderedIds);
      if (!res.success) {
        toast.error('Không thể cập nhật thứ tự: ' + res.error);
        // Rollback nếu có lỗi
        setLinks(initialLinks);
      }
    }
  };

  const handleOpenCreate = (platformKey?: string) => {
    setEditingLink(null);
    setQuickPlatform(platformKey);
    setDialogOpen(true);
  };

  const handleOpenEdit = (link: LinkRow) => {
    setEditingLink(link);
    setQuickPlatform(undefined);
    setDialogOpen(true);
  };

  // Các nền tảng phổ biến
  const popularKeys = ['phone', 'zalo', 'facebook', 'tiktok', 'instagram', 'youtube'];
  const popularPlatforms = platforms.filter((p) => popularKeys.includes(p.key));

  return (
    <div className="space-y-6">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Danh sách liên kết</h2>
          <p className="text-sm text-muted-foreground">
            Thêm, sắp xếp và quản lý các liên kết hiển thị trên trang cá nhân của bạn ({links.length}/30).
          </p>
        </div>
        <Button onClick={() => handleOpenCreate()} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" /> Thêm liên kết
        </Button>
      </div>

      {/* Thêm nhanh từ nền tảng phổ biến */}
      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>Thêm nhanh liên kết mạng xã hội:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularPlatforms.map((p) => {
              const alreadyHas = links.some((l) => l.platform === p.key);
              return (
                <Button
                  key={p.key}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenCreate(p.key)}
                  className={`h-9 gap-2 text-xs bg-card hover:bg-accent ${
                    alreadyHas ? 'border-primary/40 text-primary' : ''
                  }`}
                >
                  <PlatformIcon platform={p.key} size={15} />
                  <span>{p.name}</span>
                  {alreadyHas && <span className="text-[10px] opacity-70">(đã có)</span>}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Danh sách kéo thả */}
      {links.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-base mb-1">Chưa có liên kết nào</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Hãy thêm số điện thoại, Zalo, Facebook hoặc các mạng xã hội khác để mọi người dễ dàng kết nối với bạn.
            </p>
            <Button onClick={() => handleOpenCreate()} className="gap-2">
              <Plus className="w-4 h-4" /> Thêm liên kết đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
            <span className="flex items-center gap-1">
              <GripVertical className="w-3.5 h-3.5" />
              Kéo thả các mục để thay đổi thứ tự xuất hiện
            </span>
            <span>Tổng cộng: {links.length} liên kết</span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={links.map((item) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2.5">
                {links.map((link) => (
                  <SortableLinkItem
                    key={link.id}
                    link={link}
                    platforms={platforms}
                    onEdit={handleOpenEdit}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Dialog tạo / chỉnh sửa */}
      <LinkDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        platforms={platforms}
        editingLink={editingLink}
        initialPlatform={quickPlatform}
      />
    </div>
  );
}
