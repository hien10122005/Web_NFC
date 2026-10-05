'use client';

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { activateCardAction } from '@/actions/cards';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

interface ActivateCardClientProps {
  code: string;
  userFullName?: string;
}

export function ActivateCardClient({ code, userFullName }: ActivateCardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleActivate = () => {
    startTransition(async () => {
      const res = await activateCardAction({ code });
      if (res.success) {
        toast.success(res.message || 'Kích hoạt thẻ thành công!');
        router.push('/dashboard/cards');
      } else {
        toast.error(res.error || 'Kích hoạt thất bại');
      }
    });
  };

  return (
    <div className="space-y-4 pt-2">
      <div className="p-3 rounded-xl bg-muted/50 border text-xs text-muted-foreground">
        Tài khoản đích: <strong className="text-foreground">{userFullName || 'Bạn'}</strong>
      </div>

      <Button
        type="button"
        size="lg"
        onClick={handleActivate}
        disabled={isPending}
        className="w-full gap-2 font-semibold shadow-md"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Sparkles className="w-5 h-5" />
        )}
        <span>Gắn thẻ vào tài khoản của tôi</span>
      </Button>
    </div>
  );
}
