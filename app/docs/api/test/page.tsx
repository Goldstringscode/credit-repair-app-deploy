"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Copy, Loader2 } from "lucide-react"

const endpoints = [
  { method: "GET", path: "/api/status", description: "API Status Check" },
  { method: "POST", path: "/api/auth/login", description: "User Login" },
  { method: "GET", path: "/api/users/me", description: "Get User Profile" },
  { method: "GET", path: "/api/credit/scores", description: "Get Credit Scores" },
  { method: "POST", path: "/api/disputes", description: "Create Dispute" },
]

export default function APITestPage() {
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0])
  const [requestBody, setRequestBody] = useState("")
  const [authToken, setAuthToken] = useState("")
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [responseTime, setResponseTime] = useState<number | null>(null)

  const handleSendRequest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      const headers: any = {
        "Content-Type": "application/json",
      }

      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`
      }

      const options: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      }

      if (requestBody && (selectedEndpoint.method === "POST" || selectedEndpoint.method === "PUT")) {
        options.body = requestBody
      }

      const res = await fetch(`https://api.creditaipro.com/v1${selectedEndpoint.path}`, options)
      const data = await res.json()
      setResponse(JSON.stringify(data, null, 2))
      setResponseTime(Date.now() - startTime)
    } catch (error) {
      setResponse(JSON.stringify({ error: "Request failed" }, null, 2))
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    navigator.clipboard.writeText(response)
  }

  const downloadResponse = () => {
    const blob = new Blob([response], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "api-response.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  const getStatusColor = (status: number | null) => {
    if (!status) return "bg-gray-100 text-gray-800"
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800"
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800"
    if (status >= 500) return "bg-red-100 text-red-800"
    return "bg-gray-100 text-gray-800"
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">API Testing Console</h1>
        <p className="text-xl text-gray-600">Test API endpoints interactively and see real-time responses.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Request Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="block text-sm font-medium mb-2">Quick Select</Label>
              <Select
                value={selectedEndpoint.path}
                onValueChange={(path) => setSelectedEndpoint(endpoints.find((e) => e.path === path) || endpoints[0])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an endpoint..." />
                </SelectTrigger>
                <SelectContent>
                  {endpoints.map((endpoint) => (
                    <SelectItem key={endpoint.path} value={endpoint.path}>
                      <div className="flex items-center space-x-2">
                        <Badge
                          className={
                            endpoint.method === "GET" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                          }
                        >
                          {endpoint.method}
                        </Badge>
                        <span>{endpoint.path}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Input
                placeholder="Authorization Token"
                value={authToken}
                onChange={(e) => setAuthToken(e.target.value)}
                className="flex-1"
              />
            </div>

            <Tabs defaultValue="body" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>

              <TabsContent value="body" className="space-y-2">
                <Textarea
                  placeholder="Request body (JSON format)"
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              </TabsContent>
            </Tabs>

            <Button onClick={handleSendRequest} disabled={loading} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Response Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Response</CardTitle>
              <div className="flex items-center space-x-2">
                {response && (
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    {responseTime && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4" />
                        <span>{responseTime}ms</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={copyResponse} disabled={!response}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : response ? (
                <pre className="text-sm overflow-auto whitespace-pre-wrap">{response}</pre>
              ) : (
                <div className="text-gray-500 text-center py-8">Send a request to see the response here</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Examples */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {endpoints.map((endpoint) => (
              <Button
                key={endpoint.path}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 bg-transparent"
                onClick={() => setSelectedEndpoint(endpoint)}
              >
                <Badge
                  className={endpoint.method === "GET" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
                >
                  {endpoint.method}
                </Badge>
                <span className="font-medium">{endpoint.description}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
