'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Json } from '@/types/database.types';

// 1. Cập nhật cấu hình hệ thống (site_settings)
export async function updateSiteSettingAction(key: string, value: unknown) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        key,
        value: value as Json,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: 'Lỗi cập nhật cấu hình: ' + error.message };
    }

    revalidatePath('/admin/settings');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 2. Bật/Tắt nền tảng mạng xã hội (social_platforms)
export async function toggleSocialPlatformAction(key: string, isActive: boolean) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('social_platforms')
      .update({ is_active: isActive })
      .eq('key', key);

    if (error) {
      return { success: false, error: 'Lỗi cập nhật nền tảng: ' + error.message };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 3. Thêm username cấm (reserved_usernames)
export async function addReservedUsernameAction(username: string) {
  try {
    await requireAdmin();
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername) {
      return { success: false, error: 'Username cấm không được để trống.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('reserved_usernames')
      .insert({ username: cleanUsername });

    if (error) {
      return { success: false, error: 'Lỗi thêm username cấm: ' + error.message };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 4. Xóa username khỏi danh sách cấm
export async function deleteReservedUsernameAction(username: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('reserved_usernames')
      .delete()
      .eq('username', username.toLowerCase());

    if (error) {
      return { success: false, error: 'Lỗi xóa username cấm: ' + error.message };
    }

    revalidatePath('/admin/settings');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
