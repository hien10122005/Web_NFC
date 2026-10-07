'use client';

import React from 'react';
import { Database } from '@/types/database.types';
import { YoutubeIcon } from '@/components/platform-icon';
import {
  MapPin,
  ExternalLink,
  Quote,
  AlertCircle,
  FileText,
  ImageIcon,
} from 'lucide-react';

type BlockRow = Database['public']['Tables']['blocks']['Row'];

interface ProfileBlocksProps {
  blocks: BlockRow[];
  isDarkTheme: boolean;
  primaryColor?: string;
  cardShapeClass?: string;
  onPlaySound?: () => void;
}

export function ProfileBlocks({
  blocks,
  isDarkTheme,
  primaryColor = '#3b82f6',
  cardShapeClass = 'rounded-2xl',
  onPlaySound,
}: ProfileBlocksProps) {
  if (!blocks || blocks.length === 0) return null;

  return (
    <div className="w-full space-y-4 pt-3">
      {blocks.map((block) => {
        if (!block.is_active) return null;
        const content = (block.content as Record<string, unknown>) || {};

        // Chuẩn hóa kiểu dữ liệu tường minh
        const url = typeof content.url === 'string' ? content.url : '';
        const videoId = typeof content.videoId === 'string' ? content.videoId : '';
        const caption = typeof content.caption === 'string' ? content.caption : '';
        const address = typeof content.address === 'string' ? content.address : '';
        const embedUrl = typeof content.embedUrl === 'string' ? content.embedUrl : '';
        const placeName = typeof content.placeName === 'string' ? content.placeName : '';
        const body = typeof content.body === 'string' ? content.body : '';
        const textStyle = (typeof content.style === 'string' ? content.style : 'card') as 'card' | 'quote' | 'alert' | 'plain';
        const textAlign = (typeof content.align === 'string' ? content.align : 'left') as 'left' | 'center' | 'right';
        const imageUrl = typeof content.imageUrl === 'string' ? content.imageUrl : '';
        const linkUrl = typeof content.linkUrl === 'string' ? content.linkUrl : '';
        const aspectRatio = (typeof content.aspectRatio === 'string' ? content.aspectRatio : 'auto') as 'auto' | '16/9' | '4/3' | '1/1';

        return (
          <div
            key={block.id}
            className={`w-full overflow-hidden transition-all duration-300 backdrop-blur-xl border ${cardShapeClass} ${
              isDarkTheme
                ? 'bg-zinc-900/80 border-white/15 text-white shadow-xl shadow-black/30'
                : 'bg-white/85 border-zinc-200/90 text-zinc-900 shadow-lg shadow-zinc-200/40'
            }`}
          >
            {/* Header chung của block nếu có title hoặc icon */}
            {block.type === 'youtube' && (
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-red-600/10 text-red-600 flex items-center justify-center shrink-0">
                      <YoutubeIcon className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base truncate">
                      {block.title || 'Video nổi bật'}
                    </h3>
                  </div>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onPlaySound}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>Xem trên YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>

                {videoId ? (
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black/10 border border-white/10 shadow-inner">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                      title={block.title || 'YouTube video player'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="absolute inset-0 w-full h-full border-0"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Video không khả dụng hoặc liên kết chưa đúng.
                  </div>
                )}

                {caption ? (
                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {caption}
                  </p>
                ) : null}
              </div>
            )}

            {block.type === 'map' && (
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm sm:text-base truncate">
                        {block.title || placeName || 'Địa chỉ & Bản đồ'}
                      </h3>
                      {address ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {address}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  {address ? (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={onPlaySound}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all flex items-center gap-1 shrink-0"
                    >
                      <span>Mở Bản đồ</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : null}
                </div>

                {embedUrl ? (
                  <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-black/5 border border-white/10 shadow-inner">
                    <iframe
                      src={embedUrl}
                      title={block.title || 'Google Maps location'}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="absolute inset-0 w-full h-full border-0"
                    />
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Chưa có cấu hình bản đồ.
                  </div>
                )}
              </div>
            )}

            {block.type === 'text' && (
              <div className="p-4 sm:p-5">
                {block.title ? (
                  <div className="flex items-center gap-2 mb-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        color: primaryColor,
                      }}
                    >
                      {textStyle === 'quote' ? (
                        <Quote className="w-3.5 h-3.5" />
                      ) : textStyle === 'alert' ? (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      ) : (
                        <FileText className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <h3 className="font-bold text-sm sm:text-base">
                      {block.title}
                    </h3>
                  </div>
                ) : null}

                <div
                  className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    textAlign === 'center'
                      ? 'text-center'
                      : textAlign === 'right'
                      ? 'text-right'
                      : 'text-left'
                  } ${
                    textStyle === 'quote'
                      ? 'italic border-l-2 pl-3 py-1 text-muted-foreground'
                      : textStyle === 'alert'
                      ? 'p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200'
                      : ''
                  }`}
                  style={
                    textStyle === 'quote'
                      ? { borderColor: primaryColor }
                      : undefined
                  }
                >
                  {body || 'Chưa có nội dung.'}
                </div>
              </div>
            )}

            {block.type === 'image' && (
              <div className="p-4 sm:p-5 space-y-2.5">
                {block.title ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <h3 className="font-bold text-sm sm:text-base truncate">
                      {block.title}
                    </h3>
                  </div>
                ) : null}

                {imageUrl ? (
                  <div className="group relative rounded-xl overflow-hidden bg-black/5 border border-white/10">
                    {linkUrl ? (
                      <a
                        href={linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onPlaySound}
                        className="block relative overflow-hidden"
                      >
                        <div
                          className={`relative w-full ${
                            aspectRatio === '16/9'
                              ? 'aspect-video'
                              : aspectRatio === '4/3'
                              ? 'aspect-4/3'
                              : aspectRatio === '1/1'
                              ? 'aspect-square'
                              : 'min-h-[180px] max-h-[400px]'
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrl}
                            alt={block.title || 'Hình ảnh'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </div>
                      </a>
                    ) : (
                      <div
                        className={`relative w-full ${
                          aspectRatio === '16/9'
                            ? 'aspect-video'
                            : aspectRatio === '4/3'
                            ? 'aspect-4/3'
                            : aspectRatio === '1/1'
                            ? 'aspect-square'
                            : 'min-h-[180px] max-h-[400px]'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={block.title || 'Hình ảnh'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs text-muted-foreground">
                    Chưa có liên kết ảnh.
                  </div>
                )}

                {caption ? (
                  <p className="text-xs text-muted-foreground leading-relaxed text-center italic">
                    {caption}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
