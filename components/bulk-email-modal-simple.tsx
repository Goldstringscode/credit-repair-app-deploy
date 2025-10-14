import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Send, Loader2, X } from 'lucide-react'
import { Subscription } from '@/lib/subscription-service'

interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  subscriptions: Subscription[]
  selectedSubscriptions?: Subscription[]
}

export default function BulkEmailModal({
  isOpen,
  onClose,
  subscriptions,
  selectedSubscriptions = []
}: BulkEmailModalProps) {
  const [emailData, setEmailData] = useState({
    subject: '',
    body: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent'
  })
  
  const [recipients, setRecipients] = useState<Subscription[]>(selectedSubscriptions)
  const [sending, setSending] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<{
    sent: number
    failed: number
    errors: string[]
  }>({ sent: 0, failed: 0, errors: [] })

  const handleSendBulkEmail = async () => {
    if (!emailData.subject.trim() || !emailData.body.trim()) {
      alert('Please fill in both subject and body')
      return
    }

    if (recipients.length === 0) {
      alert('Please select at least one recipient')
      return
    }

    setSending(true)
    setProgress(0)
    setResults({ sent: 0, failed: 0, errors: [] })

    try {
      console.log('Sending bulk emails to', recipients.length, 'recipients')
      
      // Simulate bulk email sending
      let sent = 0
      let failed = 0
      const errors: string[] = []

      for (let i = 0; i < recipients.length; i++) {
        const subscription = recipients[i]
        
        try {
          // Simulate individual email sending
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          console.log(`Sending email to ${subscription.customerEmail}: ${emailData.subject}`)
          sent++
        } catch (error) {
          console.error(`Failed to send email to ${subscription.customerEmail}:`, error)
          failed++
          errors.push(`Failed to send to ${subscription.customerEmail}`)
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / recipients.length) * 100))
      }

      setResults({
        sent,
        failed,
        errors
      })

      if (sent > 0) {
        alert(`Bulk email completed! ${sent} emails sent, ${failed} failed.`)
      } else {
        alert(`Failed to send bulk emails. ${errors.join(', ')}`)
      }

    } catch (error) {
      console.error('Error sending bulk emails:', error)
      alert(`Error sending bulk emails: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSending(false)
    }
  }

  const handleAddAll = () => {
    setRecipients(subscriptions)
  }

  const handleClearAll = () => {
    setRecipients([])
  }

  const handleRemoveRecipient = (subscriptionId: string) => {
    setRecipients(prev => prev.filter(r => r.id !== subscriptionId))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Bulk Email
            <Badge variant="secondary">{recipients.length} recipients</Badge>
          </DialogTitle>
          <DialogDescription>
            Send emails to multiple customers at once
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={emailData.body}
                  onChange={(e) => setEmailData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Email message"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recipients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddAll}>
                  Add All ({subscriptions.length})
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearAll}>
                  Clear All
                </Button>
              </div>

              <div className="max-h-32 overflow-y-auto space-y-2">
                {recipients.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{subscription.customerName}</p>
                      <p className="text-xs text-gray-600">{subscription.customerEmail}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRecipient(subscription.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Progress */}
          {sending && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Sending Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sending emails...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {results.sent > 0 || results.failed > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-green-600">
                    ✓ {results.sent} emails sent successfully
                  </div>
                  {results.failed > 0 && (
                    <div className="text-red-600">
                      ✗ {results.failed} emails failed
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSendBulkEmail} disabled={sending}>
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send to {recipients.length} recipients
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
