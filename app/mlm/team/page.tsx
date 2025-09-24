"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { Users, TrendingUp, DollarSign, Target, Search, Filter, UserPlus, MessageSquare, Award, CalendarIcon, BarChart3, Crown, Star, Zap, ChevronRight, Mail, Phone, MapPin, Clock, Send, Copy, Download, BookOpen, Play, CheckCircle, Plus, Edit, Trash2, Eye, Settings, Bell, Gift, Trophy, Briefcase } from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface TeamMember {
  id: number
  name: string
  email: string
  phone: string
  location: string
  rank: string
  level: number
  joinDate: string
  totalEarnings: number
  monthlyEarnings: number
  teamSize: number
  personalSales: number
  teamSales: number
  status: "active" | "inactive"
  avatar: string
  performance: number
  badges: string[]
}

interface Prospect {
  id: number
  name: string
  email: string
  phone: string
  status: "contacted" | "interested" | "follow-up" | "converted"
  source: string
  notes: string
  dateAdded: string
  lastContact: string
}

interface Goal {
  id: number
  title: string
  description: string
  target: number
  current: number
  deadline: string
  category: "recruitment" | "sales" | "training" | "team-building"
  reward: string
  status: "active" | "completed" | "paused"
}

interface TrainingModule {
  id: number
  title: string
  description: string
  duration: number
  progress: number
  completed: boolean
  category: string
  lessons: number
}

const initialTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 (555) 123-4567",
    location: "New York, NY",
    rank: "Executive",
    level: 1,
    joinDate: "2024-01-15",
    totalEarnings: 12450,
    monthlyEarnings: 2850,
    teamSize: 23,
    personalSales: 5600,
    teamSales: 18900,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    performance: 92,
    badges: ["Top Performer", "Team Builder", "Sales Leader"]
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "m.chen@email.com",
    phone: "+1 (555) 234-5678",
    location: "Los Angeles, CA",
    rank: "Director",
    level: 1,
    joinDate: "2024-02-20",
    totalEarnings: 8750,
    monthlyEarnings: 1950,
    teamSize: 15,
    personalSales: 4200,
    teamSales: 12300,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    performance: 87,
    badges: ["Rising Star", "Mentor"]
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    phone: "+1 (555) 345-6789",
    location: "Miami, FL",
    rank: "Manager",
    level: 2,
    joinDate: "2024-03-10",
    totalEarnings: 5200,
    monthlyEarnings: 1200,
    teamSize: 8,
    personalSales: 2800,
    teamSales: 7500,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    performance: 78,
    badges: ["Consistent Performer"]
  },
  {
    id: 4,
    name: "David Thompson",
    email: "d.thompson@email.com",
    phone: "+1 (555) 456-7890",
    location: "Chicago, IL",
    rank: "Associate",
    level: 2,
    joinDate: "2024-04-05",
    totalEarnings: 2800,
    monthlyEarnings: 650,
    teamSize: 3,
    personalSales: 1500,
    teamSales: 3200,
    status: "active",
    avatar: "/placeholder.svg?height=40&width=40",
    performance: 65,
    badges: ["New Member"]
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.w@email.com",
    phone: "+1 (555) 567-8901",
    location: "Seattle, WA",
    rank: "Senior Associate",
    level: 3,
    joinDate: "2024-05-12",
    totalEarnings: 1200,
    monthlyEarnings: 350,
    teamSize: 1,
    personalSales: 800,
    teamSales: 1200,
    status: "inactive",
    avatar: "/placeholder.svg?height=40&width=40",
    performance: 45,
    badges: []
  }
]

const initialProspects: Prospect[] = [
  {
    id: 1,
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 111-2222",
    status: "interested",
    source: "Facebook",
    notes: "Interested in credit repair services, has good network",
    dateAdded: "2024-01-20",
    lastContact: "2024-01-22"
  },
  {
    id: 2,
    name: "Maria Garcia",
    email: "maria.g@email.com",
    phone: "+1 (555) 333-4444",
    status: "follow-up",
    source: "Referral",
    notes: "Needs more information about compensation plan",
    dateAdded: "2024-01-18",
    lastContact: "2024-01-21"
  }
]

const initialGoals: Goal[] = [
  {
    id: 1,
    title: "Recruit 5 New Team Members",
    description: "Add 5 qualified team members by end of month",
    target: 5,
    current: 3,
    deadline: "2024-02-29",
    category: "recruitment",
    reward: "$500 Bonus",
    status: "active"
  },
  {
    id: 2,
    title: "Achieve $10K Team Volume",
    description: "Reach $10,000 in total team sales volume",
    target: 10000,
    current: 7500,
    deadline: "2024-02-28",
    category: "sales",
    reward: "Rank Advancement",
    status: "active"
  }
]

