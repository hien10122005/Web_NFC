import { redirect } from "next/navigation"
import Link from "next/link"
import { requireUser } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { UserMenu } from "@/components/user-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { CreditCard, ExternalLink } from "lucide-react"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await requireUser()

  // Ensure user completed onboarding
  if (!profile?.username) {
    redirect("/onboarding")
  }

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-background/95 backdrop-blur shrink-0">
        <div className="flex h-16 items-center border-b border-border/40 px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <CreditCard className="h-4 w-4" />
            </div>
            <span>
              NFC<span className="text-primary font-black ml-0.5">Card</span>
            </span>
          </Link>
        </div>

        {/* User Card Summary in Sidebar */}
        <div className="p-4 border-b border-border/20">
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
              {profile.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name || ""}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                (profile.full_name || user.email || "U").slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {profile.full_name || "Chưa đặt tên"}
              </p>
              <p className="truncate text-xs font-mono text-muted-foreground">
                @{profile.username}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <DashboardNav username={profile.username} role={profile.role} />
        </div>

        {/* Footer in Sidebar */}
        <div className="p-4 border-t border-border/20 text-[11px] text-muted-foreground flex justify-between items-center">
          <span>Phiên bản 1.0</span>
          <span>© NFC Card</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/95 backdrop-blur px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Brand */}
            <div className="flex items-center gap-2 md:hidden">
              <Link href="/dashboard" className="flex items-center gap-2 font-bold text-base">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <span>NFC<span className="text-primary font-black ml-0.5">Card</span></span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {profile.username && (
              <Link
                href={`/u/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span>Xem trang của tôi</span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              </Link>
            )}

            <ThemeToggle />
            <UserMenu user={user} profile={profile} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav username={profile.username} role={profile.role} />
    </div>
  )
}
