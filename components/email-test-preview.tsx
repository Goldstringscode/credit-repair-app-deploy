"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Mail,
  Send,
  Eye,
  TestTube,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download,
  Copy,
  ExternalLink
} from "lucide-react"

interface EmailTestPreviewProps {
  template?: {
    id: string
    name: string
    subject: string
    content: string
    category: string
  }
  onSendTest?: (email: string, name: string) => Promise<void>
  onPreview?: (content: string) => void
}

export function EmailTestPreview({ 
  template, 
  onSendTest, 
  onPreview 
}: EmailTestPreviewProps) {
  const [testEmail, setTestEmail] = useState("test@example.com")
  const [testName, setTestName] = useState("Test User")
  const [isSending, setIsSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  const handleSendTest = async () => {
    if (!onSendTest) return
    
    setIsSending(true)
    setSendResult(null)
    
    try {
      await onSendTest(testEmail, testName)
      setSendResult({
        success: true,
        message: `Test email sent successfully to ${testEmail}`
      })
    } catch (error) {
      setSendResult({
        success: false,
        message: `Failed to send test email: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsSending(false)
    }
  }

  const handlePreview = () => {
    if (onPreview && template) {
      onPreview(template.content)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadTemplate = () => {
    if (!template) return
    
    const element = document.createElement('a')
    const file = new Blob([template.content], { type: 'text/html' })
    element.href = URL.createObjectURL(file)
    element.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.html`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  if (!template) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No template selected for testing</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Template Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TestTube className="h-5 w-5" />
              <span>Test Email Template</span>
            </div>
            <Badge variant="outline">{template.category}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Template Name</Label>
              <p className="text-lg font-semibold">{template.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Subject Line</Label>
              <p className="text-sm text-gray-600">{template.subject}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Test Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="testEmail">Test Email Address</Label>
                <Input
                  id="testEmail"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="testName">Test User Name</Label>
                <Input
                  id="testName"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="Test User"
                />
              </div>
            </div>

            {sendResult && (
              <Alert className={sendResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {sendResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={sendResult.success ? "text-green-800" : "text-red-800"}>
                  {sendResult.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSendTest}
                disabled={isSending || !onSendTest}
                className="flex-1"
              >
                {isSending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSending ? "Sending..." : "Send Test Email"}
              </Button>
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!onPreview}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ExternalLink className="h-5 w-5" />
            <span>Template Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => copyToClipboard(template.content)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy HTML
            </Button>
            <Button
              variant="outline"
              onClick={() => copyToClipboard(template.subject)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Subject
            </Button>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Template Preview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <div className="text-sm text-gray-600">
                <strong>From:</strong> Credit Repair AI &lt;noreply@creditrepairapp.com&gt;
              </div>
              <div className="text-sm text-gray-600">
                <strong>To:</strong> {testName} &lt;{testEmail}&gt;
              </div>
              <div className="text-sm text-gray-600">
                <strong>Subject:</strong> {template.subject}
              </div>
            </div>
            <div 
              className="p-4 bg-white max-h-96 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: template.content }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