const trainingModules: TrainingModule[] = [
  {
    id: 1,
    title: "MLM Fundamentals",
    description: "Learn the basics of multi-level marketing and our compensation plan",
    duration: 120,
    progress: 100,
    completed: true,
    category: "Basics",
    lessons: 8
  },
  {
    id: 2,
    title: "Advanced Prospecting",
    description: "Master the art of finding and qualifying prospects",
    duration: 90,
    progress: 65,
    completed: false,
    category: "Sales",
    lessons: 6
  },
  {
    id: 3,
    title: "Team Leadership",
    description: "Develop skills to lead and motivate your team",
    duration: 150,
    progress: 30,
    completed: false,
    category: "Leadership",
    lessons: 10
  }
]

const teamStats = {
  totalMembers: 47,
  activeMembers: 42,
  newThisMonth: 8,
  totalVolume: 125000,
  monthlyGrowth: 15.2,
  averagePerformance: 78,
  topPerformers: 12
}

const emailTemplates = [
  {
    id: 1,
    name: "Welcome New Prospect",
    subject: "Welcome to CreditAI Pro - Your Financial Freedom Awaits!",
    content: `Hi [NAME],

Thank you for your interest in CreditAI Pro! I'm excited to share this incredible opportunity with you.

Our AI-powered credit repair platform is revolutionizing how people improve their financial lives, and we're looking for motivated individuals to join our team.

Here's what makes this opportunity special:
• Help people repair their credit using cutting-edge AI
• Earn substantial commissions (30-55% on every sale)
• Multiple income streams and bonuses
• Complete training and support system
• Work from anywhere, set your own schedule

I'd love to schedule a brief call to discuss how this could work for you. Are you available for a 15-minute conversation this week?

Best regards,
[YOUR_NAME]`
  },
  {
    id: 2,
    name: "Follow-up Interested Prospect",
    subject: "Quick Question About Your Financial Goals",
    content: `Hi [NAME],

I hope you're doing well! I wanted to follow up on our conversation about the CreditAI Pro opportunity.

I know you mentioned being interested in creating additional income streams, and I think this could be perfect for you.

Just to recap what we discussed:
• Potential to earn $2,000-$10,000+ monthly
• Help people improve their credit scores
• Flexible schedule that fits your lifestyle
• Comprehensive training provided

Do you have any questions I can answer? I'm here to help you make the best decision for your future.

Would you like to schedule a quick call to discuss next steps?

Best,
[YOUR_NAME]`
  }
]

