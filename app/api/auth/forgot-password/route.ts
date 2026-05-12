import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendPasswordResetEmail } from "@/lib/email-service"
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
    // Send branded password reset email
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.first_name || user.email.split('@')[0],
      resetToken,
    })
    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error)
    } else {
      console.log("📧 Password reset email sent! id:", emailResult.id)
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
