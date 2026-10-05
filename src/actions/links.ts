'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { linkSchema, updateLinkSchema, LinkFormData, UpdateLinkFormData } from '@/lib/validations/links';
import { revalidatePath } from 'next/cache';

/**
 * Chuẩn hóa URL dựa theo nền tảng
 */
function normalizeUrl(url: string, platformKey: string, urlPrefix: string | null): string {
  const trimmed = url.trim();

  // Đã có protocol đầy đủ
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:')
  ) {
    return trimmed;
  }

  if (platformKey === 'phone') {
    return `tel:${trimmed.replace(/\s+/g, '')}`;
  }

  if (platformKey === 'email') {
    return `mailto:${trimmed}`;
  }

  if (urlPrefix) {
    // Nếu người dùng nhập dạng domain (ví dụ facebook.com/abc hoặc @abc)
    const cleanHandle = trimmed.replace(/^@/, '');
    if (cleanHandle.includes('.')) {
      return `https://${cleanHandle}`;
    }
    return `${urlPrefix}${cleanHandle}`;
  }

  // Mặc định cho website hoặc custom
  return `https://${trimmed}`;
}

export async function createLinkAction(data: LinkFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = linkSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const supabase = await createClient();

    // 1. Kiểm tra giới hạn số liên kết
    const { count, error: countErr } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
      .eq('profile_id', user.id);

    if (countErr) {
      return { success: false, error: 'Không thể kiểm tra số lượng liên kết hiện có.' };
    }

    if (count !== null && count >= 30) {
      return { success: false, error: 'Bạn đã đạt giới hạn tối đa 30 liên kết.' };
    }

    // 2. Lấy url_prefix của nền tảng (nếu có)
    const { data: platformData } = await supabase
      .from('social_platforms')
      .select('url_prefix, name')
      .eq('key', validated.data.platform)
      .maybeSingle();

    const formattedUrl = normalizeUrl(
      validated.data.url,
      validated.data.platform,
      platformData?.url_prefix || null
    );

    // 3. Tìm vị trí (position) lớn nhất hiện tại
    const { data: maxPosLink } = await supabase
      .from('links')
      .select('position')
      .eq('profile_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextPosition = maxPosLink ? maxPosLink.position + 1 : 0;

    const titleVal = validated.data.title?.trim() || platformData?.name || null;

    // 4. Thêm liên kết mới
    const { error: insertErr } = await supabase.from('links').insert({
      profile_id: user.id,
      platform: validated.data.platform,
      title: titleVal,
      url: formattedUrl,
      position: nextPosition,
      is_active: validated.data.is_active,
    });

    if (insertErr) {
      return { success: false, error: 'Lỗi khi lưu liên kết: ' + insertErr.message };
    }

    revalidatePath('/dashboard/links');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

export async function updateLinkAction(data: UpdateLinkFormData) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.' };
    }

    const validated = updateLinkSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.errors[0]?.message || 'Dữ liệu không hợp lệ.' };
    }

    const supabase = await createClient();

    // Lấy url_prefix của nền tảng
    const { data: platformData } = await supabase
      .from('social_platforms')
      .select('url_prefix, name')
      .eq('key', validated.data.platform)
      .maybeSingle();

    const formattedUrl = normalizeUrl(
      validated.data.url,
      validated.data.platform,
      platformData?.url_prefix || null
    );

    const titleVal = validated.data.title?.trim() || platformData?.name || null;

    const { error: updateErr } = await supabase
      .from('links')
      .update({
        platform: validated.data.platform,
        title: titleVal,
        url: formattedUrl,
        is_active: validated.data.is_active,
      })
      .eq('id', validated.data.id)
      .eq('profile_id', user.id);

    if (updateErr) {
      return { success: false, error: 'Lỗi khi cập nhật liên kết: ' + updateErr.message };
    }

    revalidatePath('/dashboard/links');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Đã xảy ra lỗi không mong muốn.',
    };
  }
}

export async function toggleLinkActiveAction(linkId: string, isActive: boolean) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('links')
      .update({ is_active: isActive })
      .eq('id', linkId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/links');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi hệ thống',
    };
  }
}

export async function deleteLinkAction(linkId: string) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('links')
      .delete()
      .eq('id', linkId)
      .eq('profile_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/links');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi khi xóa liên kết',
    };
  }
}

export async function reorderLinksAction(orderedIds: string[]) {
  try {
    const { user } = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Chưa đăng nhập' };
    }

    const supabase = await createClient();

    // Cập nhật vị trí cho từng link
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('links')
        .update({ position: index })
        .eq('id', id)
        .eq('profile_id', user.id)
    );

    const results = await Promise.all(updates);
    const hasError = results.some((r) => r.error);

    if (hasError) {
      return { success: false, error: 'Không thể cập nhật thứ tự liên kết.' };
    }

    revalidatePath('/dashboard/links');
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Lỗi sắp xếp liên kết',
    };
  }
}
