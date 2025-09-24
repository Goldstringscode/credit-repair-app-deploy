import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Simple test endpoint working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    rateLimit: {
      development: 1000,
      production: 100,
      current: process.env.NODE_ENV === 'development' ? 1000 : 100
    }
  })
}
