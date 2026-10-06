"use server"

import { createClient } from "@/lib/supabase/server"
import { leadFormSchema, type LeadFormInput } from "@/lib/validations/lead"
import { revalidatePath } from "next/cache"

export interface LeadItem {
  id: string
  profile_id: string
  name: string
  phone: string | null
  email: string | null
  note: string | null
  created_at: string
}

/**
 * 1. Khách gửi thông tin liên hệ từ trang cá nhân công khai
 */
export async function submitLeadAction(
  profileId: string,
  rawInput: LeadFormInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = leadFormSchema.safeParse(rawInput)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.errors[0]?.message || "Thông tin gửi không hợp lệ",
      }
    }

    const { name, phone, email, note, honeypot } = parsed.data

    // Chống bot spam bằng Honeypot trap: Nếu robot điền trường ẩn này, giả lập thành công nhưng bỏ qua
    if (honeypot && honeypot.trim().length > 0) {
      return { success: true }
    }

    const supabase = await createClient()

    // Kiểm tra chủ hồ sơ có tồn tại, công khai và đang hoạt động không
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("id, is_public, status, visibility")
      .eq("id", profileId)
      .maybeSingle()

    if (profileErr || !profile) {
      return { success: false, error: "Hồ sơ không tồn tại hoặc đã bị khóa" }
    }

    if (!profile.is_public || profile.status !== "active") {
      return { success: false, error: "Trang cá nhân này hiện không nhận liên hệ" }
    }

    const vis = (profile.visibility as Record<string, boolean>) || {}
    if (vis.lead_form === false) {
      return { success: false, error: "Chủ thẻ đã tạm tắt tính năng nhận thông tin liên hệ" }
    }

    // Ghi vào bảng leads
    const { error: insertErr } = await supabase.from("leads").insert({
      profile_id: profileId,
      name,
      phone: phone || null,
      email: email || null,
      note: note || null,
    })

    if (insertErr) {
      console.error("Lỗi khi lưu lead:", insertErr)
      return { success: false, error: "Không thể lưu thông tin. Vui lòng thử lại sau." }
    }

    // Kích hoạt Edge Function gửi email thông báo (async không chặn client)
    try {
      void supabase.functions.invoke("notify-new-lead", {
        body: {
          profileId,
          name,
          phone: phone || null,
          email: email || null,
          note: note || null,
        },
      })
    } catch {
      // Bỏ qua lỗi gửi mail để trải nghiệm người dùng luôn thông suốt
    }

    return { success: true }
  } catch (err: unknown) {
    console.error("submitLeadAction exception:", err)
    return { success: false, error: "Đã có lỗi hệ thống xảy ra" }
  }
}

/**
 * 2. Chủ thẻ lấy danh sách khách đã để lại liên hệ
 */
export async function getLeadsAction(): Promise<{
  success: boolean
  leads?: LeadItem[]
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" }
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    return {
      success: true,
      leads: (data as LeadItem[]) || [],
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi lấy danh sách lead"
    return { success: false, error: msg }
  }
}

/**
 * 3. Chủ thẻ xóa một liên hệ
 */
export async function deleteLeadAction(
  leadId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" }
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId)
      .eq("profile_id", user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath("/dashboard/leads")
    return { success: true }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi xóa liên hệ"
    return { success: false, error: msg }
  }
}

/**
 * 4. Xuất danh sách liên hệ ra CSV UTF-8 (mở được trực tiếp trên Excel)
 */
export async function exportLeadsCsvAction(): Promise<{
  success: boolean
  csvData?: string
  filename?: string
  error?: string
}> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Bạn chưa đăng nhập" }
    }

    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .eq("profile_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return { success: false, error: error.message }
    }

    const leads = (data as LeadItem[]) || []

    const headers = ["STT", "Họ và tên", "Số điện thoại", "Email", "Lời nhắn", "Thời gian gửi"]
    const rows = leads.map((l, idx) => [
      (idx + 1).toString(),
      `"${(l.name || "").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.note || "").replace(/"/g, '""')}"`,
      `"${new Date(l.created_at).toLocaleString("vi-VN")}"`,
    ])

    const csvBody = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n")
    // UTF-8 BOM \uFEFF giúp Excel hiển thị tiếng Việt có dấu chuẩn xác
    const csvContent = "\uFEFF" + csvBody

    const dateStr = new Date().toISOString().split("T")[0]
    return {
      success: true,
      csvData: csvContent,
      filename: `danh-ba-khach-hang-nfc-${dateStr}.csv`,
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi khi xuất CSV"
    return { success: false, error: msg }
  }
}
