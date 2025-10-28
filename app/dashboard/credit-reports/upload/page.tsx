'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  CreditCard,
  TrendingUp,
  Calendar,
  DollarSign,
  Building,
  User,
  BookOpen,
  ArrowRight,
  Wand2,
  Download,
  Send,
  Eye,
  Loader2
} from 'lucide-react'

interface CreditScore {
  id: string
  bureau: 'Experian' | 'Equifax' | 'TransUnion'
  score: number
  date: string
  notes?: string
}

interface NegativeItem {
  id: string
  creditor: string
  accountNumber: string
  originalAmount: number
  currentBalance: number
  dateOpened: string
  dateReported: string
  status: 'Open' | 'Closed' | 'Charged Off' | 'In Collections'
  itemType: 'Late Payment' | 'Collection' | 'Charge Off' | 'Bankruptcy' | 'Lien' | 'Judgment' | 'Other'
  disputeReason: string
  notes?: string
}

export default function CreditReportUpload() {
  const [creditScores, setCreditScores] = useState<CreditScore[]>([])
  const [negativeItems, setNegativeItems] = useState<NegativeItem[]>([])
  const [activeTab, setActiveTab] = useState('scores')
  const [editingScore, setEditingScore] = useState<CreditScore | null>(null)
  const [editingItem, setEditingItem] = useState<NegativeItem | null>(null)
  const [isAddingScore, setIsAddingScore] = useState(false)
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [isGeneratingLetters, setIsGeneratingLetters] = useState(false)
  const [generatedLetters, setGeneratedLetters] = useState<{ [bureau: string]: any }>({})
  const [showLetterModal, setShowLetterModal] = useState(false)
  const [selectedBureau, setSelectedBureau] = useState<string>('')
  const [letterTier, setLetterTier] = useState<string>('standard')
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    ssnLast4: '',
    dateOfBirth: ''
  })

  // Load saved data from localStorage
  useEffect(() => {
    const savedScores = localStorage.getItem('creditScores')
    const savedItems = localStorage.getItem('negativeItems')
    
    if (savedScores) {
      setCreditScores(JSON.parse(savedScores))
    }
    if (savedItems) {
      setNegativeItems(JSON.parse(savedItems))
    }
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('creditScores', JSON.stringify(creditScores))
  }, [creditScores])

  useEffect(() => {
    localStorage.setItem('negativeItems', JSON.stringify(negativeItems))
  }, [negativeItems])

  const handleAddScore = (score: Omit<CreditScore, 'id'>) => {
    const newScore: CreditScore = {
      ...score,
      id: `score_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setCreditScores(prev => [...prev, newScore])
    setIsAddingScore(false)
  }

  const handleEditScore = (id: string, updates: Partial<CreditScore>) => {
    setCreditScores(prev => prev.map(score => 
      score.id === id ? { ...score, ...updates } : score
    ))
    setEditingScore(null)
  }

  const handleDeleteScore = (id: string) => {
    setCreditScores(prev => prev.filter(score => score.id !== id))
  }

  const handleAddItem = (item: Omit<NegativeItem, 'id'>) => {
    const newItem: NegativeItem = {
      ...item,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    setNegativeItems(prev => [...prev, newItem])
    setIsAddingItem(false)
  }

  const handleEditItem = (id: string, updates: Partial<NegativeItem>) => {
    setNegativeItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
    setEditingItem(null)
  }

  const handleDeleteItem = (id: string) => {
    setNegativeItems(prev => prev.filter(item => item.id !== id))
  }

  const handleGenerateLetters = async () => {
    if (negativeItems.length === 0) {
      alert('Please add at least one negative item before generating letters.')
      return
    }

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.address) {
      alert('Please fill in your personal information before generating letters.')
      return
    }

    setIsGeneratingLetters(true)
    try {
      const response = await fetch('/api/credit-reports/generate-letters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalInfo,
          negativeItems,
          letterTier,
          creditBureaus: ['experian', 'equifax', 'transunion']
        }),
      })

      const data = await response.json()

      if (data.success) {
        setGeneratedLetters(data.data.letters)
        alert(`Successfully generated ${Object.keys(data.data.letters).length} dispute letters!`)
      } else {
        alert(`Error generating letters: ${data.error}`)
      }
    } catch (error) {
      console.error('Error generating letters:', error)
      alert('Failed to generate letters. Please try again.')
    } finally {
      setIsGeneratingLetters(false)
    }
  }

  const handleViewLetter = (bureau: string) => {
    setSelectedBureau(bureau)
    setShowLetterModal(true)
  }

  const handleDownloadLetter = (bureau: string) => {
    const letter = generatedLetters[bureau]
    if (letter) {
      const element = document.createElement('a')
      const file = new Blob([letter.content], { type: 'text/plain' })
      element.href = URL.createObjectURL(file)
      element.download = `dispute-letter-${bureau}-${new Date().toISOString().split('T')[0]}.txt`
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 740) return 'text-blue-600'
    if (score >= 670) return 'text-yellow-600'
    if (score >= 580) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 800) return 'Excellent'
    if (score >= 740) return 'Very Good'
    if (score >= 670) return 'Good'
    if (score >= 580) return 'Fair'
    return 'Poor'
  }

  const getItemTypeColor = (type: string) => {
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

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-green-100 text-green-800',
      'Closed': 'bg-gray-100 text-gray-800',
      'Charged Off': 'bg-red-100 text-red-800',
      'In Collections': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const averageScore = creditScores.length > 0 
    ? Math.round(creditScores.reduce((sum, score) => sum + score.score, 0) / creditScores.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credit Report Data Entry</h1>
              <p className="text-gray-600 mt-2">
                Enter your credit information to generate personalized dispute letters
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/dashboard/credit-reports/guide'}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                View Guide
              </Button>
              <Button 
                onClick={() => setActiveTab('letters')}
                disabled={negativeItems.length === 0}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Letters
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CreditCard className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                    {averageScore || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Credit Scores</p>
                  <p className="text-2xl font-bold text-gray-900">{creditScores.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Negative Items</p>
                  <p className="text-2xl font-bold text-gray-900">{negativeItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ready for Letters</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {negativeItems.length > 0 ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="scores">Credit Scores</TabsTrigger>
            <TabsTrigger value="items">Negative Items</TabsTrigger>
            <TabsTrigger value="letters">Generate Letters</TabsTrigger>
          </TabsList>

          {/* Credit Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Credit Scores</CardTitle>
                  <Button onClick={() => setIsAddingScore(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Score
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {creditScores.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Credit Scores Added</h3>
                    <p className="text-gray-600 mb-4">
                      Add your credit scores from each bureau to track your progress
                    </p>
                    <Button onClick={() => setIsAddingScore(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Score
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {creditScores.map((score) => (
                      <div key={score.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <Building className="h-5 w-5 text-gray-400" />
                              <span className="font-medium">{score.bureau}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-2xl font-bold ${getScoreColor(score.score)}`}>
                                {score.score}
                              </span>
                              <Badge variant="outline" className={getScoreColor(score.score)}>
                                {getScoreLabel(score.score)}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <Calendar className="h-4 w-4" />
                              <span>{score.date}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingScore(score)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteScore(score.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {score.notes && (
                          <p className="text-sm text-gray-600 mt-2">{score.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Negative Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Negative Items</CardTitle>
                  <Button onClick={() => setIsAddingItem(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {negativeItems.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Negative Items Added</h3>
                    <p className="text-gray-600 mb-4">
                      Add negative items from your credit report to generate dispute letters
                    </p>
                    <Button onClick={() => setIsAddingItem(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {negativeItems.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">{item.creditor}</h4>
                              <Badge className={getItemTypeColor(item.itemType)}>
                                {item.itemType}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Amount:</span> ${item.originalAmount.toLocaleString()}
                              </div>
                              <div>
                                <span className="font-medium">Opened:</span> {item.dateOpened}
                              </div>
                              <div>
                                <span className="font-medium">Reported:</span> {item.dateReported}
                              </div>
                              <div>
                                <span className="font-medium">Account:</span> {item.accountNumber}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="font-medium text-sm">Dispute Reason:</span>
                              <p className="text-sm text-gray-600">{item.disputeReason}</p>
                            </div>
                            {item.notes && (
                              <div className="mt-2">
                                <span className="font-medium text-sm">Notes:</span>
                                <p className="text-sm text-gray-600">{item.notes}</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Letters Tab */}
          <TabsContent value="letters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="h-6 w-6 text-purple-500" />
                  <span>Generate Dispute Letters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.firstName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.lastName}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={personalInfo.address}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Enter your address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={personalInfo.city}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={personalInfo.state}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="Enter your state"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={personalInfo.zipCode}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                        placeholder="Enter your ZIP code"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                </div>

                {/* Letter Options */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Letter Options</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="letterTier">Letter Tier</Label>
                      <Select value={letterTier} onValueChange={setLetterTier}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard - $9.99 (Basic FCRA-compliant)</SelectItem>
                          <SelectItem value="enhanced">Enhanced - $22.99 (With CFPB complaint threat)</SelectItem>
                          <SelectItem value="premium">Premium - $49.99 (Attorney-supervised)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateLetters}
                    disabled={isGeneratingLetters || negativeItems.length === 0}
                    className="bg-purple-600 hover:bg-purple-700"
                    size="lg"
                  >
                    {isGeneratingLetters ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Generating Letters...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-5 w-5 mr-2" />
                        Generate Dispute Letters
                      </>
                    )}
                  </Button>
                </div>

                {/* Generated Letters Display */}
                {Object.keys(generatedLetters).length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Generated Letters</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(generatedLetters).map(([bureau, letter]) => (
                        <Card key={bureau}>
                          <CardHeader>
                            <CardTitle className="text-lg capitalize">{bureau}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <Button
                                onClick={() => handleViewLetter(bureau)}
                                className="w-full"
                                variant="outline"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Letter
                              </Button>
                              <Button
                                onClick={() => handleDownloadLetter(bureau)}
                                className="w-full"
                                variant="outline"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Score Modal */}
        {isAddingScore && (
          <ScoreFormModal
            onSave={handleAddScore}
            onCancel={() => setIsAddingScore(false)}
          />
        )}

        {editingScore && (
          <ScoreFormModal
            score={editingScore}
            onSave={(updates) => handleEditScore(editingScore.id, updates)}
            onCancel={() => setEditingScore(null)}
          />
        )}

        {/* Add/Edit Item Modal */}
        {isAddingItem && (
          <ItemFormModal
            onSave={handleAddItem}
            onCancel={() => setIsAddingItem(false)}
          />
        )}

        {editingItem && (
          <ItemFormModal
            item={editingItem}
            onSave={(updates) => handleEditItem(editingItem.id, updates)}
            onCancel={() => setEditingItem(null)}
          />
        )}

        {/* Letter Viewing Modal */}
        {showLetterModal && selectedBureau && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  Dispute Letter - {selectedBureau.charAt(0).toUpperCase() + selectedBureau.slice(1)}
                </h3>
                <Button variant="outline" onClick={() => setShowLetterModal(false)}>
                  Close
                </Button>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {generatedLetters[selectedBureau]?.content || 'Letter not found'}
                </pre>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => handleDownloadLetter(selectedBureau)}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button onClick={() => setShowLetterModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Score Form Modal Component
function ScoreFormModal({ 
  score, 
  onSave, 
  onCancel 
}: { 
  score?: CreditScore
  onSave: (score: Omit<CreditScore, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    bureau: score?.bureau || 'Experian',
    score: score?.score || 0,
    date: score?.date || new Date().toISOString().split('T')[0],
    notes: score?.notes || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {score ? 'Edit Credit Score' : 'Add Credit Score'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="bureau">Credit Bureau</Label>
            <Select value={formData.bureau} onValueChange={(value) => setFormData(prev => ({ ...prev, bureau: value as any }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Experian">Experian</SelectItem>
                <SelectItem value="Equifax">Equifax</SelectItem>
                <SelectItem value="TransUnion">TransUnion</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="score">Credit Score</Label>
            <Input
              id="score"
              type="number"
              min="300"
              max="850"
              value={formData.score}
              onChange={(e) => setFormData(prev => ({ ...prev, score: parseInt(e.target.value) || 0 }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Item Form Modal Component
function ItemFormModal({ 
  item, 
  onSave, 
  onCancel 
}: { 
  item?: NegativeItem
  onSave: (item: Omit<NegativeItem, 'id'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    creditor: item?.creditor || '',
    accountNumber: item?.accountNumber || '',
    originalAmount: item?.originalAmount || 0,
    currentBalance: item?.currentBalance || 0,
    dateOpened: item?.dateOpened || '',
    dateReported: item?.dateReported || '',
    status: item?.status || 'Open',
    itemType: item?.itemType || 'Late Payment',
    disputeReason: item?.disputeReason || '',
    notes: item?.notes || ''
  })

  const handleDisputeReasonChange = (value: string) => {
    if (value === "Custom") {
      setFormData(prev => ({ ...prev, disputeReason: "" }))
    } else {
      // Pre-populate with the selected reason, but allow user to edit
      setFormData(prev => ({ ...prev, disputeReason: value }))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {item ? 'Edit Negative Item' : 'Add Negative Item'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="creditor">Creditor Name</Label>
              <Input
                id="creditor"
                value={formData.creditor}
                onChange={(e) => setFormData(prev => ({ ...prev, creditor: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={formData.accountNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="originalAmount">Original Amount</Label>
              <Input
                id="originalAmount"
                type="number"
                min="0"
                step="0.01"
                value={formData.originalAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, originalAmount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                type="number"
                min="0"
                step="0.01"
                value={formData.currentBalance}
                onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="dateOpened">Date Opened</Label>
              <Input
                id="dateOpened"
                type="date"
                value={formData.dateOpened}
                onChange={(e) => setFormData(prev => ({ ...prev, dateOpened: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dateReported">Date Reported</Label>
              <Input
                id="dateReported"
                type="date"
                value={formData.dateReported}
                onChange={(e) => setFormData(prev => ({ ...prev, dateReported: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                  <SelectItem value="Charged Off">Charged Off</SelectItem>
                  <SelectItem value="In Collections">In Collections</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="itemType">Item Type</Label>
              <Select value={formData.itemType} onValueChange={(value) => setFormData(prev => ({ ...prev, itemType: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Late Payment">Late Payment</SelectItem>
                  <SelectItem value="Collection">Collection</SelectItem>
                  <SelectItem value="Charge Off">Charge Off</SelectItem>
                  <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                  <SelectItem value="Lien">Lien</SelectItem>
                  <SelectItem value="Judgment">Judgment</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="disputeReason">Dispute Reason</Label>
            <div className="space-y-3">
              <Select 
                value={formData.disputeReason || ""} 
                onValueChange={handleDisputeReasonChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a common dispute reason or write your own below" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inaccurate Information">Inaccurate Information - Wrong amounts, dates, or account details</SelectItem>
                  <SelectItem value="Identity Theft">Identity Theft - Account opened without authorization</SelectItem>
                  <SelectItem value="Outdated Information">Outdated Information - Item older than 7 years (10 for bankruptcies)</SelectItem>
                  <SelectItem value="Duplicate Entry">Duplicate Entry - Same debt listed multiple times</SelectItem>
                  <SelectItem value="Paid in Full">Paid in Full - Account was paid but not updated</SelectItem>
                  <SelectItem value="Never Late">Never Late - Payment history is incorrect</SelectItem>
                  <SelectItem value="Account Not Mine">Account Not Mine - I never opened this account</SelectItem>
                  <SelectItem value="Incorrect Balance">Incorrect Balance - Balance amount is wrong</SelectItem>
                  <SelectItem value="Wrong Creditor">Wrong Creditor - Creditor name is incorrect</SelectItem>
                  <SelectItem value="Settled Account">Settled Account - Account was settled but shows as charged off</SelectItem>
                  <SelectItem value="Bankruptcy Discharge">Bankruptcy Discharge - Debt was discharged in bankruptcy</SelectItem>
                  <SelectItem value="Fraudulent Account">Fraudulent Account - Account opened fraudulently</SelectItem>
                  <SelectItem value="Incorrect Status">Incorrect Status - Account status is wrong</SelectItem>
                  <SelectItem value="Missing Payment Credit">Missing Payment Credit - Payments not reflected</SelectItem>
                  <SelectItem value="Wrong Account Type">Wrong Account Type - Account type is incorrect</SelectItem>
                  <SelectItem value="Incorrect Date">Incorrect Date - Date opened or reported is wrong</SelectItem>
                  <SelectItem value="Account Closed">Account Closed - Account was closed but shows as open</SelectItem>
                  <SelectItem value="Incorrect Credit Limit">Incorrect Credit Limit - Credit limit amount is wrong</SelectItem>
                  <SelectItem value="Wrong Payment Status">Wrong Payment Status - Payment status is incorrect</SelectItem>
                  <SelectItem value="Custom">Custom - Write your own reason below</SelectItem>
                </SelectContent>
              </Select>
              <Textarea
                id="disputeReason"
                value={formData.disputeReason}
                onChange={(e) => setFormData(prev => ({ ...prev, disputeReason: e.target.value }))}
                rows={3}
                placeholder="Explain why you're disputing this item in detail..."
                required
              />
              <div className="text-xs text-gray-500">
                💡 <strong>Tip:</strong> Be specific about what's wrong and provide any supporting documentation you have.
                {formData.disputeReason && !["Inaccurate Information", "Identity Theft", "Outdated Information", "Duplicate Entry", "Paid in Full", "Never Late", "Account Not Mine", "Incorrect Balance", "Wrong Creditor", "Settled Account", "Bankruptcy Discharge", "Fraudulent Account", "Incorrect Status", "Missing Payment Credit", "Wrong Account Type", "Incorrect Date", "Account Closed", "Incorrect Credit Limit", "Wrong Payment Status"].includes(formData.disputeReason) && (
                  <span className="block mt-1 text-blue-600">
                    ✏️ <strong>Custom reason:</strong> You can edit this text to add more details.
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
