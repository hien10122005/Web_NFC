import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ username: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { username } = await context.params;
  const cleanUsername = username?.toLowerCase().trim();

  if (!cleanUsername) {
    return new NextResponse('Username không hợp lệ', { status: 400 });
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', cleanUsername)
    .single();

  if (!profile || profile.status === 'banned' || !profile.is_public) {
    return new NextResponse('Hồ sơ không tồn tại hoặc không khả dụng', { status: 404 });
  }

  const visibility = (profile.visibility as Record<string, boolean>) || {};

  // Xây dựng nội dung vCard 3.0
  const fullName = profile.full_name || cleanUsername;
  const vcardLines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${fullName}`,
    `N;CHARSET=UTF-8:${fullName};;;;`,
  ];

  if (visibility.organization !== false && profile.organization) {
    vcardLines.push(`ORG;CHARSET=UTF-8:${profile.organization}`);
  }

  if (visibility.job_title !== false && profile.job_title) {
    vcardLines.push(`TITLE;CHARSET=UTF-8:${profile.job_title}`);
  }

  if (visibility.phone !== false && profile.phone) {
    vcardLines.push(`TEL;TYPE=CELL,VOICE:${profile.phone.replace(/\s+/g, '')}`);
  }

  if (visibility.email !== false && profile.email_public) {
    vcardLines.push(`EMAIL;TYPE=INTERNET:${profile.email_public}`);
  }

  if (visibility.address !== false && profile.address) {
    vcardLines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${profile.address};;;;`);
  }

  if (visibility.bio !== false && profile.bio) {
    vcardLines.push(`NOTE;CHARSET=UTF-8:${profile.bio.replace(/\n/g, '\\n')}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://trangcanhan.vn';
  vcardLines.push(`URL:${siteUrl}/u/${cleanUsername}`);

  // Thêm ảnh nếu có avatar
  if (profile.avatar_url) {
    vcardLines.push(`PHOTO;VALUE=URI:${profile.avatar_url}`);
  }

  vcardLines.push('END:VCARD');

  const vcfContent = vcardLines.join('\r\n');

  return new NextResponse(vcfContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${cleanUsername}.vcf"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
