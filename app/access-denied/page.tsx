import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Home, Mail } from "lucide-react"
import Link from "next/link"

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Access Restricted</CardTitle>
          <CardDescription>
            This application is currently in beta testing mode and access is limited to approved users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">
              If you believe you should have access, please contact the administrator.
            </p>
            <div className="flex items-center justify-center space-x-2 text-blue-600">
              <Mail className="w-4 h-4" />
              <span>admin@creditrepair.com</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}