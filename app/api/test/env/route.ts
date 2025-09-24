import { NextResponse } from "next/server"

export async function GET() {
  try {
    const requiredEnvVars = [
      "NEON_NEON_DATABASE_URL",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
      "RESEND_API_KEY",
    ]

    const envStatus = requiredEnvVars.map((varName) => ({
      name: varName,
      exists: !!process.env[varName],
      value: process.env[varName] ? "***" + process.env[varName].slice(-4) : "Not set",
    }))

    const missingVars = envStatus.filter((env) => !env.exists)

    return NextResponse.json({
      success: missingVars.length === 0,
      message:
        missingVars.length === 0
          ? "All required environment variables are set"
          : `Missing ${missingVars.length} environment variables`,
      details: {
        environment_variables: envStatus,
        missing: missingVars.map((env) => env.name),
      },
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Failed to check environment variables",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
