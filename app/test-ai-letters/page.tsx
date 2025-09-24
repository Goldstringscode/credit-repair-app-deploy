"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Copy, Download, RefreshCw, CheckCircle, AlertCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface LetterGenerationResult {
  id: string
  content: string
  metadata: {
    letterType: string
    qualityScore: number
    uniquenessScore: number
    writingStyle: string
    customizationLevel: string
    generatedAt: string
  }
}

interface SystemStatus {
  openaiAvailable: boolean
  databaseAvailable: boolean
  totalLettersGenerated: number
  writingStylesAvailable: number
  personalizationFactors: number
  baseTemplateLength: number
  systemHealth: string
}

export default function TestAILettersPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLetters, setGeneratedLetters] = useState<LetterGenerationResult[]>([])
  const [currentLetter, setCurrentLetter] = useState<LetterGenerationResult | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sample data for testing
  const samplePersonalInfo = {
      firstName: "John",
      lastName: "Doe",
    address: "123 Main Street",
      city: "Anytown",
      state: "CA",
    zipCode: "90210",
      phone: "(555) 123-4567",
    email: "john.doe@email.com",
      ssnLast4: "1234",
    dateOfBirth: "1985-03-15"
  }

  const sampleDisputeItems = [
      {
        id: "item_1",
      creditorName: "Chase Bank",
        accountNumber: "****1234",
      itemType: "late_payment",
      dateReported: "2024-01-15",
        status: "disputed",
      disputeReason: "Payment was made on time but reported as late",
      supportingEvidence: "Bank statement showing payment date"
    }
  ]

  // Check system status on component mount
  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      setError(null)
      const response = await fetch("/api/disputes/system-status")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSystemStatus(result.data)
        } else {
          throw new Error(result.error || "Failed to get system status")
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to check system status:", error)
      setError(error instanceof Error ? error.message : "Failed to check system status")
      // Set default status for testing
      setSystemStatus({
        openaiAvailable: false,
        databaseAvailable: false,
        totalLettersGenerated: 0,
        writingStylesAvailable: 8,
        personalizationFactors: 8,
        baseTemplateLength: 0,
        systemHealth: "Template Only"
      })
    }
  }

  const generateLetter = async (letterType: string = "standard") => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log(`🚀 Generating ${letterType} letter...`)
      
      const response = await fetch("/api/disputes/generate-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalInfo: samplePersonalInfo,
          disputeItems: sampleDisputeItems,
          letterType,
          creditBureau: "experian",
          additionalContext: {
            previousDisputes: ["Previous dispute filed in December 2023"],
            financialHardship: false
          }
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.success) {
        const newLetter = result.data.letter
        setGeneratedLetters(prev => [newLetter, ...prev])
        setCurrentLetter(newLetter)
        
        toast.success(`Generated ${letterType} letter successfully!`, {
          description: `Quality Score: ${newLetter.metadata.qualityScore}/100 | Uniqueness: ${newLetter.metadata.uniquenessScore}/100`
        })
        
        console.log("✅ Letter generated:", newLetter)
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      console.error("Letter generation error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setError(errorMessage)
      toast.error("Failed to generate letter", {
        description: errorMessage
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMultipleLetters = async () => {
    const types = ["standard", "enhanced", "premium"]
    setIsGenerating(true)
    setError(null)
    
    try {
      for (const type of types) {
        try {
          await generateLetter(type)
          // Small delay between generations
          await new Promise(resolve => setTimeout(resolve, 1000))
        } catch (error) {
          console.error(`Failed to generate ${type} letter:`, error)
          // Continue with other types even if one fails
        }
      }
      
      toast.success("Generated multiple letter types!", {
        description: "Check the results below to see the variations"
      })
    } catch (error) {
      console.error("Multiple letter generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Letter copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
      toast.error("Failed to copy to clipboard")
    }
  }

  const downloadLetter = (letter: LetterGenerationResult) => {
    try {
      const element = document.createElement("a")
      const file = new Blob([letter.content], { type: "text/plain" })
      element.href = URL.createObjectURL(file)
      element.download = `dispute-letter-${letter.metadata.letterType}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success("Letter downloaded successfully!")
    } catch (error) {
      console.error("Failed to download letter:", error)
      toast.error("Failed to download letter")
    }
  }

  const resetUniqueness = async () => {
    try {
      setError(null)
      const response = await fetch("/api/disputes/reset-uniqueness", { method: "POST" })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          toast.success("Uniqueness tracking reset!")
          setGeneratedLetters([])
          setCurrentLetter(null)
          // Refresh system status
          await checkSystemStatus()
        } else {
          throw new Error(result.error || "Reset failed")
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to reset uniqueness tracking:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to reset uniqueness tracking"
      setError(errorMessage)
      toast.error("Failed to reset uniqueness tracking", {
        description: errorMessage
      })
    }
  }

  const clearError = () => {
    setError(null)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Letter Generation Test</h1>
          <p className="text-muted-foreground">
            Test the AI-powered dispute letter generation system. Each generation creates a unique variation 
            of your base template while maintaining legal compliance.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">Error: {error}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              System Status
            </CardTitle>
            <CardDescription>
              Current status of the AI letter generation system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${systemStatus?.openaiAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {systemStatus?.openaiAvailable ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">OpenAI</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${systemStatus?.databaseAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {systemStatus?.databaseAvailable ? '✓' : '✗'}
                </div>
                <div className="text-sm text-muted-foreground">Database</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{generatedLetters.length}</div>
                <div className="text-sm text-muted-foreground">Letters Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{systemStatus?.writingStylesAvailable || 8}</div>
                <div className="text-sm text-muted-foreground">Writing Styles</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="text-sm">
                <strong>System Health:</strong> {systemStatus?.systemHealth || "Unknown"}
              </div>
              <div className="text-sm text-muted-foreground">
                {systemStatus?.openaiAvailable ? "AI generation available" : "AI generation not available - using template fallback"}
              </div>
            </div>
            <Button 
              onClick={checkSystemStatus} 
              variant="outline" 
              size="sm" 
              className="mt-4"
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
          </CardContent>
        </Card>

        {/* Generation Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Generate AI Letters</CardTitle>
            <CardDescription>
              Create unique dispute letters using your base template as a foundation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => generateLetter("standard")} 
                disabled={isGenerating}
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Standard Letter
              </Button>
              
              <Button 
                onClick={() => generateLetter("enhanced")} 
                disabled={isGenerating}
                variant="secondary"
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Enhanced Letter
              </Button>
              
              <Button 
                onClick={() => generateLetter("premium")} 
                disabled={isGenerating}
                variant="outline"
                className="min-w-[140px]"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <AlertCircle className="h-4 w-4 mr-2" />
                )}
                Premium Letter
              </Button>
              
              <Button 
                onClick={generateMultipleLetters} 
                disabled={isGenerating}
                variant="default"
                className="min-w-[180px]"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Generate All Types
              </Button>
              
              <Button 
                onClick={resetUniqueness} 
                variant="destructive"
                size="sm"
                disabled={isGenerating}
              >
                Reset Uniqueness
              </Button>
            </div>

            {isGenerating && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-blue-700">Generating letter... Please wait.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Generated Letters */}
        {generatedLetters.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Generated Letters</h2>
            
            {generatedLetters.map((letter, index) => (
              <Card key={letter.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {letter.metadata.letterType.charAt(0).toUpperCase() + letter.metadata.letterType.slice(1)} Dispute Letter
                        <Badge variant="secondary">{letter.metadata.writingStyle.replace(/_/g, ' ')}</Badge>
                      </CardTitle>
                      <CardDescription>
                        Generated on {new Date(letter.metadata.generatedAt).toLocaleString()} | 
                        Quality: {letter.metadata.qualityScore}/100 | 
                        Uniqueness: {letter.metadata.uniquenessScore}/100
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(letter.content)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => downloadLetter(letter)}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                  </div>
                </div>
                  </CardHeader>
                  <CardContent>
                  <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {letter.content}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        )}

        {/* Instructions */}
        <Card className="mt-8">
                  <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Understanding the AI letter generation system
            </CardDescription>
                  </CardHeader>
                  <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Base Template Foundation</h3>
                <p className="text-sm text-muted-foreground">
                  Your uploaded dispute letter template serves as the legal foundation and structure for all generated letters.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">2. AI-Powered Variations</h3>
                <p className="text-sm text-muted-foreground">
                  OpenAI GPT-4 creates unique variations by rewriting content while maintaining legal compliance and structure.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">3. Uniqueness Guarantee</h3>
                <p className="text-sm text-muted-foreground">
                  Each generation produces a completely different letter through multiple AI attempts and content hashing.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">4. Quality Assurance</h3>
                <p className="text-sm text-muted-foreground">
                  Letters are validated for legal compliance, cleaned for formatting, and scored for quality and uniqueness.
                </p>
              </div>
                    </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
