import { z } from 'zod';

export const blockTypeEnum = z.enum(['youtube', 'map', 'text', 'image']);
export type BlockType = z.infer<typeof blockTypeEnum>;

/**
 * Trích xuất video ID từ URL YouTube (hỗ trợ youtube.com, youtu.be, shorts, embed)
 */
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  // Đã là ID 11 ký tự thuần
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Regex nhận diện các dạng link YouTube thông dụng
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = trimmed.match(regExp);
  return match && match[1] ? match[1] : null;
}

/**
 * Chuẩn hóa URL Google Maps thành Embed URL an toàn
 */
export function formatGoogleMapsEmbedUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  // Nếu người dùng dán cả thẻ <iframe src="...">
  const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    return iframeSrcMatch[1];
  }

  // Nếu đã là link embed Google Maps
  if (trimmed.includes('google.com/maps/embed')) {
    return trimmed;
  }

  // Nếu là link hoặc địa chỉ dạng văn bản -> dùng Google Maps Search Embed
  return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
}

// Content schema cho từng loại
export const youtubeContentSchema = z.object({
  url: z.string().min(1, 'Vui lòng nhập đường dẫn video YouTube'),
  videoId: z.string().min(1, 'Không trích xuất được YouTube Video ID'),
  caption: z.string().max(200, 'Mô tả không quá 200 ký tự').optional(),
});

export const mapContentSchema = z.object({
  address: z.string().min(1, 'Vui lòng nhập địa chỉ hoặc tọa độ'),
  embedUrl: z.string().min(1, 'Đường dẫn bản đồ không hợp lệ'),
  placeName: z.string().max(100, 'Tên địa điểm không quá 100 ký tự').optional(),
});

export const textContentSchema = z.object({
  body: z.string().min(1, 'Nội dung văn bản không được để trống').max(5000, 'Tối đa 5000 ký tự'),
  style: z.enum(['card', 'quote', 'alert', 'plain']).default('card'),
  align: z.enum(['left', 'center', 'right']).default('left'),
});

export const imageContentSchema = z.object({
  imageUrl: z.string().url('Đường dẫn ảnh phải là một URL hợp lệ'),
  caption: z.string().max(200, 'Chú thích tối đa 200 ký tự').optional(),
  linkUrl: z.string().url('Liên kết đính kèm phải là URL hợp lệ').optional().or(z.literal('')),
  aspectRatio: z.enum(['auto', '16/9', '4/3', '1/1']).default('auto'),
});

// Schema tạo mới block
export const createBlockSchema = z.object({
  type: blockTypeEnum,
  title: z.string().max(100, 'Tiêu đề không quá 100 ký tự').optional().nullable(),
  content: z.record(z.unknown()),
  is_active: z.boolean().default(true),
});

export type CreateBlockInput = z.infer<typeof createBlockSchema>;

// Schema cập nhật block
export const updateBlockSchema = z.object({
  id: z.string().uuid('ID khối không hợp lệ'),
  title: z.string().max(100, 'Tiêu đề không quá 100 ký tự').optional().nullable(),
  content: z.record(z.unknown()).optional(),
  is_active: z.boolean().optional(),
});

export type UpdateBlockInput = z.infer<typeof updateBlockSchema>;
