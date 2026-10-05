'use client';

import React, { useState } from 'react';
import { CreditCard, Copy, Check, QrCode, X } from 'lucide-react';
import { toast } from 'sonner';

interface BankInfo {
  bank_name?: string;
  account_number?: string;
  account_name?: string;
}

interface BankAccountCardProps {
  bankInfo: BankInfo;
  isDark?: boolean;
  onPlaySound?: () => void;
}

export function BankAccountCard({
  bankInfo,
  onPlaySound,
}: BankAccountCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  if (!bankInfo.account_number) return null;

  const handleCopy = () => {
    onPlaySound?.();
    const text = bankInfo.account_number || '';
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    } else {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {}
    }
    setCopied(true);
    toast.success('Đã sao chép số tài khoản ngân hàng!');
    setTimeout(() => setCopied(false), 2000);
  };

  // VietQR link generation (Chuẩn VietQR công cộng nhanh)
  // Format: https://img.vietqr.io/image/{bank_code}-{acc_num}-compact2.png
  // Sử dụng QR code dịch vụ VietQR nếu nhận diện được mã ngân hàng hoặc QR dạng chuẩn
  const vietQrUrl = `https://img.vietqr.io/image/${encodeURIComponent(
    bankInfo.bank_name || 'bank'
  )}-${encodeURIComponent(bankInfo.account_number)}-compact2.png?accountName=${encodeURIComponent(
    bankInfo.account_name || ''
  )}`;

  return (
    <>
      <div className="w-full relative overflow-hidden rounded-2xl p-4 border border-amber-500/30 bg-linear-to-r from-zinc-950 via-zinc-900 to-black text-white shadow-lg transition-all hover:border-amber-400/50">
        {/* Ánh kim vàng */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                {bankInfo.bank_name || 'Tài khoản ngân hàng'}
              </p>
              <p className="text-xs text-zinc-400">Chuyển khoản nhanh 24/7</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onPlaySound?.();
              setShowQrModal(true);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/10 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-300" />
            <span>Mã VietQR</span>
          </button>
        </div>

        {/* Số tài khoản & Tên chủ thẻ */}
        <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
          <div>
            <p className="font-mono text-base font-bold tracking-wider text-white select-all">
              {bankInfo.account_number}
            </p>
            {bankInfo.account_name && (
              <p className="text-[11px] font-medium text-zinc-300 uppercase mt-0.5">
                {bankInfo.account_name}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all active:scale-95 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal VietQR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-sm rounded-3xl p-6 bg-zinc-900 border border-white/20 text-white shadow-2xl text-center space-y-4">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pt-1">
              <h3 className="font-bold text-lg text-amber-300">Quét mã VietQR chuyển khoản</h3>
              <p className="text-xs text-zinc-400">
                Mở ứng dụng ngân hàng bất kỳ để quét mã và chuyển khoản ngay
              </p>
            </div>

            <div className="bg-white p-3 rounded-2xl mx-auto w-fit shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={vietQrUrl}
                alt="Mã VietQR"
                className="w-56 h-auto rounded-lg mx-auto"
                onError={(e) => {
                  // Fallback nếu ngân hàng không map được VietQR code
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>

            <div className="bg-zinc-800/80 p-3 rounded-xl text-xs space-y-1 text-left border border-white/5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Ngân hàng:</span>
                <span className="font-semibold">{bankInfo.bank_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Số tài khoản:</span>
                <span className="font-mono font-bold text-amber-300 select-all">
                  {bankInfo.account_number}
                </span>
              </div>
              {bankInfo.account_name && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Chủ tài khoản:</span>
                  <span className="font-semibold uppercase">{bankInfo.account_name}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép số tài khoản!' : 'Sao chép số tài khoản'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
