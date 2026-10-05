"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  Link2,
  Palette,
  Settings,
  ShieldCheck,
  User,
  Users,
} from "lucide-react"

interface DashboardNavProps {
  username?: string | null
  role?: string | null
  className?: string
  onItemClick?: () => void
}

export const navItems = [
  {
    title: "Tổng quan",
    href: "/dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Hồ sơ cá nhân",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Liên kết",
    href: "/dashboard/links",
    icon: Link2,
  },
  {
    title: "Giao diện",
    href: "/dashboard/appearance",
    icon: Palette,
  },
  {
    title: "Thẻ NFC",
    href: "/dashboard/cards",
    icon: CreditCard,
  },
  {
    title: "Thống kê",
    href: "/dashboard/stats",
    icon: BarChart3,
  },
  {
    title: "Danh bạ thu thập",
    href: "/dashboard/leads",
    icon: Users,
  },
  {
    title: "Cài đặt",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav({
  username,
  role,
  className,
  onItemClick,
}: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-col gap-1.5", className)}>
      <div className="space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>

      {/* Admin Link if role is admin */}
      {role === "admin" && (
        <div className="pt-4 mt-3 border-t border-border/40">
          <Link
            href="/admin"
            onClick={onItemClick}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <ShieldCheck className="h-4 w-4 shrink-0 text-rose-500" />
            <span>Khu vực Admin</span>
          </Link>
        </div>
      )}

      {/* View My Public Page Link */}
      {username && (
        <div className="pt-2">
          <Link
            href={`/u/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onItemClick}
            className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
          >
            <span className="truncate">Xem trang: /u/{username}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 ml-1.5" />
          </Link>
        </div>
      )}
    </nav>
  )
}
