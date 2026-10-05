"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  CreditCard,
  LayoutDashboard,
  Link2,
  Menu,
  User,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

interface MobileNavProps {
  username?: string | null
  role?: string | null
}

export function MobileNav({ username, role }: MobileNavProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const quickLinks = [
    {
      title: "Tổng quan",
      href: "/dashboard",
      icon: LayoutDashboard,
      exact: true,
    },
    {
      title: "Hồ sơ",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      title: "Liên kết",
      href: "/dashboard/links",
      icon: Link2,
    },
    {
      title: "Thẻ NFC",
      href: "/dashboard/cards",
      icon: CreditCard,
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-border/60 bg-background/95 backdrop-blur md:hidden supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-around px-2">
        {quickLinks.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors",
                isActive
                  ? "text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
              <span>{item.title}</span>
            </Link>
          )
        })}

        {/* More Menu via Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <button
                type="button"
                className="flex flex-col items-center justify-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground"
              />
            }
          >
            <Menu className="h-5 w-5 text-muted-foreground" />
            <span>Thêm</span>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl pb-8 max-h-[85vh] overflow-y-auto">
            <SheetHeader className="text-left pb-4">
              <SheetTitle className="text-base font-bold">Menu điều hướng</SheetTitle>
            </SheetHeader>
            <DashboardNav
              username={username}
              role={role}
              onItemClick={() => setSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
