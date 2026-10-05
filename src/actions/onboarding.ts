"use server"

import { createClient } from "@/lib/supabase/server"
import { onboardingSchema, type OnboardingInput } from "@/lib/validations/onboarding"
import { revalidatePath } from "next/cache"

export async function checkUsernameAction(username: string): Promise<{ available: boolean; error?: string }> {
  const clean = username.trim().toLowerCase()
  if (!clean || clean.length < 3 || clean.length > 30) {
    return { available: false, error: "Độ dài username phải từ 3 đến 30 ký tự" }
  }

  const regex = /^[a-z0-9_.]+$/
  if (!regex.test(clean)) {
    return {
      available: false,
      error: "Chỉ được chứa ký tự thường (a-z), chữ số (0-9), dấu _ hoặc dấu .",
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("is_username_available", {
    p_username: clean,
  })

  if (error) {
    return { available: false, error: error.message }
  }

  return { available: !!data }
}

export async function completeOnboardingAction(
  values: OnboardingInput
): Promise<{ success?: boolean; error?: string }> {
  const parsed = onboardingSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" }
  }

  const { fullName, username } = parsed.data
  const cleanUsername = username.trim().toLowerCase()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Bạn chưa đăng nhập. Vui lòng đăng nhập lại." }
  }

  // Check username availability
  const { data: isAvailable, error: checkError } = await supabase.rpc(
    "is_username_available",
    {
      p_username: cleanUsername,
    }
  )

  if (checkError || !isAvailable) {
    return {
      error:
        "Username này không khả dụng hoặc đã có người sử dụng. Vui lòng chọn username khác.",
    }
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      username: cleanUsername,
    })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Không thể lưu thông tin: " + updateError.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
