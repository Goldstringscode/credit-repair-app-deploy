"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, CreditCard, TrendingUp, Database, Zap, Star, Target, BarChart3 } from "lucide-react"
import { CreditReportUpload } from "@/components/credit-report-upload"

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-primary">Credit Report Upload</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your credit reports and get instant, accurate analysis using our market-leading parsing technology
        </p>
      </div>

      {/* Superior Parser Benefits */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Star className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Superior Parser Technology</CardTitle>
          <CardDescription className="text-lg">
            Industry-leading accuracy with multi-strategy parsing approach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Multi-Strategy Parsing</h3>
              <p className="text-sm text-muted-foreground">
                Uses 4 different parsing strategies for maximum accuracy
              </p>
            </div>
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Advanced Pattern Recognition</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent detection of accounts, scores, and negative items
              </p>
            </div>
            <div className="text-center space-y-2">
              <CheckCircle className="h-8 w-8 text-primary mx-auto" />
              <h3 className="font-semibold">Data Validation</h3>
              <p className="text-sm text-muted-foreground">
                Comprehensive validation with confidence scoring
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Component */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Credit Report
          </CardTitle>
          <CardDescription>
            Choose your preferred analysis method and upload your credit report file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreditReportUpload />
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Account Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Credit cards, loans, mortgages, and more
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Balance and credit limit extraction
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Payment status and history
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Account opening dates
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Credit Scores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                FICO, Vantage, and other score models
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                All three major credit bureaus
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Score generation dates
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Score validation and confidence
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Negative Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Collections and charge-offs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Late payments and delinquencies
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Bankruptcies and judgments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Dispute recommendations
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Confidence scoring for all data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Duplicate detection and removal
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Data validation and cleaning
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Comprehensive error handling
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Our superior parser consistently achieves industry-leading accuracy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">95%+</div>
              <div className="text-sm text-muted-foreground">Account Detection Rate</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">98%+</div>
              <div className="text-sm text-muted-foreground">Credit Score Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">90%+</div>
              <div className="text-sm text-muted-foreground">Negative Item Detection</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">&lt;5s</div>
              <div className="text-sm text-muted-foreground">Average Processing Time</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
