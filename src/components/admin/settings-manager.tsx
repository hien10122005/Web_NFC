'use client';

import React, { useState, useTransition } from 'react';
import { Database } from '@/types/database.types';
import {
  updateSiteSettingAction,
  toggleSocialPlatformAction,
  addReservedUsernameAction,
  deleteReservedUsernameAction,
} from '@/actions/admin-settings';
import { toast } from 'sonner';
import {
  Globe,
  Share2,
  Ban,
  Save,
  Plus,
  Trash2,
  Loader2,
  Bell,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { PlatformIcon } from '@/components/platform-icon';

type SocialPlatformRow = Database['public']['Tables']['social_platforms']['Row'];
type ReservedUsernameRow = Database['public']['Tables']['reserved_usernames']['Row'];

interface SettingsManagerProps {
  settings: Record<string, unknown>;
  platforms: SocialPlatformRow[];
  reservedUsernames: ReservedUsernameRow[];
}

export function SettingsManager({
  settings: initialSettings,
  platforms: initialPlatforms,
  reservedUsernames: initialReserved,
}: SettingsManagerProps) {
  const [isPending, startTransition] = useTransition();

  // Tab 1: General Settings state
  const [allowRegistration, setAllowRegistration] = useState<boolean>(
    Boolean(initialSettings.allow_registration ?? true)
  );
  const [siteName, setSiteName] = useState<string>(
    String(initialSettings.site_name || 'Trang Cá Nhân NFC')
  );
  const [maxLinks, setMaxLinks] = useState<string>(
    String(initialSettings.max_links_per_user || '30')
  );
  const [announcement, setAnnouncement] = useState<string>(
    String(initialSettings.announcement || '')
  );

  // Tab 3: Reserved username input
  const [newReservedInput, setNewReservedInput] = useState('');

  // 1. Lưu Cấu hình chung
  const handleSaveGeneral = () => {
    startTransition(async () => {
      const results = await Promise.all([
        updateSiteSettingAction('allow_registration', allowRegistration),
        updateSiteSettingAction('site_name', siteName),
        updateSiteSettingAction('max_links_per_user', parseInt(maxLinks, 10) || 30),
        updateSiteSettingAction('announcement', announcement.trim() || null),
      ]);

      const hasError = results.find((r) => !r.success);
      if (hasError) {
        toast.error(hasError.error);
      } else {
        toast.success('Đã lưu cấu hình hệ thống thành công!');
      }
    });
  };

  // 2. Bật/Tắt Social Platform
  const handleTogglePlatform = (key: string, currentActive: boolean) => {
    startTransition(async () => {
      const res = await toggleSocialPlatformAction(key, !currentActive);
      if (res.success) {
        toast.success(`Đã ${!currentActive ? 'bật' : 'tắt'} nền tảng "${key}"`);
      } else {
        toast.error(res.error);
      }
    });
  };

  // 3. Thêm Reserved Username
  const handleAddReserved = () => {
    const val = newReservedInput.trim().toLowerCase();
    if (!val) return;

    startTransition(async () => {
      const res = await addReservedUsernameAction(val);
      if (res.success) {
        toast.success(`Đã thêm "${val}" vào danh sách cấm!`);
        setNewReservedInput('');
      } else {
        toast.error(res.error);
      }
    });
  };

  // 4. Xóa Reserved Username
  const handleDeleteReserved = (username: string) => {
    startTransition(async () => {
      const res = await deleteReservedUsernameAction(username);
      if (res.success) {
        toast.success(`Đã gỡ "${username}" khỏi danh sách cấm`);
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Tabs defaultValue="general" className="w-full space-y-6">
      <TabsList className="grid grid-cols-3 max-w-md h-11 p-1 bg-muted/80 rounded-2xl">
        <TabsTrigger value="general" className="text-xs font-bold rounded-xl gap-2">
          <Globe className="w-3.5 h-3.5" />
          <span>Hệ thống</span>
        </TabsTrigger>
        <TabsTrigger value="platforms" className="text-xs font-bold rounded-xl gap-2">
          <Share2 className="w-3.5 h-3.5" />
          <span>Nền tảng MXH</span>
        </TabsTrigger>
        <TabsTrigger value="reserved" className="text-xs font-bold rounded-xl gap-2">
          <Ban className="w-3.5 h-3.5" />
          <span>Username cấm</span>
        </TabsTrigger>
      </TabsList>

      {/* TAB 1: CẤU HÌNH CHUNG */}
      <TabsContent value="general" className="space-y-6 animate-fadeIn">
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Cài đặt vận hành hệ thống</CardTitle>
            <CardDescription className="text-xs">
              Các thiết lập ảnh hưởng đến toàn bộ website và người dùng
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Đóng / Mở đăng ký */}
            <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-muted/20">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Cho phép đăng ký tài khoản mới</Label>
                <p className="text-xs text-muted-foreground">
                  Nếu tắt, người dùng mới sẽ không thể đăng ký trên trang /register
                </p>
              </div>
              <Switch
                checked={allowRegistration}
                onCheckedChange={setAllowRegistration}
                disabled={isPending}
              />
            </div>

            {/* Tên hệ thống */}
            <div className="space-y-2">
              <Label htmlFor="site_name" className="text-xs font-bold">
                Tên thương hiệu hệ thống (Site Name):
              </Label>
              <Input
                id="site_name"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>

            {/* Số link tối đa */}
            <div className="space-y-2">
              <Label htmlFor="max_links" className="text-xs font-bold">
                Số lượng liên kết tối đa mỗi hồ sơ:
              </Label>
              <Input
                id="max_links"
                type="number"
                min={5}
                max={100}
                value={maxLinks}
                onChange={(e) => setMaxLinks(e.target.value)}
                className="rounded-xl h-10"
              />
            </div>

            {/* Banner thông báo chung */}
            <div className="space-y-2">
              <Label htmlFor="announcement" className="text-xs font-bold flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-primary" />
                <span>Thông báo toàn hệ thống (để trống nếu không có):</span>
              </Label>
              <Input
                id="announcement"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="vd: Hệ thống bảo trì nâng cấp thẻ NFC vào 02:00 sáng chủ nhật..."
                className="rounded-xl h-10"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                onClick={handleSaveGeneral}
                disabled={isPending}
                className="rounded-xl gap-2 font-bold px-6 shadow-xs"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Lưu cấu hình</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 2: NỀN TẢNG MẠNG XÃ HỘI */}
      <TabsContent value="platforms" className="space-y-4 animate-fadeIn">
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Danh mục Nền tảng Mạng xã hội</CardTitle>
            <CardDescription className="text-xs">
              Bật/tắt các biểu tượng và nền tảng hiển thị khi người dùng tạo liên kết
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {initialPlatforms.map((p) => (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-muted/80 flex items-center justify-center text-primary shrink-0">
                      <PlatformIcon platform={p.key} size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{p.name}</p>
                      <p className="font-mono text-xs text-muted-foreground">{p.url_prefix || 'https://'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {p.is_active ? 'Đang bật' : 'Đang tắt'}
                    </span>
                    <Switch
                      checked={Boolean(p.is_active)}
                      onCheckedChange={() => handleTogglePlatform(p.key, Boolean(p.is_active))}
                      disabled={isPending}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* TAB 3: RESERVED USERNAMES */}
      <TabsContent value="reserved" className="space-y-4 animate-fadeIn">
        <Card className="rounded-2xl border-border/60 shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Danh sách Tên người dùng cấm (Reserved)</CardTitle>
            <CardDescription className="text-xs">
              Các username đặc biệt được bảo lưu, không cho phép thành viên đăng ký
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Form thêm username cấm */}
            <div className="flex items-center gap-2">
              <Input
                value={newReservedInput}
                onChange={(e) => setNewReservedInput(e.target.value)}
                placeholder="Nhập username cần cấm (vd: support, api, nfc...)"
                className="rounded-xl h-10 font-mono text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReserved();
                  }
                }}
              />
              <Button
                onClick={handleAddReserved}
                disabled={isPending || !newReservedInput.trim()}
                className="h-10 px-4 rounded-xl gap-1.5 text-xs font-bold shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm</span>
              </Button>
            </div>

            {/* Danh sách badge */}
            <div className="flex flex-wrap gap-2 pt-2">
              {initialReserved.map((r) => (
                <div
                  key={r.username}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/60 bg-muted/40 font-mono text-xs font-medium"
                >
                  <span>@{r.username}</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReserved(r.username)}
                    disabled={isPending}
                    className="text-muted-foreground hover:text-rose-500 transition-colors"
                    title={`Xóa @${r.username}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
