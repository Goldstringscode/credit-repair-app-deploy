"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Code, Copy, Play, Shield, Zap, Globe } from "lucide-react"
import Link from "next/link"

const endpoints = [
  {
    method: "POST",
    path: "/api/auth/login",
    description: "Authenticate user and get access token",
    category: "Authentication",
    example: {
      request: {
        email: "user@example.com",
        password: "password123",
      },
      response: {
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        user: {
          id: "user_123",
          email: "user@example.com",
          subscription: "pro",
        },
      },
    },
  },
  {
    method: "GET",
    path: "/api/users/me",
    description: "Get current user profile",
    category: "User Management",
    example: {
      response: {
        id: "user_123",
        email: "user@example.com",
        name: "John Doe",
        subscription: "pro",
        usage: {
          letters: 15,
          reports: 3,
          disputes: 8,
        },
      },
    },
  },
  {
    method: "GET",
    path: "/api/credit/scores",
    description: "Get user's credit scores",
    category: "Credit Reports",
    example: {
      response: {
        scores: [
          { bureau: "Experian", score: 720, date: "2024-01-15" },
          { bureau: "Equifax", score: 715, date: "2024-01-15" },
          { bureau: "TransUnion", score: 725, date: "2024-01-15" },
        ],
        trend: "+15 points this month",
      },
    },
  },
  {
    method: "POST",
    path: "/api/disputes",
    description: "Create a new dispute",
    category: "Disputes",
    example: {
      request: {
        type: "inaccurate_info",
        creditor: "ABC Bank",
        account: "****1234",
        description: "Account shows late payment but was paid on time",
      },
      response: {
        id: "dispute_456",
        status: "submitted",
        created_at: "2024-01-15T10:30:00Z",
      },
    },
  },
]

const categories = [
  "All",
  "Authentication",
  "User Management",
  "Credit Reports",
  "Disputes",
  "Letters",
  "Subscriptions",
]

export default function APIDocsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const filteredEndpoints =
    selectedCategory === "All" ? endpoints : endpoints.filter((endpoint) => endpoint.category === selectedCategory)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const generateCurlExample = (endpoint: any) => {
    const hasBody = endpoint.method === "POST" || endpoint.method === "PUT"
    return `curl -X ${endpoint.method} \\
  https://api.creditaipro.com${endpoint.path} \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"${
    hasBody
      ? ` \\
  -d '${JSON.stringify(endpoint.example.request || {}, null, 2)}'`
      : ""
  }`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-6">
          Complete reference for the CreditAI Pro API. Build powerful credit repair integrations.
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Secure Authentication</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600">Rate Limited</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-purple-600" />
            <span className="text-sm text-gray-600">RESTful API</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/docs/api/test">
              <Play className="h-4 w-4 mr-2" />
              Try API Console
            </Link>
          </Button>
          <Button variant="outline">
            <Code className="h-4 w-4 mr-2" />
            Download SDK
          </Button>
        </div>
      </div>

      {/* Quick Start */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get started with the CreditAI Pro API in minutes</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="auth">1. Authentication</TabsTrigger>
              <TabsTrigger value="request">2. Make Request</TabsTrigger>
              <TabsTrigger value="response">3. Handle Response</TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="space-y-4">
              <p className="text-sm text-gray-600">First, authenticate to get your access token:</p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X POST https://api.creditaipro.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your@email.com", "password": "your_password"}'`,
                      "auth",
                    )
                  }
                >
                  {copiedCode === "auth" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {`curl -X POST https://api.creditaipro.com/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your@email.com", "password": "your_password"}'`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="request" className="space-y-4">
              <p className="text-sm text-gray-600">Use your token to make authenticated requests:</p>
              <div className="bg-gray-900 rounded-lg p-4 relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                  onClick={() =>
                    copyToClipboard(
                      `curl -X GET https://api.creditaipro.com/api/users/me \\
  -H "Authorization: Bearer YOUR_TOKEN"`,
                      "request",
                    )
                  }
                >
                  {copiedCode === "request" ? "Copied!" : <Copy className="h-4 w-4" />}
                </Button>
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {`curl -X GET https://api.creditaipro.com/api/users/me \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="response" className="space-y-4">
              <p className="text-sm text-gray-600">All responses are in JSON format:</p>
              <div className="bg-gray-900 rounded-lg p-4">
                <pre className="text-sm text-gray-300 overflow-x-auto">
                  {`{
  "id": "user_123",
  "email": "your@email.com",
  "subscription": "pro",
  "usage": {
    "letters": 15,
    "reports": 3,
    "disputes": 8
  }
}`}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="space-y-6">
        {filteredEndpoints.map((endpoint, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge variant={endpoint.method === "GET" ? "secondary" : "default"}>{endpoint.method}</Badge>
                  <code className="text-lg font-mono">{endpoint.path}</code>
                </div>
                <Badge variant="outline">{endpoint.category}</Badge>
              </div>
              <CardDescription>{endpoint.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="response">Response</TabsTrigger>
                </TabsList>

                <TabsContent value="curl">
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() => copyToClipboard(generateCurlExample(endpoint), `curl-${index}`)}
                    >
                      {copiedCode === `curl-${index}` ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                    <pre className="text-sm text-gray-300 overflow-x-auto">{generateCurlExample(endpoint)}</pre>
                  </div>
                </TabsContent>

                <TabsContent value="javascript">
                  <div className="bg-gray-900 rounded-lg p-4 relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2 text-gray-400 hover:text-white"
                      onClick={() =>
                        copyToClipboard(
                          `const response = await fetch('https://api.creditaipro.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }${
    endpoint.example.request
      ? `,
  body: JSON.stringify(${JSON.stringify(endpoint.example.request, null, 2)})`
      : ""
  }
});

const data = await response.json();`,
                          `js-${index}`,
                        )
                      }
                    >
                      {copiedCode === `js-${index}` ? "Copied!" : <Copy className="h-4 w-4" />}
                    </Button>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {`const response = await fetch('https://api.creditaipro.com${endpoint.path}', {
  method: '${endpoint.method}',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }${
    endpoint.example.request
      ? `,
  body: JSON.stringify(${JSON.stringify(endpoint.example.request, null, 2)})`
      : ""
  }
});

const data = await response.json();`}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="response">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(endpoint.example.response, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Rate Limits */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Rate Limits</CardTitle>
          <CardDescription>API request limits by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Basic</h3>
              <p className="text-2xl font-bold text-blue-600">100</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Pro</h3>
              <p className="text-2xl font-bold text-green-600">1,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <h3 className="font-semibold text-lg">Enterprise</h3>
              <p className="text-2xl font-bold text-purple-600">10,000</p>
              <p className="text-sm text-gray-600">requests/hour</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