export default function TeamManagementPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers)
  const [prospects, setProspects] = useState<Prospect[]>(initialProspects)
  const [goals, setGoals] = useState<Goal[]>(initialGoals)
  
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRank, setFilterRank] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  // Modal states
  const [showAddProspect, setShowAddProspect] = useState(false)
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [showSetGoal, setShowSetGoal] = useState(false)
  const [showTraining, setShowTraining] = useState(false)
  const [showInviteMember, setShowInviteMember] = useState(false)
  
  // Form states
  const [newProspect, setNewProspect] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
    notes: ""
  })
  
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: ""
  })
  
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    target: "",
    deadline: undefined as Date | undefined,
    category: "recruitment" as Goal["category"],
    reward: ""
  })
  
  const [inviteData, setInviteData] = useState({
    email: "",
    message: "",
    template: "welcome"
  })

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRank = filterRank === "all" || member.rank.toLowerCase() === filterRank.toLowerCase()
    const matchesStatus = filterStatus === "all" || member.status === filterStatus
    
    return matchesSearch && matchesRank && matchesStatus
  })

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "executive": return "bg-purple-100 text-purple-800"
      case "director": return "bg-blue-100 text-blue-800"
      case "manager": return "bg-green-100 text-green-800"
      case "senior associate": return "bg-yellow-100 text-yellow-800"
      case "associate": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
  }

  const getProspectStatusColor = (status: string) => {
    switch (status) {
      case "contacted": return "bg-blue-100 text-blue-800"
      case "interested": return "bg-green-100 text-green-800"
      case "follow-up": return "bg-yellow-100 text-yellow-800"
      case "converted": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleAddProspect = () => {
    if (!newProspect.name || !newProspect.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const prospect: Prospect = {
      id: prospects.length + 1,
      ...newProspect,
      status: "contacted",
      dateAdded: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0]
    }

    setProspects([...prospects, prospect])
    setNewProspect({ name: "", email: "", phone: "", source: "", notes: "" })
    setShowAddProspect(false)
    
    toast({
      title: "Success",
      description: "Prospect added successfully!"
    })
  }

  const handleCreateTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would save to database
    toast({
      title: "Success",
      description: "Email template created successfully!"
    })
    
    setNewTemplate({ name: "", subject: "", content: "" })
    setShowCreateTemplate(false)
  }

  const handleSetGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    const goal: Goal = {
      id: goals.length + 1,
      title: newGoal.title,
      description: newGoal.description,
      target: parseInt(newGoal.target),
      current: 0,
      deadline: format(newGoal.deadline, "yyyy-MM-dd"),
      category: newGoal.category,
      reward: newGoal.reward,
      status: "active"
    }

    setGoals([...goals, goal])
    setNewGoal({
      title: "",
      description: "",
      target: "",
      deadline: undefined,
      category: "recruitment",
      reward: ""
    })
    setShowSetGoal(false)
    
    toast({
      title: "Success",
      description: "Goal set successfully!"
    })
  }

  const handleInviteMember = () => {
    if (!inviteData.email) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      })
      return
    }

    // In a real app, this would send the invitation
    toast({
      title: "Success",
      description: "Invitation sent successfully!"
    })
    
    setInviteData({ email: "", message: "", template: "welcome" })
    setShowInviteMember(false)
  }

  const continueTraining = (moduleId: number) => {
    toast({
      title: "Redirecting",
      description: "Opening training module..."
    })
    // In a real app, this would navigate to the training module
  }

  const copyInviteLink = () => {
    const inviteLink = "https://creditrepair.com/join/YOUR_CODE"
    navigator.clipboard.writeText(inviteLink)
    toast({
      title: "Success",
      description: "Invite link copied to clipboard!"
    })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your team performance</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showInviteMember} onOpenChange={setShowInviteMember}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Invite New Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your team
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="prospect@example.com"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template">Email Template</Label>
                  <Select value={inviteData.template} onValueChange={(value) => setInviteData({...inviteData, template: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="welcome">Welcome New Prospect</SelectItem>
                      <SelectItem value="follow-up">Follow-up Interested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invite-message">Personal Message (Optional)</Label>
                  <Textarea
                    id="invite-message"
                    placeholder="Add a personal touch to your invitation..."
                    value={inviteData.message}
                    onChange={(e) => setInviteData({...inviteData, message: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={copyInviteLink} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Invite Link
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowInviteMember(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteMember}>
                  <Send className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Team Message
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.totalMembers}</p>
                <p className="text-xs text-green-600 mt-1">+{teamStats.newThisMonth} this month</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Members</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.activeMembers}</p>
                <p className="text-xs text-gray-500 mt-1">{((teamStats.activeMembers / teamStats.totalMembers) * 100).toFixed(1)}% active rate</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Volume</p>
                <p className="text-2xl font-bold text-gray-900">${teamStats.totalVolume.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">+{teamStats.monthlyGrowth}% growth</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Performance</p>
                <p className="text-2xl font-bold text-gray-900">{teamStats.averagePerformance}%</p>
                <p className="text-xs text-blue-600 mt-1">{teamStats.topPerformers} top performers</p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterRank} onValueChange={setFilterRank}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ranks</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="senior associate">Senior Associate</SelectItem>
                    <SelectItem value="associate">Associate</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Member Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
                          <Badge className={getRankColor(member.rank)}>{member.rank}</Badge>
                          <Badge className={getStatusColor(member.status)}>{member.status}</Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {member.phone}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {member.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            Joined {new Date(member.joinDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:w-96">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Team Size</p>
                        <p className="font-semibold">{member.teamSize}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Monthly</p>
                        <p className="font-semibold text-green-600">${member.monthlyEarnings.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-semibold">${member.totalEarnings.toLocaleString()}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Performance</p>
                        <div className="flex items-center gap-1">
                          <Progress value={member.performance} className="w-12 h-2" />
                          <span className="text-sm font-medium">{member.performance}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges */}
                  {member.badges.length > 0 && (
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      {member.badges.map((badge, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <Award className="h-3 w-3 mr-1" />
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Prospects</h2>
            <Dialog open={showAddProspect} onOpenChange={setShowAddProspect}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Prospect
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Prospect</DialogTitle>
                  <DialogDescription>
                    Add a new prospect to your pipeline
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="prospect-name">Name *</Label>
                    <Input
                      id="prospect-name"
                      placeholder="John Smith"
                      value={newProspect.name}
                      onChange={(e) => setNewProspect({...newProspect, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-email">Email *</Label>
                    <Input
                      id="prospect-email"
                      type="email"
                      placeholder="john@example.com"
                      value={newProspect.email}
                      onChange={(e) => setNewProspect({...newProspect, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-phone">Phone</Label>
                    <Input
                      id="prospect-phone"
                      placeholder="+1 (555) 123-4567"
                      value={newProspect.phone}
                      onChange={(e) => setNewProspect({...newProspect, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-source">Source</Label>
                    <Select value={newProspect.source} onValueChange={(value) => setNewProspect({...newProspect, source: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="How did you find them?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="linkedin">LinkedIn</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="cold-call">Cold Call</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prospect-notes">Notes</Label>
                    <Textarea
                      id="prospect-notes"
                      placeholder="Any additional information about this prospect..."
                      value={newProspect.notes}
                      onChange={(e) => setNewProspect({...newProspect, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddProspect(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProspect}>
                    Add Prospect
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {prospects.map((prospect) => (
              <Card key={prospect.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{prospect.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{prospect.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          {prospect.email}
                          {prospect.phone && (
                            <>
                              <span>•</span>
                              <Phone className="h-3 w-3" />
                              {prospect.phone}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getProspectStatusColor(prospect.status)}>
                        {prospect.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {prospect.notes && (
                    <p className="text-sm text-gray-600 mt-2 pl-14">{prospect.notes}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-2 pl-14">
                    <span>Added: {new Date(prospect.dateAdded).toLocaleDateString()}</span>
                    <span>Last Contact: {new Date(prospect.lastContact).toLocaleDateString()}</span>
                    <span>Source: {prospect.source}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Goals</h2>
            <Dialog open={showSetGoal} onOpenChange={setShowSetGoal}>
              <DialogTrigger asChild>
                <Button>
                  <Target className="h-4 w-4 mr-2" />
                  Set New Goal
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Set New Goal</DialogTitle>
                  <DialogDescription>
                    Create a new goal to track your progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="goal-title">Goal Title *</Label>
                    <Input
                      id="goal-title"
                      placeholder="e.g., Recruit 5 new members"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-description">Description</Label>
                    <Textarea
                      id="goal-description"
                      placeholder="Describe your goal in detail..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal-target">Target *</Label>
                      <Input
                        id="goal-target"
                        type="number"
                        placeholder="5"
                        value={newGoal.target}
                        onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="goal-category">Category</Label>
                      <Select value={newGoal.category} onValueChange={(value: Goal["category"]) => setNewGoal({...newGoal, category: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recruitment">Recruitment</SelectItem>
                          <SelectItem value="sales">Sales</SelectItem>
                          <SelectItem value="training">Training</SelectItem>
                          <SelectItem value="team-building">Team Building</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Deadline *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newGoal.deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newGoal.deadline ? format(newGoal.deadline, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newGoal.deadline}
                          onSelect={(date) => setNewGoal({...newGoal, deadline: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goal-reward">Reward</Label>
                    <Input
                      id="goal-reward"
                      placeholder="e.g., $500 bonus, Rank advancement"
                      value={newGoal.reward}
                      onChange={(e) => setNewGoal({...newGoal, reward: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowSetGoal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSetGoal}>
                    Set Goal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{goal.title}</h3>
                        <Badge variant="outline">{goal.category}</Badge>
                        <Badge className={goal.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                          {goal.status}
                        </Badge>
                      </div>
                      {goal.description && (
                        <p className="text-gray-600 mb-3">{goal.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                        {goal.reward && <span>Reward: {goal.reward}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600">
                        {goal.current}/{goal.target}
                      </div>
                      <div className="text-sm text-gray-600">
                        {Math.round((goal.current / goal.target) * 100)}% complete
                      </div>
                    </div>
                  </div>
                  <Progress value={(goal.current / goal.target) * 100} className="h-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Training Modules</h2>
            <Button variant="outline">
              <BookOpen className="h-4 w-4 mr-2" />
              View All Courses
            </Button>
          </div>

          <div className="grid gap-4">
            {trainingModules.map((module) => (
              <Card key={module.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{module.title}</h3>
                        <Badge variant="outline">{module.category}</Badge>
                        {module.completed && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{module.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.duration} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {module.lessons} lessons
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {module.progress}%
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => continueTraining(module.id)}
                        variant={module.completed ? "outline" : "default"}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        {module.completed ? "Review" : module.progress > 0 ? "Continue" : "Start"}
                      </Button>
                    </div>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Email Templates</h2>
            <Dialog open={showCreateTemplate} onOpenChange={setShowCreateTemplate}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable email template for your team
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name *</Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Welcome New Prospect"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Subject Line *</Label>
                    <Input
                      id="template-subject"
                      placeholder="e.g., Welcome to CreditAI Pro!"
                      value={newTemplate.subject}
                      onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-content">Email Content *</Label>
                    <Textarea
                      id="template-content"
                      placeholder="Write your email template here... Use [NAME] for personalization"
                      value={newTemplate.content}
                      onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                      rows={10}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateTemplate(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTemplate}>
                    Create Template
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {emailTemplates.map((template) => (
              <Card key={template.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <div className="bg-gray-50 p-3 rounded border-l-4 border-blue-500 mb-3">
                        <p className="font-medium text-sm">Subject:</p>
                        <p className="text-sm">{template.subject}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded max-h-32 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-sans">{template.content.substring(0, 200)}...</pre>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
