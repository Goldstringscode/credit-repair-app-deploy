import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Testing upload API verification...")

    // Test 1: Check if the upload endpoint exists and responds
    const testContent =
      "EXPERIAN CREDIT REPORT\nFICO Score: 720\nChase Credit Card ****1234 Balance: $1,500 Limit: $5,000"
    const testFile = new File([testContent], "test-report.txt", { type: "text/plain" })

    const formData = new FormData()
    formData.append("file", testFile)

    // Make internal request to upload API
    const uploadResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/v2/upload/credit-reports`,
      {
        method: "POST",
        body: formData,
      },
    )

    console.log("Upload response status:", uploadResponse.status)
    console.log("Upload response headers:", Object.fromEntries(uploadResponse.headers.entries()))

    // Check if response is HTML (error) or JSON (success)
    const contentType = uploadResponse.headers.get("content-type")
    const responseText = await uploadResponse.text()

    console.log("Response content type:", contentType)
    console.log("Response text (first 200 chars):", responseText.substring(0, 200))

    if (contentType?.includes("text/html")) {
      return NextResponse.json({
        success: false,
        error: "Upload API returned HTML error page instead of JSON",
        details: {
          status: uploadResponse.status,
          contentType,
          responsePreview: responseText.substring(0, 500),
        },
      })
    }

    // Try to parse as JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      return NextResponse.json({
        success: false,
        error: "Upload API returned invalid JSON",
        details: {
          status: uploadResponse.status,
          contentType,
          responsePreview: responseText.substring(0, 500),
          parseError: parseError instanceof Error ? parseError.message : "Unknown parse error",
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Upload API is working correctly and returning JSON responses",
      details: {
        status: uploadResponse.status,
        contentType,
        responseData: responseData,
        testPassed: true,
      },
    })
  } catch (error) {
    console.error("Upload verification test error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error during upload verification",
      details: {
        errorType: error instanceof Error ? error.constructor.name : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
  }
}
