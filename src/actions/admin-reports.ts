'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function resolveReportAction(
  reportId: string,
  resolution: 'resolved' | 'rejected',
  actionTaken: 'none' | 'hide_profile' | 'ban_user' = 'none'
) {
  try {
    const { user: currentAdmin } = await requireAdmin();
    const supabase = await createClient();

    // 1. Lấy thông tin report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('id, profile_id')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      return { success: false, error: 'Không tìm thấy thông tin báo cáo vi phạm.' };
    }

    // 2. Thực hiện hành động nếu có
    if (actionTaken === 'hide_profile' && report.profile_id) {
      await supabase
        .from('profiles')
        .update({ is_public: false, updated_at: new Date().toISOString() })
        .eq('id', report.profile_id);
    } else if (actionTaken === 'ban_user' && report.profile_id) {
      // Không cho phép tự khóa chính admin
      if (report.profile_id !== currentAdmin.id) {
        await supabase
          .from('profiles')
          .update({ status: 'banned', updated_at: new Date().toISOString() })
          .eq('id', report.profile_id);
      }
    }

    // 3. Cập nhật trạng thái báo cáo
    const { error: updateError } = await supabase
      .from('reports')
      .update({
        status: resolution,
        resolved_at: new Date().toISOString(),
        resolved_by: currentAdmin.id,
      })
      .eq('id', reportId);

    if (updateError) {
      return { success: false, error: 'Lỗi khi cập nhật báo cáo: ' + updateError.message };
    }

    revalidatePath('/admin/reports');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
