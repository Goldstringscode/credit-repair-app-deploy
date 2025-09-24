"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calculator, FileText, Mail, MessageSquare, Share2, Download, Copy, Settings, Zap, Target, BarChart3, Users, DollarSign, Calendar, Clock, CheckCircle, AlertCircle, Smartphone, Globe, Link, Image, Video, Megaphone, TrendingUp, PieChart, Activity } from 'lucide-react'

const businessTools = [
  {
    id: 1,
    name: "Commission Calculator",
    description: "Calculate potential earnings based on sales and team performance",
    icon: <Calculator className="h-6 w-6" />,
    category: "calculators",
    premium: false,
    popular: true
  },
  {
    id: 2,
    name: "ROI Calculator",
    description: "Analyze return on investment for marketing campaigns",
    icon: <TrendingUp className="h-6 w-6" />,
    category: "calculators",
    premium: true,
    popular: false
  },
  {
    id: 3,
    name: "Team Performance Tracker",
    description: "Monitor and analyze your team's performance metrics",
    icon: <BarChart3 className="h-6 w-6" />,
    category: "analytics",
    premium: true,
    popular: true
  },
  {
    id: 4,
    name: "Email Templates",
    description: "Pre-designed email templates for recruitment and follow-ups",
    icon: <Mail className="h-6 w-6" />,
    category: "templates",
    premium: false,
    popular: true
  },
  {
    id: 5,
    name: "Social Media Scheduler",
    description: "Schedule and automate your social media posts",
    icon: <Calendar className="h-6 w-6" />,
    category: "automation",
    premium: true,
    popular: false
  },
  {
    id: 6,
    name: "Lead Generation Forms",
    description: "Customizable forms to capture potential leads",
    icon: <FileText className="h-6 w-6" />,
    category: "marketing",
    premium: false,
    popular: true
  }
]

const templates = [
  {
    id: 1,
    name: "Welcome Email",
    type: "email",
    description: "Welcome new team members with this professional template",
    category: "onboarding",
    downloads: 1250
  },
  {
    id: 2,
    name: "Follow-up Sequence",
    type: "email",
    description: "5-part email sequence for prospect nurturing",
    category: "sales",
    downloads: 890
  },
  {
    id: 3,
    name: "Social Media Post Pack",
    type: "social",
    description: "30 ready-to-use social media posts",
    category: "marketing",
    downloads: 2100
  },
  {
    id: 4,
    name: "Presentation Slides",
    type: "presentation",
    description: "Professional MLM opportunity presentation",
    category: "sales",
    downloads: 750
  }
]

const automationRules = [
  {
    id: 1,
    name: "New Member Welcome",
    trigger: "Member joins team",
    action: "Send welcome email sequence",
    status: "active",
    executions: 45
  },
  {
    id: 2,
    name: "Inactive Member Follow-up",
    trigger: "No activity for 7 days",
    action: "Send re-engagement email",
    status: "active",
    executions: 23
  },
  {
    id: 3,
    name: "Achievement Celebration",
    trigger: "Member reaches new rank",
    action: "Send congratulations message",
    status: "paused",
    executions: 12
  }
]

