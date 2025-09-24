"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  FileText,
  Search,
  Star,
  Download,
  Copy,
  Eye,
  TrendingUp,
  Users,
  Heart,
  CheckCircle,
  DollarSign,
  Shield,
  Zap,
} from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: string
  type: "dispute" | "goodwill" | "validation" | "legal" | "business"
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  successRate: number
  usageCount: number
  rating: number
  reviews: number
  premium: boolean
  tags: string[]
  lastUpdated: string
  author: string
  content: string
  instructions: string[]
  legalNotes: string
  estimatedTime: string
  effectiveness: "High" | "Medium" | "Low"
}

export default function CertifiedMailTemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [showPremiumOnly, setShowPremiumOnly] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [favorites, setFavorites] = useState<string[]>([])

  const templates: Template[] = [
    {
      id: "basic-dispute-letter",
      title: "Basic Credit Bureau Dispute Letter",
      description: "Standard dispute letter for inaccurate information on credit reports. Perfect for beginners.",
      category: "Credit Bureau Disputes",
      type: "dispute",
      difficulty: "Beginner",
      successRate: 78,
      usageCount: 15420,
      rating: 4.6,
      reviews: 892,
      premium: false,
      tags: ["Credit Bureau", "Inaccurate Information", "Basic Dispute", "FCRA"],
      lastUpdated: "2024-01-15",
      author: "Credit Repair Legal Team",
      estimatedTime: "10-15 minutes",
      effectiveness: "High",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Credit Bureau Name]
[Credit Bureau Address]
[City, State ZIP Code]

Re: Request for Investigation of Credit Report Information
Social Security Number: XXX-XX-XXXX
Date of Birth: [Your DOB]

Dear Sir or Madam:

I am writing to dispute the following information in my file. I have circled the items I dispute on the attached copy of the report I received.

This item is (inaccurate or incomplete or outdated) because [describe what is inaccurate or incomplete or outdated and why]. I am requesting that the item be removed (or request another specific change) to correct the information.

Enclosed are copies of (use this sentence if applicable and describe any enclosed documentation, such as payment records and court documents) supporting my position. Please reinvestigate this (these) matter(s) and (delete or correct) the disputed item(s) as soon as possible.

Sincerely,

[Your signature]
[Your printed name]

Enclosures: (List what you are enclosing)`,
      instructions: [
        "Fill in all bracketed information with your personal details",
        "Attach a copy of your credit report with disputed items circled",
        "Include supporting documentation if available",
        "Send via certified mail with return receipt requested",
        "Keep copies of all documents for your records",
        "Follow up in 30 days if no response received",
      ],
      legalNotes:
        "This letter is based on your rights under the Fair Credit Reporting Act (FCRA). Credit bureaus have 30 days to investigate your dispute.",
    },
    {
      id: "goodwill-letter",
      title: "Goodwill Letter for Late Payments",
      description:
        "Professional goodwill letter to request removal of late payments based on positive payment history.",
      category: "Goodwill Requests",
      type: "goodwill",
      difficulty: "Intermediate",
      successRate: 67,
      usageCount: 8934,
      rating: 4.4,
      reviews: 567,
      premium: false,
      tags: ["Goodwill", "Late Payments", "Customer Relations", "Payment History"],
      lastUpdated: "2024-01-10",
      author: "Credit Repair Specialists",
      estimatedTime: "15-20 minutes",
      effectiveness: "Medium",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Creditor Name]
[Customer Service Department]
[Creditor Address]
[City, State ZIP Code]

Re: Goodwill Request for Account #[Account Number]

Dear [Creditor Name] Customer Service Team:

I hope this letter finds you well. I am writing as a long-standing customer to request your consideration in removing a late payment notation from my credit report.

I have been a loyal customer of [Creditor Name] for [length of relationship] and have maintained a positive payment history throughout our relationship. Unfortunately, due to [brief explanation of circumstances - job loss, medical emergency, etc.], I experienced a temporary financial hardship that resulted in a late payment on [date of late payment].

Since that time, I have:
• Resumed consistent, on-time payments
• [Add any other positive actions taken]
• Maintained my account in good standing

I understand that reporting accurate information is important, but I am hoping that you might consider this request as a gesture of goodwill given my overall positive relationship with your company. The removal of this late payment would significantly help my credit profile and would be greatly appreciated.

I value our business relationship and look forward to many more years as your customer. Thank you for your time and consideration of this request.

Sincerely,

[Your signature]
[Your printed name]
[Phone number]
[Email address]`,
      instructions: [
        "Personalize the letter with specific details about your relationship with the creditor",
        "Be honest about the circumstances that led to the late payment",
        "Emphasize your positive payment history and current good standing",
        "Keep the tone respectful and professional",
        "Send to the customer service department, not collections",
        "Follow up with a phone call if no response within 30 days",
      ],
      legalNotes:
        "Goodwill letters are requests, not legal demands. Success depends on the creditor's policies and your relationship history.",
    },
    {
      id: "debt-validation-letter",
      title: "Debt Validation Request Letter",
      description: "Comprehensive debt validation letter to verify the legitimacy of collection accounts.",
      category: "Debt Validation",
      type: "validation",
      difficulty: "Intermediate",
      successRate: 72,
      usageCount: 12567,
      rating: 4.7,
      reviews: 743,
      premium: false,
      tags: ["Debt Validation", "Collections", "FDCPA", "Verification"],
      lastUpdated: "2024-01-12",
      author: "Consumer Rights Legal Team",
      estimatedTime: "20-25 minutes",
      effectiveness: "High",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Collection Agency Name]
