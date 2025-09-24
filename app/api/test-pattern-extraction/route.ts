import { NextResponse } from "next/server"

const sampleText = `Date Pulled: 7/1/2021 
Name: John Doe 
DOB: 1/1/1960

Generic Risk Score
604
Number Of Bank Revolving Accounts Reported 
Last 9 Months
Utilization Of Available Credit On Revolving Bank
Accounts

VANTAGESCORE 3.0
609
Total Of All Balances On Bankcard Or Revolving
Accounts Is Too High
Balances On Bankcard Or Revolving Accounts Too
High Compared To Credit Limits
Score Range: 300 - 850
Consumer Rank: 24%

Insight Score
586
• Age of Revolving Accounts
• Bankcard Utilization
• Age of Non-Mortgage Installment Accounts
Score Range: 364 to 825`

function testPatternExtraction(text: string) {
  const results = {
    scores_found: [] as Array<{
      type: string
      score: number
      pattern_used: string
      match_text: string
      priority: number
      context: string
      valid: boolean
    }>,
    personal_info: {} as any,
    confidence: 0,
    text_analysis: {
      contains_generic_risk: text.includes("Generic Risk Score"),
      contains_vantagescore: text.includes("VANTAGESCORE 3.0"),
      contains_insight: text.includes("Insight Score"),
      text_length: text.length,
      line_breaks: (text.match(/\n/g) || []).length,
      carriage_returns: (text.match(/\r/g) || []).length,
    },
  }

  // Validation function
  function isValidCreditScore(score: number, context: string): boolean {
    const contextLower = context.toLowerCase()
    const excludeContexts = [
      "range",
      "rank",
      "percent",
      "%",
      "consumer rank",
      "score range",
      "between",
      "from",
      "to",
      "-",
      "minimum",
      "maximum",
      "avg",
      "average",
    ]

    for (const exclude of excludeContexts) {
      if (contextLower.includes(exclude)) {
        return false
      }
    }

    return score >= 300 && score <= 850
  }

  // Test the exact patterns used in the main analysis - IMPROVED PATTERNS
  const scorePatterns = [
    {
      pattern: /Generic\s+Risk\s+Score\s*[\r\n\s]*(\d{3})\s*(?:\r|\n|$)/gi,
      type: "generic_risk_score",
      name: "Generic Risk Score",
      priority: 3,
    },
    {
      pattern: /Generic\s+Risk\s+Score[\s\S]{0,50}?(\d{3})/gi,
      type: "generic_risk_score_flex",
      name: "Generic Risk Score (Flexible)",
      priority: 3,
    },
    {
      pattern: /VANTAGESCORE\s+3\.0\s*[\r\n\s]*(\d{3})\s*(?:\r|\n|$)/gi,
      type: "vantage_score",
      name: "VantageScore 3.0",
      priority: 2,
    },
    {
      pattern: /VANTAGESCORE\s+3\.0[\s\S]{0,50}?(\d{3})/gi,
      type: "vantage_score_flex",
      name: "VantageScore 3.0 (Flexible)",
      priority: 2,
    },
    {
      pattern: /Insight\s+Score\s*[\r\n\s]*(\d{3})\s*(?:\r|\n|$)/gi,
      type: "insight_score",
      name: "Insight Score",
      priority: 4,
    },
    {
      pattern: /Insight\s+Score[\s\S]{0,50}?(\d{3})/gi,
      type: "insight_score_flex",
      name: "Insight Score (Flexible)",
      priority: 4,
    },
    {
      pattern: /FICO\s+Score\s*(?:8|9)?\s*[\r\n\s]*(\d{3})/gi,
      type: "fico_score",
      name: "FICO Score",
      priority: 1,
    },
  ]

  for (const { pattern, type, name, priority } of scorePatterns) {
    const matches = Array.from(text.matchAll(pattern))
    for (const match of matches) {
      const score = Number.parseInt(match[1])
      const context = text.substring(Math.max(0, match.index! - 100), match.index! + 200)
      const valid = isValidCreditScore(score, context)

      results.scores_found.push({
        type,
        score,
        pattern_used: pattern.source,
        match_text: match[0].trim(),
        priority,
        context: context.trim(),
        valid,
      })
    }
  }

  // Test personal info extraction
  const nameMatch = text.match(/Name:\s*([A-Za-z\s]{2,50})/gi)
  if (nameMatch) {
    results.personal_info.name = nameMatch[0]?.replace(/Name:\s*/i, "").trim()
  }

  results.confidence = results.scores_found.filter((s) => s.valid).length > 0 ? 0.8 : 0.2

  return results
}

export async function GET() {
  try {
    const results = testPatternExtraction(sampleText)

    // Determine primary score based on priority
    let primaryScore = null
    let highestPriority = 999

    for (const score of results.scores_found) {
      if (score.priority < highestPriority && score.valid) {
        highestPriority = score.priority
        primaryScore = score.score
      }
    }

    return NextResponse.json({
      success: true,
      test_data: {
        text_length: sampleText.length,
        expected_scores: {
          generic_risk_score: 604,
          vantage_score: 609,
          insight_score: 586,
          primary_score: 609, // Should be VantageScore (priority 2)
        },
      },
      extraction_results: results,
      analysis: {
        total_scores_found: results.scores_found.length,
        unique_score_types: [...new Set(results.scores_found.map((s) => s.type))],
        all_scores: results.scores_found.reduce(
          (acc, curr) => {
            acc[curr.type] = curr.score
            return acc
          },
          {} as Record<string, number>,
        ),
        calculated_primary_score: primaryScore,
        test_results: {
          generic_risk_score_correct: results.scores_found.some(
            (s) => s.type.includes("generic_risk_score") && s.score === 604 && s.valid,
          ),
          vantage_score_correct: results.scores_found.some(
            (s) => s.type.includes("vantage_score") && s.score === 609 && s.valid,
          ),
          insight_score_correct: results.scores_found.some(
            (s) => s.type.includes("insight_score") && s.score === 586 && s.valid,
          ),
          primary_score_correct: primaryScore === 609,
        },
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
