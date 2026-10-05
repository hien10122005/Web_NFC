'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

// Khóa hoặc Mở khóa tài khoản
export async function updateUserStatusAction(
  userId: string,
  newStatus: 'active' | 'banned'
) {
  try {
    const { user: currentAdmin } = await requireAdmin();

    if (currentAdmin.id === userId) {
      return { success: false, error: 'Bạn không thể tự khóa tài khoản quản trị của chính mình.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Lỗi cập nhật trạng thái: ' + error.message };
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// Thay đổi quyền (Role)
export async function updateUserRoleAction(
  userId: string,
  newRole: 'user' | 'admin'
) {
  try {
    const { user: currentAdmin } = await requireAdmin();

    if (currentAdmin.id === userId && newRole !== 'admin') {
      return { success: false, error: 'Bạn không thể tự giáng quyền quản trị của chính mình.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Lỗi cập nhật quyền: ' + error.message };
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// Bật/tắt công khai hồ sơ
export async function updateUserVisibilityAction(
  userId: string,
  isPublic: boolean
) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase
      .from('profiles')
      .update({
        is_public: isPublic,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: 'Lỗi cập nhật chế độ hiển thị: ' + error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// Xóa tài khoản người dùng
export async function deleteUserByAdminAction(userId: string) {
  try {
    const { user: currentAdmin } = await requireAdmin();

    if (currentAdmin.id === userId) {
      return { success: false, error: 'Bạn không thể tự xóa tài khoản quản trị của chính mình tại đây.' };
    }

    const supabase = await createClient();

    // 1. Đưa thẻ NFC của user về unassigned
    await supabase
      .from('nfc_cards')
      .update({ profile_id: null, status: 'unassigned' })
      .eq('profile_id', userId);

    // 2. Xóa các liên kết
    await supabase.from('links').delete().eq('profile_id', userId);

    // 3. Xóa hồ sơ
    const { error } = await supabase.from('profiles').delete().eq('id', userId);

    if (error) {
      return { success: false, error: 'Lỗi khi xóa người dùng: ' + error.message };
    }

    revalidatePath('/admin/users');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
