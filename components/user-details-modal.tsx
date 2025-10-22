'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  CreditCard,
  Activity
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: string
  joinDate: string
  lastLogin: string
  subscription: string
  creditScore: number
  phone: string
  createdAt: string
  isVerified: boolean
  totalSpent: number
  lastActivity: string
}

interface UserDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onEdit: (user: User) => void
  onEmail: (user: User) => void
  onDelete: (user: User) => void
}

export default function UserDetailsModal({ 
  isOpen, 
  onClose, 
  user, 
  onEdit, 
  onEmail, 
  onDelete 
}: UserDetailsModalProps) {
  if (!user) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />
      case 'suspended': return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'inactive': return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
      case 'suspended': return <Badge className="bg-red-100 text-red-800">Suspended</Badge>
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      default: return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4 text-purple-500" />
      case 'premium': return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'user': return <UserIcon className="h-4 w-4 text-gray-500" />
      case 'trial': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <UserIcon className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            User Details - {user.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* User Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    {getStatusIcon(user.status)}
                    {getStatusBadge(user.status)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">{user.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Role:</span>
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <span className="capitalize font-medium">{user.role}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(user.status)}
                    {getStatusBadge(user.status)}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Verified:</span>
                  <div className="flex items-center space-x-2">
                    {user.isVerified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={user.isVerified ? 'text-green-600' : 'text-red-600'}>
                      {user.isVerified ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Credit Score:</span>
                  <span className="font-medium">{user.creditScore}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Subscription & Billing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Plan:</span>
                  <span className="font-medium">{user.subscription}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent:</span>
                  <span className="font-medium">${user.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Join Date:</span>
                  <span className="font-medium">{user.joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Login:</span>
                  <span className="font-medium">{user.lastLogin}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span>{new Date(user.lastActivity).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Account Created:</span>
                  <span>{new Date(user.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" onClick={() => onEmail(user)}>
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </Button>
            <Button variant="outline" onClick={() => onEdit(user)}>
              <UserIcon className="h-4 w-4 mr-2" />
              Edit User
            </Button>
            <Button variant="destructive" onClick={() => onDelete(user)}>
              <XCircle className="h-4 w-4 mr-2" />
              Delete User
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}