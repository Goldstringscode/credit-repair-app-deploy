"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Upload,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Folder,
  Star,
} from "lucide-react"

interface Document {
  id: string
  name: string
  type: string
  category: string
  size: string
  uploadDate: string
  status: "analyzing" | "analyzed" | "error"
  analysis?: {
    score: number
    insights: string[]
    recommendations: string[]
    negativeItems: number
    positiveItems: number
  }
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Experian_Credit_Report_2024.pdf",
    type: "credit_report",
    category: "Credit Reports",
    size: "2.4 MB",
    uploadDate: "2024-01-15",
    status: "analyzed",
    analysis: {
      score: 680,
      insights: [
        "3 negative items found that can be disputed",
        "Credit utilization is 45% - should be under 30%",
        "Payment history shows 2 late payments in last 12 months",
      ],
      recommendations: [
        "Dispute the collection account from ABC Collections",
        "Pay down credit card balances to reduce utilization",
        "Set up automatic payments to avoid future late payments",
      ],
      negativeItems: 3,
      positiveItems: 12,
    },
  },
  {
    id: "2",
    name: "Equifax_Report_Jan2024.pdf",
    type: "credit_report",
    category: "Credit Reports",
    size: "1.8 MB",
    uploadDate: "2024-01-10",
    status: "analyzed",
    analysis: {
      score: 695,
      insights: [
        "2 accounts showing incorrect balances",
        "Address information is outdated",
        "Good payment history on mortgage account",
      ],
      recommendations: [
        "Dispute incorrect balance on Capital One account",
        "Update address information with credit bureaus",
        "Continue making on-time mortgage payments",
      ],
      negativeItems: 2,
      positiveItems: 15,
    },
  },
  {
    id: "3",
    name: "Bank_Statement_Dec2023.pdf",
    type: "bank_statement",
    category: "Financial Documents",
    size: "856 KB",
    uploadDate: "2024-01-08",
    status: "analyzing",
  },
]

export default function DocumentsPage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>(mockDocuments)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const file = files[0]
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload files smaller than 10MB",
          variant: "destructive",
        })
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setIsUploading(false)

            // Add new document
            const newDoc: Document = {
              id: Date.now().toString(),
              name: file.name,
              type: file.type.includes("pdf") ? "credit_report" : "other",
              category: file.type.includes("pdf") ? "Credit Reports" : "Other Documents",
              size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              uploadDate: new Date().toISOString().split("T")[0],
              status: "analyzing",
            }

            setDocuments((prev) => [newDoc, ...prev])

            toast({
              title: "File uploaded successfully",
              description: "AI analysis is in progress...",
            })

            // Simulate analysis completion
            setTimeout(() => {
              setDocuments((prev) =>
                prev.map((doc) =>
                  doc.id === newDoc.id
                    ? {
                        ...doc,
                        status: "analyzed" as const,
                        analysis: {
                          score: Math.floor(Math.random() * 200) + 600,
                          insights: [
                            "Document processed successfully",
                            "Key information extracted",
                            "Ready for dispute generation",
                          ],
                          recommendations: ["Review identified issues", "Generate dispute letters", "Monitor progress"],
                          negativeItems: Math.floor(Math.random() * 5),
                          positiveItems: Math.floor(Math.random() * 10) + 5,
                        },
                      }
                    : doc,
                ),
              )

              toast({
                title: "Analysis complete",
                description: "Your document has been analyzed and is ready for review",
              })
            }, 3000)

            return 100
          }
          return prev + 10
        })
      }, 200)
    },
    [toast],
  )

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(documents.map((doc) => doc.category)))]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "analyzed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "analyzing":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "analyzed":
        return <Badge className="bg-green-100 text-green-800">Analyzed</Badge>
      case "analyzing":
        return <Badge className="bg-yellow-100 text-yellow-800">Analyzing</Badge>
      case "error":
        return <Badge className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600">Upload and analyze your credit documents with AI</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Encrypted Storage
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">My Documents</TabsTrigger>
          <TabsTrigger value="upload">Upload New</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.category}</p>
                      </div>
                    </div>
                    {getStatusIcon(doc.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Size: {doc.size}</span>
                    <span className="text-gray-500">{doc.uploadDate}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    {getStatusBadge(doc.status)}
                    {doc.analysis && (
                      <div className="flex items-center space-x-1 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{doc.analysis.score}</span>
                      </div>
                    )}
                  </div>

                  {doc.analysis && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">✓ {doc.analysis.positiveItems} positive</span>
                        <span className="text-red-600">⚠ {doc.analysis.negativeItems} issues</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p className="truncate">{doc.analysis.insights[0]}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Folder className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Upload your first document to get started"}
                </p>
                <Button>Upload Document</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload credit reports, bank statements, and other financial documents for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Drop files here or click to upload</h3>
                <p className="text-gray-600 mb-4">Supports PDF, JPG, PNG files up to 10MB</p>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />
                <Button>Choose Files</Button>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} />
                </div>
              )}

              {/* Supported Document Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Credit Reports</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Experian credit reports</li>
                    <li>• Equifax credit reports</li>
                    <li>• TransUnion credit reports</li>
                    <li>• Annual credit reports</li>
                  </ul>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Financial Documents</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Bank statements</li>
                    <li>• Payment receipts</li>
                    <li>• Correspondence letters</li>
                    <li>• Legal documents</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {documents
              .filter((doc) => doc.analysis)
              .map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{doc.name}</CardTitle>
                    <CardDescription>AI Analysis Results</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold">Credit Score: {doc.analysis?.score}</span>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Analyzed
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{doc.analysis?.positiveItems}</p>
                        <p className="text-sm text-green-700">Positive Items</p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{doc.analysis?.negativeItems}</p>
                        <p className="text-sm text-red-700">Issues Found</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Key Insights</h4>
                      <ul className="space-y-1">
                        {doc.analysis?.insights.map((insight, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Recommendations</h4>
                      <ul className="space-y-1">
                        {doc.analysis?.recommendations.map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start">
                            <Star className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button className="w-full">Generate Dispute Letters</Button>
                  </CardContent>
                </Card>
              ))}
          </div>

          {documents.filter((doc) => doc.analysis).length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No analysis results yet</h3>
                <p className="text-gray-600 mb-6">Upload and analyze documents to see AI insights here</p>
                <Button>Upload Documents</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
