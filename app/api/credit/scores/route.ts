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

    const creditScores = {
      experian: {
        score: 742,
        change: 12,
        lastUpdated: "2024-01-20T10:30:00Z",
        range: "670-739",
        grade: "Good",
      },
      equifax: {
        score: 738,
        change: 8,
        lastUpdated: "2024-01-19T10:30:00Z",
        range: "670-739",
        grade: "Good",
      },
      transunion: {
        score: 745,
        change: 15,
        lastUpdated: "2024-01-18T10:30:00Z",
        range: "670-739",
        grade: "Good",
      },
    }

    return NextResponse.json({
      success: true,
      data: creditScores,
    })
  } catch (error) {
    console.error("Get credit scores error:", error)
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
