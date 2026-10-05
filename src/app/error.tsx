"use client"

import * as React from "react"
import { Button, buttonVariants } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("App Error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-6">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Đã có lỗi xảy ra!
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Hệ thống gặp sự cố ngoài ý muốn khi xử lý yêu cầu của bạn. Vui lòng thử lại hoặc quay về trang chủ.
      </p>
      {error.message && (
        <pre className="mt-4 max-w-lg overflow-auto rounded bg-muted p-3 text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Button onClick={() => reset()} variant="default">
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          <Home className="mr-2 h-4 w-4" />
          Về trang chủ
        </Link>
      </div>
    </div>
  )
}
