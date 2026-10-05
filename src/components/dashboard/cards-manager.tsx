'use client';

import React, { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Database } from '@/types/database.types';
import { activateCardSchema, ActivateCardFormData } from '@/lib/validations/cards';
import { activateCardAction } from '@/actions/cards';
import { CardItem } from './card-item';
import { QRDialog } from './qr-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  CreditCard,
  QrCode,
  Plus,
  Loader2,
  HelpCircle,
  Copy,
  Check,
  Radio,
  ExternalLink,
} from 'lucide-react';

type NfcCardRow = Database['public']['Tables']['nfc_cards']['Row'];
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

interface CardsManagerProps {
  cards: NfcCardRow[];
  profile: ProfileRow;
  baseUrl: string;
}

export function CardsManager({ cards, profile, baseUrl }: CardsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [profileQrOpen, setProfileQrOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const profileUrl = `${baseUrl}/u/${profile.username || ''}`;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActivateCardFormData>({
    resolver: zodResolver(activateCardSchema),
    defaultValues: {
      code: '',
    },
  });

  const onActivate = (data: ActivateCardFormData) => {
    startTransition(async () => {
      const res = await activateCardAction(data);
      if (res.success) {
        toast.success(res.message || 'Kích hoạt thẻ thành công!');
        reset();
      } else {
        toast.error(res.error || 'Kích hoạt thẻ thất bại');
      }
    });
  };

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success('Đã sao chép liên kết trang cá nhân!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. KHỐI QR TRANG CÁ NHÂN TỔNG QUAN */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
        <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Mã QR trang cá nhân của bạn</h3>
            <p className="text-xs text-muted-foreground max-w-md">
              Mã QR này luôn dẫn thẳng tới trang cá nhân <span className="font-mono font-medium text-foreground">{profileUrl}</span>. Bạn có thể in mã này lên danh thiếp giấy, sticker hoặc lưu vào điện thoại.
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyProfileLink}
                className="h-8 text-xs gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Sao chép link</span>
              </Button>
              <a
                href={profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-xs font-medium hover:bg-muted"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở trang</span>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 shrink-0">
            <Button
              type="button"
              onClick={() => setProfileQrOpen(true)}
              className="gap-2 shadow-sm"
            >
              <QrCode className="w-4 h-4" />
              <span>Xem & Tải mã QR</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 2. FORM KÍCH HOẠT THẺ NFC MỚI */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary" /> Kích hoạt thẻ NFC mới
          </CardTitle>
          <CardDescription>
            Nhập mã 8 ký tự được in trên thẻ hoặc bao bì để liên kết thẻ với tài khoản của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onActivate)} className="space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="w-full sm:max-w-xs space-y-1">
                <Label htmlFor="code" className="sr-only">
                  Mã thẻ
                </Label>
                <Input
                  id="code"
                  placeholder="Ví dụ: AB12CD34"
                  className="font-mono uppercase tracking-wider text-sm"
                  maxLength={20}
                  {...register('code')}
                />
              </div>
              <Button type="submit" disabled={isPending} className="gap-2 shrink-0 w-full sm:w-auto">
                {isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Kích hoạt thẻ</span>
              </Button>
            </div>
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code.message}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 3. DANH SÁCH THẺ ĐÃ SỞ HỮU */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold">Thẻ NFC của bạn</h3>
            <p className="text-xs text-muted-foreground">
              Bạn đang sở hữu {cards.length} thẻ NFC được liên kết với trang này.
            </p>
          </div>
        </div>

        {cards.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Chưa có thẻ NFC nào</h4>
              <p className="text-xs text-muted-foreground max-w-sm mb-4">
                Nếu bạn đã nhận thẻ vật lý, hãy nhập mã kích hoạt ở phía trên để bắt đầu sử dụng.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {cards.map((card) => (
              <CardItem key={card.id} card={card} baseUrl={baseUrl} />
            ))}
          </div>
        )}
      </div>

      {/* 4. HƯỚNG DẪN QUÉT THẺ */}
      <Card className="bg-muted/40">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>Mẹo quét thẻ NFC hiệu quả:</span>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>
              <strong>iPhone (từ iPhone XR/XS trở lên):</strong> Chạm nhẹ đỉnh đầu iPhone vào thẻ. Không cần mở app, thông báo sẽ tự động bật lên.
            </li>
            <li>
              <strong>Android:</strong> Bật tính năng NFC trong Cài đặt nhanh, chạm lưng điện thoại (vùng gần camera hoặc giữa thân máy) vào thẻ.
            </li>
            <li>
              Khi chia sẻ danh thiếp, người đối diện <strong>không cần cài đặt bất kỳ ứng dụng nào</strong>.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Dialog xem QR Trang cá nhân */}
      <QRDialog
        open={profileQrOpen}
        onOpenChange={setProfileQrOpen}
        title="Mã QR trang cá nhân"
        url={profileUrl}
        description={`Mã QR công khai chuyển hướng thẳng đến hồ sơ ${profile.full_name || profile.username}.`}
      />
    </div>
  );
}
