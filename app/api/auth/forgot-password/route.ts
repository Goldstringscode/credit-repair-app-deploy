import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { emailService } from "@/lib/email-service"
import crypto from "crypto"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Find user by email
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single()

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (!findError && user) {
      // Generate password reset token
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

      // Update user with reset token
      const { error: updateError } = await supabase
        .from("users")
        .update({
          password_reset_token: resetToken,
          password_reset_expires: resetExpires.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (!updateError) {
        // Send password reset email
        const emailResult = await emailService.sendPasswordResetEmail(user.email, user.first_name, resetToken)

        if (!emailResult.success) {
          console.error("Failed to send password reset email:", emailResult.error)
        }
      }
    }

    // Always return success message to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, we have sent a password reset link.",
    })
  } catch (error) {
    console.error("Password reset request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
