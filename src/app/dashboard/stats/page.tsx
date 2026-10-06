import { Metadata } from "next"
import { requireUser } from "@/lib/auth"
import { getMyStatsAction } from "@/actions/stats"
import { StatsView } from "@/components/dashboard/stats-view"

export const metadata: Metadata = {
  title: "Thống kê hoạt động - Trang Cá Nhân NFC",
  description: "Báo cáo chi tiết lượt xem, nguồn quét thẻ NFC, thiết bị và các liên kết được bấm",
}

export default async function DashboardStatsPage() {
  await requireUser()

  const res = await getMyStatsAction(30)

  const initialData = res.data || {
    days: 30,
    summary: {
      total_views: 0,
      views_today: 0,
      total_clicks: 0,
      clicks_today: 0,
      ctr: 0,
    },
    views_by_date: [],
    views_by_source: { nfc: 0, qr: 0, direct: 0 },
    views_by_device: { mobile: 0, desktop: 0, other: 0 },
    top_links: [],
  }

  return <StatsView initialData={initialData} />
}
