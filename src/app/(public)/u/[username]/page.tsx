import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { after } from 'next/server';
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

// Tối ưu: Dùng React cache để không bị truy vấn Supabase 2 lần giữa generateMetadata và Page component
const getProfile = cache(async (username: string) => {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  return profile;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = username?.toLowerCase().trim();

  if (!cleanUsername) {
    return { title: 'Không tìm thấy hồ sơ' };
  }

  const profile = await getProfile(cleanUsername);

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

  // 1. Lấy thông tin hồ sơ (đã cache từ metadata, không tốn thêm query mạng)
  const profile = await getProfile(cleanUsername);

  if (!profile || profile.status === 'banned') {
    notFound();
  }

  // 2. Tối ưu: Chỉ kiểm tra Auth khi trang ở chế độ RIÊNG TƯ (người xem bình thường không tốn thời gian gọi Auth)
  if (!profile.is_public) {
    const { user } = await getCurrentUser();
    const isOwner = user?.id === profile.id;

    if (!isOwner) {
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
  }

  // 3. Tối ưu: Ghi nhận lượt xem chạy ngầm sau khi trả HTML cho client (dùng after() của Next.js 15)
  if (query.from !== 'card') {
    const headerList = await headers();
    const userAgent = headerList.get('user-agent') || '';
    const isMobile = /mobile|android|iphone|ipad/i.test(userAgent);
    const device = isMobile ? 'mobile' : 'desktop';
    const source = query.src === 'qr' ? 'qr' : 'direct';

    after(async () => {
      try {
        const bgSupabase = await createClient();
        await bgSupabase.rpc('log_profile_view', {
          p_username: cleanUsername,
          p_source: source,
          p_device: device,
          p_user_agent: userAgent.slice(0, 500),
        });
      } catch (err) {
        console.error('Lỗi khi ghi nhận view ngầm:', err);
      }
    });
  }

  const supabase = await createClient();
  const [{ data: links }, { data: blocks }] = await Promise.all([
    supabase
      .from('links')
      .select('*')
      .eq('profile_id', profile.id)
      .order('position', { ascending: true }),
    supabase
      .from('blocks')
      .select('*')
      .eq('profile_id', profile.id)
      .eq('is_active', true)
      .order('position', { ascending: true }),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <PublicProfileView
      profile={profile}
      links={links || []}
      blocks={blocks || []}
      siteUrl={siteUrl}
    />
  );
}
