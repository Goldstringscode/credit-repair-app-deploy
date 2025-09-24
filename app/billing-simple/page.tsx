'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function BillingSimplePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in to access your billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You need to be logged in to view your billing information.
              </p>
              <div className="space-y-2">
                <Button onClick={() => setIsAuthenticated(true)} className="w-full">
                  Use Demo Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Billing Dashboard</h1>
      <p className="text-gray-600 mt-2">Welcome to your billing dashboard!</p>
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Basic Plan - $29.99/month</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You are successfully logged in!</p>
            <Button 
              onClick={() => setIsAuthenticated(false)} 
              variant="outline" 
              className="mt-4"
            >
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
