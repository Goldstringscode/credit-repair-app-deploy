"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wand2,
  FileText,
  User,
  Building,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Download,
  Send,
  Eye,
  Copy,
  Sparkles,
  RefreshCw,
  Zap,
  X,
  Upload,
  EyeOff,
  Paperclip,
  ArrowRight,
} from "lucide-react"
import { toast } from "sonner"
import SendViaCertifiedMail from "@/components/letters/SendViaCertifiedMail"

export default function GenerateLetterPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [letterType, setLetterType] = useState("")
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    ssnLast4: "",
    dateOfBirth: "",
  })
  const [disputeInfo, setDisputeInfo] = useState({
    creditorName: "",
    accountNumber: "",
    disputeReason: "",
    disputeDetails: "",
    desiredOutcome: "",
    bureaus: [] as string[],
    supportingDocs: false,
    previousDisputes: false,
  })
  const [enhancedExplanation, setEnhancedExplanation] = useState("")
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [showEnhancedPreview, setShowEnhancedPreview] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [generatedLetters, setGeneratedLetters] = useState<{ [bureau: string]: string }>({})
  const [currentBureau, setCurrentBureau] = useState<string>("")
  const [letterMetadata, setLetterMetadata] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [negativeItems, setNegativeItems] = useState<any[]>([])
  const [showNegativeItemsModal, setShowNegativeItemsModal] = useState(false)
  const [isLoadingNegativeItems, setIsLoadingNegativeItems] = useState(false)

  const searchParams = useSearchParams()

  // Get URL parameters
  const urlDisputeType = searchParams.get("type")
  const urlBureau = searchParams.get("bureau")
  const urlCreditor = searchParams.get("creditor")
  const urlAccount = searchParams.get("account")
  const urlDate = searchParams.get("date")

  // Pre-fill form based on URL parameters
  useEffect(() => {
    if (urlDisputeType) {
      const typeMapping: { [key: string]: string } = {
        new_inquiry: "dispute",
        inquiry_dispute: "dispute",
        late_payment: "dispute",
        new_account: "dispute",
        payment_missed: "dispute",
      }
      setLetterType(typeMapping[urlDisputeType] || "dispute")
      setCurrentStep(2) // Skip letter type selection
    }

    if (urlCreditor) {
      setDisputeInfo((prev) => ({ ...prev, creditorName: urlCreditor }))
    }

    if (urlAccount) {
      setDisputeInfo((prev) => ({ ...prev, accountNumber: urlAccount }))
    }

    if (urlBureau && urlBureau !== "All Bureaus") {
      setDisputeInfo((prev) => ({ ...prev, bureaus: [urlBureau.toLowerCase()] }))
    }

    // Set dispute reason based on type
    if (urlDisputeType) {
      const reasonMapping: { [key: string]: string } = {
        new_inquiry: "Not authorized by me",
        inquiry_dispute: "Not authorized by me",
        late_payment: "Incorrect payment history",
        new_account: "Not my account",
        payment_missed: "Payment was made on time",
      }
      setDisputeInfo((prev) => ({ ...prev, disputeReason: reasonMapping[urlDisputeType] || "Incorrect information" }))
    }
  }, [urlDisputeType, urlBureau, urlCreditor, urlAccount, urlDate])

  // Load negative items and user data when component mounts
  useEffect(() => {
    loadNegativeItems()
    loadUserData()
  }, [])

  const loadUserData = () => {
    // In a real app, this would fetch from user profile/database
    // For now, we'll use mock data or localStorage
    const mockUserData = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      phone: '(555) 123-4567',
      email: 'john.doe@example.com',
      ssnLast4: '1234',
      dateOfBirth: '1990-01-01'
    }

    // Check if we have user data in localStorage (from credit reports)
    const savedPersonalInfo = localStorage.getItem('personalInfo')
    if (savedPersonalInfo) {
      try {
        const parsed = JSON.parse(savedPersonalInfo)
        setPersonalInfo(parsed)
      } catch (error) {
        console.error('Error parsing saved personal info:', error)
        setPersonalInfo(mockUserData)
      }
    } else {
      setPersonalInfo(mockUserData)
    }
  }

  const loadNegativeItems = async () => {
    setIsLoadingNegativeItems(true)
    try {
      const response = await fetch('/api/credit-reports/negative-items')
      const data = await response.json()
      
      if (data.success) {
        setNegativeItems(data.data.negativeItems)
      } else {
        console.error('Failed to load negative items:', data.error)
      }
    } catch (error) {
      console.error('Error loading negative items:', error)
    } finally {
      setIsLoadingNegativeItems(false)
    }
  }

  const handleSelectNegativeItem = (item: any) => {
    // Auto-fill the dispute form with the selected negative item
    setDisputeInfo(prev => ({
      ...prev,
      creditorName: item.creditor,
      accountNumber: item.accountNumber,
      disputeReason: item.disputeReason,
      disputeDetails: item.notes || '',
      desiredOutcome: 'Remove this item from my credit report'
    }))
    
    // Close the modal
    setShowNegativeItemsModal(false)
    
    // Move to the next step
    setCurrentStep(3)
  }

  const letterTiers = [
    {
      id: "standard",
      name: "Standard Tier",
      description: "Professional letters with basic legal framework",
      color: "bg-blue-500",
      basePrice: 29.99,
      multiplier: 1.0,
      quality: "Good",
      features: ["Basic legal compliance", "Professional formatting", "Standard personalization"]
    },
    {
      id: "enhanced",
      name: "Enhanced Tier", 
      description: "Advanced letters with detailed legal analysis",
      color: "bg-green-500",
      basePrice: 59.99,
      multiplier: 2.0,
      quality: "Better",
      features: ["Enhanced legal analysis", "Multiple strategies", "Advanced personalization", "FCRA citations"]
    },
    {
      id: "premium",
      name: "Premium Tier",
      description: "Attorney-level letters with comprehensive framework",
      color: "bg-purple-500", 
      basePrice: 99.99,
      multiplier: 3.5,
      quality: "Best",
      features: ["Attorney-level quality", "Comprehensive analysis", "Escalation strategy", "CFPB prep", "Multiple citations"]
    }
  ]

  const letterTypes = [
    {
      id: "dispute",
      name: "Credit Dispute Letter",
      description: "Challenge inaccurate information on your credit report",
      icon: AlertTriangle,
      basePrice: 29.99,
      successRate: "87%",
    },
    {
      id: "goodwill",
      name: "Goodwill Letter",
      description: "Request removal of negative items as a gesture of goodwill",
      icon: CheckCircle,
      basePrice: 39.99,
      successRate: "65%",
    },
    {
      id: "validation",
      name: "Debt Validation Letter",
      description: "Request proof that a debt is valid and legally owed",
      icon: FileText,
      basePrice: 44.99,
      successRate: "78%",
    },
    {
      id: "identity",
      name: "Identity Theft Letter",
      description: "Report fraudulent accounts and request removal",
      icon: User,
      basePrice: 54.99,
      successRate: "92%",
    },
    {
      id: "paydelete",
      name: "Pay-for-Delete Letter",
      description: "Negotiate payment in exchange for removal",
      icon: DollarSign,
      basePrice: 49.99,
      successRate: "73%",
    },
    {
      id: "cease",
      name: "Cease & Desist Letter",
      description: "Stop collection calls and harassment",
      icon: Building,
      basePrice: 39.99,
      successRate: "95%",
    },
  ]

  const disputeReasons = [
    "Not my account",
    "Not authorized by me",
    "Incorrect balance",
    "Incorrect payment history",
    "Account closed by consumer",
    "Paid in full",
    "Duplicate account",
    "Incorrect dates",
    "Identity theft",
    "Mixed credit files",
    "Outdated information",
  ]

  const creditBureaus = [
    { id: "experian", name: "Experian", address: "P.O. Box 4500, Allen, TX 75013" },
    { id: "equifax", name: "Equifax", address: "P.O. Box 740256, Atlanta, GA 30374" },
    { id: "transunion", name: "TransUnion", address: "P.O. Box 2000, Chester, PA 19016" },
  ]

  const generateBasicTemplateLetter = (bureau?: string) => {
    const bureauInfo = creditBureaus.find(b => b.id === bureau)
    const bureauName = bureauInfo?.name || "Credit Bureau"
    const bureauAddress = bureauInfo?.address || "Address not available"
    
    return `${personalInfo.firstName} ${personalInfo.lastName}
${personalInfo.address}
${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}
${personalInfo.phone}
${personalInfo.email}

${new Date().toLocaleDateString()}

${bureauName}
${bureauAddress}

Subject: Dispute of Credit Report Information

Dear ${bureauName} Representative,

I am writing to dispute the following information in my credit report. The items I am disputing are circled on the attached copy of my credit report.

Account Information:
- Creditor: ${disputeInfo.creditorName}
- Account Number: ${disputeInfo.accountNumber || 'Not provided'}
- Dispute Reason: ${disputeInfo.disputeReason}
- Desired Outcome: ${disputeInfo.desiredOutcome || 'Remove from credit report'}

Detailed Explanation:
${disputeInfo.disputeDetails}

I am requesting that this item be removed from my credit report as soon as possible.

Sincerely,
${personalInfo.firstName} ${personalInfo.lastName}

Enclosures: Credit Report Copy`
  }

  const generateLetter = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      console.log("🚀 Starting letter generation...")
      console.log("📝 Current letterType:", letterType)
      console.log("👤 Personal info:", personalInfo)
      console.log("⚖️ Dispute info:", disputeInfo)

      // Validate required personal info fields
      const requiredFields = ["firstName", "lastName", "address", "city", "state", "zipCode", "phone", "email"]
      const missingFields = requiredFields.filter(field => !personalInfo[field as keyof typeof personalInfo] || personalInfo[field as keyof typeof personalInfo].trim() === "")
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required personal information: ${missingFields.join(", ")}`)
      }

      // Extract tier and letter type from the combined letterType (e.g., "premium_dispute")
      const [selectedTier, selectedLetterType] = letterType.split('_')
      console.log("🏷️ Selected tier:", selectedTier)
      console.log("📄 Selected letter type:", selectedLetterType)
      
      // Map letter types to AI system types
      const aiLetterTypeMapping: { [key: string]: string } = {
        standard: "standard",
        enhanced: "enhanced", 
        premium: "premium",
      }

      const aiLetterType = aiLetterTypeMapping[selectedTier] || "standard"
      console.log("🤖 AI letter type:", aiLetterType)

      // Prepare dispute items for AI generation
      const disputeItems = [{
        id: `item_${Date.now()}`,
        creditorName: disputeInfo.creditorName,
        accountNumber: disputeInfo.accountNumber || "Not provided",
        itemType: "credit_dispute",
        dateReported: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
        status: "disputed",
        disputeReason: disputeInfo.disputeReason || "Incorrect information",
        supportingEvidence: disputeInfo.supportingDocs ? "Supporting documentation provided" : undefined
      }]

      console.log("📋 Prepared dispute items:", disputeItems)

      // Generate letters for each selected bureau
      const newGeneratedLetters: { [bureau: string]: string } = {}
      let firstBureau = ""
      let firstMetadata = null

      for (const bureau of disputeInfo.bureaus) {
        console.log(`📝 Generating letter for ${bureau}...`)
        
        // Get bureau-specific information
        const bureauInfo = creditBureaus.find(b => b.id === bureau)
        const bureauName = bureauInfo?.name || bureau
        const bureauAddress = bureauInfo?.address || ""
        
        const requestBody = {
          personalInfo,
          disputeItems,
          letterType: selectedLetterType, // Use the actual dispute type (dispute, goodwill, etc.)
          letterTier: aiLetterType, // Use the tier (standard/enhanced/premium)
          creditBureau: bureau,
          additionalContext: {
            previousDisputes: disputeInfo.previousDisputes,
            letterPurpose: selectedLetterType,
            disputeDetails: disputeInfo.disputeDetails,
            desiredOutcome: disputeInfo.desiredOutcome,
            bureauName: bureauName,
            bureauAddress: bureauAddress
          }
        }

        console.log(`📤 Sending request to API for ${bureau}:`, requestBody)
        console.log("🔍 Request details:", {
          letterType: aiLetterType,
          selectedTier,
          selectedLetterType,
          creditBureau: bureau,
          bureauName,
          bureauAddress
        })

        // Call AI dispute letter generation API
        const response = await fetch("/api/disputes/generate-letter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })

        console.log(`📥 API response for ${bureau} - status:`, response.status)
        console.log(`📥 API response for ${bureau} - ok:`, response.ok)

        if (!response.ok) {
          const errorData = await response.json()
          console.error(`❌ API error response for ${bureau}:`, errorData)
          console.error(`❌ Full error details for ${bureau}:`, {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
            requestBody: requestBody
          })
          
          // Log the specific validation errors
          if (errorData.details) {
            console.error(`❌ Validation details:`, errorData.details)
          }
          
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log(`✅ API success response for ${bureau}:`, result)
        
        if (result.success) {
          // Ensure the letter content has the correct bureau information
          let letterContent = result.data.letter.content
          
          // Get bureau-specific information for post-processing
          const bureauInfo = creditBureaus.find(b => b.id === bureau)
          const bureauName = bureauInfo?.name || bureau
          const bureauAddress = bureauInfo?.address || ""
          
          // Replace any generic bureau references with the specific bureau
          letterContent = letterContent.replace(/Dear Credit Bureau/g, `Dear ${bureauName}`)
          letterContent = letterContent.replace(/Dear Bureau/g, `Dear ${bureauName}`)
          letterContent = letterContent.replace(/Credit Bureau/g, bureauName)
          letterContent = letterContent.replace(/credit bureau/g, bureauName.toLowerCase())
          
          // Ensure the correct address is in the letter
          if (bureauAddress && !letterContent.includes(bureauAddress)) {
            // Find where the address should be and replace it
            letterContent = letterContent.replace(
              /P\.O\. Box \d+.*?(?=\n|$)/g,
              bureauAddress
            )
          }
          
          newGeneratedLetters[bureau] = letterContent
          
          // Store metadata from first successful generation
          if (!firstMetadata) {
            firstMetadata = result.data.letter.metadata
            firstBureau = bureau
          }
          
          console.log(`✅ Letter generated for ${bureau} with quality score:`, result.data.letter.metadata.qualityScore)
          console.log(`🔄 Uniqueness score for ${bureau}:`, result.data.letter.metadata.uniquenessScore)
          console.log(`📊 Customization level for ${bureau}:`, result.data.letter.metadata.customizationLevel)
        } else {
          throw new Error(result.error || "Failed to generate letter")
        }
      }

      // Set the generated letters and metadata
      setGeneratedLetters(newGeneratedLetters)
      setLetterMetadata(firstMetadata)
      setCurrentBureau(firstBureau) // Set first bureau as current
      setCurrentStep(4)
      
      toast.success(`Successfully generated ${Object.keys(newGeneratedLetters).length} letter(s)!`)
      
    } catch (error) {
      console.error("❌ Letter generation failed:", error)
      setError(error instanceof Error ? error.message : "Failed to generate letter")
      
      // Fallback to basic template for each selected bureau
      console.log("🔄 Falling back to basic template...")
      const fallbackLetters: { [bureau: string]: string } = {}
      
      for (const bureau of disputeInfo.bureaus) {
        fallbackLetters[bureau] = generateBasicTemplateLetter(bureau)
      }
      
      setGeneratedLetters(fallbackLetters)
      setCurrentBureau(disputeInfo.bureaus[0])
      setLetterMetadata({
        qualityScore: 60,
        uniquenessScore: 30,
        customizationLevel: "Basic",
        legalCompliance: ["FCRA compliance", "Basic legal framework"]
      })
      setCurrentStep(4)
      
      toast.info("AI generation failed. Showing basic templates instead.")
    } finally {
      setIsGenerating(false)
    }
  }

  const enhanceExplanationWithAI = async () => {
    if (!disputeInfo.disputeDetails.trim()) {
      toast.error("Please enter a detailed explanation first")
      return
    }

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/ai/enhance-explanation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalExplanation: disputeInfo.disputeDetails,
          disputeReason: disputeInfo.disputeReason,
          creditorName: disputeInfo.creditorName,
          accountNumber: disputeInfo.accountNumber,
          desiredOutcome: disputeInfo.desiredOutcome,
          supportingDocs: disputeInfo.supportingDocs,
          previousDisputes: disputeInfo.previousDisputes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to enhance explanation")
      }

      const result = await response.json()
      
      if (result.success) {
        setEnhancedExplanation(result.data.enhancedExplanation)
        setShowEnhancedPreview(true)
        toast.success("Explanation enhanced with AI!")
      } else {
        throw new Error(result.error || "Failed to enhance explanation")
      }
    } catch (error) {
      console.error("❌ AI enhancement failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to enhance explanation")
    } finally {
      setIsEnhancing(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setLetterType("")
    setPersonalInfo({
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      ssnLast4: "",
      dateOfBirth: "",
    })
    setDisputeInfo({
      creditorName: "",
      accountNumber: "",
      disputeReason: "",
      disputeDetails: "",
      desiredOutcome: "",
      bureaus: [],
      supportingDocs: false,
      previousDisputes: false,
    })
    setEnhancedExplanation("")
    setShowEnhancedPreview(false)
    setUploadedDocuments([])
    setGeneratedLetters({})
    setCurrentBureau("")
    setLetterMetadata(null)
    setError(null)
  }

  const progressPercentage = (currentStep / 4) * 100

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return
    
    const newFiles = Array.from(files)
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type === 'application/pdf' || 
                         file.type === 'text/plain' || 
                         file.name.endsWith('.txt') ||
                         file.name.endsWith('.pdf')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a supported file type. Please upload PDF or TXT files only.`)
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Please upload files smaller than 10MB.`)
      }
      
      return isValidType && isValidSize
    })
    
    if (validFiles.length > 0) {
      setUploadedDocuments(prev => [...prev, ...validFiles])
      toast.success(`${validFiles.length} document(s) uploaded successfully!`)
    }
  }

  const removeDocument = (index: number) => {
    setUploadedDocuments(prev => prev.filter((_, i) => i !== index))
    toast.success("Document removed")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    handleFileUpload(e.dataTransfer.files)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Wand2 className="h-6 w-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Letter Generator</h1>
                <p className="text-gray-600 mt-1">Create professional dispute letters with AI assistance</p>
                {urlDisputeType && (
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Pre-filled from monitoring alert</Badge>
                )}
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800">Step {currentStep} of 4</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between mt-4 text-sm text-gray-600">
              <span className={currentStep >= 1 ? "text-blue-600 font-medium" : ""}>Letter Type</span>
              <span className={currentStep >= 2 ? "text-blue-600 font-medium" : ""}>Personal Info</span>
              <span className={currentStep >= 3 ? "text-blue-600 font-medium" : ""}>Dispute Details</span>
              <span className={currentStep >= 4 ? "text-blue-600 font-medium" : ""}>Generated Letter</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Letter Type Selection */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <span>Choose Letter Tier & Type</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* First, show the tiers */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Select Quality Tier</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {letterTiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                        letterType.startsWith(tier.id) ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => {
                        // If no letter type is selected yet, select the first letter type in this tier
                        if (!letterType || !letterType.includes('_')) {
                          setLetterType(`${tier.id}_${letterTypes[0].id}`)
                        } else {
                          // If a letter type is already selected, just change the tier
                          const currentLetterType = letterType.split('_')[1]
                          setLetterType(`${tier.id}_${currentLetterType}`)
                        }
                      }}
                    >
                      <div className="text-center">
                        <div className={`${tier.color} rounded-lg p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center`}>
                          <span className="text-white font-bold text-lg">{tier.id.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{tier.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                        <div className="mb-3">
                          <span className="text-lg font-bold text-blue-600">Starting at ${tier.basePrice}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 mb-3">
                          {tier.quality}
                        </Badge>
                        <div className="space-y-1">
                          {tier.features.map((feature, index) => (
                            <div key={index} className="flex items-center text-xs text-gray-600">
                              <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Then, show the letter types within the selected tier */}
              {letterType && letterType.includes('_') && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Select Letter Type</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {letterTypes.map((type) => {
                      const Icon = type.icon
                      const selectedTier = letterTiers.find(tier => letterType.startsWith(tier.id))
                      const calculatedPrice = selectedTier ? (type.basePrice * selectedTier.multiplier).toFixed(2) : type.basePrice
                      
                      return (
                        <div
                          key={type.id}
                          className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${
                            letterType === `${selectedTier?.id}_${type.id}` ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setLetterType(`${selectedTier?.id}_${type.id}`)}
                        >
                          <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-gray-500 rounded-lg p-2">
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{type.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {type.successRate} Success Rate
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                          <div className="mb-3">
                            <span className="text-lg font-bold text-blue-600">${calculatedPrice}</span>
                            <span className="text-sm text-gray-500 ml-2">({selectedTier?.name})</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!letterType || !letterType.includes('_')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={personalInfo.address}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                    placeholder="Enter your street address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={personalInfo.city}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                    placeholder="Enter your city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={personalInfo.state}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                    placeholder="Enter your state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code *</Label>
                  <Input
                    id="zipCode"
                    value={personalInfo.zipCode}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, zipCode: e.target.value })}
                    placeholder="Enter your ZIP code"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    placeholder="Enter your email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  disabled={!personalInfo.firstName || !personalInfo.lastName || !personalInfo.address}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Dispute Details */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Dispute Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="creditorName">Creditor/Company Name *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="creditorName"
                        value={disputeInfo.creditorName}
                        onChange={(e) => setDisputeInfo({ ...disputeInfo, creditorName: e.target.value })}
                        placeholder="Enter creditor name"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowNegativeItemsModal(true)}
                        disabled={isLoadingNegativeItems || negativeItems.length === 0}
                        className="whitespace-nowrap"
                      >
                        {isLoadingNegativeItems ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-1" />
                            Select from Credit Reports
                          </>
                        )}
                      </Button>
                    </div>
                    {negativeItems.length > 0 && (
                      <p className="text-xs text-gray-500">
                        {negativeItems.length} negative items available from your credit reports
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input
                      id="accountNumber"
                      value={disputeInfo.accountNumber}
                      onChange={(e) => setDisputeInfo({ ...disputeInfo, accountNumber: e.target.value })}
                      placeholder="Enter account number (last 4 digits)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disputeReason">Dispute Reason *</Label>
                  <Select
                    value={disputeInfo.disputeReason}
                    onValueChange={(value) => setDisputeInfo({ ...disputeInfo, disputeReason: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select dispute reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {disputeReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disputeDetails" className="text-sm font-medium text-gray-700">
                    Detailed Explanation
                  </Label>
                  <Textarea
                    id="disputeDetails"
                    value={disputeInfo.disputeDetails}
                    onChange={(e) => setDisputeInfo({ ...disputeInfo, disputeDetails: e.target.value })}
                    placeholder="Provide a detailed explanation of why this information is incorrect..."
                    className="min-h-[100px] resize-none"
                  />
                  
                  {enhancedExplanation && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-blue-800">AI Enhanced Explanation</h4>
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(((enhancedExplanation.length - disputeInfo.disputeDetails.length) / disputeInfo.disputeDetails.length) * 100)}% longer
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowEnhancedPreview(!showEnhancedPreview)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {showEnhancedPreview ? (
                              <>
                                <EyeOff className="h-4 w-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-1" />
                                Preview
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEnhancedExplanation("")}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {showEnhancedPreview && (
                        <div className="space-y-3">
                          <div className="p-3 bg-white border border-blue-200 rounded-md">
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{enhancedExplanation}</p>
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setDisputeInfo(prev => ({
                                  ...prev,
                                  disputeDetails: enhancedExplanation
                                }))
                                setShowEnhancedPreview(false)
                                toast.success("Enhanced explanation applied!")
                              }}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Use Enhanced
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEnhancedExplanation("")
                                setShowEnhancedPreview(false)
                                toast.success("AI enhancement removed")
                              }}
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Keep Original
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="desiredOutcome">Desired Outcome</Label>
                  <Textarea
                    id="desiredOutcome"
                    value={disputeInfo.desiredOutcome}
                    onChange={(e) => setDisputeInfo({ ...disputeInfo, desiredOutcome: e.target.value })}
                    placeholder="What would you like to happen? (e.g., remove item, correct information, etc.)"
                    rows={2}
                  />
                </div>

                <div className="space-y-4">
                  <Label>Credit Bureaus to Contact</Label>
                  <div className="space-y-3">
                    {creditBureaus.map((bureau) => (
                      <div key={bureau.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={bureau.id}
                          checked={disputeInfo.bureaus.includes(bureau.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setDisputeInfo({
                                ...disputeInfo,
                                bureaus: [...disputeInfo.bureaus, bureau.id],
                              })
                            } else {
                              setDisputeInfo({
                                ...disputeInfo,
                                bureaus: disputeInfo.bureaus.filter((b) => b !== bureau.id),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={bureau.id} className="flex-1">
                          <div>
                            <p className="font-medium">{bureau.name}</p>
                            <p className="text-sm text-gray-600">{bureau.address}</p>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="supportingDocs"
                      checked={disputeInfo.supportingDocs}
                      onCheckedChange={(checked) => setDisputeInfo({ ...disputeInfo, supportingDocs: checked as boolean })}
                    />
                    <Label htmlFor="supportingDocs" className="text-sm font-medium text-gray-700">
                      I have supporting documentation
                    </Label>
                  </div>
                  
                  {disputeInfo.supportingDocs && (
                    <div className="space-y-3">
                      <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          uploadedDocuments.length > 0 
                            ? 'border-green-300 bg-green-50' 
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="space-y-2">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <div className="text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                              <span>Upload credit report documents</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                multiple
                                accept=".pdf,.txt"
                                className="sr-only"
                                onChange={(e) => handleFileUpload(e.target.files)}
                              />
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              or drag and drop PDF or TXT files here
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Maximum file size: 10MB per file
                          </p>
                        </div>
                      </div>

                      {uploadedDocuments.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                          <div className="space-y-2">
                            {uploadedDocuments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-blue-500" />
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                                        const url = URL.createObjectURL(file)
                                        window.open(url, '_blank')
                                      } else {
                                        const reader = new FileReader()
                                        reader.onload = (e) => {
                                          const content = e.target?.result as string
                                          const newWindow = window.open('', '_blank')
                                          if (newWindow) {
                                            newWindow.document.write(`
                                              <html>
                                                <head><title>${file.name}</title></head>
                                                <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
                                                  ${content}
                                                </body>
                                              </html>
                                            `)
                                            newWindow.document.close()
                                          }
                                        }
                                        reader.readAsText(file)
                                      }
                                    }}
                                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Preview
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeDocument(index)}
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back
                </Button>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    onClick={generateLetter}
                    disabled={isGenerating || !letterType || !personalInfo.firstName || !disputeInfo.creditorName}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating Letter...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Generate Letter
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={enhanceExplanationWithAI}
                    disabled={!disputeInfo.disputeDetails.trim() || isEnhancing}
                    variant="outline"
                    className="flex-1 border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    {isEnhancing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Enhance with AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Generated Letter */}
        {currentStep === 4 && (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Generated Letters</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        const currentContent = generatedLetters[currentBureau]
                        if (currentContent) {
                          navigator.clipboard.writeText(currentContent)
                          toast.success("Letter copied to clipboard!")
                        }
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const currentContent = generatedLetters[currentBureau]
                        if (currentContent) {
                          const blob = new Blob([currentContent], { type: 'text/plain' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `dispute-letter-${currentBureau}.txt`
                          a.click()
                          URL.revokeObjectURL(url)
                        }
                      }}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm" onClick={resetForm}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Start Over
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded">
                      <p className="text-red-800 font-medium">Error: {error}</p>
                    </div>
                  )}
                  
                  {Object.keys(generatedLetters).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Generated Letters</h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">Select Bureau:</span>
                          <Select value={currentBureau} onValueChange={setCurrentBureau}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Select a bureau" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(generatedLetters).map((bureau) => (
                                <SelectItem key={bureau} value={bureau}>
                                  {creditBureaus.find(b => b.id === bureau)?.name || bureau}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {currentBureau && (
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 mb-2">
                              {creditBureaus.find(b => b.id === currentBureau)?.name || currentBureau}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {creditBureaus.find(b => b.id === currentBureau)?.address || 'Address not available'}
                            </p>
                          </div>

                          {uploadedDocuments.length > 0 && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Supporting Documents Attached
                              </h4>
                              <div className="space-y-2">
                                {uploadedDocuments.map((file: File, index: number) => (
                                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                                    <div className="flex items-center space-x-2">
                                      <FileText className="h-4 w-4 text-blue-500" />
                                      <span className="text-sm text-gray-700">{file.name}</span>
                                      <span className="text-xs text-gray-500">
                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                      </span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
                                          const url = URL.createObjectURL(file)
                                          window.open(url, '_blank')
                                        } else {
                                          const reader = new FileReader()
                                          reader.onload = (e) => {
                                            const content = e.target?.result as string
                                            const newWindow = window.open('', '_blank')
                                            if (newWindow) {
                                              newWindow.document.write(`
                                                <html>
                                                  <head><title>${file.name}</title></head>
                                                  <body style="font-family: monospace; white-space: pre-wrap; padding: 20px;">
                                                    ${content}
                                                  </body>
                                                </html>
                                              `)
                                              newWindow.document.close()
                                            }
                                          }
                                          reader.readAsText(file)
                                        }
                                      }}
                                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="letterContent" className="text-sm font-medium text-gray-700">
                              Letter Content
                            </Label>
                            <Textarea
                              id="letterContent"
                              value={generatedLetters[currentBureau] || ""}
                              onChange={(e) => setGeneratedLetters(prev => ({
                                ...prev,
                                [currentBureau]: e.target.value
                              }))}
                              className="min-h-[400px] resize-none font-mono text-sm"
                              placeholder="Letter content will appear here..."
                            />
                          </div>

                          {/* Letter Actions */}
                          <div className="flex flex-wrap gap-3 pt-4 border-t">
                            <Button 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(generatedLetters[currentBureau] || "")
                                toast.success("Letter copied to clipboard!")
                              }}
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              Copy Letter
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                const blob = new Blob([generatedLetters[currentBureau] || ""], { type: 'text/plain' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `dispute-letter-${currentBureau}-${new Date().toISOString().split('T')[0]}.txt`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                                toast.success("Letter downloaded!")
                              }}
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <SendViaCertifiedMail
                              letterContent={generatedLetters[currentBureau] || ''}
                              letterType={letterType}
                              recipientName={creditBureaus.find(b => b.id === currentBureau)?.name || currentBureau}
                              recipientAddress={creditBureaus.find(b => b.id === currentBureau)?.address || ''}
                              onSuccess={(trackingNumber) => {
                                toast.success(`Letter sent via certified mail! Tracking: ${trackingNumber}`)
                                // You could also save this to a database or state
                              }}
                            />
                            <Button 
                              variant="outline" 
                              className="bg-blue-600 text-white hover:bg-blue-700"
                              onClick={() => {
                                toast.success(`Priority mail option selected for ${creditBureaus.find(b => b.id === currentBureau)?.name || currentBureau}!`)
                              }}
                            >
                              <Zap className="h-4 w-4 mr-2" />
                              Send via Priority Mail
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => {
                                toast.success(`Letter saved as template for ${creditBureaus.find(b => b.id === currentBureau)?.name || currentBureau}!`)
                              }}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              Save as Template
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={resetForm}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Start Over
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-800 mb-2">📮 Mailing Options</h4>
                      <div className="space-y-2 text-sm text-blue-700">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span>Certified Mail: $4.35 + tracking</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span>Priority Mail: $8.95 + faster delivery</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                          <span>Return receipt: $3.45 additional</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">✅ What's Included</h4>
                      <div className="space-y-1 text-sm text-green-700">
                        <div>• Professional letter formatting</div>
                        <div>• Legal compliance verification</div>
                        <div>• Personalized content</div>
                        <div>• Mailing instructions</div>
                        <div>• Follow-up guidance</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Letter Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tier:</span>
                    <span className="text-sm font-medium">
                      {letterType && letterType.includes('_') ? 
                        letterTiers.find(tier => letterType.startsWith(tier.id))?.name : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Letter Type:</span>
                    <span className="text-sm font-medium">
                      {letterType && letterType.includes('_') ? 
                        letterTypes.find(type => letterType.endsWith(type.id))?.name : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Creditor:</span>
                    <span className="text-sm font-medium">{disputeInfo.creditorName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bureaus:</span>
                    <span className="text-sm font-medium">{disputeInfo.bureaus.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Success Rate:</span>
                    <span className="text-sm font-medium text-green-600">
                      {letterType && letterType.includes('_') ? 
                        letterTypes.find(type => letterType.endsWith(type.id))?.successRate : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Price:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {letterType && letterType.includes('_') ? 
                        (() => {
                          const [tier, type] = letterType.split('_')
                          const selectedTier = letterTiers.find(t => t.id === tier)
                          const selectedType = letterTypes.find(t => t.id === type)
                          if (selectedTier && selectedType) {
                            return `$${(selectedType.basePrice * selectedTier.multiplier).toFixed(2)}`
                          }
                          return "N/A"
                        })() : "N/A"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI Quality Score:</span>
                    <span className="text-sm font-medium text-blue-600">
                      {letterMetadata ? `${letterMetadata.qualityScore}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">AI Uniqueness Score:</span>
                    <span className="text-sm font-medium text-purple-600">
                      {letterMetadata ? `${letterMetadata.uniquenessScore}%` : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Customization Level:</span>
                    <span className="text-sm font-medium text-orange-600">
                      {letterMetadata ? letterMetadata.customizationLevel : "N/A"}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Legal Compliance:</span>
                    <div className="mt-1 space-y-1">
                      {letterMetadata ? letterMetadata.legalCompliance.map((item: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      )) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tips for Success</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-2 text-gray-600">
                    <li>• Send via certified mail with return receipt</li>
                    <li>• Keep copies of all correspondence</li>
                    <li>• Follow up after 30 days if no response</li>
                    <li>• Include supporting documentation when available</li>
                    <li>• Be professional and factual in your approach</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Negative Items Selection Modal */}
        {showNegativeItemsModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Select Negative Item from Credit Reports</h3>
                <Button variant="outline" onClick={() => setShowNegativeItemsModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {isLoadingNegativeItems ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Loading negative items...</span>
                </div>
              ) : negativeItems.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Negative Items Found</h4>
                  <p className="text-gray-600 mb-4">
                    You haven't added any negative items to your credit reports yet.
                  </p>
                  <Button 
                    onClick={() => {
                      setShowNegativeItemsModal(false)
                      window.location.href = '/dashboard/credit-reports/upload'
                    }}
                  >
                    Add Negative Items
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Click on any item below to auto-fill the dispute form with that information.
                  </p>
                  <div className="grid gap-4">
                    {negativeItems.map((item) => (
                      <Card 
                        key={item.id} 
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleSelectNegativeItem(item)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-lg">{item.creditor}</h4>
                                <Badge variant="outline" className={getItemTypeColor(item.itemType)}>
                                  {item.itemType}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                                <div>
                                  <span className="font-medium">Account:</span> {item.accountNumber}
                                </div>
                                <div>
                                  <span className="font-medium">Amount:</span> ${item.originalAmount.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium">Opened:</span> {item.dateOpened}
                                </div>
                                <div>
                                  <span className="font-medium">Reported:</span> {item.dateReported}
                                </div>
                              </div>
                              <div className="mb-2">
                                <span className="font-medium text-sm">Dispute Reason:</span>
                                <p className="text-sm text-gray-600">{item.disputeReason}</p>
                              </div>
                              {item.notes && (
                                <div>
                                  <span className="font-medium text-sm">Notes:</span>
                                  <p className="text-sm text-gray-600">{item.notes}</p>
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <Button variant="outline" size="sm">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions for styling
function getItemTypeColor(type: string) {
  const colors: Record<string, string> = {
    'Late Payment': 'bg-yellow-100 text-yellow-800',
    'Collection': 'bg-red-100 text-red-800',
    'Charge Off': 'bg-red-100 text-red-800',
    'Bankruptcy': 'bg-red-100 text-red-800',
    'Lien': 'bg-orange-100 text-orange-800',
    'Judgment': 'bg-red-100 text-red-800',
    'Other': 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    'Open': 'bg-green-100 text-green-800',
    'Closed': 'bg-gray-100 text-gray-800',
    'Charged Off': 'bg-red-100 text-red-800',
    'In Collections': 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}