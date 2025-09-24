import { NextRequest, NextResponse } from "next/server"
import { EnhancedAICreditParser } from "@/lib/enhanced-ai-credit-parser"

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Parse the form data
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bureau = formData.get("bureau") as string || "auto-detect"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Validate file type and size
    const allowedTypes = ["application/pdf", "text/plain", "text/csv"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only PDF, TXT, and CSV files are supported." },
        { status: 400 }
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      )
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      )
    }

    console.log(`🚀 Starting Enhanced AI Analysis for: ${file.name} (${file.size} bytes)`)

    // Initialize the enhanced AI parser
    const parser = new EnhancedAICreditParser()
    
    // Perform the enhanced AI analysis
    const analysisResult = await parser.analyzeDocument(file)
    
    if (!analysisResult.success) {
      console.error("❌ Enhanced AI analysis failed:", analysisResult.error)
      return NextResponse.json(
        {
          error: "Enhanced AI analysis failed",
          details: analysisResult.error,
          processing_notes: analysisResult.processing_notes,
        },
        { status: 500 }
      )
    }

    const analysisDuration = Date.now() - startTime

    // Extract key metrics for response
    const extractedData = analysisResult.data
    const stats = {
      total_accounts: extractedData.accounts?.length || 0,
      total_scores: extractedData.credit_scores?.length || 0,
      total_negative_items: extractedData.negative_items?.length || 0,
      total_inquiries: extractedData.inquiries?.length || 0,
      confidence_score: analysisResult.confidence,
      extraction_methods_used: analysisResult.ai_models_used,
      processing_time: `${(analysisDuration / 1000).toFixed(2)}s`,
      data_quality_score: extractedData.validation_results?.quality_score || 0,
      risk_score: extractedData.risk_analysis?.risk_score || 0,
      recommendations_count: extractedData.recommendations?.length || 0,
    }

    // Prepare the comprehensive response
    const response = {
      success: true,
      message: "Enhanced AI credit report analysis completed successfully",
      report: {
        id: `enhanced-ai-${Date.now()}`,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        bureau: extractedData.report_metadata?.bureau || bureau,
        confidence: analysisResult.confidence,
        processing_method: "enhanced-ai-multi-model",
        ai_models_used: analysisResult.ai_models_used,
        analysis_duration: analysisDuration,
        risk_level: extractedData.risk_analysis?.risk_level || "Unknown",
      },
      analysis: {
        personal_info: extractedData.personal_info,
        credit_scores: extractedData.credit_scores || [],
        accounts: extractedData.accounts || [],
        negative_items: extractedData.negative_items || [],
        inquiries: extractedData.inquiries || [],
        risk_analysis: extractedData.risk_analysis,
        recommendations: extractedData.recommendations || [],
      },
      stats: stats,
      processing_notes: analysisResult.processing_notes,
      validation_results: extractedData.validation_results,
      metadata: {
        processing_method: "enhanced-ai-multi-model",
        ai_models_used: analysisResult.ai_models_used,
        analysis_duration: analysisDuration,
        confidence: analysisResult.confidence,
        data_quality: extractedData.validation_results?.quality_score || 0,
        risk_assessment: extractedData.risk_analysis?.risk_level || "Unknown",
        improvement_opportunities: extractedData.recommendations?.length || 0,
      },
    }

    console.log(`✅ Enhanced AI Analysis completed in ${(analysisDuration / 1000).toFixed(2)}s`)
    console.log(`📊 Results: ${stats.total_accounts} accounts, ${stats.total_scores} scores, ${stats.confidence_score * 100}% confidence`)

    return NextResponse.json(response)

  } catch (error) {
    console.error("❌ Enhanced AI Analysis error:", error)
    
    return NextResponse.json(
      {
        success: false,
        error: "Enhanced AI analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: "/api/v5/upload/enhanced-ai-analysis",
    description: "Enhanced AI-powered credit report analysis using multiple AI models",
    features: [
      "Multi-model AI analysis (GPT-4o, GPT-4o-mini, specialized)",
      "Advanced risk assessment and scoring",
      "Credit improvement recommendations",
      "Comprehensive data validation",
      "High-accuracy extraction with confidence scoring",
      "Risk factor analysis and impact assessment",
      "Actionable improvement strategies",
    ],
    supported_formats: ["PDF", "TXT", "CSV"],
    max_file_size: "50MB",
    ai_models: ["gpt-4o", "gpt-4o-mini", "specialized-analysis"],
    processing_method: "enhanced-ai-multi-model",
    status: "active",
  })
}

