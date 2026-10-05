import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Check user profile status
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, username, role")
        .eq("id", data.user.id)
        .single()

      if (profile?.status === "banned") {
        await supabase.auth.signOut()
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
          )}`
        )
      }

      // If user hasn't set up username yet, guide to onboarding
      if (!profile?.username) {
        return NextResponse.redirect(`${origin}/onboarding`)
      }

      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // If code exchange failed or no code provided
  return NextResponse.redirect(
    `${origin}/login?error=${encodeURIComponent(
      "Liên kết xác thực không hợp lệ hoặc đã hết hạn."
    )}`
  )
}
