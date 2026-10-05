'use server';

import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const reportSchema = z.object({
  profileId: z.string().uuid('ID hồ sơ không hợp lệ'),
  reason: z
    .string()
    .min(5, 'Lý do báo cáo phải có ít nhất 5 ký tự')
    .max(500, 'Lý do báo cáo tối đa 500 ký tự')
    .trim(),
  reporterEmail: z
    .string()
    .email('Địa chỉ email không hợp lệ')
    .optional()
    .or(z.literal(''))
    .transform((val) => (val && val.trim() !== '' ? val.trim() : null)),
});

export type ReportFormData = z.infer<typeof reportSchema>;

export async function submitReportAction(data: {
  profileId: string;
  reason: string;
  reporterEmail?: string;
}) {
  try {
    const validated = reportSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const supabase = await createClient();

    const { error } = await supabase.from('reports').insert({
      profile_id: validated.data.profileId,
      reason: validated.data.reason,
      reporter_email: validated.data.reporterEmail,
      status: 'pending',
    });

    if (error) {
      return { success: false, error: 'Không thể gửi báo cáo: ' + error.message };
    }

    return { success: true, message: 'Cảm ơn bạn! Báo cáo đã được gửi tới ban quản trị để xem xét.' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