[Collection Agency Address]
[City, State ZIP Code]

Re: Account Number: [Account Number]
    Original Creditor: [Original Creditor Name]
    Amount: $[Amount]

Dear Sir or Madam:

This letter is sent in response to a notice I received from you on [date of notice]. Be advised that this is not a refusal to pay, but a notice sent pursuant to the Fair Debt Collection Practices Act, 15 USC 1692g Sec. 809 (b) that your claim is disputed and validation is requested.

This is NOT a request for "verification" or proof of my mailing address, but a request for VALIDATION made pursuant to the above named Title and Section. I respectfully request that your office provide me with competent evidence that I have any legal obligation to pay you.

Please provide me with the following:
1. What the money you say I owe is for;
2. Explain and show me how you calculated what you say I owe;
3. Provide me with copies of any papers that show I agreed to pay what you say I owe;
4. Prove the Statute of Limitations has not expired on this account;
5. Show me that you are licensed to collect in my state;
6. Provide me with your license numbers and Registered Agent.

If your offices have reported invalidated information to any of the three major Credit Bureau companies (Equifax, Experian or TransUnion), said action might constitute fraud under both Federal and State Laws. Due to this fact, if any negative mark is found on any of my credit reports by your company or the company that you represent, I will not hesitate in bringing legal action against you for the following:

Violation of the Fair Credit Reporting Act
Violation of the Fair Debt Collection Practices Act
Defamation of Character

If your offices are able to provide the proper documentation as requested in the following Declaration, I will require at least 30 days to investigate this information and during such time all collection activity must cease and desist.

Also during this validation period, if any action is taken which could be considered detrimental to any of my credit reports, I will consult with my legal counsel for suit.

I require compliance with this request within 30 days or complete removal of the disputed item from all credit reports and permanent termination of any collection activities on this account.

Sincerely,

