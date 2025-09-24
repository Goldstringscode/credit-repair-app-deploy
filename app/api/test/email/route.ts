import { NextResponse } from "next/server"
import { Resend } from "resend"

export async function GET() {
  try {
    const resendApiKey = process.env.RESEND_API_KEY

    if (!resendApiKey) {
      return NextResponse.json({
        success: false,
        message: "Missing Resend API key",
        details: "Add RESEND_API_KEY to your .env.local file"
      })
    }

    if (!resendApiKey.startsWith("re_")) {
      return NextResponse.json({
        success: false,
        message: "Invalid Resend API key format",
        details: "Resend API keys should start with 're_'"
      })
    }

    const resend = new Resend(resendApiKey)

    // Test the API key by trying to get domain info (this doesn't send an email)
    try {
      // This is a simple API call that validates the key without sending emails
      const response = await fetch("https://api.resend.com/domains", {
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        }
      })

      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          message: "Invalid Resend API key",
          details: "The API key is not valid or has been revoked"
        })
      }

      if (response.status === 403) {
        return NextResponse.json({
          success: false,
          message: "Resend API key lacks permissions",
          details: "The API key doesn't have the required permissions"
        })
      }

      if (!response.ok) {
        return NextResponse.json({
          success: false,
          message: "Resend API error",
          details: `HTTP ${response.status}: ${response.statusText}`
        })
      }

      return NextResponse.json({
        success: true,
        message: "Resend email service connected successfully",
        details: "API key is valid and service is accessible"
      })

    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        message: "Failed to connect to Resend API",
        details: fetchError instanceof Error ? fetchError.message : "Network error"
      })
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Email service test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
