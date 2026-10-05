'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { themeSchema, ThemeData } from '@/lib/validations/appearance';
import { revalidatePath } from 'next/cache';
import { Json } from '@/types/database.types';

export async function updateThemeAction(data: ThemeData) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = themeSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Cấu hình giao diện không hợp lệ.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        theme: validated.data as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: 'Lỗi khi lưu giao diện: ' + error.message };
    }

    revalidatePath('/dashboard/appearance');
    revalidatePath('/dashboard');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
