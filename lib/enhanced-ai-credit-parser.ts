import { AdvancedCreditParser } from "./advanced-credit-parser"

export class EnhancedAICreditParser {
  private processingNotes: string[] = []
  private rawText = ""
  private analysisStartTime: number = 0
  private advancedParser: AdvancedCreditParser

  constructor() {
    this.advancedParser = new AdvancedCreditParser()
  }

  async analyzeDocument(file: File): Promise<any> {
    this.analysisStartTime = Date.now()
    this.processingNotes = []

    try {
      this.processingNotes.push("🚀 Starting Enhanced Credit Report Analysis...")

      // Stage 1: Extract text from file
      const textResult = await this.extractTextFromFile(file)
      this.rawText = textResult.text
      this.processingNotes.push(`📄 Extracted ${this.rawText.length} characters from ${textResult.pages} pages`)

      // Stage 2: Use advanced parser for comprehensive analysis
      const analysisResult = await this.advancedParser.analyzeDocument(file)
      this.processingNotes.push(`🔍 Advanced analysis completed`)

      if (!analysisResult.success) {
        throw new Error("Advanced parser failed to analyze document")
      }

      // Stage 3: Enhanced risk assessment
      const riskAnalysis = await this.performRiskAnalysis(analysisResult.data)
      this.processingNotes.push(`⚠️ Risk analysis completed with ${riskAnalysis.risk_score} risk score`)

      // Stage 4: Credit improvement recommendations
      const recommendations = await this.generateCreditImprovementRecommendations(analysisResult.data, riskAnalysis)
      this.processingNotes.push(`💡 Generated ${recommendations.length} improvement recommendations`)

      // Stage 5: Data validation and quality assessment
      const validationResults = await this.validateAndEnhanceData(analysisResult.data)
      this.processingNotes.push(`✅ Data validation completed with ${(validationResults.quality_score * 100).toFixed(1)}% quality`)

      const analysisDuration = Date.now() - this.analysisStartTime

      const finalAnalysis = {
        ...analysisResult.data,
        risk_analysis: riskAnalysis,
        recommendations: recommendations,
        report_metadata: {
          ...analysisResult.data.report_metadata,
          ai_models_used: ["enhanced-pattern-matching", "advanced-parsing"],
          analysis_duration: analysisDuration,
          processing_notes: this.processingNotes,
        },
        validation_results: validationResults,
      }

      return {
        success: true,
        data: finalAnalysis,
        confidence: 0.85,
        processing_notes: this.processingNotes,
        analysis_duration: analysisDuration,
        ai_models_used: ["enhanced-pattern-matching", "advanced-parsing"],
      }

    } catch (error) {
      console.error("Enhanced analysis failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        processing_notes: this.processingNotes,
      }
    }
  }

  private async extractTextFromFile(file: File): Promise<{ text: string; pages: number }> {
    if (file.type === "application/pdf") {
      const { default: pdfParse } = await import("pdf-parse")
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const data = await pdfParse(buffer)
      return { text: data.text, pages: data.numpages }
    } else if (file.type === "text/plain" || file.type === "text/csv") {
      const text = await file.text()
      return { text, pages: 1 }
    } else {
      throw new Error(`Unsupported file type: ${file.type}`)
    }
  }

  private async performRiskAnalysis(data: any): Promise<any> {
    try {
      const riskFactors: string[] = []
      let riskScore = 0

      // Analyze credit scores
      if (data.credit_scores && data.credit_scores.length > 0) {
        const avgScore = data.credit_scores.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / data.credit_scores.length
        if (avgScore < 580) {
          riskScore += 30
          riskFactors.push("Very low credit score")
        } else if (avgScore < 670) {
          riskScore += 20
          riskFactors.push("Low credit score")
        } else if (avgScore < 740) {
          riskScore += 10
          riskFactors.push("Fair credit score")
        }
      }

      // Analyze negative items
      if (data.negative_items && data.negative_items.length > 0) {
        riskScore += Math.min(25, data.negative_items.length * 5)
        riskFactors.push(`${data.negative_items.length} negative items found`)
      }

      // Analyze credit utilization
      if (data.accounts && data.accounts.length > 0) {
        const totalBalance = data.accounts.reduce((sum: number, a: any) => sum + (a.balance || 0), 0)
        const totalLimit = data.accounts.reduce((sum: number, a: any) => sum + (a.credit_limit || 0), 0)
        if (totalLimit > 0) {
          const utilization = (totalBalance / totalLimit) * 100
          if (utilization > 90) {
            riskScore += 20
            riskFactors.push("Very high credit utilization")
          } else if (utilization > 70) {
            riskScore += 15
            riskFactors.push("High credit utilization")
          }
        }
      }

      // Analyze inquiries
      if (data.inquiries && data.inquiries.length > 0) {
        if (data.inquiries.length > 6) {
          riskScore += 15
          riskFactors.push("Too many recent inquiries")
        }
      }

      return {
        risk_score: Math.min(100, riskScore),
        risk_factors: riskFactors,
        risk_level: riskScore < 30 ? "Low" : riskScore < 60 ? "Medium" : "High",
      }
    } catch (error) {
      console.error("Risk analysis failed:", error)
      return {
        risk_score: 50,
        risk_factors: ["Risk analysis failed"],
        risk_level: "Unknown",
      }
    }
  }

