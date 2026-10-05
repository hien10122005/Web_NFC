'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Database } from '@/types/database.types';
import { ProfileTheme, parseTheme } from '@/types/theme';
import { PlatformIcon } from '@/components/platform-icon';
import { ShareProfileButton } from './share-profile-button';
import { ReportDialog } from './report-dialog';
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

  const theme: ProfileTheme = parseTheme(profile.theme);
  const visibility = (profile.visibility as Record<string, boolean>) || {};
  const isDarkTheme = theme.backgroundType === 'dark';

  const currentUrl = `${siteUrl}/u/${profile.username}`;
  const vcardUrl = `/u/${profile.username}/vcard`;

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
        return 'rounded-none px-4';
      default:
        return 'rounded-2xl px-4';
    }
  };

  // Kiểu nút bấm
  const getCardStyleClass = () => {
    switch (theme.buttonStyle) {
      case 'outline':
        return isDarkTheme
          ? 'border border-white/20 bg-transparent text-white hover:bg-white/10'
          : 'border border-gray-200 bg-white/70 backdrop-blur-md text-gray-900 hover:bg-white';
      case 'soft':
        return isDarkTheme
          ? 'bg-white/10 text-white hover:bg-white/15'
          : 'bg-primary/10 text-gray-900 hover:bg-primary/15';
      case 'glass':
        return isDarkTheme
          ? 'bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-sm hover:bg-white/20'
          : 'bg-white/70 backdrop-blur-md border border-white/60 text-gray-900 shadow-sm hover:bg-white/90';
      default: // filled
        return isDarkTheme
          ? 'bg-zinc-800 text-white shadow-xs hover:bg-zinc-700'
          : 'bg-white text-gray-900 shadow-xs hover:shadow-md';
    }
  };

  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div
      style={{ background: theme.backgroundColor }}
      className={`min-h-screen w-full transition-colors duration-300 ${fontClass} ${
        isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'
      }`}
    >
      <div className="max-w-md mx-auto min-h-screen flex flex-col justify-between relative shadow-2xl bg-card/20 backdrop-blur-xs">
        {/* NÚT ACTIONS Ở GÓC TRÊN CÙNG */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <ShareProfileButton
            url={currentUrl}
            fullName={profile.full_name || profile.username || 'Người dùng'}
            isDark={isDarkTheme}
          />
        </div>

        <div>
          {/* ẢNH BÌA */}
          <div className="relative w-full h-44 sm:h-52 bg-muted/60 overflow-hidden">
            {profile.cover_url ? (
              <Image
                src={profile.cover_url}
                alt="Ảnh bìa"
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${theme.primaryColor} 0%, #0f172a 100%)`,
                }}
              />
            )}
          </div>

          {/* KHỐI NỘI DUNG CHÍNH */}
          <div className="relative px-5 pb-8 -mt-16 sm:-mt-20 flex flex-col items-center space-y-4">
            {/* AVATAR */}
            <div className="relative group">
              <div
                className={`rounded-full overflow-hidden border-4 ${
                  isDarkTheme ? 'border-zinc-900 bg-zinc-800' : 'border-white bg-white'
                } shadow-xl relative w-32 h-32`}
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Avatar'}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center font-bold text-white uppercase text-3xl"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {profile.full_name ? profile.full_name.charAt(0) : 'U'}
                  </div>
                )}
              </div>
            </div>

            {/* THÔNG TIN HỒ SƠ */}
            <div className="text-center w-full space-y-1.5">
              <h1 className="font-extrabold text-2xl tracking-tight">
                {profile.full_name || 'Hồ sơ người dùng'}
              </h1>

              {visibility.job_title !== false && profile.job_title && (
                <p className={`flex items-center justify-center gap-1.5 font-medium text-sm ${
                  isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  <Briefcase className="w-4 h-4 opacity-75 shrink-0" />
                  <span>{profile.job_title}</span>
                </p>
              )}

              {visibility.organization !== false && profile.organization && (
                <p className={`flex items-center justify-center gap-1.5 text-xs text-muted-foreground ${
                  isDarkTheme ? 'text-zinc-400' : ''
                }`}>
                  <Building className="w-3.5 h-3.5 opacity-70 shrink-0" />
                  <span>{profile.organization}</span>
                </p>
              )}

              {visibility.bio !== false && profile.bio && (
                <p
                  className={`mt-2.5 text-xs leading-relaxed max-w-xs mx-auto whitespace-pre-line ${
                    isDarkTheme ? 'text-zinc-300' : 'text-zinc-600'
                  }`}
                >
                  {profile.bio}
                </p>
              )}

              {visibility.address !== false && profile.address && (
                <p className={`text-xs flex items-center justify-center gap-1.5 pt-1 opacity-80 ${
                  isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'
                }`}>
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span>{profile.address}</span>
                </p>
              )}
            </div>

            {/* NÚT LƯU DANH BẠ (vCard) */}
            <div className="w-full pt-1">
              <a
                href={vcardUrl}
                download
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-md transition-all active:scale-[0.98] hover:opacity-95"
                style={{
                  backgroundColor: theme.primaryColor,
                  color: '#ffffff',
                }}
              >
                <UserPlus className="w-4 h-4" />
                <span>Lưu vào danh bạ điện thoại</span>
              </a>
            </div>

            {/* CÁC NÚT LIÊN HỆ TRỰC TIẾP (Gọi, SMS, Email) */}
            <div className="flex items-center justify-center gap-2 w-full pt-1">
              {visibility.phone !== false && profile.phone && (
                <>
                  <a
                    href={`tel:${profile.phone.replace(/\s+/g, '')}`}
                    className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-medium text-xs border transition-all active:scale-95 ${
                      isDarkTheme
                        ? 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700'
                        : 'bg-white/80 border-gray-200 hover:bg-white shadow-xs'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Gọi điện</span>
                  </a>
                  <a
                    href={`sms:${profile.phone.replace(/\s+/g, '')}`}
                    className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-medium text-xs border transition-all active:scale-95 ${
                      isDarkTheme
                        ? 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700'
                        : 'bg-white/80 border-gray-200 hover:bg-white shadow-xs'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>Nhắn SMS</span>
                  </a>
                </>
              )}

              {visibility.email !== false && profile.email_public && (
                <a
                  href={`mailto:${profile.email_public}`}
                  className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 font-medium text-xs border transition-all active:scale-95 ${
                    isDarkTheme
                      ? 'bg-zinc-800/80 border-white/10 hover:bg-zinc-700'
                      : 'bg-white/80 border-gray-200 hover:bg-white shadow-xs'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>Email</span>
                </a>
              )}
            </div>

            {/* DANH SÁCH LIÊN KẾT */}
            <div className="w-full space-y-3 pt-3">
              {activeLinks.map((link) => (
                <a
                  key={link.id}
                  href={`/l/${link.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-between py-3.5 transition-all duration-200 active:scale-[0.98] ${getCardShapeClass()} ${getCardStyleClass()}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        color: isDarkTheme ? '#ffffff' : theme.primaryColor,
                      }}
                    >
                      <PlatformIcon platform={link.platform} size={18} />
                    </div>
                    <span className="font-semibold text-sm truncate">
                      {link.title || link.platform}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 shrink-0 ml-2" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER & BÁO CÁO VI PHẠM */}
        <div className="px-5 py-6 text-center space-y-4 border-t border-border/20">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              className="hover:underline flex items-center gap-1 opacity-70 hover:opacity-100"
            >
              <Flag className="w-3 h-3" />
              <span>Báo cáo trang này</span>
            </button>
          </div>

          {/* CTA Tạo trang cá nhân */}
          <div className="pt-2">
            <Link
              href="/"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border shadow-xs transition-all hover:scale-105 ${
                isDarkTheme
                  ? 'bg-zinc-800/60 border-white/10 text-zinc-300'
                  : 'bg-white/80 border-gray-200 text-zinc-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Tạo trang cá nhân thông minh của bạn</span>
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
