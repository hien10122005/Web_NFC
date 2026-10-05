'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/types/database.types';
import { ProfileTheme, parseTheme } from '@/types/theme';
import { PlatformIcon } from '@/components/platform-icon';
import { ShareProfileButton } from './share-profile-button';
import { ReportDialog } from './report-dialog';
import { NfcHologramCard } from './nfc-hologram-card';
import { BankAccountCard } from './bank-account-card';
import { soundFX } from '@/lib/sound';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Building,
  Briefcase,
  UserPlus,
  Flag,
  Sparkles,
  MessageSquare,
  CreditCard,
  Volume2,
  VolumeX,
  Radio,
} from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type LinkRow = Database['public']['Tables']['links']['Row'];

interface PublicProfileViewProps {
  profile: ProfileRow;
  links: LinkRow[];
  siteUrl: string;
}

export function PublicProfileView({
  profile,
  links,
  siteUrl,
}: PublicProfileViewProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [show3dCard, setShow3dCard] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const theme: ProfileTheme = parseTheme(profile.theme);
  const visibility = (profile.visibility as Record<string, boolean>) || {};
  const bankInfo = (profile.bank_info as Record<string, string>) || {};
  const isDarkTheme = theme.backgroundType === 'dark' || theme.preset === 'dark' || theme.preset === 'ocean';

  const currentUrl = `${siteUrl}/u/${profile.username}`;
  const vcardUrl = `/u/${profile.username}/vcard`;

  // Xử lý bật tắt âm thanh
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFX.enabled = next;
    if (next) soundFX.playTap();
  };

  // Âm thanh khi click
  const handleTap = () => {
    soundFX.playTap();
  };

  // Khi tải danh bạ
  const handleDownloadVcard = () => {
    soundFX.playNfcConnect();
    toast.success('Đang tải danh thiếp về điện thoại của bạn!', {
      description: 'Mở file vừa tải để lưu trực tiếp vào danh bạ máy.',
    });
  };

  // Phong cách font chữ
  const fontClass =
    theme.fontFamily === 'serif'
      ? 'font-serif'
      : theme.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Kiểu bo góc
  const getCardShapeClass = () => {
    switch (theme.cardStyle) {
      case 'pill':
        return 'rounded-full px-5';
      case 'sharp':
        return 'rounded-lg px-4';
      default:
        return 'rounded-2xl px-4';
    }
  };

  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div
      style={{
        background: theme?.backgroundColor?.includes('gradient')
          ? theme.backgroundColor
          : undefined,
        backgroundColor:
          theme?.backgroundColor && !theme.backgroundColor.includes('gradient')
            ? theme.backgroundColor
            : undefined,
      }}
      className={`min-h-screen w-full relative overflow-x-hidden selection:bg-primary/20 ${fontClass} ${
        isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'
      }`}
    >
      {/* 1. HIỆU ỨNG AMBIENT AURA GLOW NỀN KHÔNG GIAN SANG TRỌNG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] opacity-40 animate-float"
          style={{ backgroundColor: theme.primaryColor }}
        />
        <div
          className="absolute top-1/3 -right-28 w-80 h-80 rounded-full blur-[100px] opacity-30 animate-float"
          style={{
            backgroundColor: isDarkTheme ? '#818cf8' : '#38bdf8',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-25 animate-float"
          style={{
            backgroundColor: isDarkTheme ? '#c084fc' : '#a7f3d0',
            animationDelay: '4s',
          }}
        />
        {/* Subtle Tech Grid chìm */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* 2. KHUNG CONTAINER TRUNG TÂM (MOBILE-OPTIMIZED) */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between relative z-10 px-3 sm:px-4 py-3 sm:py-6">
        {/* THANH ĐIỀU KHIỂN TRÊN CÙNG (TOP ACTION BAR) */}
        <div className="w-full flex items-center justify-between pb-3 px-1 animate-slide-up">
          {/* Nút chuyển đổi xem Thẻ NFC 3D */}
          <button
            type="button"
            onClick={() => {
              handleTap();
              setShow3dCard(!show3dCard);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all active:scale-95 shadow-xs ${
              show3dCard
                ? 'bg-amber-400 text-black border-amber-300 shadow-amber-400/20'
                : isDarkTheme
                ? 'bg-white/10 hover:bg-white/15 text-white border-white/15'
                : 'bg-white/80 hover:bg-white text-zinc-800 border-zinc-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>{show3dCard ? 'Đóng thẻ 3D' : 'Xem Thẻ NFC 3D'}</span>
          </button>

          {/* Nhóm góc phải: Bật/Tắt Âm thanh & Nút chia sẻ */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSound}
              title={soundEnabled ? 'Tắt âm thanh tương tác' : 'Bật âm thanh tương tác'}
              className={`p-2 rounded-full backdrop-blur-md border transition-all active:scale-95 ${
                isDarkTheme
                  ? 'bg-white/10 hover:bg-white/15 text-white/80 border-white/10'
                  : 'bg-white/80 hover:bg-white text-zinc-700 border-zinc-200'
              }`}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-zinc-400" />
              )}
            </button>

            <ShareProfileButton
              url={currentUrl}
              fullName={profile.full_name || profile.username || 'Người dùng'}
              isDark={isDarkTheme}
            />
          </div>
        </div>

        {/* THẺ CHÍNH GLASSMORPHISM HOÀNG GIA */}
        <div
          className={`w-full rounded-3xl overflow-hidden border backdrop-blur-2xl shadow-2xl transition-all duration-300 animate-slide-up ${
            isDarkTheme
              ? 'bg-zinc-950/75 border-white/15 shadow-black/60'
              : 'bg-white/85 border-white/80 shadow-zinc-900/10'
          }`}
        >
          {/* CHẾ ĐỘ XEM THẺ NFC 3D HOLOGRAPHIC (NẾU ĐƯỢC MỞ) */}
          {show3dCard ? (
            <div className="p-5 pb-8 flex flex-col items-center bg-black/40 border-b border-white/10">
              <div className="text-center mb-2 space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Mô phỏng Thẻ NFC Vật lý 3D
                </span>
                <p className="text-xs text-zinc-400">
                  Chạm vào thẻ để lật mặt trước / mặt sau
                </p>
              </div>
              <NfcHologramCard
                fullName={profile.full_name || profile.username || 'Người dùng'}
                jobTitle={profile.job_title}
                organization={profile.organization}
                profileUrl={currentUrl}
                primaryColor={theme.primaryColor}
                onPlaySound={handleTap}
              />
            </div>
          ) : (
            /* ẢNH BÌA COVER HIỆN ĐẠI */
            <div className="relative w-full h-44 sm:h-48 overflow-hidden">
              {profile.cover_url ? (
                <Image
                  src={profile.cover_url}
                  alt="Ảnh bìa"
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div
                  className="w-full h-full relative"
                  style={{
                    background: `linear-gradient(135deg, ${theme.primaryColor}dd 0%, #0f172a 100%)`,
                  }}
                >
                  {/* Họa tiết lưới ánh sáng trên cover */}
                  <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />
                </div>
              )}
              {/* Lớp chuyển màu mờ đáy để avatar hòa hợp */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-zinc-950/60 to-transparent" />
            </div>
          )}

          {/* KHỐI NỘI DUNG PROFILE */}
          <div className="relative px-5 pb-7 -mt-16 sm:-mt-18 flex flex-col items-center space-y-4">
            {/* AVATAR VỚI ROTATING CONIC HALO GLOW & NFC CHIP BADGE */}
            <div className="relative group">
              {/* Vòng hào quang phát sáng xoay tròn */}
              <div
                className="absolute -inset-1 rounded-full opacity-75 blur-xs animate-spin-slow"
                style={{
                  background: `conic-gradient(from 0deg, ${theme.primaryColor}, #38bdf8, #ec4899, #eab308, ${theme.primaryColor})`,
                }}
              />

              {/* Vỏ bọc Avatar */}
              <div
                className={`rounded-full overflow-hidden border-4 ${
                  isDarkTheme ? 'border-zinc-900 bg-zinc-800' : 'border-white bg-white'
                } shadow-2xl relative w-28 h-28 sm:w-32 sm:h-32 z-10`}
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                    unoptimized
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-extrabold text-white uppercase text-3xl shadow-inner"
                    style={{
                      background: `linear-gradient(135deg, ${theme.primaryColor} 0%, #1e1b4b 100%)`,
                    }}
                  >
                    {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                )}
              </div>

              {/* Huy hiệu NFC Chip Verified ở góc Avatar */}
              <div
                title="Thẻ NFC thông minh đã kích hoạt"
                className="absolute bottom-1 right-1 z-20 w-8 h-8 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 border-2 border-zinc-900 flex items-center justify-center shadow-lg text-white"
              >
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-radar pointer-events-none" />
                <Radio className="w-4 h-4 relative z-10" />
              </div>
            </div>

            {/* THÔNG TIN HỒ SƠ & TIỂU SỬ */}
            <div className="text-center w-full space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="font-extrabold text-2xl sm:text-3xl tracking-tight drop-shadow-sm">
                  {profile.full_name || 'Hồ sơ người dùng'}
                </h1>
              </div>

              {/* Tag chức danh & đơn vị */}
              {(profile.job_title || profile.organization) && (
                <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5">
                  {visibility.job_title !== false && profile.job_title && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
                        isDarkTheme
                          ? 'bg-white/10 text-zinc-200 border-white/10'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{profile.job_title}</span>
                    </span>
                  )}

                  {visibility.organization !== false && profile.organization && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md border ${
                        isDarkTheme
                          ? 'bg-white/5 text-zinc-300 border-white/10'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      <Building className="w-3 h-3 opacity-70 shrink-0" />
                      <span>{profile.organization}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Tiểu sử (Bio) */}
              {visibility.bio !== false && profile.bio && (
                <div
                  className={`mt-2 p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-sm mx-auto backdrop-blur-md border whitespace-pre-line text-left relative ${
                    isDarkTheme
                      ? 'bg-white/5 text-zinc-300 border-white/10 shadow-inner'
                      : 'bg-zinc-50/90 text-zinc-700 border-zinc-200 shadow-xs'
                  }`}
                >
                  <p>{profile.bio}</p>
                </div>
              )}

              {/* Địa điểm */}
              {visibility.address !== false && profile.address && (
                <p
                  className={`text-xs flex items-center justify-center gap-1.5 pt-1 ${
                    isDarkTheme ? 'text-zinc-400' : 'text-zinc-600'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>{profile.address}</span>
                </p>
              )}
            </div>

            {/* NÚT CTA CHÍNH: LƯU VÀO DANH BẠ (vCard) VỚI HIỆU ỨNG SHIMMER SWEEP QUÉT SÁNG */}
            <div className="w-full pt-1">
              <a
                href={vcardUrl}
                download
                onClick={handleDownloadVcard}
                className="relative overflow-hidden w-full py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2.5 font-bold text-sm sm:text-base text-white shadow-xl transition-all duration-300 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-2xl group"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor} 0%, #2563eb 50%, #1d4ed8 100%)`,
                }}
              >
                {/* Vệt sáng quét ngang tự động (Shimmer Sweep) */}
                <div className="absolute inset-0 w-1/2 h-full bg-linear-to-r from-transparent via-white/40 to-transparent -skew-x-20 animate-shimmer pointer-events-none" />

                <UserPlus className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
                <span className="tracking-wide">Lưu vào danh bạ điện thoại</span>
              </a>
            </div>

            {/* THANH PHÍM TẮT TRỰC TIẾP (QUICK ACTIONS DOCK: GỌI ĐIỆN, SMS, EMAIL) */}
            <div className="flex items-center justify-center gap-2.5 w-full pt-1">
              {visibility.phone !== false && profile.phone && (
                <>
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                    onClick={handleTap}
                    className={`flex-1 py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-semibold text-xs border backdrop-blur-md transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm ${
                      isDarkTheme
                        ? 'bg-zinc-900/90 border-white/10 text-white hover:bg-zinc-800'
                        : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>Gọi điện</span>
                  </a>

                  <a
                    href={`sms:${profile.phone.replace(/\s+/g, '')}`}
                    onClick={handleTap}
                    className={`flex-1 py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-semibold text-xs border backdrop-blur-md transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm ${
                      isDarkTheme
                        ? 'bg-zinc-900/90 border-white/10 text-white hover:bg-zinc-800'
                        : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <span>Nhắn SMS</span>
                  </a>
                </>
              )}

              {visibility.email !== false && profile.email_public && (
                <a
                  href={`mailto:${profile.email_public}`}
                  onClick={handleTap}
                  className={`flex-1 py-2.5 px-2 rounded-2xl flex items-center justify-center gap-1.5 font-semibold text-xs border backdrop-blur-md transition-all duration-200 active:scale-95 hover:-translate-y-0.5 shadow-sm ${
                    isDarkTheme
                      ? 'bg-zinc-900/90 border-white/10 text-white hover:bg-zinc-800'
                      : 'bg-white border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <span>Email</span>
                </a>
              )}
            </div>

            {/* THẺ TÀI KHOẢN NGÂN HÀNG & VIETQR CHUYỂN KHOẢN (NẾU CÓ) */}
            {visibility.bank_info !== false && bankInfo.account_number && (
              <div className="w-full pt-1">
                <BankAccountCard
                  bankInfo={bankInfo}
                  isDark={isDarkTheme}
                  onPlaySound={handleTap}
                />
              </div>
            )}

            {/* DANH SÁCH LIÊN KẾT MẠNG XÃ HỘI & CUSTOM LINKS (PRO GLASS CARDS) */}
            <div className="w-full space-y-3 pt-2">
              {activeLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={`/l/${link.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleTap}
                  style={{ animationDelay: `${0.08 * (index + 1)}s` }}
                  className={`group relative overflow-hidden flex items-center justify-between py-3.5 px-4 backdrop-blur-xl border transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg ${getCardShapeClass()} ${
                    isDarkTheme
                      ? 'bg-zinc-900/70 border-white/15 text-white hover:border-white/30 hover:bg-zinc-800/80 shadow-black/40'
                      : 'bg-white/80 border-white/80 text-zinc-900 hover:border-zinc-300 hover:bg-white shadow-zinc-200/50'
                  }`}
                >
                  {/* Vệt phản quang hover */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex items-center gap-3.5 min-w-0 relative z-10">
                    {/* Icon container với màu thương hiệu */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                        isDarkTheme ? 'bg-zinc-800 border border-white/10' : 'bg-zinc-100 border border-zinc-200'
                      }`}
                      style={{
                        color: isDarkTheme ? '#ffffff' : theme.primaryColor,
                      }}
                    >
                      <PlatformIcon platform={link.platform} size={20} />
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-sm block truncate group-hover:text-primary transition-colors">
                        {link.title || link.platform}
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {link.url.replace(/^https?:\/\//, '')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 relative z-10">
                    <ExternalLink className="w-4 h-4 text-primary" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* 3. FOOTER BẢO CHỨNG NFC & ĐIỀU HƯỚNG */}
        <div className="px-5 py-6 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Thẻ Thông Minh NFC • Chạm để kết nối danh thiếp</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => {
                handleTap();
                setReportOpen(true);
              }}
              className="hover:underline flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            >
              <Flag className="w-3 h-3 text-rose-400" />
              <span>Báo cáo trang này</span>
            </button>
          </div>

          {/* CTA Tạo trang cá nhân */}
          <div className="pt-1">
            <Link
              href="/"
              onClick={handleTap}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border shadow-sm transition-all duration-200 hover:scale-105 ${
                isDarkTheme
                  ? 'bg-white/10 hover:bg-white/15 border-white/10 text-zinc-200'
                  : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tạo trang NFC thông minh của riêng bạn</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Dialog báo cáo vi phạm */}
      <ReportDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        profileId={profile.id}
        fullName={profile.full_name || profile.username || ''}
      />
    </div>
  );
}
