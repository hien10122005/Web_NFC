'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface QRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  url: string;
  description?: string;
}

export function QRDialog({
  open,
  onOpenChange,
  title,
  url,
  description,
}: QRDialogProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !url) return;

    QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((res) => {
        setDataUrl(res);
      })
      .catch((err) => {
        console.error('Lỗi tạo mã QR:', err);
      });
  }, [open, url]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Đã sao chép liên kết vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

  const handleDownload = async (format: 'png' | 'svg') => {
    try {
      if (format === 'png') {
        const highResUrl = await QRCode.toDataURL(url, {
          width: 1024,
          margin: 2,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'H',
        });
        const a = document.createElement('a');
        a.href = highResUrl;
        a.download = `qrcode-${title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        a.click();
      } else {
        const svgString = await QRCode.toString(url, {
          type: 'svg',
          margin: 2,
          errorCorrectionLevel: 'H',
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `qrcode-${title.replace(/[^a-zA-Z0-9]/g, '_')}.svg`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      }
      toast.success(`Đã tải mã QR dạng ${format.toUpperCase()}!`);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải mã QR');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description || 'Quét mã bằng camera điện thoại để truy cập ngay lập tức.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4">
          {/* Khung hiển thị QR */}
          <div className="p-4 bg-white rounded-2xl shadow-md border inline-block">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="QR Code"
                width={220}
                height={220}
                className="w-52 h-52 object-contain"
              />
            ) : (
              <div className="w-52 h-52 flex items-center justify-center bg-gray-50 text-xs text-muted-foreground">
                Đang tạo mã QR...
              </div>
            )}
          </div>

          {/* Đường dẫn */}
          <div className="mt-4 w-full flex items-center justify-between gap-2 p-2 rounded-lg bg-muted text-xs">
            <span className="truncate text-muted-foreground font-mono">{url}</span>
            <div className="flex items-center gap-1 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleCopy}
                aria-label="Sao chép liên kết"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </Button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-md hover:bg-background text-muted-foreground hover:text-foreground"
                aria-label="Mở liên kết"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Nút tải về */}
          <div className="grid grid-cols-2 gap-2 w-full mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownload('png')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Tải ảnh PNG (HD)
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleDownload('svg')}
              className="gap-1.5 text-xs"
            >
              <Download className="w-3.5 h-3.5" /> Tải file SVG (In ấn)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
