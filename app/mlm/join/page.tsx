"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle, Users, Crown, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TeamInfo {
  teamCode: string
  teamName: string
  sponsorName: string
  memberCount: number
  teamRank: string
}

function MLMJoinPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const [step, setStep] = useState<'code' | 'info' | 'signup' | 'success'>('code')
  const [teamCode, setTeamCode] = useState('')
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setTeamCode(code)
      validateTeamCode(code)
    }
  }, [searchParams])

  const validateTeamCode = async (code: string) => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`/api/mlm/teams/validate?code=${code}`)
      const data = await response.json()
      
      if (response.ok) {
        setTeamInfo(data.team)
        setStep('info')
      } else {
        setError(data.error || 'Invalid team code')
      }
    } catch (err) {
      setError('Failed to validate team code')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamCode.trim()) {
      setError('Please enter a team code')
      return
    }
    await validateTeamCode(teamCode)
  }

  const handleSignup = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      setLoading(true)
      setError('')

      const response = await fetch('/api/mlm/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamCode: teamCode || null
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        toast({
          title: "Account Created!",
          description: "Welcome to the MLM system!",
        })
      } else {
        setError(data.error || 'Failed to create account')
      }
    } catch (err) {
      setError('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const renderTeamCodeStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
          <Users className="w-6 h-6 text-blue-600" />
        </div>
        <CardTitle>Join MLM Team</CardTitle>
        <CardDescription>
          Enter your team code to join an existing team, or leave blank to create a new team
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCodeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamCode">Team Code (Optional)</Label>
            <Input
              id="teamCode"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value)}
              placeholder="Enter team code"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                'Continue'
              )}
            </Button>
            
            <Button 
              type="button"
              variant="outline" 
              onClick={() => setStep('signup')}
              className="w-full"
            >
              Create New Team
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )

  const renderTeamInfoStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Team Found!</CardTitle>
        <CardDescription>
          You're joining an existing team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamInfo && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{teamInfo.teamName}</div>
              <div className="text-sm text-gray-500">Team Code: {teamInfo.teamCode}</div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold">{teamInfo.memberCount}</div>
                <div className="text-sm text-gray-500">Members</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-semibold text-yellow-600">{teamInfo.teamRank}</div>
                <div className="text-sm text-gray-500">Team Rank</div>
              </div>
            </div>
            
            <div className="text-center text-sm text-gray-600">
              Sponsored by: <span className="font-medium">{teamInfo.sponsorName}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={() => setStep('signup')}
            className="w-full"
          >
            Join This Team
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setStep('code')}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSignupStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          {teamCode ? `Joining team ${teamCode}` : 'Creating new team'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Doe"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            placeholder="john@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            placeholder="Create a strong password"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Confirm your password"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Button 
            onClick={handleSignup} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setStep('code')}
            className="w-full"
          >
            Back
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSuccessStep = () => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Welcome to the Team!</CardTitle>
        <CardDescription>
          Your MLM account has been created successfully
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold">
            {formData.firstName} {formData.lastName}
          </div>
          <div className="text-sm text-gray-500">{formData.email}</div>
          {teamCode && (
            <div className="text-sm text-blue-600">
              Team: {teamCode}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Button 
            onClick={() => router.push('/mlm/dashboard')}
            className="w-full"
          >
            Go to Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
            className="w-full"
          >
            Back to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {step === 'code' && renderTeamCodeStep()}
        {step === 'info' && renderTeamInfoStep()}
        {step === 'signup' && renderSignupStep()}
        {step === 'success' && renderSuccessStep()}
      </div>
    </div>
  )
}

export default function MLMJoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <MLMJoinPageContent />
    </Suspense>
  )
}