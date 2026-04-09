import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET

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

// Simulate real credit bureau API integration
async function fetchCreditScoreFromBureau(bureau: string, userId: string) {
  // In a real implementation, this would call actual credit bureau APIs
  // like Experian, Equifax, or TransUnion APIs

  const mockScores = {
    experian: {
      score: 742 + Math.floor(Math.random() * 10) - 5,
      model: "FICO 8",
      range: "300-850",
      factors: [
        { factor: "Payment History", impact: "Excellent", percentage: 35 },
        { factor: "Credit Utilization", impact: "Good", percentage: 30 },
        { factor: "Length of Credit History", impact: "Good", percentage: 15 },
        { factor: "Credit Mix", impact: "Fair", percentage: 10 },
        { factor: "New Credit", impact: "Good", percentage: 10 },
      ],
      lastUpdated: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
    equifax: {
      score: 738 + Math.floor(Math.random() * 10) - 5,
      model: "FICO 8",
      range: "300-850",
      factors: [
        { factor: "Payment History", impact: "Excellent", percentage: 35 },
        { factor: "Credit Utilization", impact: "Good", percentage: 30 },
        { factor: "Length of Credit History", impact: "Good", percentage: 15 },
        { factor: "Credit Mix", impact: "Fair", percentage: 10 },
        { factor: "New Credit", impact: "Fair", percentage: 10 },
      ],
      lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextUpdate: new Date().toISOString(),
    },
    transunion: {
      score: 745 + Math.floor(Math.random() * 10) - 5,
      model: "VantageScore 3.0",
      range: "300-850",
      factors: [
        { factor: "Payment History", impact: "Excellent", percentage: 40 },
        { factor: "Credit Utilization", impact: "Excellent", percentage: 20 },
        { factor: "Length of Credit History", impact: "Good", percentage: 21 },
        { factor: "Credit Mix", impact: "Good", percentage: 11 },
        { factor: "New Credit", impact: "Good", percentage: 8 },
      ],
      lastUpdated: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      nextUpdate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  }

  return mockScores[bureau as keyof typeof mockScores]
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

    const { searchParams } = new URL(request.url)
    const bureau = searchParams.get("bureau")

    if (bureau && !["experian", "equifax", "transunion"].includes(bureau)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_BUREAU",
            message: "Invalid credit bureau specified",
          },
        },
        { status: 400 },
      )
    }

    if (bureau) {
      // Fetch specific bureau data
      const scoreData = await fetchCreditScoreFromBureau(bureau, user.userId)
      return NextResponse.json({
        success: true,
        data: { [bureau]: scoreData },
      })
    }

    // Fetch all bureaus
    const [experian, equifax, transunion] = await Promise.all([
      fetchCreditScoreFromBureau("experian", user.userId),
      fetchCreditScoreFromBureau("equifax", user.userId),
      fetchCreditScoreFromBureau("transunion", user.userId),
    ])

    const averageScore = Math.round((experian.score + equifax.score + transunion.score) / 3)
    const scoreChange = Math.floor(Math.random() * 20) - 10 // Random change between -10 and +10

    return NextResponse.json({
      success: true,
      data: {
        experian,
        equifax,
        transunion,
        summary: {
          averageScore,
          scoreChange,
          lastUpdated: new Date().toISOString(),
          trend: scoreChange > 0 ? "improving" : scoreChange < 0 ? "declining" : "stable",
        },
      },
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

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { action, bureau } = body

    if (action === "refresh") {
      // Simulate refreshing credit scores
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const scoreData = await fetchCreditScoreFromBureau(bureau || "experian", user.userId)

      return NextResponse.json({
        success: true,
        message: `${bureau || "All"} credit score(s) refreshed successfully`,
        data: scoreData,
      })
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ACTION",
          message: "Invalid action specified",
        },
      },
      { status: 400 },
    )
  } catch (error) {
    console.error("Credit score action error:", error)
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
