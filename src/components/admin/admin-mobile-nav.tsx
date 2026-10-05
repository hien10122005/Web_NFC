'use client';

import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { AdminNav } from './admin-nav';
import { Button } from '@/components/ui/button';

interface AdminMobileNavProps {
  pendingReportsCount?: number;
}

export function AdminMobileNav({ pendingReportsCount = 0 }: AdminMobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-muted-foreground"
        onClick={() => setOpen(!open)}
        aria-label="Mở menu quản trị"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {open && (
        <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-md p-6 border-t border-border flex flex-col justify-between overflow-y-auto animate-fadeIn">
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">Hệ thống Quản trị Admin</span>
            </div>

            <div onClick={() => setOpen(false)}>
              <AdminNav pendingReportsCount={pendingReportsCount} />
            </div>
          </div>

          <div className="pt-6 border-t border-border/40 text-xs text-muted-foreground flex justify-between items-center">
            <span>Trang Cá Nhân NFC</span>
            <span>Admin Center v1.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
