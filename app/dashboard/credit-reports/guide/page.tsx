'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ArrowRight,
  CreditCard,
  Shield,
  Target,
  BookOpen,
  PlayCircle
} from 'lucide-react'

export default function CreditReportGuide() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: 'Overview', icon: BookOpen },
    { id: 'getting-reports', title: 'Getting Reports', icon: Download },
    { id: 'understanding-scores', title: 'Understanding Scores', icon: CreditCard },
    { id: 'negative-items', title: 'Negative Items', icon: AlertTriangle },
    { id: 'dispute-process', title: 'Dispute Process', icon: Target },
    { id: 'next-steps', title: 'Next Steps', icon: ArrowRight }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Complete Credit Report Guide
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn how to get your free credit reports, understand your credit score, 
            identify negative items, and start the dispute process to improve your credit.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {sections.map((section, index) => {
              const Icon = section.icon
              const isActive = activeSection === section.id
              const isCompleted = sections.findIndex(s => s.id === activeSection) > index
              
              return (
                <div key={section.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isCompleted 
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-white border-gray-300 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {index < sections.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <TabsTrigger key={section.id} value={section.id} className="flex items-center space-x-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{section.title}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Overview Section */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 text-blue-500" />
                  <span>Credit Report Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">What is a Credit Report?</h3>
                    <p className="text-gray-600 mb-4">
                      Your credit report is a detailed record of your credit history, including loans, 
                      credit cards, payment history, and other financial information. It's used by 
                      lenders to determine your creditworthiness.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Personal information (name, address, SSN)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Credit accounts and payment history</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Public records (bankruptcies, liens)</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>Credit inquiries</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Why This Matters</h3>
                    <p className="text-gray-600 mb-4">
                      Your credit report directly impacts your credit score, which affects your ability 
                      to get loans, credit cards, and even employment or housing.
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Key Benefits of Good Credit:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Lower interest rates on loans</li>
                        <li>• Better credit card offers</li>
                        <li>• Easier approval for housing</li>
                        <li>• Potential employment advantages</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Getting Reports Section */}
          <TabsContent value="getting-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="h-6 w-6 text-green-500" />
                  <span>How to Get Your Free Credit Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3">
                    🎉 You're Entitled to FREE Credit Reports!
                  </h3>
                  <p className="text-green-800 mb-4">
                    By law, you can get one free credit report from each of the three major credit 
                    bureaus every 12 months through AnnualCreditReport.com.
                  </p>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => window.open('https://www.annualcreditreport.com', '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit AnnualCreditReport.com
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step 1: Visit the Website</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Go to AnnualCreditReport.com - the only official site for free credit reports.
                      </p>
                      <div className="bg-yellow-50 p-3 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>⚠️ Warning:</strong> Avoid other sites that claim to offer "free" reports but require payment.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step 2: Fill Out the Form</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Provide your personal information including:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Full name</li>
                        <li>• Social Security Number</li>
                        <li>• Date of birth</li>
                        <li>• Current address</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Step 3: Choose Your Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Select which credit bureau reports you want:
                      </p>
                      <div className="space-y-2">
                        <Badge variant="outline">Experian</Badge>
                        <Badge variant="outline">Equifax</Badge>
                        <Badge variant="outline">TransUnion</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">
                    💡 Pro Tip: Stagger Your Reports
                  </h3>
                  <p className="text-blue-800">
                    Instead of getting all three reports at once, consider getting one every 4 months 
                    to monitor your credit throughout the year for free.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Understanding Scores Section */}
          <TabsContent value="understanding-scores" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-6 w-6 text-purple-500" />
                  <span>Understanding Your Credit Score</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Credit Score Ranges</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">Excellent</span>
                        <Badge className="bg-green-500">800-850</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <span className="font-medium">Very Good</span>
                        <Badge className="bg-blue-500">740-799</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="font-medium">Good</span>
                        <Badge className="bg-yellow-500">670-739</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <span className="font-medium">Fair</span>
                        <Badge className="bg-orange-500">580-669</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium">Poor</span>
                        <Badge className="bg-red-500">300-579</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">What Affects Your Score</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Payment History (35%)</h4>
                          <p className="text-sm text-gray-600">On-time payments are crucial</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Credit Utilization (30%)</h4>
                          <p className="text-sm text-gray-600">Keep balances below 30% of limits</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Length of Credit (15%)</h4>
                          <p className="text-sm text-gray-600">Older accounts help your score</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">Credit Mix (10%)</h4>
                          <p className="text-sm text-gray-600">Different types of credit</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mt-2"></div>
                        <div>
                          <h4 className="font-medium">New Credit (10%)</h4>
                          <p className="text-sm text-gray-600">Recent applications and accounts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Negative Items Section */}
          <TabsContent value="negative-items" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <span>Identifying Negative Items</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">
                    What to Look For
                  </h3>
                  <p className="text-red-800 mb-4">
                    These items can significantly damage your credit score and are prime candidates for disputes:
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Common Negative Items</h3>
                    <div className="space-y-4">
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-600 mb-2">Late Payments</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Payments that are 30, 60, 90, or 120+ days late
                        </p>
                        <Badge variant="destructive">High Impact</Badge>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-600 mb-2">Collections</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Accounts sent to collection agencies
                        </p>
                        <Badge variant="destructive">High Impact</Badge>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-red-600 mb-2">Charge-offs</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Debts written off as uncollectible
                        </p>
                        <Badge variant="destructive">High Impact</Badge>
                      </div>
                      
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-600 mb-2">Bankruptcies</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Chapter 7, 11, or 13 bankruptcy filings
                        </p>
                        <Badge variant="destructive">Very High Impact</Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dispute Reasons</h3>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Inaccurate Information</h4>
                          <p className="text-sm text-gray-600">Wrong amounts, dates, or account details</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Identity Theft</h4>
                          <p className="text-sm text-gray-600">Accounts you didn't open or authorize</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Outdated Information</h4>
                          <p className="text-sm text-gray-600">Items older than 7 years (10 for bankruptcies)</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium">Duplicate Entries</h4>
                          <p className="text-sm text-gray-600">Same debt listed multiple times</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dispute Process Section */}
          <TabsContent value="dispute-process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-6 w-6 text-blue-500" />
                  <span>The Dispute Process</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Step-by-Step Process</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h4 className="font-medium">Identify Items</h4>
                          <p className="text-sm text-gray-600">Find negative items on your credit report</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h4 className="font-medium">Gather Evidence</h4>
                          <p className="text-sm text-gray-600">Collect supporting documentation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h4 className="font-medium">Write Dispute Letter</h4>
                          <p className="text-sm text-gray-600">Create a professional dispute letter</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h4 className="font-medium">Send Certified Mail</h4>
                          <p className="text-sm text-gray-600">Mail with proof of delivery</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                        <div>
                          <h4 className="font-medium">Follow Up</h4>
                          <p className="text-sm text-gray-600">Track progress and respond to requests</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">Timeline & Expectations</h3>
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-blue-900">30 Days</h4>
                        <p className="text-sm text-blue-800">
                          Credit bureaus must investigate your dispute within 30 days
                        </p>
                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-900">Success Rate</h4>
                        <p className="text-sm text-green-800">
                          Studies show 25-30% of disputes result in item removal
                        </p>
                      </div>
                      
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-900">Multiple Attempts</h4>
                        <p className="text-sm text-yellow-800">
                          You can dispute the same item multiple times with different reasons
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next Steps Section */}
          <TabsContent value="next-steps" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowRight className="h-6 w-6 text-green-500" />
                  <span>Ready to Get Started?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    You're Ready to Begin Your Credit Repair Journey!
                  </h3>
                  <p className="text-lg text-gray-600 mb-8">
                    Now that you understand the process, let's get your credit information 
                    into our system so we can help you create effective dispute letters.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card className="text-center">
                    <CardHeader>
                      <FileText className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <CardTitle>1. Get Your Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Download your free credit reports from AnnualCreditReport.com
                      </p>
                      <Button 
                        variant="outline" 
                        onClick={() => window.open('https://www.annualcreditreport.com', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get Reports
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardHeader>
                      <Target className="h-12 w-12 text-green-500 mx-auto mb-2" />
                      <CardTitle>2. Enter Your Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Use our simple forms to input your credit score and negative items
                      </p>
                      <Button 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
                      >
                        Start Data Entry
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="text-center">
                    <CardHeader>
                      <Shield className="h-12 w-12 text-purple-500 mx-auto mb-2" />
                      <CardTitle>3. Generate Letters</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">
                        Our AI will create professional dispute letters for each item
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/dashboard/letters'}
                      >
                        View Letters
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    🎯 Ready to Start?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Click the button below to begin entering your credit information. 
                    Our system will guide you through each step and help you create 
                    effective dispute letters.
                  </p>
                  <div className="flex justify-center">
                    <Button 
                      size="lg" 
                      className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                      onClick={() => window.location.href = '/dashboard/credit-reports/upload'}
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Start Credit Data Entry
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
