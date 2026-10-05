import { requireUser } from "@/lib/auth"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { ExternalLink, User } from "lucide-react"

export default async function ProfilePage() {
  const { user, profile } = await requireUser()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Hồ sơ cá nhân</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cập nhật hình ảnh, chức vụ, thông tin liên hệ và tùy chỉnh hiển thị từng mục.
          </p>
        </div>

        {profile?.username && (
          <Link
            href={`/u/${profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "font-medium shrink-0",
            })}
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            Xem trang công khai
          </Link>
        )}
      </div>

      {/* Profile Form */}
      <ProfileForm user={user} profile={profile!} />
    </div>
  )
}
