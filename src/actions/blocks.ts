'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import {
  createBlockSchema,
  updateBlockSchema,
  CreateBlockInput,
  UpdateBlockInput,
} from '@/lib/validations/blocks';
import { revalidatePath } from 'next/cache';
import { Database, Json } from '@/types/database.types';

type BlockUpdate = Database['public']['Tables']['blocks']['Update'];

/**
 * Lấy danh sách tất cả các khối nội dung của người dùng hiện tại
 */
export async function getUserBlocksAction() {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.', data: [] };
    }

    const supabase = await createClient();
    const { data: blocks, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('profile_id', user.id)
      .order('position', { ascending: true });

    if (error) {
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: blocks || [] };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định.';
    return { success: false, error: errorMsg, data: [] };
  }
}

/**
 * Tạo khối nội dung mới cho người dùng
 */
export async function createBlockAction(data: CreateBlockInput) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.' };
    }

    const validated = createBlockSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.',
      };
    }

    const supabase = await createClient();

    // 1. Kiểm tra giới hạn tối đa 20 blocks mỗi người dùng
    const { count, error: countErr } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id);

    if (countErr) {
      return { success: false, error: 'Không thể kiểm tra số lượng khối hiện có.' };
    }

    if (count !== null && count >= 20) {
      return { success: false, error: 'Bạn đã đạt giới hạn tối đa 20 khối nội dung.' };
    }

    // 2. Tìm vị trí position lớn nhất
    const { data: maxPosBlock } = await supabase
      .from('blocks')
      .select('position')
      .eq('profile_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = maxPosBlock ? maxPosBlock.position + 1 : 0;

    // 3. Thêm mới khối
    const { data: newBlock, error: insertErr } = await supabase
      .from('blocks')
      .insert({
        profile_id: user.id,
        type: validated.data.type,
        title: validated.data.title || null,
        content: validated.data.content as Json,
        position: nextPosition,
        is_active: validated.data.is_active ?? true,
      })
      .select()
      .single();

    if (insertErr) {
      return { success: false, error: insertErr.message || 'Lỗi khi thêm khối nội dung.' };
    }

    // Revalidate paths
    revalidatePath('/dashboard/blocks');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true, data: newBlock };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định.';
    return { success: false, error: errorMsg };
  }
}

/**
 * Cập nhật thông tin khối nội dung
 */
export async function updateBlockAction(data: UpdateBlockInput) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const validated = updateBlockSchema.safeParse(data);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.',
      };
    }

    const supabase = await createClient();

    const updatePayload: BlockUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (validated.data.title !== undefined) {
      updatePayload.title = validated.data.title;
    }
    if (validated.data.content !== undefined) {
      updatePayload.content = validated.data.content as Json;
    }
    if (validated.data.is_active !== undefined) {
      updatePayload.is_active = validated.data.is_active;
    }

    const { error: updateErr } = await supabase
      .from('blocks')
      .update(updatePayload)
      .eq('id', validated.data.id)
      .eq('profile_id', user.id);

    if (updateErr) {
      return { success: false, error: updateErr.message || 'Lỗi khi cập nhật khối nội dung.' };
    }

    revalidatePath('/dashboard/blocks');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định.';
    return { success: false, error: errorMsg };
  }
}

/**
 * Bật hoặc tắt trạng thái hiển thị của khối
 */
export async function toggleBlockActiveAction(blockId: string, isActive: boolean) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('blocks')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', blockId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/blocks');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định.';
    return { success: false, error: errorMsg };
  }
}

/**
 * Xóa một khối nội dung
 */
export async function deleteBlockAction(blockId: string) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', blockId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, error: error.message || 'Không thể xóa khối nội dung.' };
    }

    revalidatePath('/dashboard/blocks');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không xác định.';
    return { success: false, error: errorMsg };
  }
}

/**
 * Cập nhật thứ tự hiển thị của các khối nội dung
 */
export async function reorderBlocksAction(orderedIds: string[]) {
  try {
    const { user, profile } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập.' };
    }

    if (!orderedIds || orderedIds.length === 0) {
      return { success: true };
    }

    const supabase = await createClient();

    // Cập nhật vị trí từng block
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('blocks')
        .update({ position: index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('profile_id', user.id)
    );

    await Promise.all(updates);

    revalidatePath('/dashboard/blocks');
    if (profile?.username) {
      revalidatePath(`/u/${profile.username}`);
    }

    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi không thể sắp xếp khối.';
    return { success: false, error: errorMsg };
  }
}