[Your signature]
[Your printed name]`,
      instructions: [
        "Send this letter within 30 days of first contact from the collector",
        "Use certified mail with return receipt requested",
        "Keep detailed records of all correspondence",
        "Do not admit to owing the debt in your letter",
        "Wait for validation before making any payments",
        "If they cannot validate, demand removal from credit reports",
      ],
      legalNotes:
        "Under the FDCPA, debt collectors must cease collection activities until they provide proper validation of the debt.",
    },
    {
      id: "identity-theft-affidavit",
      title: "Identity Theft Affidavit Letter",
      description: "Official identity theft affidavit for reporting fraudulent accounts and requesting removal.",
      category: "Identity Theft",
      type: "legal",
      difficulty: "Advanced",
      successRate: 89,
      usageCount: 3421,
      rating: 4.8,
      reviews: 234,
      premium: true,
      tags: ["Identity Theft", "Fraud", "Affidavit", "FTC", "Legal"],
      lastUpdated: "2024-01-08",
      author: "Identity Theft Legal Specialists",
      estimatedTime: "30-45 minutes",
      effectiveness: "High",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Credit Bureau/Creditor Name]
[Address]
[City, State ZIP Code]

Re: Identity Theft Affidavit - Request for Removal of Fraudulent Information
Social Security Number: XXX-XX-XXXX
Date of Birth: [Your DOB]

Dear Sir or Madam:

I am a victim of identity theft and am writing to report fraudulent information that appears on my credit report as a result of this crime. I did not authorize or participate in any transaction that created the following account(s):

[List fraudulent accounts with details]

I first became aware of this identity theft on [date] when [explain how you discovered it]. I have taken the following steps to address this crime:

1. Filed a police report on [date] (Report #[number] - copy enclosed)
2. Filed a complaint with the Federal Trade Commission
3. Placed fraud alerts on my credit reports
4. [List other steps taken]

Under the Fair Credit Reporting Act (FCRA) Section 605B, I am requesting that you:
1. Block the reporting of all information that resulted from identity theft
2. Remove all fraudulent accounts and inquiries from my credit report
3. Provide me with written confirmation of these actions

Enclosed you will find:
• Copy of FTC Identity Theft Report
• Copy of police report
• Copy of government-issued ID
• Proof of address
• [Other supporting documents]

This fraudulent information is causing significant damage to my credit profile and financial well-being. I request that you investigate this matter immediately and remove all fraudulent information within 4 business days as required by law.

Please send written confirmation of the removal of all fraudulent information to the address listed above. If you need any additional information, please contact me at [phone number].

Thank you for your prompt attention to this serious matter.

Sincerely,

[Your signature]
[Your printed name]

Enclosures: [List all enclosed documents]`,
      instructions: [
        "File a police report before sending this letter",
        "Complete the FTC Identity Theft Report online",
        "Gather all supporting documentation",
        "Send to all three credit bureaus and affected creditors",
        "Place fraud alerts on all credit reports",
        "Keep detailed records of all communications",
        "Follow up if no response within 5 business days",
      ],
      legalNotes:
        "Under FCRA Section 605B, credit reporting agencies must block fraudulent information within 4 business days of receiving proper documentation.",
    },
    {
      id: "pay-for-delete-agreement",
      title: "Pay-for-Delete Agreement Letter",
      description: "Professional pay-for-delete negotiation letter for collection accounts with legal protections.",
      category: "Collection Negotiations",
      type: "business",
      difficulty: "Advanced",
      successRate: 54,
      usageCount: 6789,
      rating: 4.2,
      reviews: 445,
      premium: true,
      tags: ["Pay for Delete", "Collections", "Negotiation", "Settlement"],
      lastUpdated: "2024-01-05",
      author: "Debt Settlement Experts",
      estimatedTime: "25-30 minutes",
      effectiveness: "Medium",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Collection Agency Name]
[Collection Agency Address]
[City, State ZIP Code]

Re: Account Number: [Account Number]
    Original Creditor: [Original Creditor Name]
    Settlement Offer and Deletion Request

Dear Collection Manager:

I am writing regarding the above-referenced account that appears on my credit report. I am prepared to resolve this matter, but I need your cooperation to reach a mutually beneficial agreement.

I am willing to pay $[Settlement Amount] as payment in full for this account, contingent upon your agreement to the following terms:

1. This payment will be accepted as payment in full, regardless of the balance you show on your records.

2. Upon receipt of payment, you will request deletion of all references to this account from all credit reporting agencies (Experian, Equifax, and TransUnion).

3. You will provide written confirmation that:
   a. The account is settled in full
   b. No further collection efforts will be made
   c. The account will be deleted from all credit reports
   d. No 1099-C will be issued for any forgiven debt