  private async generateCreditImprovementRecommendations(data: any, riskAnalysis: any): Promise<any[]> {
    const recommendations: any[] = []

    try {
      // Generate recommendations based on risk factors
      if (riskAnalysis.risk_factors.includes("Very low credit score")) {
        recommendations.push({
          action: "Focus on building positive payment history",
          priority: "High",
          expected_impact: "Significant score improvement over 6-12 months",
          timeline: "6-12 months",
        })
      }

      if (riskAnalysis.risk_factors.includes("Very high credit utilization")) {
        recommendations.push({
          action: "Reduce credit card balances below 30% of limits",
          priority: "High",
          expected_impact: "Immediate score improvement",
          timeline: "1-2 months",
        })
      }

      if (riskAnalysis.risk_factors.includes("Too many recent inquiries")) {
        recommendations.push({
          action: "Avoid new credit applications for 6-12 months",
          priority: "Medium",
          expected_impact: "Score recovery from inquiry impact",
          timeline: "6-12 months",
        })
      }

      // Add general recommendations
      recommendations.push({
        action: "Review credit report for errors and dispute inaccuracies",
        priority: "Medium",
        expected_impact: "Potential score improvement if errors found",
        timeline: "2-4 months",
      })

      recommendations.push({
        action: "Maintain on-time payments on all accounts",
        priority: "High",
        expected_impact: "Gradual score improvement",
        timeline: "Ongoing",
      })

      return recommendations
    } catch (error) {
      console.error("Recommendation generation failed:", error)
      return [
        {
          action: "Consult with a credit counselor",
          priority: "Medium",
          expected_impact: "Professional guidance on credit improvement",
          timeline: "Immediate",
        },
      ]
    }
  }

  private async validateAndEnhanceData(data: any): Promise<any> {
    try {
      let qualityScore = 0.8 // Base quality score
      const validationNotes: string[] = []

      // Validate credit scores
      if (data.credit_scores && data.credit_scores.length > 0) {
        const validScores = data.credit_scores.filter((s: any) => s.score >= 300 && s.score <= 850)
        if (validScores.length === data.credit_scores.length) {
          qualityScore += 0.1
          validationNotes.push("All credit scores are in valid range")
        } else {
          validationNotes.push("Some credit scores are outside valid range")
        }
      }

      // Validate accounts
      if (data.accounts && data.accounts.length > 0) {
        const validAccounts = data.accounts.filter((a: any) => 
          a.creditor_name && 
          a.account_number_last_4 && 
          /^\d{4}$/.test(a.account_number_last_4)
        )
        if (validAccounts.length === data.accounts.length) {
          qualityScore += 0.1
          validationNotes.push("All accounts have valid information")
        } else {
          validationNotes.push("Some accounts have invalid information")
        }
      }

      // Check data completeness
      if (data.personal_info?.full_name) qualityScore += 0.05
      if (data.credit_scores?.length > 0) qualityScore += 0.05
      if (data.accounts?.length > 0) qualityScore += 0.05

      return {
        quality_score: Math.min(1.0, qualityScore),
        validation_notes: validationNotes,
        data_completeness: this.calculateDataCompleteness(data),
      }
    } catch (error) {
      console.error("Data validation failed:", error)
      return {
        quality_score: 0.6,
        validation_notes: ["Data validation failed"],
        data_completeness: 0.5,
      }
    }
  }

  private calculateDataCompleteness(data: any): number {
    let completeness = 0
    let totalFields = 0

    // Check personal info
    if (data.personal_info) {
      totalFields += 4
      if (data.personal_info.full_name) completeness += 1
      if (data.personal_info.date_of_birth) completeness += 1
      if (data.personal_info.current_address) completeness += 1
      if (data.personal_info.ssn_last_4) completeness += 1
    }

    // Check credit scores
    if (data.credit_scores && data.credit_scores.length > 0) {
      completeness += 1
      totalFields += 1
    }

    // Check accounts
    if (data.accounts && data.accounts.length > 0) {
      completeness += 1
      totalFields += 1
    }

    // Check negative items
    if (data.negative_items) {
      completeness += 1
      totalFields += 1
    }

    // Check inquiries
    if (data.inquiries) {
      completeness += 1
      totalFields += 1
    }

    return totalFields > 0 ? completeness / totalFields : 0
  }
}
