import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Compass, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 text-muted-foreground mb-6">
        <Compass className="h-10 w-10 animate-pulse" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">404</h1>
      <h2 className="mt-2 text-xl font-semibold sm:text-2xl">
        Không tìm thấy trang
      </h2>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn bị thay đổi.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className={buttonVariants({ variant: "default" })}>
          <Home className="mr-2 h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
