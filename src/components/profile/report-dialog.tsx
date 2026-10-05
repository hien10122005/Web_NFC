'use client';

import React, { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { submitReportAction } from '@/actions/report';
import { toast } from 'sonner';
import { Flag, Loader2, ShieldAlert } from 'lucide-react';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profileId: string;
  fullName: string;
}

export function ReportDialog({
  open,
  onOpenChange,
  profileId,
  fullName,
}: ReportDialogProps) {
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 5) {
      toast.error('Vui lòng nhập lý do cụ thể (tối thiểu 5 ký tự)');
      return;
    }

    startTransition(async () => {
      const res = await submitReportAction({
        profileId,
        reason: reason.trim(),
        reporterEmail: email.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        setReason('');
        setEmail('');
        onOpenChange(false);
      } else {
        toast.error(res.error || 'Gửi báo cáo thất bại');
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="w-5 h-5" /> Báo cáo vi phạm
          </DialogTitle>
          <DialogDescription>
            Báo cáo trang cá nhân của <strong>{fullName}</strong> nếu có dấu hiệu mạo danh, lừa đảo hoặc vi phạm điều khoản sử dụng.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="reason">Lý do báo cáo <span className="text-destructive">*</span></Label>
            <Textarea
              id="reason"
              placeholder="Mô tả cụ thể hành vi vi phạm (ví dụ: mạo danh thương hiệu, thông tin gian lận, nội dung phản cảm...)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[100px] text-xs"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reporterEmail">Email của bạn (tùy chọn)</Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="email@example.com (để nhận phản hồi nếu cần)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs"
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
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="gap-1.5"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <Flag className="w-4 h-4" />
              <span>Gửi báo cáo</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
