import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { PublicProfileView } from '@/components/profile/public-profile-view';
import { headers } from 'next/headers';
import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ username: string }>;
  searchParams: Promise<{ from?: string; src?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username?.toLowerCase().trim();

  if (!cleanUsername) {
    return { title: 'Không tìm thấy hồ sơ' };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, bio, avatar_url, is_public, status')
    .eq('username', cleanUsername)
    .single();

  if (!profile || profile.status === 'banned') {
    return { title: 'Không tìm thấy hồ sơ - Trang Cá Nhân NFC' };
  }

  if (!profile.is_public) {
    return {
      title: `${profile.full_name || cleanUsername} (Riêng tư)`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${profile.full_name || cleanUsername} | Danh thiếp thông minh`;
  const description = profile.bio || `Trang thông tin và liên kết cá nhân của ${profile.full_name || cleanUsername}`;
  const images = profile.avatar_url ? [profile.avatar_url] : [];

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const { username } = await params;
  const query = await searchParams;
  const cleanUsername = username?.toLowerCase().trim();

  if (!cleanUsername) {
    notFound();
  }

  const supabase = await createClient();

  // 1. Lấy thông tin hồ sơ
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', cleanUsername)
    .single();

  if (!profile || profile.status === 'banned') {
    notFound();
  }

  // 2. Kiểm tra quyền riêng tư (is_public)
  const { user } = await getCurrentUser();
  const isOwner = user?.id === profile.id;

  if (!profile.is_public && !isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <div className="max-w-md w-full p-8 rounded-2xl border bg-card text-card-foreground shadow-lg text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold">Hồ sơ riêng tư</h2>
          <p className="text-sm text-muted-foreground">
            Trang cá nhân của <strong>{profile.full_name || cleanUsername}</strong> hiện đang được đặt ở chế độ riêng tư và chỉ người sở hữu mới có thể xem.
          </p>
          <div className="pt-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Ghi nhận lượt xem nếu truy cập trực tiếp (không đi qua /c/ card redirect)
  if (query.from !== 'card') {
    try {
      const headerList = await headers();
      const userAgent = headerList.get('user-agent') || '';
      const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
      const device = isMobile ? 'mobile' : 'desktop';

      await supabase.rpc('log_profile_view', {
        p_username: cleanUsername,
        p_source: query.src === 'qr' ? 'qr' : 'direct',
        p_device: device,
        p_user_agent: userAgent.slice(0, 500),
      });
    } catch (err) {
      console.error('Lỗi khi ghi nhận view trực tiếp:', err);
    }
  }

  // 4. Lấy danh sách liên kết của hồ sơ
  const { data: links } = await supabase
    .from('links')
    .select('*')
    .eq('profile_id', profile.id)
    .order('position', { ascending: true });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <PublicProfileView
      profile={profile}
      links={links || []}
      siteUrl={siteUrl}
    />
  );
}
