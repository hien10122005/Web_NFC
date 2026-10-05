import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ linkId: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { linkId } = await context.params;

  if (!linkId) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = await createClient();

  // 1. Lấy thông tin link
  const { data: link } = await supabase
    .from('links')
    .select('url')
    .eq('id', linkId)
    .single();

  if (!link || !link.url) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Ghi lượt click (gọi RPC log_link_click)
  try {
    await supabase.rpc('log_link_click', { p_link_id: linkId });
  } catch (err) {
    console.error('Lỗi khi ghi nhận click link:', err);
  }

  // 3. Chuyển hướng đến URL đích
  return NextResponse.redirect(link.url);
}
