"use server"

import { createClient } from "@/lib/supabase/server"
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth"
import { redirect } from "next/navigation"

export type AuthActionResult = {
  success?: boolean
  error?: string
  needEmailConfirm?: boolean
  redirectTo?: string
}

export async function loginAction(values: LoginInput): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" }
  }

  const { email, password } = parsed.data
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { error: "Email hoặc mật khẩu không chính xác." }
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        error:
          "Email của bạn chưa được xác nhận. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư rác) để hoàn tất kích hoạt.",
      }
    }
    return { error: error.message }
  }

  if (data.user) {
    // Check user status
    const { data: profile } = await supabase
      .from("profiles")
      .select("status, username, role")
      .eq("id", data.user.id)
      .single()

    if (profile?.status === "banned") {
      await supabase.auth.signOut()
      return {
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.",
      }
    }

    // If user has no username yet, guide to onboarding
    if (!profile?.username) {
      return { success: true, redirectTo: "/onboarding" }
    }
  }

  return { success: true, redirectTo: "/dashboard" }
}

export async function registerAction(values: RegisterInput): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" }
  }

  const { email, password, fullName } = parsed.data
  const supabase = await createClient()

  // Check allow_registration setting
  const { data: setting } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "allow_registration")
    .single()

  if (setting?.value === false || setting?.value === "false") {
    return { error: "Hệ thống đang tạm ngừng mở đăng ký mới." }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    if (
      error.message.includes("User already registered") ||
      error.message.includes("already registered")
    ) {
      return {
        error: "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.",
      }
    }
    if (error.message.includes("Hệ thống đang tạm đóng đăng ký")) {
      return { error: "Hệ thống đang tạm ngừng mở đăng ký mới." }
    }
    return { error: error.message }
  }

  // Supabase returns an empty identities array if user already registered (with email confirmation enabled)
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      error: "Địa chỉ email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.",
    }
  }

  // If session is null, email confirmation is required
  const needEmailConfirm = !data.session

  return {
    success: true,
    needEmailConfirm,
    redirectTo: needEmailConfirm ? undefined : "/onboarding",
  }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function forgotPasswordAction(
  values: ForgotPasswordInput
): Promise<AuthActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Email không hợp lệ" }
  }

  const { email } = parsed.data
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
  }
}

export async function resetPasswordAction(
  values: ResetPasswordInput
): Promise<AuthActionResult> {
  const parsed = resetPasswordSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Mật khẩu không hợp lệ" }
  }

  const { password } = parsed.data
  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  return {
    success: true,
    redirectTo: "/login?message=" + encodeURIComponent("Đổi mật khẩu thành công. Vui lòng đăng nhập lại."),
  }
}

