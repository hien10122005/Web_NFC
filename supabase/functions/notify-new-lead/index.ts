import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface WebhookPayload {
  leadId?: string
  profileId: string
  name: string
  phone?: string | null
  email?: string | null
  note?: string | null
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const payload: WebhookPayload = await req.json()
    const { profileId, name, phone, email, note } = payload

    if (!profileId || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required profileId or name" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase env keys not configured")
      return new Response(
        JSON.stringify({ message: "Supabase service key missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Lấy email của người sở hữu thẻ từ auth.users và profiles
    const { data: userData } = await supabase.auth.admin.getUserById(profileId)
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, username, email_public")
      .eq("id", profileId)
      .single()

    const recipientEmail = userData?.user?.email || profileData?.email_public

    if (!recipientEmail) {
      console.log(`No email found for profile ${profileId}`)
      return new Response(
        JSON.stringify({ message: "No recipient email found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Nếu không có RESEND_API_KEY, log ra để kiểm tra
    if (!resendApiKey) {
      console.log(
        `[LEAD NOTIFICATION MOCK] RESEND_API_KEY is not set. Would have sent email to ${recipientEmail} with lead from ${name} (${phone || email})`
      )
      return new Response(
        JSON.stringify({
          message: "Notification logged (RESEND_API_KEY not configured)",
          recipient: recipientEmail,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Gửi email qua Resend API
    const emailSubject = `[Trang Cá Nhân NFC] ${name} vừa để lại thông tin kết nối`
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">🎉 Bạn có liên hệ mới từ Thẻ NFC!</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Xin chào <strong>${profileData?.full_name || "bạn"}</strong>,<br/>
          Một người xem vừa quét thẻ NFC / truy cập trang cá nhân của bạn và gửi lại lời chào:
        </p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0; font-size: 14px;"><strong>Họ và tên:</strong> ${name}</p>
          ${phone ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Số điện thoại:</strong> <a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a></p>` : ""}
          ${email ? `<p style="margin: 4px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></p>` : ""}
          ${note ? `<p style="margin: 8px 0 4px 0; font-size: 14px;"><strong>Lời nhắn:</strong><br/><span style="color: #334155; font-style: italic;">${note}</span></p>` : ""}
        </div>

        <p style="color: #64748b; font-size: 12px; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Thông báo tự động từ hệ thống <strong>Trang Cá Nhân NFC</strong>.
        </p>
      </div>
    `

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Trang Cá Nhân NFC <onboarding@resend.dev>",
        to: recipientEmail,
        subject: emailSubject,
        html: emailHtml,
      }),
    })

    const resendJson = await resendRes.json()

    return new Response(
      JSON.stringify({ success: resendRes.ok, data: resendJson }),
      {
        status: resendRes.ok ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal Error"
    return new Response(
      JSON.stringify({ error: errorMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
