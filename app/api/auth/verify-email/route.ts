import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import jwt from "jsonwebtoken"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Verification token is required" }, { status: 400 })
    }

    // Find user with this verification token
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email_verification_token", token)
      .single()

    if (findError || !user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 400 })
    }

    if (user.email_verified) {
      return NextResponse.json({ error: "Email is already verified" }, { status: 400 })
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        email_verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update user verification status:", updateError)
      return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
    }

    // Generate new JWT token with verified status
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: true,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    const response = NextResponse.json({
      success: true,
      message: "Email verified successfully! You now have full access to your account.",
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        emailVerified: true,
        subscriptionStatus: user.subscription_status,
      },
    })

    // Update the auth cookie with new token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing-token", request.url))
    }

    // Find user with this verification token
    const { data: user, error: findError } = await supabase
      .from("users")
      .select("*")
      .eq("email_verification_token", token)
      .single()

    if (findError || !user) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url))
    }

    if (user.email_verified) {
      return NextResponse.redirect(new URL("/dashboard?message=already-verified", request.url))
    }

    // Update user to mark email as verified
    const { error: updateError } = await supabase
      .from("users")
      .update({
        email_verified: true,
        email_verification_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("Failed to update user verification status:", updateError)
      return NextResponse.redirect(new URL("/login?error=verification-failed", request.url))
    }

    // Generate new JWT token with verified status
    const newToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        emailVerified: true,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    )

    const response = NextResponse.redirect(new URL("/dashboard?message=email-verified", request.url))

    // Set the auth cookie with new token
    response.cookies.set("auth-token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Email verification error:", error)
    return NextResponse.redirect(new URL("/login?error=server-error", request.url))
  }
}
