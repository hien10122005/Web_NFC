import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  Eye,
  Flag,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminOverviewCharts } from '@/components/admin/admin-overview-charts';

interface OverviewStats {
  total_users: number;
  new_users_today: number;
  new_users_7d: number;
  banned_users: number;
  total_cards: number;
  active_cards: number;
  unassigned_cards: number;
  locked_cards: number;
  total_views: number;
  views_today: number;
  pending_reports: number;
}

export default async function AdminOverviewPage() {
  await requireAdmin();
  const supabase = await createClient();

  // 1. Lấy số liệu tổng quan từ RPC admin_get_overview
  const { data: rawOverview, error: overviewError } = await supabase.rpc('admin_get_overview');

  if (overviewError) {
    console.error('Lỗi gọi RPC admin_get_overview:', overviewError);
  }

  const rawObj = (rawOverview && typeof rawOverview === 'object' ? rawOverview : {}) as Record<string, unknown>;

  const overview: OverviewStats = {
    total_users: Number(rawObj.total_users || 0),
    new_users_today: Number(rawObj.new_users_today || 0),
    new_users_7d: Number(rawObj.new_users_7d || 0),
    banned_users: Number(rawObj.banned_users || 0),
    total_cards: Number(rawObj.total_cards || 0),
    active_cards: Number(rawObj.active_cards || 0),
    unassigned_cards: Number(rawObj.unassigned_cards || 0),
    locked_cards: Number(rawObj.locked_cards || 0),
    total_views: Number(rawObj.total_views || 0),
    views_today: Number(rawObj.views_today || 0),
    pending_reports: Number(rawObj.pending_reports || 0),
  };

  // 2. Lấy dữ liệu 30 ngày qua cho biểu đồ
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const [viewsResult, usersResult] = await Promise.all([
    supabase
      .from('page_views')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('profiles')
      .select('created_at')
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ]);

  // Nhóm theo ngày (30 ngày)
  const chartMap: Record<string, { views: number; users: number }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    chartMap[key] = { views: 0, users: 0 };
  }

  viewsResult.data?.forEach((v) => {
    if (v.created_at) {
      const d = new Date(v.created_at);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (chartMap[key]) chartMap[key].views += 1;
    }
  });

  usersResult.data?.forEach((u) => {
    if (u.created_at) {
      const d = new Date(u.created_at);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (chartMap[key]) chartMap[key].users += 1;
    }
  });

  const chartData = Object.entries(chartMap).map(([date, val]) => ({
    date,
    views: val.views,
    users: val.users,
  }));

  // 3. Lấy Top 10 trang cá nhân nhiều lượt xem nhất
  const { data: topProfilesRaw } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, role, status, is_public')
    .not('username', 'is', null)
    .limit(10);

  // Đếm lượt xem của các profile
  const profileIds = topProfilesRaw?.map((p) => p.id) || [];
  const { data: allViewsForTop } = await supabase
    .from('page_views')
    .select('profile_id')
    .in('profile_id', profileIds);

  const viewCountMap: Record<string, number> = {};
  allViewsForTop?.forEach((v) => {
    if (v.profile_id) {
      viewCountMap[v.profile_id] = (viewCountMap[v.profile_id] || 0) + 1;
    }
  });

  const topProfiles = (topProfilesRaw || [])
    .map((p) => ({
      ...p,
      view_count: viewCountMap[p.id] || 0,
    }))
    .sort((a, b) => b.view_count - a.view_count);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header chào mừng & Lối tắt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Tổng quan hệ thống
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi tình trạng vận hành, người dùng và thẻ NFC theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/cards">
            <Button size="sm" className="gap-2 rounded-xl shadow-xs">
              <PlusCircle className="w-4 h-4" />
              <span>Tạo thẻ NFC mới</span>
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button size="sm" variant="outline" className="gap-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span>Xem người dùng</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Thẻ KPI chính */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Người dùng */}
        <Card className="rounded-2xl border-border/60 shadow-xs relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng người dùng
            </CardTitle>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black">
              {overview.total_users.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-500 font-semibold flex items-center">
                +{overview.new_users_today} hôm nay
              </span>
              <span>•</span>
              <span>+{overview.new_users_7d} tuần qua</span>
            </div>
          </CardContent>
        </Card>

        {/* Lượt xem / Quét thẻ */}
        <Card className="rounded-2xl border-border/60 shadow-xs relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tổng lượt xem / quét
            </CardTitle>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Eye className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black">
              {overview.total_views.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-500 font-semibold">
                +{overview.views_today} hôm nay
              </span>
              <span>•</span>
              <span>Từ thẻ NFC & QR</span>
            </div>
          </CardContent>
        </Card>

        {/* Thẻ NFC */}
        <Card className="rounded-2xl border-border/60 shadow-xs relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Thẻ NFC trong hệ thống
            </CardTitle>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black">
              {overview.total_cards.toLocaleString()}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-emerald-500 font-semibold">
                {overview.active_cards} hoạt động
              </span>
              <span>•</span>
              <span className="text-muted-foreground">
                {overview.unassigned_cards} thẻ kho trống
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Báo cáo chờ duyệt & Khóa */}
        <Card className="rounded-2xl border-border/60 shadow-xs relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Báo cáo vi phạm
            </CardTitle>
            <div
              className={`p-2 rounded-xl ${
                overview.pending_reports > 0
                  ? 'bg-rose-500/10 text-rose-500'
                  : 'bg-zinc-500/10 text-zinc-500'
              }`}
            >
              <Flag className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black">
              {overview.pending_reports}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {overview.pending_reports > 0 ? (
                <Link
                  href="/admin/reports"
                  className="text-rose-500 font-semibold hover:underline flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Cần xử lý ngay</span>
                </Link>
              ) : (
                <span className="text-emerald-500 font-semibold">Hệ thống an toàn</span>
              )}
              <span>•</span>
              <span>{overview.banned_users} user bị khóa</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ hoạt động Recharts 30 ngày */}
      <AdminOverviewCharts data={chartData} />

      {/* Top 10 Trang cá nhân & Trạng thái thẻ kho */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột 1 & 2: Top 10 trang nhiều lượt xem nhất */}
        <Card className="lg:col-span-2 rounded-2xl border-border/60 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">
                Top trang cá nhân nhiều lượt xem nhất
              </CardTitle>
              <CardDescription className="text-xs">
                Danh sách người dùng có lượng tương tác quét thẻ cao nhất
              </CardDescription>
            </div>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {topProfiles.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Chưa có dữ liệu lượt xem
                </div>
              ) : (
                topProfiles.map((p, index) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-5 text-center font-bold text-xs text-muted-foreground">
                        #{index + 1}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center font-bold text-xs text-primary shrink-0">
                        {p.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.avatar_url}
                            alt={p.full_name || ''}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (p.full_name || p.username || 'U').slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {p.full_name || 'Chưa đặt tên'}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground truncate">
                          @{p.username}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-extrabold text-sm text-primary">
                          {p.view_count.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-muted-foreground">lượt xem</p>
                      </div>

                      <Link
                        href={`/u/${p.username}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Xem trang công khai"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cột 3: Tình trạng kho thẻ & Quản trị nhanh */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border/60 shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Trạng thái kho thẻ NFC</CardTitle>
              <CardDescription className="text-xs">
                Phân bổ {overview.total_cards} thẻ trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-emerald-600 dark:text-emerald-400">Đã kích hoạt (Active)</span>
                  <span className="font-bold">{overview.active_cards} thẻ</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${overview.total_cards > 0 ? (overview.active_cards / overview.total_cards) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-blue-600 dark:text-blue-400">Chưa gắn chủ (Kho trắng)</span>
                  <span className="font-bold">{overview.unassigned_cards} thẻ</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${overview.total_cards > 0 ? (overview.unassigned_cards / overview.total_cards) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-rose-600 dark:text-rose-400">Đang khóa / Báo mất</span>
                  <span className="font-bold">{overview.locked_cards} thẻ</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full"
                    style={{
                      width: `${overview.total_cards > 0 ? (overview.locked_cards / overview.total_cards) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Link href="/admin/cards">
                  <Button variant="outline" className="w-full text-xs font-semibold rounded-xl">
                    Quản lý danh sách thẻ NFC
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Lối tắt quản trị */}
          <Card className="rounded-2xl border-border/60 shadow-xs bg-linear-to-br from-primary/5 via-muted/30 to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Thao tác nhanh</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/admin/cards" className="block">
                <div className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all text-xs flex items-center justify-between">
                  <span className="font-semibold">Tạo lô thẻ NFC & Xuất CSV</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
              <Link href="/admin/settings" className="block">
                <div className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all text-xs flex items-center justify-between">
                  <span className="font-semibold">Đóng/mở đăng ký & Username cấm</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
              <Link href="/admin/logs" className="block">
                <div className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all text-xs flex items-center justify-between">
                  <span className="font-semibold">Xem lịch sử Admin Logs</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
