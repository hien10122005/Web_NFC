"use client"

import * as React from "react"
import Link from "next/link"
import { logoutAction } from "@/actions/auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react"

interface UserMenuProps {
  user: {
    email?: string | null
    id?: string
  }
  profile: {
    full_name?: string | null
    username?: string | null
    avatar_url?: string | null
    role?: string | null
  } | null
}

export function UserMenu({ user, profile }: UserMenuProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false)

  const displayName = profile?.full_name || user.email?.split("@")[0] || "Người dùng"
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(-2)
    .join("")
    .toUpperCase()

  async function handleLogout() {
    setIsLoggingOut(true)
    await logoutAction()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-full ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        }
      >
        <Avatar className="h-9 w-9">
          {profile?.avatar_url && (
            <AvatarImage src={profile.avatar_url} alt={displayName} />
          )}
          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
            {initials || <UserIcon className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
        <DropdownMenuLabel className="font-normal p-2">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-sm leading-none text-foreground">
              <span>{displayName}</span>
              {profile?.role === "admin" && (
                <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  ADMIN
                </span>
              )}
            </div>
            {profile?.username && (
              <p className="text-xs text-primary font-mono">@{profile.username}</p>
            )}
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/dashboard" />}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Bảng điều khiển</span>
          </DropdownMenuItem>

          {profile?.username && (
            <DropdownMenuItem
              render={<Link href={`/u/${profile.username}`} target="_blank" />}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>Xem trang của tôi</span>
            </DropdownMenuItem>
          )}

          {profile?.role === "admin" && (
            <DropdownMenuItem render={<Link href="/admin" />}>
              <ShieldCheck className="mr-2 h-4 w-4 text-rose-500" />
              <span className="font-medium text-rose-600 dark:text-rose-400">
                Quản trị hệ thống
              </span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem render={<Link href="/dashboard/settings" />}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt tài khoản</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          disabled={isLoggingOut}
          onClick={handleLogout}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
