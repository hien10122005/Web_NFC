import Link from "next/link"
import { CreditCard } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="py-6 text-center text-xs text-muted-foreground border-t border-border/20">
        <p>© 2026 Trang Cá Nhân NFC. Mọi quyền được bảo lưu.</p>
      </footer>
    </div>
  )
}
