import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check environment variables
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    const openaiKey = process.env.OPENAI_API_KEY
    
    const status = {
      api_version: "v4",
      status: "online",
      timestamp: new Date().toISOString(),
      environment: {
        database: databaseUrl ? "configured" : "missing",
        openai: openaiKey ? "configured" : "missing",
        node_env: process.env.NODE_ENV || "development"
      },
      features: {
        ultimate_parser: true,
        multi_pass_extraction: true,
        ai_analysis: !!openaiKey,
        pattern_fallback: true
      }
    }

    return NextResponse.json(status)
  } catch (error) {
    return NextResponse.json(
      {
        api_version: "v4",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Ultimate Analysis API V4 POST endpoint is working!",
    timestamp: new Date().toISOString(),
  })
}
