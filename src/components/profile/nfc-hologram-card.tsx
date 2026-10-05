'use client';

import React, { useState } from 'react';
import QRCode from 'qrcode';
import { Wifi, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';

interface NfcHologramCardProps {
  fullName: string;
  jobTitle?: string | null;
  organization?: string | null;
  cardCode?: string | null;
  profileUrl: string;
  primaryColor?: string;
  onPlaySound?: () => void;
}

export function NfcHologramCard({
  fullName,
  jobTitle,
  organization,
  cardCode = 'NFC-SMART-PASS',
  profileUrl,
  onPlaySound,
}: NfcHologramCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [qrSrc, setQrSrc] = useState<string>('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    QRCode.toDataURL(profileUrl, {
      width: 160,
      margin: 1,
      color: {
        dark: '#ffffff',
        light: '#00000000',
      },
    })
      .then(setQrSrc)
      .catch(console.error);
  }, [profileUrl]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -24;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const toggleFlip = () => {
    onPlaySound?.();
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="w-full flex flex-col items-center select-none py-2">
      {/* 3D Perspective Container */}
      <div
        className="w-full max-w-[340px] h-[206px] perspective-1000 cursor-pointer group"
        onClick={toggleFlip}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`relative w-full h-full duration-500 transform-style-3d transition-transform ease-out rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transform: isFlipped
              ? 'rotateY(180deg)'
              : `rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          }}
        >
          {/* MẶT TRƯỚC (FRONT) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-2xl overflow-hidden p-5 flex flex-col justify-between border border-white/20 bg-linear-to-br from-zinc-900 via-neutral-900 to-black text-white">
            {/* Lớp phản quang Holographic Shimmer */}
            <div
              className="absolute inset-0 pointer-events-none opacity-25 mix-blend-color-dodge transition-opacity duration-300 group-hover:opacity-45"
              style={{
                background:
                  'linear-gradient(115deg, transparent 20%, rgba(255,215,0,0.6) 40%, rgba(56,189,248,0.7) 60%, rgba(236,72,153,0.6) 80%, transparent 95%)',
                backgroundSize: '200% 200%',
              }}
            />

            {/* Họa tiết vi mạch chìm */}
            <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute -right-2 -bottom-2 w-32 h-32 rounded-full border border-white/10 pointer-events-none" />

            {/* Hàng trên: Chip NFC & Sóng Contactless */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                {/* Chip EMV mạ vàng */}
                <div className="relative w-11 h-8 rounded-md bg-linear-to-br from-amber-200 via-amber-400 to-yellow-600 p-[1.5px] shadow-sm">
                  <div className="w-full h-full rounded-[4px] bg-linear-to-br from-amber-300 to-amber-500 grid grid-cols-3 grid-rows-2 gap-[1px] p-[2px] opacity-90">
                    <div className="border-r border-b border-amber-700/60 rounded-xs" />
                    <div className="border-r border-b border-amber-700/60 rounded-xs" />
                    <div className="border-b border-amber-700/60 rounded-xs" />
                    <div className="border-r border-amber-700/60 rounded-xs" />
                    <div className="border-r border-amber-700/60 rounded-xs" />
                    <div className="border-amber-700/60 rounded-xs" />
                  </div>
                </div>

                {/* Sóng NFC Contactless Wave */}
                <div className="flex items-center text-amber-300/80">
                  <Wifi className="w-5 h-5 rotate-90" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-mono tracking-wider text-amber-200 font-semibold">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>NFC METALLIC</span>
              </div>
            </div>

            {/* Hàng giữa: Mã định danh & Chi tiết cá nhân */}
            <div className="relative z-10 space-y-1">
              <p className="font-mono text-[11px] text-zinc-400 tracking-widest uppercase">
                {cardCode || 'NFC-9999'}
              </p>
              <h3 className="text-lg font-bold tracking-wide uppercase text-transparent bg-clip-text bg-linear-to-r from-white via-zinc-100 to-zinc-400 drop-shadow-sm truncate">
                {fullName}
              </h3>
              {(jobTitle || organization) && (
                <p className="text-xs text-zinc-300/90 truncate font-medium">
                  {jobTitle}
                  {jobTitle && organization && ' • '}
                  {organization}
                </p>
              )}
            </div>

            {/* Hàng dưới: Logo NFC & Hướng dẫn lật */}
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-medium relative z-10 pt-1">
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Xác thực NFC Tag</span>
              </div>
              <span className="flex items-center gap-1 text-zinc-400 group-hover:text-white transition-colors">
                <RefreshCw className="w-2.5 h-2.5 animate-spin-slow" />
                <span>Chạm để lật mặt sau</span>
              </span>
            </div>
          </div>

          {/* MẶT SAU (BACK) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-2xl overflow-hidden flex flex-col justify-between border border-white/15 bg-linear-to-bl from-zinc-950 via-neutral-900 to-black text-white">
            {/* Dải từ tính (Magnetic Stripe) */}
            <div className="w-full h-10 bg-zinc-950 border-y border-zinc-800/80 mt-4 relative">
              <div className="absolute inset-0 bg-linear-to-r from-zinc-900 via-neutral-950 to-zinc-900 opacity-90" />
            </div>

            {/* Khung QR Code & Chữ ký */}
            <div className="px-5 flex items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-7 px-3 bg-zinc-800/90 rounded border border-zinc-700/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-zinc-400">CHỮ KÝ ĐIỆN TỬ</span>
                  <span className="text-[11px] font-mono text-amber-300 font-bold">VERIFIED</span>
                </div>
                <p className="text-[9px] text-zinc-400 leading-tight">
                  Quét chip NFC hoặc mã QR trên mặt thẻ để lưu danh bạ và kết nối trực tiếp.
                </p>
              </div>

              {/* QR Code */}
              <div className="w-16 h-16 rounded-lg bg-black/60 p-1 border border-white/20 shrink-0 flex items-center justify-center">
                {qrSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={qrSrc} alt="QR Code" className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full bg-zinc-800 rounded animate-pulse" />
                )}
              </div>
            </div>

            {/* Footer mặt sau */}
            <div className="px-5 pb-3 flex items-center justify-between text-[9px] text-zinc-400 font-mono">
              <span>TRANG CÁ NHÂN NFC SMART</span>
              <span>CHẠM LẬT LẠI</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
