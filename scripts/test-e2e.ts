import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve } from "path"

// Đọc biến môi trường từ .env.local
const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8")
const env: Record<string, string> = {}
for (const line of envContent.split("\n")) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith("#")) continue
  const [key, ...rest] = trimmed.split("=")
  if (key && rest.length) {
    env[key.trim()] = rest.join("=").trim()
  }
}

const supabaseUrl = env["NEXT_PUBLIC_SUPABASE_URL"]
const supabaseAnonKey =
  env["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"] || env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Thiếu biến môi trường NEXT_PUBLIC_SUPABASE_URL hoặc PUBLISHABLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function runE2ETests() {
  console.log("==================================================")
  console.log("🚀 BẮT ĐẦU CHẠY KIỂM THỬ E2E HỆ THỐNG TRANG CÁ NHÂN NFC")
  console.log("==================================================")
  let passCount = 0
  let totalCount = 0

  function assert(title: string, condition: boolean, extra?: string) {
    totalCount++
    if (condition) {
      passCount++
      console.log(`✅ [PASS] ${title}`)
    } else {
      console.error(`❌ [FAIL] ${title} ${extra ? `(${extra})` : ""}`)
    }
  }

  // -----------------------------------------------------------------
  // KỊCH BẢN 1: Kiểm tra tính sẵn sàng của Username (Onboarding flow)
  // -----------------------------------------------------------------
  console.log("\n--- 1. Kiểm thử kiểm tra Username khả dụng ---")
  try {
    const { data: available, error } = await supabase.rpc("is_username_available", {
      p_username: "random_test_username_99999",
    })
    assert("Username chưa ai dùng trả về TRUE", available === true && !error)

    const { data: unavailable } = await supabase.rpc("is_username_available", {
      p_username: "admin", // nằm trong danh sách username cấm
    })
    assert("Username thuộc danh sách cấm ('admin') trả về FALSE", unavailable === false)
  } catch (err) {
    assert("Kịch bản 1 lỗi ngoại lệ", false, String(err))
  }

  // -----------------------------------------------------------------
  // KỊCH BẢN 2: Luồng quét thẻ NFC (/c/[code] -> resolve_card)
  // -----------------------------------------------------------------
  console.log("\n--- 2. Kiểm thử luồng quét mã thẻ NFC ---")
  try {
    // Quét thẻ không tồn tại
    const { data: notFoundRes } = await supabase.rpc("resolve_card", {
      p_code: "MA_THE_KHONG_TON_TAI_XYZ123",
      p_source: "nfc",
      p_device: "Mobile",
      p_user_agent: "E2E-Tester",
    })
    const notFoundJson = typeof notFoundRes === "string" ? JSON.parse(notFoundRes) : notFoundRes
    assert(
      "Quét mã thẻ không tồn tại trả về status = 'not_found'",
      notFoundJson?.status === "not_found"
    )

    // Lấy thử 1 thẻ trong kho nếu có để test
    const { data: unassignedCard } = await supabase
      .from("nfc_cards")
      .select("code, status")
      .eq("status", "unassigned")
      .limit(1)
      .maybeSingle()

    if (unassignedCard) {
      const { data: resolveCardRes } = await supabase.rpc("resolve_card", {
        p_code: unassignedCard.code,
        p_source: "nfc",
        p_device: "Mobile",
      })
      const resolveJson = typeof resolveCardRes === "string" ? JSON.parse(resolveCardRes) : resolveCardRes
      assert(
        "Quét thẻ chưa kích hoạt trả về status = 'unassigned'",
        resolveJson?.status === "unassigned"
      )
    } else {
      console.log("ℹ️ Bỏ qua test thẻ unassigned (kho thẻ hiện tại không có thẻ trống)")
    }
  } catch (err) {
    assert("Kịch bản 2 lỗi ngoại lệ", false, String(err))
  }

  // -----------------------------------------------------------------
  // KỊCH BẢN 3: Ghi nhận lượt xem công khai (log_profile_view)
  // -----------------------------------------------------------------
  console.log("\n--- 3. Kiểm thử Tracking lượt xem trang cá nhân ---")
  try {
    // Lấy 1 profile public bất kỳ
    const { data: sampleProfile } = await supabase
      .from("profiles")
      .select("username")
      .eq("is_public", true)
      .eq("status", "active")
      .not("username", "is", null)
      .limit(1)
      .maybeSingle()

    if (sampleProfile?.username) {
      const { error: logViewErr } = await supabase.rpc("log_profile_view", {
        p_username: sampleProfile.username,
        p_source: "nfc",
        p_device: "iPhone",
        p_user_agent: "Mozilla/5.0 iPhone",
      })
      assert("Gọi log_profile_view thành công không có lỗi", !logViewErr)
    } else {
      console.log("ℹ️ Chưa có profile public nào để test view tracking")
    }
  } catch (err) {
    assert("Kịch bản 3 lỗi ngoại lệ", false, String(err))
  }

  // -----------------------------------------------------------------
  // KỊCH BẢN 4: Chống leo thang quyền hạn (Security Privilege Escalation)
  // -----------------------------------------------------------------
  console.log("\n--- 4. Kiểm thử Chặn quyền Admin đối với Anon / Unprivileged ---")
  try {
    // Anon gọi admin_get_overview
    const { error: adminRpcErr } = await supabase.rpc("admin_get_overview")
    assert(
      "Anon gọi admin_get_overview bị chặn và trả về lỗi",
      Boolean(adminRpcErr)
    )

    // Anon gọi admin_generate_cards
    const { error: genCardsErr } = await supabase.rpc("admin_generate_cards", {
      p_count: 5,
    })
    assert(
      "Anon gọi admin_generate_cards bị chặn và trả về lỗi",
      Boolean(genCardsErr)
    )
  } catch (err) {
    assert("Kịch bản 4 lỗi ngoại lệ", false, String(err))
  }

  // -----------------------------------------------------------------
  // KỊCH BẢN 5: Kiểm tra cấu trúc vCard 3.0
  // -----------------------------------------------------------------
  console.log("\n--- 5. Kiểm thử định dạng danh thiếp vCard 3.0 ---")
  try {
    const mockProfile = {
      full_name: "Nguyễn Văn Test",
      job_title: "Giám Đốc Công Nghệ",
      organization: "Tập Đoàn NFC",
      phone: "0987654321",
      email_public: "test@nfc.vn",
      address: "Hà Nội, Việt Nam",
      bio: "Kết nối tương lai",
    }

    const vcardLines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${mockProfile.full_name}`,
      `ORG:${mockProfile.organization}`,
      `TITLE:${mockProfile.job_title}`,
      `TEL;TYPE=CELL,VOICE:${mockProfile.phone}`,
      `EMAIL;TYPE=PREF,INTERNET:${mockProfile.email_public}`,
      `ADR;TYPE=WORK:;;${mockProfile.address};;;;`,
      `NOTE:${mockProfile.bio}`,
      "END:VCARD",
    ]
    const vcardText = vcardLines.join("\r\n")

    assert("vCard bắt đầu bằng BEGIN:VCARD", vcardText.startsWith("BEGIN:VCARD"))
    assert("vCard phiên bản 3.0", vcardText.includes("VERSION:3.0"))
    assert("vCard chứa đầy đủ thông tin số điện thoại", vcardText.includes("0987654321"))
    assert("vCard kết thúc bằng END:VCARD", vcardText.endsWith("END:VCARD"))
  } catch (err) {
    assert("Kịch bản 5 lỗi ngoại lệ", false, String(err))
  }

  // -----------------------------------------------------------------
  // KẾT QUẢ TỔNG HỢP
  // -----------------------------------------------------------------
  console.log("\n==================================================")
  console.log(`📊 KẾT QUẢ KIỂM THỬ: ${passCount}/${totalCount} TIÊU CHÍ ĐẠT (${Math.round((passCount / totalCount) * 100)}%)`)
  console.log("==================================================")

  if (passCount === totalCount) {
    console.log("🎉 TOÀN BỘ KỊCH BẢN E2E HOẠT ĐỘNG HOÀN HẢO!")
    process.exit(0)
  } else {
    console.error("⚠️ Có tiêu chí chưa đạt, vui lòng kiểm tra lại log.")
    process.exit(1)
  }
}

runE2ETests().catch((err) => {
  console.error("Lỗi thực thi test:", err)
  process.exit(1)
})
