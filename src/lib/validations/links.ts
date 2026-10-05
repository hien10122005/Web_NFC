import { z } from 'zod';

export const linkSchema = z.object({
  platform: z.string().min(1, 'Vui lòng chọn nền tảng'),
  title: z.string().max(100, 'Tiêu đề tối đa 100 ký tự').optional(),
  url: z
    .string()
    .min(1, 'Vui lòng nhập đường dẫn hoặc thông tin liên kết')
    .max(500, 'Đường dẫn tối đa 500 ký tự')
    .trim(),
  is_active: z.boolean(),
});

export const updateLinkSchema = linkSchema.extend({
  id: z.string().uuid('ID liên kết không hợp lệ'),
});

export type LinkFormData = z.infer<typeof linkSchema>;
export type UpdateLinkFormData = z.infer<typeof updateLinkSchema>;
