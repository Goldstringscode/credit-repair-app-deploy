import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { Resend } from "resend"
import crypto from "crypto"

export const dynamic = 'force-dynamic'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    console.log("=== FORGOT PASSWORD START ===")
    console.log("Email requested:", email)

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Log env vars (safe - no secrets)
    console.log("RESEND_API_KEY set:", !!process.env.RESEND_API_KEY)
    console.log("RESEND_API_KEY prefix:", process.env.RESEND_API_KEY?.substring(0, 8))
    console.log("FROM_EMAIL:", process.env.FROM_EMAIL || "onboarding@resend.dev (default)")
    console.log("DEV_TO_EMAIL:", process.env.DEV_TO_EMAIL || "(not set)")

    const supabase = getSupabaseClient()

    const { data: user, error: findError } = await supabase
      .from("users")
      .select("id, email, first_name")
      .eq("email", email.toLowerCase())
      .single()

    console.log("User lookup result:", user ? "FOUND id=" + user.id : "NOT FOUND", findError ? "err=" + findError.message : "")

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we have sent a password reset link.",
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://creditrepairai.com"
    const resetLink = appUrl + "/reset-password?token=" + resetToken

    // Store token in DB
    const { error: updateError } = await supabase
      .from("users")
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    console.log("DB token update:", updateError ? "FAILED: " + updateError.message : "SUCCESS")

    // Send email directly via Resend SDK — no intermediary service
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set — cannot send email")
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, we have sent a password reset link.",
        _debug: "email not sent: no api key"
      })
    }

    const fromEmail = process.env.FROM_EMAIL || "onboarding@resend.dev"
    const toEmail = process.env.DEV_TO_EMAIL || user.email
    const fromName = process.env.FROM_NAME || "Credit Repair AI"

    console.log("Sending email via Resend:")
    console.log("  from:", fromName + " <" + fromEmail + ">")
    console.log("  to:", toEmail)
    console.log("  subject: Reset Your Credit Repair AI Password")

    const resend = new Resend(apiKey)

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: fromName + " <" + fromEmail + ">",
      to: [toEmail],
      subject: "Reset Your Credit Repair AI Password",
      html: `<!DOCTYPE html>
<html><body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
<h2 style="color:#2563eb">Password Reset Request</h2>
<p>Hi ${user.first_name || "there"},</p>
<p>We received a request to reset your Credit Repair AI password.</p>
<p><a href="${resetLink}" style="display:inline-block;background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold">Reset My Password</a></p>
<p>Or copy this link: <br/><small>${resetLink}</small></p>
<p>This link expires in 1 hour. If you did not request this, you can safely ignore this email.</p>
<p>— The Credit Repair AI Team</p>
</body></html>`,
      text: "Hi " + (user.first_name || "there") + ",\n\nReset your password here:\n" + resetLink + "\n\nThis link expires in 1 hour.\n\n— The Credit Repair AI Team",
    })

    if (emailError) {
      console.error("Resend ERROR:", JSON.stringify(emailError))
    } else {
      console.log("Resend SUCCESS! Email ID:", emailData?.id)
    }

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we have sent a password reset link.",
    })
  } catch (error: any) {
    console.error("=== FORGOT PASSWORD EXCEPTION ===", error.message, error.stack?.substring(0, 300))
    return NextResponse.json({ success: true, message: "If an account with that email exists, we have sent a password reset link." })
  }
}
