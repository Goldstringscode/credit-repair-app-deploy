"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
} from "recharts"
import {
  TrendingUp,
  Users,
  Clock,
  Star,
  Play,
  Eye,
  BookOpen,
  Award,
  MessageSquare,
  Share,
  Target,
  Zap,
} from "lucide-react"
import type { Playlist } from "@/lib/playlist-system"
import { formatDuration } from "@/lib/playlist-system"

interface PlaylistAnalyticsProps {
  playlist: Playlist
}

export function PlaylistAnalyticsComponent({ playlist }: PlaylistAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any | null>(null)
  const [timeRange, setTimeRange] = useState("30d")

  // Mock analytics data - in real app, this would come from API
  useEffect(() => {
    const mockAnalytics = {
      playlistId: playlist.id,
      totalViews: 15420,
      averageCompletionRate: 78.5,
      averageRating: 4.7,
      dropOffPoints: [
        { videoId: "video-1", percentage: 15 },
        { videoId: "video-2", percentage: 25 },
        { videoId: "video-3", percentage: 35 },
      ],
      engagementMetrics: {
        averageWatchTime: 1680, // 28 minutes
        replayRate: 12.3,
        notesTaken: 2847,
        bookmarksCreated: 1523,
      },
      popularVideos: [
        { videoId: "video-1", views: 8420, rating: 4.8 },
        { videoId: "video-2", views: 7230, rating: 4.6 },
        { videoId: "video-3", views: 6890, rating: 4.7 },
      ],
      userFeedback: [
        {
          rating: 5,
          comment: "Excellent content! Very comprehensive and well-structured.",
          userId: "user-1",
          createdAt: "2024-01-20T10:00:00Z",
        },
        {
          rating: 4,
          comment: "Good playlist but could use more practical examples.",
          userId: "user-2",
          createdAt: "2024-01-19T15:30:00Z",
        },
        {
          rating: 5,
          comment: "Perfect for beginners. Clear explanations and great pacing.",
          userId: "user-3",
          createdAt: "2024-01-18T09:15:00Z",
        },
      ],
    }
    setAnalytics(mockAnalytics)
  }, [playlist.id])

  if (!analytics) {
    return <div>Loading analytics...</div>
  }

  // Chart data
  const viewsData = [
    { name: "Week 1", views: 2400, completions: 1800 },
    { name: "Week 2", views: 3200, completions: 2500 },
    { name: "Week 3", views: 2800, completions: 2200 },
    { name: "Week 4", views: 4100, completions: 3200 },
  ]

  const engagementData = [
    { name: "Mon", engagement: 65 },
    { name: "Tue", engagement: 78 },
    { name: "Wed", engagement: 82 },
    { name: "Thu", engagement: 75 },
    { name: "Fri", engagement: 88 },
    { name: "Sat", engagement: 72 },
    { name: "Sun", engagement: 69 },
  ]

  const completionData = [
    { name: "Started", value: 100, color: "#3b82f6" },
    { name: "25% Complete", value: 85, color: "#10b981" },
    { name: "50% Complete", value: 68, color: "#f59e0b" },
    { name: "75% Complete", value: 52, color: "#ef4444" },
    { name: "Completed", value: 42, color: "#8b5cf6" },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold">{analytics.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-3xl font-bold">{analytics.averageCompletionRate}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+3.2%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Rating</p>
                <p className="text-3xl font-bold">{analytics.averageRating}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+0.3</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Watch Time</p>
                <p className="text-3xl font-bold">{formatDuration(analytics.engagementMetrics.averageWatchTime)}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+5.8%</span>
              <span className="text-gray-600 ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="videos">Video Performance</TabsTrigger>
          <TabsTrigger value="feedback">User Feedback</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Views and Completions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Views vs Completions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#3b82f6" name="Views" />
                    <Bar dataKey="completions" fill="#10b981" name="Completions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Completion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.engagementMetrics.notesTaken.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Notes Taken</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {analytics.engagementMetrics.bookmarksCreated.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Bookmarks Created</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Play className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{analytics.engagementMetrics.replayRate}%</div>
                <div className="text-sm text-gray-600">Replay Rate</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">{playlist.enrollmentCount.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="engagement" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Drop-off Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.dropOffPoints.map((point: any, index: number) => {
                    const video = playlist.videos.find((v) => v.id === point.videoId)
                    return (
                      <div key={point.videoId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{video?.title || `Video ${index + 1}`}</span>
                          <span className="text-sm text-red-600">{point.percentage}% drop-off</span>
                        </div>
                        <Progress value={100 - point.percentage} className="h-2" />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Zap className="h-5 w-5 text-yellow-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Peak Engagement</div>
                      <div className="text-sm text-gray-600">Fridays show highest engagement at 88%</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Growing Trend</div>
                      <div className="text-sm text-gray-600">Note-taking increased by 23% this month</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Optimization Opportunity</div>
                      <div className="text-sm text-gray-600">Video 2 has highest drop-off rate</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.popularVideos.map((videoData: any, index: number) => {
                  const video = playlist.videos.find((v) => v.id === videoData.videoId)
                  return (
                    <div
                      key={videoData.videoId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-8 bg-gray-300 rounded flex items-center justify-center">
                          <Play className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{video?.title || `Video ${index + 1}`}</div>
                          <div className="text-sm text-gray-600">{formatDuration(video?.duration || 0)}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="font-medium">{videoData.views.toLocaleString()}</div>
                          <div className="text-xs text-gray-600">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {videoData.rating}
                          </div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                        <Badge variant="outline">#{index + 1} Popular</Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent User Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analytics.userFeedback.map((feedback: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating ? "text-yellow-500 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Badge variant="outline">Verified User</Badge>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-green-800">Strong Performance</div>
                        <div className="text-sm text-green-700">Completion rate is 15% above platform average</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-blue-800">High Engagement</div>
                        <div className="text-sm text-blue-700">Users are taking 2.3x more notes than average</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <div className="font-medium text-yellow-800">Optimization Opportunity</div>
                        <div className="text-sm text-yellow-700">
                          Consider adding interactive elements to reduce drop-off
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Award className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Add Certificates</div>
                      <div className="text-sm text-gray-600">
                        High completion rate suggests users would value certificates
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Enable Discussions</div>
                      <div className="text-sm text-gray-600">
                        High note-taking activity indicates desire for interaction
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Share className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-medium">Promote Sharing</div>
                      <div className="text-sm text-gray-600">High ratings suggest content is worth sharing</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
