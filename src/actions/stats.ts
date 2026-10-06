"use server"

import { createClient } from "@/lib/supabase/server"

export interface StatsSummary {
  total_views: number
  views_today: number
  total_clicks: number
  clicks_today: number
  ctr: number
}

export interface DateViewPoint {
  date: string
  label: string
  views: number
}

export interface SourceDistribution {
  nfc: number
  qr: number
  direct: number
}

export interface DeviceDistribution {
  mobile: number
  desktop: number
  other: number
}

export interface TopLinkItem {
  id: string
  title: string | null
  url: string
  platform: string
  clicks: number
}

export interface MyStatsData {
  days: number
  summary: StatsSummary
  views_by_date: DateViewPoint[]
  views_by_source: SourceDistribution
  views_by_device: DeviceDistribution
  top_links: TopLinkItem[]
}

export async function getMyStatsAction(days: number = 30): Promise<{
  success: boolean
  data?: MyStatsData
  error?: string
}> {
  try {
    const validDays = [7, 30, 90].includes(days) ? days : 30
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" }
    }

    const { data, error } = await supabase.rpc("get_my_stats", {
      p_days: validDays,
    })

    if (error) {
      console.error("Error fetching my stats:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      data: data as unknown as MyStatsData,
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Đã có lỗi xảy ra"
    return { success: false, error: message }
  }
}
