'use client';

import React from 'react';
import Image from 'next/image';
import { Database } from '@/types/database.types';
import { ProfileTheme } from '@/types/theme';
import { PlatformIcon } from '@/components/platform-icon';
import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Building,
  Briefcase,
} from 'lucide-react';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type LinkRow = Database['public']['Tables']['links']['Row'];

interface ProfilePreviewCardProps {
  profile: ProfileRow;
  links: LinkRow[];
  theme: ProfileTheme;
  isMockup?: boolean;
}

export function ProfilePreviewCard({
  profile,
  links,
  theme,
  isMockup = false,
}: ProfilePreviewCardProps) {
  const visibility = (profile.visibility as Record<string, boolean>) || {};

  // Xác định style cho nền
  const bgStyle: React.CSSProperties = {
    background: theme.backgroundColor,
  };

  const isDarkTheme = theme.backgroundType === 'dark';

  // Kiểu font
  const fontClass =
    theme.fontFamily === 'serif'
      ? 'font-serif'
      : theme.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  // Kiểu bo góc của Card Link
  const getCardShapeClass = () => {
    switch (theme.cardStyle) {
      case 'pill':
        return 'rounded-full px-5';
      case 'sharp':
        return 'rounded-none px-4';
      default:
        return 'rounded-xl px-4';
    }
  };

  // Kiểu nút của Card Link
  const getCardStyleClass = () => {
    switch (theme.buttonStyle) {
      case 'outline':
        return isDarkTheme
          ? 'border border-white/20 bg-transparent text-white hover:bg-white/10'
          : 'border border-gray-300 bg-white/60 backdrop-blur-xs text-gray-900 hover:bg-white';
      case 'soft':
        return isDarkTheme
          ? 'bg-white/10 text-white hover:bg-white/15'
          : 'bg-primary/10 text-gray-900 hover:bg-primary/20';
      case 'glass':
        return isDarkTheme
          ? 'bg-white/10 backdrop-blur-md border border-white/10 text-white shadow-sm hover:bg-white/15'
          : 'bg-white/60 backdrop-blur-md border border-white/40 text-gray-900 shadow-sm hover:bg-white/80';
      default: // filled
        return isDarkTheme
          ? 'bg-zinc-800 text-white shadow-xs hover:bg-zinc-700'
          : 'bg-white text-gray-900 shadow-xs hover:shadow-sm';
    }
  };

  // Danh sách link hoạt động
  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div
      style={bgStyle}
      className={`w-full min-h-full transition-colors duration-300 ${fontClass} ${
        isDarkTheme ? 'text-zinc-100' : 'text-zinc-900'
      } ${isMockup ? 'text-xs' : 'text-sm'}`}
    >
      {/* ẢNH BÌA */}
      <div className={`relative w-full ${isMockup ? 'h-28' : 'h-40 sm:h-52'} bg-muted/60 overflow-hidden`}>
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
              background: `linear-gradient(135deg, ${theme.primaryColor} 0%, #1e293b 100%)`,
            }}
          />
        )}
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className={`relative px-4 pb-12 -mt-12 sm:-mt-16 flex flex-col items-center ${isMockup ? 'space-y-3' : 'space-y-4'}`}>
        {/* AVATAR */}
        <div className="relative group">
          <div
            className={`rounded-full overflow-hidden border-4 ${
              isDarkTheme ? 'border-zinc-900 bg-zinc-800' : 'border-white bg-white'
            } shadow-md relative ${isMockup ? 'w-20 h-20' : 'w-28 h-28 sm:w-32 sm:h-32'}`}
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
                className="w-full h-full flex items-center justify-center font-bold text-white uppercase text-xl"
                style={{ backgroundColor: theme.primaryColor }}
              >
                {profile.full_name ? profile.full_name.charAt(0) : 'U'}
              </div>
            )}
          </div>
        </div>

        {/* THÔNG TIN CÁ NHÂN */}
        <div className="text-center w-full max-w-sm space-y-1">
          <h1
            className={`font-bold tracking-tight ${
              isMockup ? 'text-base' : 'text-xl sm:text-2xl'
            }`}
          >
            {profile.full_name || 'Chưa đặt họ tên'}
          </h1>

          {visibility.job_title !== false && profile.job_title && (
            <p className={`flex items-center justify-center gap-1 font-medium ${isDarkTheme ? 'text-zinc-300' : 'text-zinc-700'}`}>
              <Briefcase className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <span>{profile.job_title}</span>
            </p>
          )}

          {visibility.organization !== false && profile.organization && (
            <p className={`flex items-center justify-center gap-1 text-muted-foreground ${isDarkTheme ? 'text-zinc-400' : ''}`}>
              <Building className="w-3.5 h-3.5 opacity-70 shrink-0" />
              <span>{profile.organization}</span>
            </p>
          )}

          {visibility.bio !== false && profile.bio && (
            <p
              className={`mt-2 text-xs leading-relaxed max-w-xs mx-auto line-clamp-3 ${
                isDarkTheme ? 'text-zinc-300' : 'text-zinc-600'
              }`}
            >
              {profile.bio}
            </p>
          )}

          {visibility.address !== false && profile.address && (
            <p className={`text-[11px] flex items-center justify-center gap-1 pt-1 opacity-75 ${isDarkTheme ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate max-w-[200px]">{profile.address}</span>
            </p>
          )}
        </div>

        {/* CÁC NÚT HÀNH ĐỘNG NHANH (Gọi, Email...) */}
        <div className="flex items-center justify-center gap-2 pt-1 w-full max-w-xs">
          {visibility.phone !== false && profile.phone && (
            <a
              href={`tel:${profile.phone.replace(/\s+/g, '')}`}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-transform active:scale-95 ${
                isMockup ? 'text-[11px]' : 'text-xs'
              }`}
              style={{
                backgroundColor: theme.primaryColor,
                color: '#ffffff',
              }}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi điện</span>
            </a>
          )}

          {visibility.email !== false && profile.email_public && (
            <a
              href={`mailto:${profile.email_public}`}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 font-medium transition-transform active:scale-95 ${
                isMockup ? 'text-[11px]' : 'text-xs'
              } ${
                isDarkTheme
                  ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
                  : 'bg-zinc-100 text-zinc-800 hover:bg-zinc-200'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </a>
          )}
        </div>

        {/* DANH SÁCH LIÊN KẾT */}
        <div className="w-full max-w-sm space-y-2.5 pt-2">
          {activeLinks.length === 0 ? (
            <div
              className={`p-4 text-center rounded-xl border border-dashed ${
                isDarkTheme ? 'border-zinc-800 text-zinc-500' : 'border-zinc-200 text-zinc-400'
              }`}
            >
              Chưa có liên kết nào hiển thị
            </div>
          ) : (
            activeLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between py-3 transition-all duration-200 active:scale-[0.98] ${getCardShapeClass()} ${getCardStyleClass()}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      color: isDarkTheme ? '#ffffff' : theme.primaryColor,
                    }}
                  >
                    <PlatformIcon platform={link.platform} size={16} />
                  </div>
                  <span className="font-medium truncate text-xs sm:text-sm">
                    {link.title || link.platform}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-40 shrink-0 ml-2" />
              </a>
            ))
          )}
        </div>

        {/* FOOTER BẢN QUYỀN */}
        <div className="pt-6 text-center">
          <p className="text-[10px] opacity-50 flex items-center justify-center gap-1">
            <span>Tạo bởi</span>
            <span className="font-semibold">Trang Cá Nhân NFC</span>
          </p>
        </div>
      </div>
    </div>
  );
}
