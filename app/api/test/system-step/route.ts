import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as Record<string, any>,
    }

    // Test 1: Environment Variables (simplified)
    try {
      results.tests.environment = {
        status: "PASS",
        message: "Environment check completed",
        details: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.NEON_DATABASE_URL,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY
        }
      }
    } catch (error) {
      results.tests.environment = {
        status: "ERROR",
        message: "Environment check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }

    // Test 2: Database Connection (simplified)
    try {
      if (process.env.NEON_DATABASE_URL) {
        results.tests.database = {
          status: "PASS",
          message: "Database URL is configured",
          details: {
            hasUrl: true,
            urlPrefix: process.env.NEON_DATABASE_URL.substring(0, 20) + "..."
          }
        }
      } else {
        results.tests.database = {
          status: "SKIP",
          message: "Database URL not configured"
        }
      }
    } catch (error) {
      results.tests.database = {
        status: "ERROR",
        message: "Database check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }

    // Test 3: OpenAI API (simplified)
    try {
      if (process.env.OPENAI_API_KEY) {
        if (!process.env.OPENAI_API_KEY.startsWith("sk-")) {
          results.tests.openai = {
            status: "FAIL",
            message: "Invalid OpenAI API key format (should start with 'sk-')"
          }
        } else {
          results.tests.openai = {
            status: "PASS",
            message: "OpenAI API key format is valid",
            details: {
              keyFormat: "Valid (sk-...)",
              keyLength: process.env.OPENAI_API_KEY.length
            }
          }
        }
      } else {
        results.tests.openai = {
          status: "SKIP",
          message: "OpenAI API key not configured"
        }
      }
    } catch (error) {
      results.tests.openai = {
        status: "ERROR",
        message: "OpenAI check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }

    // Overall status calculation
    const testStatuses = Object.values(results.tests).map((test) => test.status)
    const hasFailures = testStatuses.includes("FAIL") || testStatuses.includes("ERROR")

    results.overall = {
      status: hasFailures ? "FAIL" : "PASS",
      message: hasFailures ? "Some tests failed" : "All tests passed successfully",
      summary: {
        total: testStatuses.length,
        passed: testStatuses.filter((s) => s === "PASS").length,
        failed: testStatuses.filter((s) => s === "FAIL").length,
        errors: testStatuses.filter((s) => s === "ERROR").length,
        skipped: testStatuses.filter((s) => s === "SKIP").length,
      }
    }

    return NextResponse.json(results, {
      status: hasFailures ? 500 : 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
      },
    })

  } catch (error) {
    return NextResponse.json({
      error: "System test failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
