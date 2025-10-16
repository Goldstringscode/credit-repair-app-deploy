'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { userService, type User } from '@/lib/user-service'
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Phone, 
  Calendar, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Edit,
  Trash2,
  Mail as MailIcon
} from 'lucide-react'

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onEdit?: (user: User) => void
  onDelete?: (userId: string) => void
  onSendEmail?: (user: User) => void
}

export default function UserDetailsModal({ 
  isOpen, 
  onClose, 
  user, 
  onEdit, 
  onDelete, 
  onSendEmail 
}: UserDetailsModalProps) {
  if (!user) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive": return <XCircle className="h-4 w-4 text-gray-600" />
      case "suspended": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Shield className="h-4 w-4 text-purple-600" />
      case "premium": return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "user": return <UserIcon className="h-4 w-4 text-gray-600" />
      case "trial": return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <UserIcon className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {user.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Full Name</Label>
                  <div className="flex items-center space-x-2">
                    <UserIcon className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Email Address</Label>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Phone Number</Label>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">User ID</Label>
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Role */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Status & Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Account Status</Label>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(user.status)}
                    <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                      {user.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">User Role</Label>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Verification Status</Label>
                  <div className="flex items-center space-x-2">
                    {user.isVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Subscription</Label>
                  <Badge variant={user.subscription.includes('Premium') ? 'default' : 'secondary'}>
                    {user.subscription}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Financial Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Credit Score</Label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-lg">{user.creditScore}</span>
                    <Badge variant={user.creditScore >= 700 ? 'default' : user.creditScore >= 600 ? 'secondary' : 'destructive'}>
                      {user.creditScore >= 700 ? 'Excellent' : user.creditScore >= 600 ? 'Good' : 'Fair'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Total Spent</Label>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <span className="font-medium text-lg">${user.totalSpent.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Join Date</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.joinDate}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Last Login</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{user.lastLogin}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Last Activity</Label>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{new Date(user.lastActivity).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Account Created</Label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onSendEmail && (
            <Button variant="outline" onClick={() => onSendEmail(user)}>
              <MailIcon className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(user)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(user.id)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
