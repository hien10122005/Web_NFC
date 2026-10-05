'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import {
  changePasswordSchema,
  changeEmailSchema,
  deleteAccountSchema,
  ChangePasswordFormData,
  ChangeEmailFormData,
  DeleteAccountFormData,
} from '@/lib/validations/settings';
import { revalidatePath } from 'next/cache';

export async function changePasswordAction(data: ChangePasswordFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user || !user.email) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = changePasswordSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const supabase = await createClient();

    // 1. Xác thực mật khẩu cũ bằng cách thử đăng nhập lại
    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: validated.data.currentPassword,
    });

    if (verifyErr) {
      return { success: false, error: 'Mật khẩu hiện tại không chính xác.' };
    }

    // 2. Cập nhật mật khẩu mới
    const { error: updateErr } = await supabase.auth.updateUser({
      password: validated.data.newPassword,
    });

    if (updateErr) {
      return { success: false, error: 'Không thể cập nhật mật khẩu: ' + updateErr.message };
    }

    return { success: true, message: 'Đổi mật khẩu thành công!' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

export async function changeEmailAction(data: ChangeEmailFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = changeEmailSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Email không hợp lệ.' };
    }

    if (validated.data.newEmail.toLowerCase() === user.email?.toLowerCase()) {
      return { success: false, error: 'Email mới trùng với email hiện tại của bạn.' };
    }

    const supabase = await createClient();

    // Cập nhật email trong Supabase Auth
    const { error } = await supabase.auth.updateUser({
      email: validated.data.newEmail,
    });

    if (error) {
      return { success: false, error: 'Không thể đổi email: ' + error.message };
    }

    return {
      success: true,
      message:
        'Hệ thống đã gửi liên kết xác nhận đến cả email cũ và email mới. Vui lòng bấm vào liên kết trong hộp thư để hoàn tất đổi email.',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

export async function deleteAccountAction(data: DeleteAccountFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const validated = deleteAccountSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Xác nhận không hợp lệ.' };
    }

    const supabase = await createClient();

    // 1. Thử gọi RPC delete_my_account
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: rpcErr } = await (supabase.rpc as any)('delete_my_account');

    if (rpcErr) {
      console.warn('RPC delete_my_account error or not found:', rpcErr);
      // Fallback: xóa profiles của user (links sẽ tự xóa do ON DELETE CASCADE)
      await supabase.from('profiles').delete().eq('id', user.id);
    }

    // 2. Đăng xuất phiên làm việc
    await supabase.auth.signOut();

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi xóa tài khoản',
    };
  }
}