export default function BusinessToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [calculatorValues, setCalculatorValues] = useState({
    personalSales: 5000,
    teamSales: 15000,
    teamSize: 10,
    rank: "director"
  })

  const filteredTools = businessTools.filter(tool => 
    selectedCategory === "all" || tool.category === selectedCategory
  )

  const calculateCommission = () => {
    const personalCommission = calculatorValues.personalSales * 0.25
    const teamCommission = calculatorValues.teamSales * 0.05
    const rankBonus = calculatorValues.rank === "executive" ? 500 : calculatorValues.rank === "director" ? 200 : 0
    return personalCommission + teamCommission + rankBonus
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "paused": return "bg-yellow-100 text-yellow-800"
      case "inactive": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Tools</h1>
          <p className="text-gray-600 mt-1">Powerful tools to grow your MLM business</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="calculators">Calculators</SelectItem>
              <SelectItem value="templates">Templates</SelectItem>
              <SelectItem value="automation">Automation</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tools Available</p>
                <p className="text-2xl font-bold text-gray-900">{businessTools.length}</p>
                <p className="text-xs text-blue-600 mt-1">{businessTools.filter(t => t.premium).length} premium</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Used</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
                <p className="text-xs text-green-600 mt-1">+8 this month</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Automations</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
                <p className="text-xs text-purple-600 mt-1">2 active</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">12h</p>
                <p className="text-xs text-yellow-600 mt-1">this week</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tools" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tools">All Tools</TabsTrigger>
          <TabsTrigger value="calculators">Calculators</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{tool.name}</h3>
                        {tool.premium && <Badge className="bg-yellow-100 text-yellow-800">Pro</Badge>}
                        {tool.popular && <Badge className="bg-blue-100 text-blue-800">Popular</Badge>}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      <Button className="w-full">
                        {tool.premium ? "Upgrade to Use" : "Use Tool"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calculators" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>Commission Calculator</CardTitle>
                <CardDescription>Calculate your potential monthly earnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Personal Sales ($)</label>
                  <Input
                    type="number"
                    value={calculatorValues.personalSales}
                    onChange={(e) => setCalculatorValues({...calculatorValues, personalSales: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Team Sales ($)</label>
                  <Input
                    type="number"
                    value={calculatorValues.teamSales}
                    onChange={(e) => setCalculatorValues({...calculatorValues, teamSales: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Team Size</label>
                  <Input
                    type="number"
                    value={calculatorValues.teamSize}
                    onChange={(e) => setCalculatorValues({...calculatorValues, teamSize: Number(e.target.value)})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Current Rank</label>
                  <Select value={calculatorValues.rank} onValueChange={(value) => setCalculatorValues({...calculatorValues, rank: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="associate">Associate</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Estimated Monthly Commission:</span>
                    <span className="text-2xl font-bold text-green-600">${calculateCommission().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>ROI Calculator</CardTitle>
                <CardDescription>Calculate return on investment for marketing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Marketing Investment ($)</label>
                  <Input type="number" placeholder="1000" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Revenue Generated ($)</label>
                  <Input type="number" placeholder="3000" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Time Period (months)</label>
                  <Input type="number" placeholder="3" className="mt-1" />
                </div>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-semibold text-green-600">200%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly ROI:</span>
                      <span className="font-semibold">66.7%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Profit:</span>
                      <span className="font-semibold">$2,000</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{template.category}</Badge>
                        <Badge variant="secondary">{template.type}</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{template.downloads} downloads</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Template Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Template Categories</CardTitle>
              <CardDescription>Browse templates by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Email Templates</p>
                  <p className="text-sm text-gray-600">12 templates</p>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <Share2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Social Media</p>
                  <p className="text-sm text-gray-600">8 templates</p>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Presentations</p>
                  <p className="text-sm text-gray-600">5 templates</p>
                </div>
                <div className="text-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="font-medium">Messages</p>
                  <p className="text-sm text-gray-600">15 templates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Automations */}
            <Card>
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
                <CardDescription>Manage your automated workflows</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Trigger:</span> {rule.trigger}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Action:</span> {rule.action}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(rule.status)}>{rule.status}</Badge>
                        <span className="text-xs text-gray-500">{rule.executions} executions</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.status === "active"} />
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full">
                  <Zap className="h-4 w-4 mr-2" />
                  Create New Automation
                </Button>
              </CardContent>
            </Card>

            {/* Automation Builder */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Automation Builder</CardTitle>
                <CardDescription>Create a new automation workflow</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Automation Name</label>
                  <Input placeholder="Enter automation name" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Trigger Event</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new-member">New member joins</SelectItem>
                      <SelectItem value="inactive">Member becomes inactive</SelectItem>
                      <SelectItem value="achievement">Achievement unlocked</SelectItem>
                      <SelectItem value="sales-goal">Sales goal reached</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Action to Take</label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="send-email">Send email</SelectItem>
                      <SelectItem value="send-sms">Send SMS</SelectItem>
                      <SelectItem value="create-task">Create task</SelectItem>
                      <SelectItem value="notify-admin">Notify admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Message Template</label>
                  <Textarea placeholder="Enter your message template..." className="mt-1" />
                </div>
                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Automation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Automation Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Performance</CardTitle>
              <CardDescription>Track the effectiveness of your automations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-2xl font-bold">156</p>
                  <p className="text-sm text-gray-600">Total Executions</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="text-2xl font-bold">94%</p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="text-2xl font-bold">12h</p>
                  <p className="text-sm text-gray-600">Time Saved</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <p className="text-2xl font-bold">+23%</p>
                  <p className="text-sm text-gray-600">Efficiency Gain</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
