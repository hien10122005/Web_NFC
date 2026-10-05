'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { activateCardSchema, ActivateCardFormData } from '@/lib/validations/cards';
import { revalidatePath } from 'next/cache';

export async function activateCardAction(data: ActivateCardFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = activateCardSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Mã thẻ không hợp lệ.' };
    }

    const supabase = await createClient();

    // Gọi hàm RPC activate_card đã có trong database
    const { data: rpcRes, error: rpcErr } = await supabase.rpc('activate_card', {
      p_code: validated.data.code.trim(),
    });

    if (rpcErr) {
      return { success: false, error: rpcErr.message || 'Kích hoạt thẻ thất bại.' };
    }

    const resObj = rpcRes as { status?: string; card_id?: string } | null;

    if (resObj?.status === 'already_yours') {
      return { success: true, message: 'Thẻ này đã thuộc quyền sở hữu của bạn.' };
    }

    revalidatePath('/dashboard/cards');
    revalidatePath('/dashboard');
    return { success: true, message: 'Kích hoạt thẻ thành công!' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

export async function setCardStatusAction(cardId: string, newStatus: 'active' | 'lost') {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const supabase = await createClient();

    // Gọi hàm RPC set_my_card_status
    const { error: rpcErr } = await supabase.rpc('set_my_card_status', {
      p_card_id: cardId,
      p_status: newStatus,
    });

    if (rpcErr) {
      return { success: false, error: rpcErr.message || 'Không thể đổi trạng thái thẻ.' };
    }

    revalidatePath('/dashboard/cards');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi hệ thống',
    };
  }
}

export async function updateCardNoteAction(cardId: string, note: string | null) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const supabase = await createClient();
    const cleanNote = note && note.trim() !== '' ? note.trim().slice(0, 100) : null;

    const { error } = await supabase
      .from('nfc_cards')
      .update({ note: cleanNote })
      .eq('id', cardId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/cards');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi lưu ghi chú',
    };
  }
}
