import { NextResponse } from "next/server"
import pdfParse from "pdf-parse"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    console.log(`Processing test file: ${file.name} (${file.size} bytes, ${file.type})`)

    // Extract text from PDF
    const buffer = await file.arrayBuffer()
    const pdfData = await pdfParse(buffer, {
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    })

    const extractedText = pdfData.text

    // Test specific patterns for your document format
    const testPatterns = [
      {
        name: "VantageScore 3.0 Direct",
        pattern: /VANTAGESCORE\s+3\.0\s+(\d{3})/gi,
        description: "Looks for 'VANTAGESCORE 3.0 609' format",
      },
      {
        name: "VantageScore 3.0 Line Break",
        pattern: /VANTAGESCORE\s+3\.0[\s\r\n]+(\d{3})/gi,
        description: "Looks for 'VANTAGESCORE 3.0' followed by line break then number",
      },
      {
        name: "Generic Risk Score",
        pattern: /Generic\s+Risk\s+Score[\s\r\n]+(\d{3})/gi,
        description: "Looks for 'Generic Risk Score' followed by number",
      },
      {
        name: "Insight Score",
        pattern: /Insight\s+Score[\s\r\n]+(\d{3})/gi,
        description: "Looks for 'Insight Score' followed by number",
      },
      {
        name: "Any 3-digit number",
        pattern: /(\d{3})/g,
        description: "All 3-digit numbers in the document",
      },
    ]

    const results = []
    const allNumbers = []

    for (const { name, pattern, description } of testPatterns) {
      const matches = Array.from(extractedText.matchAll(pattern))
      const scores = matches.map((match) => ({
        score: Number.parseInt(match[1]),
        context: extractedText.substring(Math.max(0, match.index! - 100), match.index! + 200),
        fullMatch: match[0],
      }))

      if (name === "Any 3-digit number") {
        // For all numbers, just collect them
        allNumbers.push(...scores.map((s) => s.score).filter((s) => s >= 300 && s <= 850))
      }

      results.push({
        pattern_name: name,
        description,
        matches_found: matches.length,
        scores: scores.slice(0, 10), // Limit to first 10 matches
      })
    }

    // Analyze the text structure
    const textAnalysis = {
      total_length: extractedText.length,
      contains_vantagescore: extractedText.includes("VANTAGESCORE 3.0"),
      contains_generic_risk: extractedText.includes("Generic Risk Score"),
      contains_insight: extractedText.includes("Insight Score"),
      line_breaks: (extractedText.match(/\n/g) || []).length,
      unique_3digit_numbers: [...new Set(allNumbers)].sort((a, b) => a - b),
      first_1000_chars: extractedText.substring(0, 1000),
      vantagescore_context: extractedText.includes("VANTAGESCORE 3.0")
        ? extractedText.substring(
            Math.max(0, extractedText.indexOf("VANTAGESCORE 3.0") - 50),
            extractedText.indexOf("VANTAGESCORE 3.0") + 200,
          )
        : "Not found",
    }

    return NextResponse.json({
      success: true,
      file_info: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
      text_analysis: textAnalysis,
      pattern_results: results,
      recommendations: {
        likely_vantagescore: textAnalysis.vantagescore_context.includes("609") ? 609 : "Not found in context",
        all_valid_scores: [...new Set(allNumbers)].filter((n) => n >= 300 && n <= 850),
        extraction_method: "pdf_parse",
      },
    })
  } catch (error) {
    console.error("Test processing error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
