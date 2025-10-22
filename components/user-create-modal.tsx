'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Phone, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onUserCreated: (user: any) => void
}

interface UserFormData {
  name: string
  email: string
  role: string
  phone: string
  subscription: string
  status: string
}

const ROLES = [
  { id: 'user', name: 'User', description: 'Standard user access' },
  { id: 'premium', name: 'Premium', description: 'Premium user with enhanced features' },
  { id: 'admin', name: 'Admin', description: 'Administrator with full access' },
  { id: 'trial', name: 'Trial', description: 'Trial user with limited access' }
]

const SUBSCRIPTIONS = [
  { id: 'Basic Plan', name: 'Basic Plan', price: '$29.99/month' },
  { id: 'Premium Plan', name: 'Premium Plan', price: '$59.99/month' },
  { id: 'Enterprise Plan', name: 'Enterprise Plan', price: '$99.99/month' },
  { id: 'Trial', name: 'Trial', price: 'Free' }
]

const STATUSES = [
  { id: 'active', name: 'Active', description: 'User is active and can use the platform' },
  { id: 'inactive', name: 'Inactive', description: 'User account is inactive' },
  { id: 'pending', name: 'Pending', description: 'User account is pending approval' },
  { id: 'suspended', name: 'Suspended', description: 'User account is suspended' }
]

export default function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    subscription: 'Basic Plan',
    status: 'active'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    setLoading(true)
    
    try {
      console.log('Creating user with data:', formData)
      
      // Create new user object
      const newUser = {
        id: Date.now().toString(), // Simple ID generation
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        subscription: formData.subscription,
        creditScore: Math.floor(Math.random() * 200) + 500, // Random credit score
        phone: formData.phone,
        createdAt: new Date().toISOString(),
        isVerified: formData.status === 'active',
        totalSpent: formData.subscription === 'Trial' ? 0 : Math.floor(Math.random() * 500),
        lastActivity: new Date().toISOString()
      }

      console.log('User created successfully:', newUser)
      onUserCreated(newUser)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'user',
        phone: '',
        subscription: 'Basic Plan',
        status: 'active'
      })
      
      onClose()
    } catch (error) {
      console.error('Error creating user:', error)
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const selectedRole = ROLES.find(role => role.id === formData.role)
  const selectedSubscription = SUBSCRIPTIONS.find(sub => sub.id === formData.subscription)
  const selectedStatus = STATUSES.find(status => status.id === formData.status)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>
            Add a new user to the platform with the specified details.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="user@example.com"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subscription">Subscription Plan</Label>
                    <Select value={formData.subscription} onValueChange={(value) => handleInputChange('subscription', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBSCRIPTIONS.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>
                            {sub.name} - {sub.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role and Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Role & Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">User Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="font-medium">{formData.name || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="font-medium">{formData.email || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <Badge variant={selectedRole?.id === 'admin' ? 'default' : 'secondary'}>
                      {selectedRole?.name || 'Not selected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={
                      selectedStatus?.id === 'active' ? 'default' : 
                      selectedStatus?.id === 'suspended' ? 'destructive' : 
                      'secondary'
                    }>
                      {selectedStatus?.name || 'Not selected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subscription:</span>
                    <span className="font-medium">{selectedSubscription?.name || 'Not selected'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="font-medium">{formData.phone || 'Not provided'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t bg-white sticky bottom-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.email}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating User...
                </>
              ) : (
                'Create User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}