'use server';

import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Database } from '@/types/database.types';

// 1. Tạo hàng loạt thẻ NFC qua RPC admin_generate_cards
export async function generateCardsAction(
  count: number,
  batchId: string,
  cardType: string
) {
  try {
    await requireAdmin();

    if (!count || count < 1 || count > 1000) {
      return { success: false, error: 'Số lượng thẻ tạo phải từ 1 đến 1000 thẻ.' };
    }

    const cleanBatch = batchId.trim() || `BATCH-${new Date().toISOString().slice(0, 10)}`;
    const cleanType = cardType.trim() || 'plastic';

    const supabase = await createClient();
    const { data, error } = await supabase.rpc('admin_generate_cards', {
      p_count: count,
      p_batch_id: cleanBatch,
      p_card_type: cleanType,
    });

    if (error) {
      return { success: false, error: 'Lỗi khi tạo mã thẻ: ' + error.message };
    }

    revalidatePath('/admin/cards');
    revalidatePath('/admin');
    return {
      success: true,
      count: Array.isArray(data) ? data.length : count,
      batchId: cleanBatch,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 2. Đổi trạng thái thẻ (active, unassigned, locked, lost)
export async function updateCardStatusByAdminAction(
  cardId: string,
  newStatus: 'active' | 'unassigned' | 'locked' | 'lost'
) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const updatePayload: Database['public']['Tables']['nfc_cards']['Update'] = {
      status: newStatus,
    };

    // Nếu đưa về unassigned thì xóa chủ sở hữu
    if (newStatus === 'unassigned') {
      updatePayload.profile_id = null;
    }

    const { error } = await supabase
      .from('nfc_cards')
      .update(updatePayload)
      .eq('id', cardId);

    if (error) {
      return { success: false, error: 'Lỗi cập nhật trạng thái thẻ: ' + error.message };
    }

    revalidatePath('/admin/cards');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 3. Gán thẻ cho người dùng theo username hoặc email
export async function assignCardToUserAction(cardId: string, identifier: string) {
  try {
    await requireAdmin();
    const cleanIdentifier = identifier.trim().toLowerCase();

    if (!cleanIdentifier) {
      return { success: false, error: 'Vui lòng nhập username hoặc email của người dùng.' };
    }

    const supabase = await createClient();

    // Tìm user theo username
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', cleanIdentifier)
      .single();

    if (!profile) {
      return {
        success: false,
        error: `Không tìm thấy người dùng có username "@${cleanIdentifier}".`,
      };
    }

    const { error } = await supabase
      .from('nfc_cards')
      .update({
        profile_id: profile.id,
        status: 'active',
        activated_at: new Date().toISOString(),
      })
      .eq('id', cardId);

    if (error) {
      return { success: false, error: 'Lỗi gán thẻ: ' + error.message };
    }

    revalidatePath('/admin/cards');
    revalidatePath('/admin');
    return { success: true, user: profile };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

// 4. Gỡ thẻ khỏi người dùng (đưa về kho unassigned)
export async function unassignCardAction(cardId: string) {
  return updateCardStatusByAdminAction(cardId, 'unassigned');
}

// 5. Xóa thẻ vĩnh viễn
export async function deleteCardByAdminAction(cardId: string) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const { error } = await supabase.from('nfc_cards').delete().eq('id', cardId);

    if (error) {
      return { success: false, error: 'Lỗi khi xóa thẻ: ' + error.message };
    }

    revalidatePath('/admin/cards');
    revalidatePath('/admin');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}