4. This agreement will be binding upon your company, its successors, assigns, and any other collection agency or attorney who may acquire this account.

If these terms are acceptable, please sign and return one copy of this letter to me before I send payment. Upon receipt of your signed agreement, I will forward payment via [payment method] within 5 business days.

Please note that this offer is contingent upon deletion from my credit reports. If you cannot agree to deletion, I am not interested in settling this account at this time.

This offer expires on [date - typically 10-14 days from letter date]. I look forward to resolving this matter quickly and amicably.

Sincerely,

[Your signature]
[Your printed name]
[Phone number]

AGREED AND ACCEPTED:

_________________________    Date: ________
[Collection Agency Representative]
[Title]
[Collection Agency Name]`,
      instructions: [
        "Only use this approach if you can afford the settlement amount",
        "Start with an offer of 30-50% of the balance",
        "Get written agreement BEFORE sending any payment",
        "Use certified mail for all correspondence",
        "Never give electronic access to your bank account",
        "Verify deletion from credit reports after payment",
        "Keep all documentation permanently",
      ],
      legalNotes:
        "Pay-for-delete agreements are not guaranteed to work. Some creditors have policies against deletion. Always get agreements in writing before paying.",
    },
    {
      id: "cease-and-desist-letter",
      title: "Cease and Desist Collection Letter",
      description: "Legal cease and desist letter to stop collection calls and communications under FDCPA.",
      category: "Collection Defense",
      type: "legal",
      difficulty: "Intermediate",
      successRate: 96,
      usageCount: 4567,
      rating: 4.9,
      reviews: 312,
      premium: false,
      tags: ["Cease and Desist", "FDCPA", "Collection Calls", "Harassment"],
      lastUpdated: "2024-01-18",
      author: "Consumer Protection Legal Team",
      estimatedTime: "10-15 minutes",
      effectiveness: "High",
      content: `[Date]

[Your Name]
[Your Address]
[City, State ZIP Code]

[Collection Agency Name]
[Collection Agency Address]
[City, State ZIP Code]

Re: Account Number: [Account Number]
    Cease and Desist Communication

Dear Sir or Madam:

You are hereby notified under the provisions of Public Law 95-109, Section 805-C of the Fair Debt Collection Practices Act that your services are no longer desired.

You and your organization must CEASE AND DESIST all attempts to collect the above debt. This includes but is not limited to:

• Telephone calls to my home, cell phone, or place of employment
• Contact with third parties regarding this alleged debt
• Reporting or threatening to report adverse information to credit reporting agencies
• Any other form of communication or contact regarding this matter

This is my formal notice to you under Section 805(c) of the Fair Debt Collection Practices Act (FDCPA) to cease all communication with me in connection with the collection of the above-referenced alleged debt.

Please be advised that I am aware of my rights under the FDCPA. Any violation of this cease and desist directive will result in a complaint being filed with:
• The Federal Trade Commission
• The Consumer Financial Protection Bureau  
• My state's Attorney General's office
• Possible legal action for damages under the FDCPA

The only acceptable contact from this point forward is:
1. To advise me that your collection efforts are being terminated, or
2. To notify me that you or the creditor intend to invoke a specific remedy that you ordinarily invoke

If you choose to invoke a specific remedy, you must actually intend to do so. Empty threats are violations of the FDCPA.

This letter is not an acknowledgment that I owe this debt. I dispute the validity of this alleged debt. If you wish to pursue this matter further, you may only do so through the courts.

Sincerely,

[Your signature]
[Your printed name]

