'use client';

import React, { useState, useTransition } from 'react';
import { Database } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { QRDialog } from './qr-dialog';
import { setCardStatusAction, updateCardNoteAction } from '@/actions/cards';
import {
  CreditCard,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Pencil,
  Check,
  X,
  Loader2,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

type NfcCardRow = Database['public']['Tables']['nfc_cards']['Row'];

interface CardItemProps {
  card: NfcCardRow;
  baseUrl: string;
}

export function CardItem({ card, baseUrl }: CardItemProps) {
  const [isPending, startTransition] = useTransition();
  const [qrOpen, setQrOpen] = useState(false);
  const [confirmLostOpen, setConfirmLostOpen] = useState(false);

  // Chỉnh sửa ghi chú
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteValue, setNoteValue] = useState(card.note || '');

  const cardUrl = `${baseUrl}/c/${card.code}`;

  const getCardTypeName = (type: string) => {
    switch (type.toLowerCase()) {
      case 'metal':
        return 'Thẻ kim loại';
      case 'sticker':
        return 'Sticker dán NFC';
      case 'keychain':
        return 'Móc khóa NFC';
      default:
        return 'Thẻ nhựa PVC';
    }
  };

  const handleToggleStatus = (newStatus: 'active' | 'lost') => {
    startTransition(async () => {
      const res = await setCardStatusAction(card.id, newStatus);
      if (res.success) {
        toast.success(
          newStatus === 'lost'
            ? 'Đã báo mất thẻ thành công'
            : 'Đã mở lại hoạt động cho thẻ'
        );
        setConfirmLostOpen(false);
      } else {
        toast.error('Lỗi: ' + res.error);
      }
    });
  };

  const handleSaveNote = () => {
    startTransition(async () => {
      const res = await updateCardNoteAction(card.id, noteValue);
      if (res.success) {
        toast.success('Đã cập nhật ghi chú thẻ');
        setIsEditingNote(false);
      } else {
        toast.error('Không thể lưu ghi chú: ' + res.error);
      }
    });
  };

  return (
    <>
      <div className="p-4 sm:p-5 rounded-2xl border bg-card text-card-foreground shadow-xs space-y-4">
        {/* Hàng 1: Header thẻ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base tracking-wider uppercase">
                  {card.code}
                </span>
                <span className="text-xs text-muted-foreground font-normal">
                  ({getCardTypeName(card.card_type)})
                </span>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3" />
                <span>
                  Kích hoạt:{' '}
                  {card.activated_at
                    ? new Date(card.activated_at).toLocaleDateString('vi-VN')
                    : 'Chưa xác định'}
                </span>
              </p>
            </div>
          </div>

          {/* Badge trạng thái */}
          <div>
            {card.status === 'active' && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Đang hoạt động
              </Badge>
            )}
            {card.status === 'lost' && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 gap-1">
                <AlertTriangle className="w-3 h-3" /> Đã báo mất
              </Badge>
            )}
            {card.status === 'locked' && (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800 gap-1">
                <Lock className="w-3 h-3" /> Đã bị khóa
              </Badge>
            )}
          </div>
        </div>

        {/* Hàng 2: Ghi chú thẻ */}
        <div className="flex items-center gap-2 pt-1">
          {isEditingNote ? (
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Input
                value={noteValue}
                onChange={(e) => setNoteValue(e.target.value)}
                placeholder="Ghi chú (ví dụ: Thẻ ví da, Thẻ dán xe...)"
                className="h-8 text-xs"
                maxLength={100}
                autoFocus
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-primary"
                onClick={handleSaveNote}
                disabled={isPending}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => {
                  setNoteValue(card.note || '');
                  setIsEditingNote(false);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="italic">
                {card.note ? `Ghi chú: "${card.note}"` : 'Chưa có ghi chú cho thẻ này'}
              </span>
              <button
                type="button"
                onClick={() => setIsEditingNote(true)}
                className="text-primary hover:underline flex items-center gap-1 text-[11px]"
              >
                <Pencil className="w-3 h-3" />
                <span>{card.note ? 'Sửa' : 'Thêm ghi chú'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Hàng 3: Các nút hành động */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQrOpen(true)}
              className="gap-1.5 h-8 text-xs"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Xem mã QR thẻ</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {card.status === 'active' && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmLostOpen(true)}
                disabled={isPending}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/20 h-8 text-xs gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Báo mất thẻ</span>
              </Button>
            )}

            {card.status === 'lost' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleToggleStatus('active')}
                disabled={isPending}
                className="text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 h-8 text-xs gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Mở lại thẻ</span>
              </Button>
            )}

            {card.status === 'locked' && (
              <span className="text-[11px] text-muted-foreground italic">
                Liên hệ hỗ trợ để mở khóa
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dialog xem QR Code của thẻ */}
      <QRDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={`Mã QR thẻ ${card.code}`}
        url={cardUrl}
        description={`Quét mã này sẽ chuyển hướng trực tiếp đến trang cá nhân của bạn (Route /c/${card.code}).`}
      />

      {/* Dialog xác nhận Báo mất thẻ */}
      <Dialog open={confirmLostOpen} onOpenChange={setConfirmLostOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-5 h-5" /> Báo mất thẻ {card.code}?
            </DialogTitle>
            <DialogDescription className="space-y-2 pt-2">
              <p>
                Khi báo mất, người khác nhặt được và quét thẻ sẽ <strong>không thể xem</strong> hồ sơ cá nhân của bạn.
              </p>
              <p className="text-xs">
                Bạn có thể mở lại thẻ bất cứ lúc nào khi tìm lại được thẻ.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmLostOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={() => handleToggleStatus('lost')}
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Xác nhận báo mất
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
