import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { Database } from "@/types/database.types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { user: null, profile: null }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { user, profile: null }
  }

  return { user, profile }
}

export async function requireUser() {
  const { user, profile } = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (profile?.status === "banned") {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect(
      "/login?error=" +
        encodeURIComponent(
          "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
        )
    )
  }

  return { user, profile }
}

export async function requireAdmin() {
  const { user, profile } = await requireUser()
  const supabase = await createClient()

  const { data: isAdmin, error } = await supabase.rpc("is_admin")

  if (error || !isAdmin) {
    redirect(
      "/dashboard?error=" +
        encodeURIComponent("Bạn không có quyền truy cập khu vực quản trị.")
    )
  }

  return { user, profile }
}
