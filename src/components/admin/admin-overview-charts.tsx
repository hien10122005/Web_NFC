'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimeSeriesPoint {
  date: string; // "DD/MM"
  views: number;
  users: number;
}

interface AdminOverviewChartsProps {
  data: TimeSeriesPoint[];
}

export function AdminOverviewCharts({ data }: AdminOverviewChartsProps) {
  const [metric, setMetric] = useState<'views' | 'users'>('views');

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
        <div>
          <CardTitle className="text-base sm:text-lg font-bold">
            Hoạt động hệ thống 30 ngày qua
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Biến động lượt quét thẻ NFC và số lượng tài khoản đăng ký mới
          </CardDescription>
        </div>

        <Tabs
          value={metric}
          onValueChange={(v) => setMetric(v as 'views' | 'users')}
          className="w-auto"
        >
          <TabsList className="grid grid-cols-2 h-9 p-1 bg-muted/80 rounded-xl">
            <TabsTrigger value="views" className="text-xs font-semibold rounded-lg">
              Lượt xem/quét
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs font-semibold rounded-lg">
              User mới
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent className="pt-6 px-2 sm:px-6">
        <div className="h-72 sm:h-80 w-full">
          {metric === 'views' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  dy={8}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">
                            Ngày: {payload[0].payload.date}
                          </p>
                          <p className="text-blue-500 font-bold mt-1">
                            Lượt xem/quét: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  dy={8}
                />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-xl border border-border bg-popover p-2.5 shadow-md text-xs">
                          <p className="font-semibold text-foreground">
                            Ngày: {payload[0].payload.date}
                          </p>
                          <p className="text-emerald-500 font-bold mt-1">
                            Người dùng mới: {payload[0].value}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="users"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
