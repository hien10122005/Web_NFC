'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, QrCode } from 'lucide-react';
import { QRDialog } from '@/components/dashboard/qr-dialog';

interface ShareProfileButtonProps {
  url: string;
  fullName: string;
  isDark?: boolean;
}

export function ShareProfileButton({
  url,
  fullName,
  isDark,
}: ShareProfileButtonProps) {
  const [qrOpen, setQrOpen] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Danh thiếp thông minh - ${fullName}`,
          text: `Kết nối với ${fullName} trên Trang Cá Nhân NFC:`,
          url: url,
        });
        return;
      } catch (err) {
        // Người dùng hủy share hoặc không hỗ trợ
        if ((err as Error).name !== 'AbortError') {
          setQrOpen(true);
        }
      }
    } else {
      // Mở QR dialog nếu không hỗ trợ navigator.share
      setQrOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleShare}
          className={`h-9 px-3 text-xs gap-1.5 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-95 ${
            isDark
              ? 'bg-zinc-800/80 border-white/10 text-zinc-100 hover:bg-zinc-700'
              : 'bg-white/80 border-gray-200 text-zinc-800 hover:bg-white'
          }`}
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Chia sẻ</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setQrOpen(true)}
          className={`h-9 w-9 rounded-full shadow-xs backdrop-blur-xs transition-transform active:scale-95 ${
            isDark
              ? 'bg-zinc-800/80 border-white/10 text-zinc-100 hover:bg-zinc-700'
              : 'bg-white/80 border-gray-200 text-zinc-800 hover:bg-white'
          }`}
          aria-label="Xem mã QR"
        >
          <QrCode className="w-4 h-4" />
        </Button>
      </div>

      <QRDialog
        open={qrOpen}
        onOpenChange={setQrOpen}
        title={`Mã QR của ${fullName}`}
        url={url}
        description="Quét mã này để lưu danh bạ hoặc truy cập hồ sơ cá nhân ngay lập tức."
      />
    </>
  );
}