CERTIFIED MAIL RECEIPT #: _______________`,
      instructions: [
        "Send via certified mail with return receipt requested",
        "Keep the certified mail receipt and return receipt",
        "Do not admit to owing the debt in your letter",
        "Document any contact after they receive this letter",
        "File complaints if they violate the cease and desist",
        "Understand this may lead to legal action by the creditor",
        "Consider consulting an attorney if sued",
      ],
      legalNotes:
        "Under FDCPA Section 805(c), debt collectors must stop all communication after receiving a cease and desist letter, except to notify you of specific legal actions.",
    },
  ]

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory
    const matchesType = selectedType === "all" || template.type === selectedType
    const matchesPremium = !showPremiumOnly || template.premium

    return matchesSearch && matchesCategory && matchesType && matchesPremium
  })

  const toggleFavorite = (templateId: string) => {
    setFavorites((prev) => (prev.includes(templateId) ? prev.filter((id) => id !== templateId) : [...prev, templateId]))
  }

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
    // You could add a toast notification here
  }

  const downloadTemplate = (template: Template) => {
    const blob = new Blob([template.content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.title.replace(/\s+/g, "_")}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getEffectivenessColor = (effectiveness: string) => {
    switch (effectiveness) {
      case "High":
        return "text-green-600"
      case "Medium":
        return "text-yellow-600"
      case "Low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "dispute":
        return FileText
      case "goodwill":
        return Heart
      case "validation":
        return CheckCircle
      case "legal":
        return Shield
      case "business":
        return DollarSign
      default:
        return FileText
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Letter Templates</h1>
        <p className="text-gray-600">
          Professional, legally-compliant letter templates for all your credit repair needs
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
            <div className="text-sm text-gray-600">Total Templates</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(templates.reduce((sum, t) => sum + t.successRate, 0) / templates.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg Success Rate</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {templates.reduce((sum, t) => sum + t.usageCount, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Uses</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {(templates.reduce((sum, t) => sum + t.rating, 0) / templates.length).toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates by title, description, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Categories</option>
                <option value="Credit Bureau Disputes">Credit Bureau Disputes</option>
                <option value="Goodwill Requests">Goodwill Requests</option>
                <option value="Debt Validation">Debt Validation</option>
                <option value="Identity Theft">Identity Theft</option>
                <option value="Collection Negotiations">Collection Negotiations</option>
                <option value="Collection Defense">Collection Defense</option>
              </select>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">All Types</option>
                <option value="dispute">Dispute</option>
                <option value="goodwill">Goodwill</option>
                <option value="validation">Validation</option>
                <option value="legal">Legal</option>
                <option value="business">Business</option>
              </select>

              <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md text-sm">
                <input
                  type="checkbox"
                  checked={showPremiumOnly}
                  onChange={(e) => setShowPremiumOnly(e.target.checked)}
                  className="rounded"
                />
                <span>Premium Only</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Templates ({filteredTemplates.length})</TabsTrigger>
          <TabsTrigger value="free">Free ({filteredTemplates.filter((t) => !t.premium).length})</TabsTrigger>
          <TabsTrigger value="premium">Premium ({filteredTemplates.filter((t) => t.premium).length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({favorites.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => {
              const TypeIcon = getTypeIcon(template.type)
              return (
                <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TypeIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                        {template.premium && (
                          <Badge className="bg-purple-100 text-purple-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(template.id)}
                        className="p-1 h-8 w-8"
                      >
                        <Heart
                          className={`h-4 w-4 ${favorites.includes(template.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                        />
                      </Button>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                      {template.title}
                    </CardTitle>
                    <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600 font-medium">{template.successRate}%</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{template.usageCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{template.rating}</span>
                        <span className="text-gray-500 text-xs">({template.reviews})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Effectiveness:{" "}
                        <span className={`font-medium ${getEffectivenessColor(template.effectiveness)}`}>
                          {template.effectiveness}
                        </span>
                      </span>
                      <span>Time: {template.estimatedTime}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <TypeIcon className="h-5 w-5" />
                              <span>{template.title}</span>
                              {template.premium && <Badge className="bg-purple-100 text-purple-800">Premium</Badge>}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Category:</strong> {template.category}
                              </div>
                              <div>
                                <strong>Success Rate:</strong>{" "}
                                <span className="text-green-600">{template.successRate}%</span>
                              </div>
                              <div>
                                <strong>Difficulty:</strong> {template.difficulty}
                              </div>
                              <div>
                                <strong>Estimated Time:</strong> {template.estimatedTime}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Letter Content:</h4>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <pre className="whitespace-pre-wrap text-sm font-mono">{template.content}</pre>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-semibold mb-2">Instructions:</h4>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {template.instructions.map((instruction, index) => (
                                  <li key={index}>{instruction}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                              <h4 className="font-semibold mb-2 text-yellow-800">Legal Notes:</h4>
                              <p className="text-sm text-yellow-700">{template.legalNotes}</p>
                            </div>

                            <div className="flex space-x-2">
                              <Button onClick={() => copyToClipboard(template.content)} className="flex-1">
                                <Copy className="h-4 w-4 mr-2" />
                                Copy to Clipboard
                              </Button>
                              <Button onClick={() => downloadTemplate(template)} variant="outline" className="flex-1">
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button size="sm" onClick={() => copyToClipboard(template.content)} className="flex-1">
                        <Copy className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div className="flex justify-between">
                        <span>By {template.author}</span>
                        <span>Updated {template.lastUpdated}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="free" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter((template) => !template.premium)
              .map((template) => {
                const TypeIcon = getTypeIcon(template.type)
                return (
                  <Card key={template.id} className="group hover:shadow-lg transition-all duration-200">
                    {/* Same card content as above */}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <TypeIcon className="h-4 w-4 text-blue-600" />
                          </div>
                          <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                          <Badge className="bg-green-100 text-green-800">Free</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(template.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Heart
                            className={`h-4 w-4 ${favorites.includes(template.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                          />
                        </Button>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {template.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">{template.successRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{template.usageCount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{template.rating}</span>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" onClick={() => copyToClipboard(template.content)} className="flex-1">
                          <Copy className="h-4 w-4 mr-2" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="space-y-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates
              .filter((template) => template.premium)
              .map((template) => {
                const TypeIcon = getTypeIcon(template.type)
                return (
                  <Card
                    key={template.id}
                    className="group hover:shadow-lg transition-all duration-200 border-purple-200"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <TypeIcon className="h-4 w-4 text-purple-600" />
                          </div>
                          <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(template.id)}
                          className="p-1 h-8 w-8"
                        >
                          <Heart
                            className={`h-4 w-4 ${favorites.includes(template.id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
                          />
                        </Button>
                      </div>
                      <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                        {template.title}
                      </CardTitle>
                      <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-green-600 font-medium">{template.successRate}%</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-600">{template.usageCount.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{template.rating}</span>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="flex items-center space-x-2 text-purple-800">
                          <Zap className="h-4 w-4" />
                          <span className="font-medium">Premium Features:</span>
                        </div>
                        <ul className="text-sm text-purple-700 mt-1 space-y-1">
                          <li>• Advanced legal language</li>
                          <li>• Higher success rates</li>
                          <li>• Expert legal review</li>
                          <li>• Priority support</li>
                        </ul>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(template.content)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Use Premium Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                  <Heart className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
                <p className="text-gray-600">Click the heart icon on templates to add them to your favorites</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates
                .filter((template) => favorites.includes(template.id))
                .map((template) => {
                  const TypeIcon = getTypeIcon(template.type)
                  return (
                    <Card
                      key={template.id}
                      className="group hover:shadow-lg transition-all duration-200 border-red-200"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="p-2 bg-red-100 rounded-lg">
                              <TypeIcon className="h-4 w-4 text-red-600" />
                            </div>
                            <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
                            {template.premium && <Badge className="bg-purple-100 text-purple-800">Premium</Badge>}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleFavorite(template.id)}
                            className="p-1 h-8 w-8"
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        <CardTitle className="text-lg group-hover:text-red-600 transition-colors">
                          {template.title}
                        </CardTitle>
                        <p className="text-gray-600 text-sm line-clamp-2">{template.description}</p>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">{template.successRate}%</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{template.usageCount.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="font-medium">{template.rating}</span>
                          </div>
                        </div>

                        <div className="flex space-x-2 pt-2">
                          <Button size="sm" onClick={() => copyToClipboard(template.content)} className="flex-1">
                            <Copy className="h-4 w-4 mr-2" />
                            Use Template
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-fit mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-600">Try adjusting your search terms or filters</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
