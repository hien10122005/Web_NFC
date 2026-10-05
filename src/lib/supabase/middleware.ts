import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import type { Database } from "@/types/database.types"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // 1. Routes requiring authentication: /dashboard, /admin, /onboarding
  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/onboarding") {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      if (pathname !== "/dashboard" && pathname !== "/onboarding") {
        url.searchParams.set("next", pathname)
      }
      return NextResponse.redirect(url)
    }

    // Check profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, username, role")
      .eq("id", user.id)
      .single()

    // Check banned status
    if (profile?.status === "banned") {
      await supabase.auth.signOut()
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      url.searchParams.set(
        "error",
        "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
      )
      return NextResponse.redirect(url)
    }

    // If user has no username yet and is not already on onboarding
    if (!profile?.username && pathname !== "/onboarding") {
      const url = request.nextUrl.clone()
      url.pathname = "/onboarding"
      return NextResponse.redirect(url)
    }

    // If user already has username and tries to access /onboarding
    if (profile?.username && pathname === "/onboarding") {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }

    // If user is accessing /admin, check admin privileges
    if (pathname.startsWith("/admin")) {
      const { data: isAdmin } = await supabase.rpc("is_admin")
      if (!isAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        url.searchParams.set(
          "error",
          "Bạn không có quyền truy cập khu vực quản trị."
        )
        return NextResponse.redirect(url)
      }
    }
  }

  // 2. Auth routes when already logged in: /login, /register
  if (user && (pathname === "/login" || pathname === "/register")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, username")
      .eq("id", user.id)
      .single()

    const url = request.nextUrl.clone()
    if (!profile?.username) {
      url.pathname = "/onboarding"
    } else {
      url.pathname = "/dashboard"
    }
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
