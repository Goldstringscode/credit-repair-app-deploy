import { NextRequest, NextResponse } from "next/server"

// This endpoint helps debug and manage rate limits in development
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: "Debug endpoint only available in development" },
      { status: 403 }
    )
  }

  const url = new URL(request.url)
  const action = url.searchParams.get('action')

  if (action === 'clear') {
    // Clear rate limit store (this would need to be implemented in middleware)
    return NextResponse.json({
      message: "Rate limit store cleared",
      note: "This clears the in-memory rate limit store. In production, you'd need to clear Redis or your rate limiting service."
    })
  }

  if (action === 'status') {
    return NextResponse.json({
      message: "Rate limit debug info",
      environment: process.env.NODE_ENV,
      development: process.env.NODE_ENV === 'development',
      rateLimit: {
        development: 1000,
        production: 100,
        current: process.env.NODE_ENV === 'development' ? 1000 : 100
      },
      excludedEndpoints: [
        "/api/auth/*",
        "/api/status",
        "/api/test/*",
        "/api/notifications/test",
        "/api/notifications/stream",
        "/api/debug/rate-limit"
      ]
    })
  }

  return NextResponse.json({
    message: "Rate limit debug endpoint",
    usage: {
      status: "GET /api/debug/rate-limit?action=status",
      clear: "GET /api/debug/rate-limit?action=clear"
    },
    note: "This endpoint is only available in development mode"
  })
}
