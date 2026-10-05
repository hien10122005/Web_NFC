"use server"

import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth"
import { profileSchema, type ProfileInput } from "@/lib/validations/profile"
import type { Database } from "@/types/database.types"
import { revalidatePath } from "next/cache"

type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export async function updateProfileAction(
  values: ProfileInput
): Promise<{ success?: boolean; error?: string }> {
  const parsed = profileSchema.safeParse(values)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Dữ liệu không hợp lệ" }
  }

  const { user, profile } = await requireUser()
  const data = parsed.data
  const cleanUsername = data.username.trim().toLowerCase()

  const supabase = await createClient()

  // If username is changing, verify availability
  if (profile?.username !== cleanUsername) {
    const { data: isAvailable, error: checkError } = await supabase.rpc(
      "is_username_available",
      { p_username: cleanUsername }
    )

    if (checkError || !isAvailable) {
      return {
        error: "Username này không khả dụng hoặc đã được sử dụng. Vui lòng chọn username khác.",
      }
    }
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName,
      username: cleanUsername,
      job_title: data.jobTitle || null,
      organization: data.organization || null,
      bio: data.bio || null,
      phone: data.phone || null,
      email_public: data.emailPublic || null,
      address: data.address || null,
      is_public: data.isPublic,
      visibility: data.visibility,
    })
    .eq("id", user.id)

  if (updateError) {
    return { error: "Không thể lưu hồ sơ: " + updateError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  revalidatePath(`/u/${cleanUsername}`)
  if (profile?.username && profile.username !== cleanUsername) {
    revalidatePath(`/u/${profile.username}`)
  }

  return { success: true }
}

export async function updateProfileImagesAction(payload: {
  avatarUrl?: string | null
  coverUrl?: string | null
}): Promise<{ success?: boolean; error?: string }> {
  const { user, profile } = await requireUser()
  const supabase = await createClient()

  const updateData: ProfileUpdate = {}
  if ("avatarUrl" in payload) updateData.avatar_url = payload.avatarUrl ?? null
  if ("coverUrl" in payload) updateData.cover_url = payload.coverUrl ?? null

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id)

  if (error) {
    return { error: "Không thể cập nhật ảnh: " + error.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/profile")
  if (profile?.username) {
    revalidatePath(`/u/${profile.username}`)
  }

  return { success: true }
}
