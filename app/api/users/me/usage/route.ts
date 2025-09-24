import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

function verifyToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  try {
    return jwt.verify(token, JWT_SECRET) as any
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or missing authentication token",
          },
        },
        { status: 401 },
      )
    }

    const usageData = {
      period: "2024-01",
      usage: {
        disputeLetters: 12,
        aiChatMessages: 47,
        certifiedMail: 3,
      },
      limits: {
        disputeLetters: "unlimited",
        aiChatMessages: "unlimited",
        certifiedMail: false,
      },
    }

    return NextResponse.json({
      success: true,
      data: usageData,
    })
  } catch (error) {
    console.error("Get usage error:", error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal error occurred",
        },
      },
      { status: 500 },
    )
  }
}
