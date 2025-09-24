"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  UserPlus,
  Mail,
  MessageSquare,
  Share2,
  Target,
  Calendar,
  Phone,
  Video,
  Send,
  Copy,
  Download,
  Star,
  TrendingUp,
  Award,
} from "lucide-react"

interface TeamBuilderProps {
  userId: string
}

export function TeamBuilder({ userId }: TeamBuilderProps) {
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteMessage, setInviteMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("welcome")
  const [copied, setCopied] = useState(false)

  const inviteTemplates = [
    {
      id: "welcome",
      name: "Welcome & Opportunity",
      subject: "Exciting Business Opportunity - Transform Lives & Earn Income",
      message: `Hi [NAME],

I hope this message finds you well! I wanted to reach out because I've discovered an incredible opportunity that I think would be perfect for you.

I've joined CreditAI Pro's business opportunity program, and it's been absolutely life-changing. We help people repair their credit using cutting-edge AI technology, and the income potential is amazing.

Here's what makes this special:
• Help people improve their financial lives
• Earn 30-55% commissions on every referral
• Multiple income streams (7 different ways to earn!)
• Complete training and support system
• Work from anywhere, set your own schedule

I genuinely believe you'd be fantastic at this, and I'd love to personally mentor you to success.

Would you be open to a quick 15-minute call this week to learn more? No pressure at all - just want to share this opportunity with people I care about.

Best regards,
[YOUR_NAME]

P.S. The company is growing rapidly, and they're only accepting a limited number of new partners this month.`,
    },
    {
      id: "financial_freedom",
      name: "Financial Freedom Focus",
      subject: "Ready to Take Control of Your Financial Future?",
      message: `Hey [NAME],

I've been thinking about our conversation regarding financial goals, and I have something exciting to share with you.

I recently partnered with CreditAI Pro, and it's opened up incredible income opportunities while helping people improve their credit scores and financial lives.

What caught my attention:
• Multiple 6-figure earners in the company
• Recession-proof industry (credit repair)
• Comprehensive training program
• Supportive community of entrepreneurs
• Flexible schedule that fits your lifestyle

The best part? You don't need any prior experience. They provide everything you need to succeed.

I'm personally committed to helping my team members reach their financial goals, and I'd love to discuss how this could work for you.

Are you available for a brief call this week?

Talk soon,
[YOUR_NAME]`,
    },
    {
      id: "help_others",
      name: "Help Others Focus",
      subject: "Make a Real Difference While Building Your Future",
      message: `Hi [NAME],

I know how much you care about helping others, which is why I thought of you for this opportunity.

I've joined an amazing company called CreditAI Pro that uses AI technology to help people repair their credit and transform their financial lives. The impact we're making is incredible - we're literally changing lives every day.

But here's the beautiful part - while we're helping others, we're also building substantial income:
• Direct commissions on every person we help
• Team building bonuses
• Leadership rewards
• Long-term residual income

It's the perfect combination of purpose and profit.

I'm building a team of like-minded people who want to make a difference while securing their own financial future. Your heart for helping others would make you perfect for this.

Would you be interested in learning more? I'd love to share some success stories and show you exactly how this works.

Let me know when you're free for a quick chat!

With gratitude,
[YOUR_NAME]`,
    },
  ]

  const prospectingTools = [
    {
      name: "Social Media Scripts",
      description: "Ready-to-use posts for Facebook, Instagram, and LinkedIn",
      icon: Share2,
      action: "Download Scripts",
    },
    {
      name: "Email Templates",
      description: "Professional email sequences for follow-up campaigns",
      icon: Mail,
      action: "View Templates",
    },
    {
      name: "Presentation Slides",
      description: "Complete business presentation with income examples",
      icon: Target,
      action: "Download Slides",
    },
    {
      name: "Success Stories",
      description: "Real testimonials and case studies to share",
      icon: Star,
      action: "View Stories",
    },
    {
      name: "Objection Handlers",
      description: "Responses to common questions and concerns",
      icon: MessageSquare,
      action: "Study Responses",
    },
    {
      name: "Income Calculator",
      description: "Show prospects their earning potential",
      icon: TrendingUp,
      action: "Use Calculator",
    },
  ]

  const teamGoals = [
    {
      title: "Recruit 5 New Team Members",
      current: 3,
      target: 5,
      deadline: "End of Month",
      reward: "$500 Bonus",
      progress: 60,
    },
    {
      title: "Achieve $10K Team Volume",
      current: 7200,
      target: 10000,
      deadline: "This Month",
      reward: "Rank Advancement",
      progress: 72,
    },
    {
      title: "Help 3 Members Reach Consultant",
      current: 1,
      target: 3,
      deadline: "Next 60 Days",
      reward: "Leadership Bonus",
      progress: 33,
    },
  ]

  const upcomingEvents = [
    {
      title: "Weekly Team Training Call",
      date: "Today, 8:00 PM EST",
      type: "Training",
      attendees: 23,
    },
    {
      title: "New Member Orientation",
      date: "Tomorrow, 7:00 PM EST",
      type: "Onboarding",
      attendees: 8,
    },
    {
      title: "Success Stories Webinar",
      date: "Friday, 8:00 PM EST",
      type: "Motivation",
      attendees: 156,
    },
    {
      title: "Monthly Recognition Event",
      date: "Jan 31, 7:00 PM EST",
      type: "Recognition",
      attendees: 89,
    },
  ]

  const sendInvite = () => {
    // In real app, would send email invitation
    console.log("Sending invite to:", inviteEmail)
    setInviteEmail("")
    setInviteMessage("")
  }

  const copyInviteLink = () => {
    const inviteLink = `https://creditrepair.com/join/CREDITPRO2024`
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const selectedTemplateData = inviteTemplates.find((t) => t.id === selectedTemplate)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="invite" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="invite">Invite</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Invite Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserPlus className="h-5 w-5 mr-2" />
                  Invite New Team Member
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {inviteTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Prospect Email</label>
                  <Input
                    type="email"
                    placeholder="prospect@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Personal Message (Optional)</label>
                  <Textarea
                    placeholder="Add a personal touch to your invitation..."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button onClick={sendInvite} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={copyInviteLink}>
                    {copied ? "Copied!" : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Template Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Email Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplateData && (
                  <div className="space-y-4">
                    <div className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                      <p className="font-medium text-sm">Subject:</p>
                      <p className="text-sm">{selectedTemplateData.subject}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded max-h-64 overflow-y-auto">
                      <pre className="text-sm whitespace-pre-wrap font-sans">{selectedTemplateData.message}</pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Invite Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Mail className="h-6 w-6 mb-2" />
                  Email Campaign
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  SMS Invite
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Share2 className="h-6 w-6 mb-2" />
                  Social Media
                </Button>
                <Button variant="outline" className="h-20 flex-col bg-transparent">
                  <Phone className="h-6 w-6 mb-2" />
                  Schedule Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prospecting & Recruiting Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prospectingTools.map((tool, index) => (
                  <div key={index} className="p-6 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <tool.icon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{tool.name}</h4>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                    <Button variant="outline" className="w-full bg-transparent">
                      {tool.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Marketing Materials */}
          <Card>
            <CardHeader>
              <CardTitle>Marketing Materials Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg text-center">
                  <Download className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium mb-1">Business Cards</h5>
                  <p className="text-sm text-gray-600 mb-3">Professional business card templates</p>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Download className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h5 className="font-medium mb-1">Brochures</h5>
                  <p className="text-sm text-gray-600 mb-3">Detailed opportunity brochures</p>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Download className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h5 className="font-medium mb-1">Flyers</h5>
                  <p className="text-sm text-gray-600 mb-3">Eye-catching promotional flyers</p>
                  <Button size="sm" variant="outline">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Team Building Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamGoals.map((goal, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold">{goal.title}</h4>
                      <Badge className="bg-green-100 text-green-800">{goal.reward}</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>
                          Progress: {goal.current} / {goal.target}
                        </span>
                        <span>Deadline: {goal.deadline}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${goal.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">{goal.progress}% complete</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goal Setting */}
          <Card>
            <CardHeader>
              <CardTitle>Set New Goal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recruitment">Recruitment</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="rank">Rank Advancement</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target</label>
                  <Input type="number" placeholder="Enter target number" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Deadline</label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reward</label>
                <Input placeholder="What will you reward yourself with?" />
              </div>
              <Button className="w-full">
                <Target className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Upcoming Team Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{event.title}</h4>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{event.type}</Badge>
                          <span className="text-xs text-gray-500">{event.attendees} attending</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Video className="h-4 w-4 mr-1" />
                        Join
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-4 w-4 mr-1" />
                        Add to Calendar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Schedule Event */}
          <Card>
            <CardHeader>
              <CardTitle>Schedule Team Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Title</label>
                  <Input placeholder="Enter event title" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="motivation">Motivation</SelectItem>
                      <SelectItem value="recognition">Recognition</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Input type="time" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea placeholder="Event description and agenda..." rows={3} />
              </div>
              <Button className="w-full">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Event
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Team Training Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Comprehensive Training Library</h3>
                <p className="text-gray-600 mb-4">
                  Access our complete MLM training curriculum and team development resources
                </p>
                <Button>Access Training Portal</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
