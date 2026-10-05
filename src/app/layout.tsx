import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const beVietnamPro = Be_Vietnam_Pro({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Trang Cá Nhân NFC — Danh thiếp số một chạm",
    template: "%s | Trang Cá Nhân NFC",
  },
  description:
    "Tạo và chia sẻ danh thiếp thông minh, hồ sơ cá nhân số hiện đại chỉ với một lần chạm thẻ NFC hoặc quét mã QR.",
  keywords: [
    "NFC",
    "danh thiếp thông minh",
    "trang cá nhân",
    "smart card",
    "vietqr",
    "vcard",
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${beVietnamPro.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  )
}
