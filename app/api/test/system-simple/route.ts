import { NextResponse } from "next/server"

export async function GET() {
  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: {} as Record<string, any>,
    }

    // Test 1: Environment Variables
    try {
      const requiredEnvVars = [
        'NEXT_PUBLIC_APP_URL',
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'OPENAI_API_KEY'
      ]

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName])
      const presentVars = requiredEnvVars.filter(varName => process.env[varName])

      results.tests.environment = {
        status: missingVars.length === 0 ? "PASS" : "FAIL",
        message: missingVars.length === 0 
          ? "All required environment variables are set" 
          : `Missing environment variables: ${missingVars.join(", ")}`,
        details: {
          present: presentVars,
          missing: missingVars,
          total: requiredEnvVars.length,
          configured: presentVars.length
        }
      }
    } catch (error) {
      results.tests.environment = {
        status: "ERROR",
        message: "Environment check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      }
    }

    // Test 2: Basic API Response
    try {
      results.tests.api = {
        status: "PASS",
        message: "API endpoint is responding correctly",
        details: {
          timestamp: new Date().toISOString(),
          nodeEnv: process.env.NODE_ENV,
          method: "GET"
        }
      }
    } catch (error) {
      results.tests.api = {
        status: "ERROR",
        message: "API test failed",
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
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
