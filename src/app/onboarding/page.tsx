import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { OnboardingForm } from "@/components/onboarding-form"
import { CreditCard } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

export default async function OnboardingPage() {
  const { user, profile } = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  // If user already completed onboarding, go to dashboard
  if (profile?.username) {
    redirect("/dashboard")
  }

  const initialFullName =
    profile?.full_name ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    ""

  return (
    <div className="flex min-h-screen flex-col bg-muted/20">
      <header className="flex h-16 w-full items-center justify-between px-4 sm:px-8 border-b border-border/40 bg-background/60 backdrop-blur">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <CreditCard className="h-4 w-4" />
          </div>
          <span>
            NFC<span className="text-primary font-black ml-0.5">Card</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-lg">
          <OnboardingForm initialFullName={initialFullName} />
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/20">
        <p>© 2026 Trang Cá Nhân NFC. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  )
}
