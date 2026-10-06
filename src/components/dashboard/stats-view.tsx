"use client"

import React, { useState, useTransition } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Eye,
  MousePointerClick,
  Percent,
  Nfc,
  QrCode,
  Globe,
  Smartphone,
  Laptop,
  TrendingUp,
  ExternalLink,
  Calendar,
  Loader2,
} from "lucide-react"
import { getMyStatsAction, type MyStatsData } from "@/actions/stats"
import { toast } from "sonner"

interface StatsViewProps {
  initialData: MyStatsData
}

const SOURCE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6"] // NFC (blue), QR (emerald), Direct (purple)

export function StatsView({ initialData }: StatsViewProps) {
  const [data, setData] = useState<MyStatsData>(initialData)
  const [selectedDays, setSelectedDays] = useState<number>(initialData.days || 30)
  const [isPending, startTransition] = useTransition()

  const handlePeriodChange = (days: number) => {
    if (days === selectedDays || isPending) return
    setSelectedDays(days)
    startTransition(async () => {
      const res = await getMyStatsAction(days)
      if (res.success && res.data) {
        setData(res.data)
      } else {
        toast.error(res.error || "Không thể tải dữ liệu thống kê")
      }
    })
  }

  const { summary, views_by_date, views_by_source, views_by_device, top_links } = data

  // Chuẩn bị dữ liệu cho nguồn truy cập
  const totalSourceViews = (views_by_source.nfc || 0) + (views_by_source.qr || 0) + (views_by_source.direct || 0)
  const sourceChartData = [
    { name: "Thẻ NFC", value: views_by_source.nfc || 0, icon: Nfc },
    { name: "Quét mã QR", value: views_by_source.qr || 0, icon: QrCode },
    { name: "Trực tiếp / Link", value: views_by_source.direct || 0, icon: Globe },
  ].filter((item) => item.value > 0)

  // Chuẩn bị dữ liệu cho thiết bị
  const totalDeviceViews = (views_by_device.mobile || 0) + (views_by_device.desktop || 0) + (views_by_device.other || 0)
  const mobilePercent = totalDeviceViews > 0 ? Math.round(((views_by_device.mobile || 0) / totalDeviceViews) * 100) : 0
  const desktopPercent = totalDeviceViews > 0 ? Math.round(((views_by_device.desktop || 0) / totalDeviceViews) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Header & Bộ lọc thời gian */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Thống kê hoạt động</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Theo dõi hiệu quả trang cá nhân NFC, nguồn người xem và các liên kết được bấm nhiều nhất
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-xl border border-border/50 self-start sm:self-auto">
          {[
            { label: "7 ngày", val: 7 },
            { label: "30 ngày", val: 30 },
            { label: "90 ngày", val: 90 },
          ].map((period) => (
            <Button
              key={period.val}
              variant={selectedDays === period.val ? "default" : "ghost"}
              size="sm"
              disabled={isPending}
              onClick={() => handlePeriodChange(period.val)}
              className="text-xs h-8 px-3 rounded-lg font-medium transition-all"
            >
              {isPending && selectedDays === period.val ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : null}
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tổng lượt xem
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summary.total_views}</div>
            <p className="text-xs text-muted-foreground mt-1">Trong {selectedDays} ngày qua</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Xem hôm nay
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">+{summary.views_today}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt xem trong ngày</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Lượt click link
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summary.total_clicks}</div>
            <p className="text-xs text-muted-foreground mt-1">Người xem bấm liên kết</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Click hôm nay
            </CardTitle>
            <MousePointerClick className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">+{summary.clicks_today}</div>
            <p className="text-xs text-muted-foreground mt-1">Lượt click trong ngày</p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-xs bg-card/60 backdrop-blur-xs sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tỷ lệ click (CTR)
            </CardTitle>
            <Percent className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">{summary.ctr}%</div>
            <p className="text-xs text-muted-foreground mt-1">Click trên số người xem</p>
          </CardContent>
        </Card>
      </div>

      {/* Biểu đồ biến động lượt xem theo ngày */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/40">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Biến động lượt xem theo ngày</span>
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Dữ liệu chuỗi thời gian {selectedDays} ngày qua
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-6 px-2 sm:px-6">
          <div className="h-72 sm:h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={views_by_date}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="userViewsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload as { date: string; label: string; views: number }
                      return (
                        <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">Ngày: {item.date}</p>
                          <p className="text-blue-500 font-bold mt-1">Lượt xem: {item.views}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Lượt xem"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#userViewsGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Nguồn truy cập & Thiết bị */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Nguồn truy cập */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold">Nguồn truy cập</CardTitle>
            <CardDescription className="text-xs">
              Người xem vào trang của bạn qua cách thức nào
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {totalSourceViews === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Chưa có lượt truy cập nào trong khoảng thời gian này
              </div>
            ) : (
              <div className="space-y-6">
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={sourceChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                      >
                        {sourceChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={SOURCE_COLORS[index % SOURCE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(val) => <span className="text-xs text-foreground font-medium">{val}</span>}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const p = payload[0]
                            const percent = Math.round(((Number(p.value) || 0) / totalSourceViews) * 100)
                            return (
                              <div className="rounded-xl border border-border bg-popover p-2 shadow-md text-xs">
                                <span className="font-semibold">{p.name}: </span>
                                <span className="font-bold">{p.value} lượt ({percent}%)</span>
                              </div>
                            )
                          }
                          return null
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                    <Nfc className="h-4 w-4 text-blue-500 mb-1" />
                    <span className="text-xs text-muted-foreground">Thẻ NFC</span>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {views_by_source.nfc || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <QrCode className="h-4 w-4 text-emerald-500 mb-1" />
                    <span className="text-xs text-muted-foreground">Mã QR</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {views_by_source.qr || 0}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center">
                    <Globe className="h-4 w-4 text-purple-500 mb-1" />
                    <span className="text-xs text-muted-foreground">Trực tiếp</span>
                    <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {views_by_source.direct || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Thiết bị người xem */}
        <Card className="border-border/60 shadow-xs">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-base font-bold">Thiết bị người xem</CardTitle>
            <CardDescription className="text-xs">
              Tỷ lệ giữa điện thoại thông minh và máy tính để bàn
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {totalDeviceViews === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Chưa có dữ liệu thiết bị trong khoảng thời gian này
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual Bar Ratio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                      <Smartphone className="h-4 w-4" /> Di động: {mobilePercent}%
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <Laptop className="h-4 w-4" /> Máy tính: {desktopPercent}%
                    </span>
                  </div>
                  <div className="h-3 w-full bg-muted rounded-full overflow-hidden flex">
                    <div
                      className="bg-cyan-500 transition-all duration-500"
                      style={{ width: `${mobilePercent}%` }}
                    />
                    <div
                      className="bg-amber-500 transition-all duration-500"
                      style={{ width: `${desktopPercent}%` }}
                    />
                  </div>
                </div>

                {/* Cards detail */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-xl border border-border/50 bg-muted/20 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Điện thoại di động</p>
                      <p className="text-lg font-bold">{views_by_device.mobile || 0}</p>
                      <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                        {mobilePercent}% tổng lượt
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-border/50 bg-muted/20 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                      <Laptop className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Máy tính / Khác</p>
                      <p className="text-lg font-bold">{views_by_device.desktop || 0}</p>
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        {desktopPercent}% tổng lượt
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Liên kết được click nhiều nhất */}
      <Card className="border-border/60 shadow-xs">
        <CardHeader className="border-b border-border/40 pb-4">
          <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
            <MousePointerClick className="h-4 w-4 text-violet-500" />
            <span>Top liên kết được tương tác nhiều nhất</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Bảng xếp hạng những nút liên kết được khách bấm vào nhiều nhất trong {selectedDays} ngày qua
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 px-0 sm:px-6">
          {top_links.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Bạn chưa có liên kết nào hoặc chưa phát sinh lượt click.
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {top_links.map((link, idx) => {
                const clickPercent =
                  summary.total_clicks > 0
                    ? Math.round((link.clicks / summary.total_clicks) * 100)
                    : 0
                return (
                  <div
                    key={link.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-4 sm:px-0 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate text-foreground">
                            {link.title || link.platform}
                          </p>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {link.platform}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate mt-0.5"
                        >
                          <span className="truncate">{link.url}</span>
                          <ExternalLink className="h-3 w-3 shrink-0" />
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:self-center self-end">
                      <div className="w-28 hidden sm:block">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="bg-violet-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${clickPercent}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-foreground">
                          {link.clicks} <span className="text-xs font-normal text-muted-foreground">click</span>
                        </span>
                        <p className="text-[11px] text-muted-foreground font-medium">
                          {clickPercent}% tổng click
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
