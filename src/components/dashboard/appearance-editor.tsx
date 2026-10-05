'use client';

import React, { useState, useTransition } from 'react';
import { Database } from '@/types/database.types';
import {
  ProfileTheme,
  THEME_PRESETS,
  DEFAULT_THEME,
  parseTheme,
} from '@/types/theme';
import { updateThemeAction } from '@/actions/appearance';
import { ProfilePreviewCard } from '@/components/profile/profile-preview-card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Palette,
  Eye,
  Check,
  RotateCcw,
  Smartphone,
  Save,
  Loader2,
  Sparkles,
} from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type LinkRow = Database['public']['Tables']['links']['Row'];

interface AppearanceEditorProps {
  profile: ProfileRow;
  links: LinkRow[];
}

const COLOR_PALETTE = [
  '#0284c7', // Sky blue
  '#2563eb', // Royal blue
  '#059669', // Emerald
  '#16a34a', // Green
  '#ea580c', // Orange
  '#e11d48', // Rose
  '#9333ea', // Purple
  '#4f46e5', // Indigo
  '#18181b', // Zinc / Black
  '#d97706', // Amber
];

export function AppearanceEditor({ profile, links }: AppearanceEditorProps) {
  const [theme, setTheme] = useState<ProfileTheme>(() => parseTheme(profile.theme));
  const [isPending, startTransition] = useTransition();

  const handleApplyPreset = (presetId: string) => {
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTheme({ ...found.theme });
    }
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    toast.info('Đã hoàn về giao diện mặc định');
  };

  const handleSave = () => {
    startTransition(async () => {
      const res = await updateThemeAction(theme);
      if (res.success) {
        toast.success('Đã lưu giao diện trang cá nhân thành công!');
      } else {
        toast.error('Lưu thất bại: ' + res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Tùy biến giao diện</h2>
          <p className="text-sm text-muted-foreground">
            Lựa chọn phong cách, màu sắc và kiểu nút để trang cá nhân của bạn thật nổi bật.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isPending}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc định</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isPending}
            className="gap-1.5"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu thay đổi</span>
          </Button>
        </div>
      </div>

      {/* Tabs cho Mobile (Chỉnh sửa / Xem trước) */}
      <Tabs defaultValue="editor" className="w-full lg:hidden">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="editor" className="gap-2">
            <Palette className="w-4 h-4" /> Chỉnh sửa
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" /> Xem trước
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-6">
          <EditorControls
            theme={theme}
            setTheme={setTheme}
            onApplyPreset={handleApplyPreset}
          />
        </TabsContent>

        <TabsContent value="preview" className="flex justify-center py-4">
          <MobileMockupFrame profile={profile} links={links} theme={theme} />
        </TabsContent>
      </Tabs>

      {/* Grid 2 cột trên Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-8 items-start">
        {/* Cột trái: Bộ điều khiển (7 cột) */}
        <div className="lg:col-span-7 space-y-6">
          <EditorControls
            theme={theme}
            setTheme={setTheme}
            onApplyPreset={handleApplyPreset}
          />
        </div>

        {/* Cột phải: Live Preview Mockup (5 cột Sticky) */}
        <div className="lg:col-span-5 sticky top-20 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Xem trước trực tiếp (Mobile)</span>
          </div>
          <MobileMockupFrame profile={profile} links={links} theme={theme} />
        </div>
      </div>
    </div>
  );
}

// BỘ ĐIỀU KHIỂN CHỈNH SỬA
interface EditorControlsProps {
  theme: ProfileTheme;
  setTheme: React.Dispatch<React.SetStateAction<ProfileTheme>>;
  onApplyPreset: (presetId: string) => void;
}

function EditorControls({ theme, setTheme, onApplyPreset }: EditorControlsProps) {
  return (
    <div className="space-y-6">
      {/* 1. MẪU GIAO DIỆN (PRESETS) */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Mẫu giao diện có sẵn
          </CardTitle>
          <CardDescription>
            Chọn nhanh một phong cách thiết kế được phối màu chuyên nghiệp.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {THEME_PRESETS.map((preset) => {
              const isSelected = theme.preset === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onApplyPreset(preset.id)}
                  className={`text-left p-3 rounded-xl border-2 transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-xs'
                      : 'border-border hover:border-muted-foreground/30 hover:shadow-xs'
                  }`}
                >
                  {/* Thanh preview màu */}
                  <div
                    className="h-10 w-full rounded-lg mb-2 relative flex items-center justify-center shadow-inner overflow-hidden"
                    style={{ background: preset.previewBg }}
                  >
                    <div
                      className="w-4 h-4 rounded-full shadow-xs"
                      style={{ backgroundColor: preset.previewPrimary }}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-xs truncate">{preset.name}</p>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 2. MÀU CHỦ ĐẠO */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Màu sắc chủ đạo</CardTitle>
          <CardDescription>
            Màu áp dụng cho các nút hành động chính, icon liên kết và điểm nhấn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2.5">
            {COLOR_PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() =>
                  setTheme((prev) => ({ ...prev, primaryColor: c, preset: 'custom' }))
                }
                style={{ backgroundColor: c }}
                className={`w-9 h-9 rounded-full transition-transform active:scale-95 flex items-center justify-center shadow-xs ${
                  theme.primaryColor.toLowerCase() === c.toLowerCase()
                    ? 'ring-2 ring-offset-2 ring-primary scale-110'
                    : 'hover:scale-105'
                }`}
              >
                {theme.primaryColor.toLowerCase() === c.toLowerCase() && (
                  <Check className="w-4 h-4 text-white drop-shadow-xs" />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Label htmlFor="customColor" className="text-xs shrink-0">
              Hoặc nhập mã Hex:
            </Label>
            <div className="flex items-center gap-2 max-w-[160px]">
              <Input
                id="customColor"
                value={theme.primaryColor}
                onChange={(e) =>
                  setTheme((prev) => ({
                    ...prev,
                    primaryColor: e.target.value,
                    preset: 'custom',
                  }))
                }
                className="h-8 font-mono text-xs uppercase"
                placeholder="#0284c7"
              />
              <div
                className="w-7 h-7 rounded-md border shrink-0"
                style={{ backgroundColor: theme.primaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. KIỂU KHUNG VÀ NÚT LIÊN KẾT */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kiểu dáng liên kết</CardTitle>
          <CardDescription>
            Định hình phong cách các thẻ liên kết trên trang của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Kiểu bo góc */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Độ bo góc thẻ (Border Radius)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'rounded', label: 'Bo tròn vừa' },
                { id: 'pill', label: 'Bo tròn lớn' },
                { id: 'sharp', label: 'Góc vuông' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setTheme((prev) => ({
                      ...prev,
                      cardStyle: item.id as ProfileTheme['cardStyle'],
                      preset: 'custom',
                    }))
                  }
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                    theme.cardStyle === item.id
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hiệu ứng nút */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hiệu ứng viền & nền nút (Button Style)
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'filled', label: 'Màu khối' },
                { id: 'outline', label: 'Đường viền' },
                { id: 'soft', label: 'Màu êm dịu' },
                { id: 'glass', label: 'Kính mờ' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setTheme((prev) => ({
                      ...prev,
                      buttonStyle: item.id as ProfileTheme['buttonStyle'],
                      preset: 'custom',
                    }))
                  }
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                    theme.buttonStyle === item.id
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Phông chữ */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Phông chữ (Font Family)
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'system', label: 'Hiện đại (Sans)', font: 'font-sans' },
                { id: 'serif', label: 'Cổ điển (Serif)', font: 'font-serif' },
                { id: 'mono', label: 'Lập trình (Mono)', font: 'font-mono' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setTheme((prev) => ({
                      ...prev,
                      fontFamily: item.id as ProfileTheme['fontFamily'],
                      preset: 'custom',
                    }))
                  }
                  className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                    item.font
                  } ${
                    theme.fontFamily === item.id
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// KHUNG ĐIỆN THOẠI MOCKUP IPHONE
function MobileMockupFrame({
  profile,
  links,
  theme,
}: {
  profile: ProfileRow;
  links: LinkRow[];
  theme: ProfileTheme;
}) {
  return (
    <div className="relative w-[310px] sm:w-[340px] h-[640px] rounded-[48px] p-3 bg-zinc-950 shadow-2xl ring-1 ring-zinc-800 border-4 border-zinc-900 select-none">
      {/* Notch / Dynamic Island */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-30 flex items-center justify-between px-3">
        <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
        <div className="w-2 h-2 rounded-full bg-zinc-900" />
      </div>

      {/* Loa thoại viền kim loại */}
      <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-800 rounded-full z-30" />

      {/* Màn hình hiển thị bên trong */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden overflow-y-auto bg-card no-scrollbar">
        <ProfilePreviewCard
          profile={profile}
          links={links}
          theme={theme}
          isMockup={true}
        />
      </div>

      {/* Vạch Home Bar dưới đáy iPhone */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full z-30 pointer-events-none" />
    </div>
  );
}
