'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { userService, type User } from '@/lib/user-service'
import { 
  User, 
  Mail, 
  Shield, 
  Phone, 
  Calendar, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (user: User) => void
  user: User | null
}

interface UserFormData {
  name: string
  email: string
  role: string
  phone: string
  subscription: string
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

export default function EditUserModal({ isOpen, onClose, onSuccess, user }: EditUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    subscription: 'Basic Plan'
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        subscription: user.subscription
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      alert('Name and email are required')
      return
    }

    if (!user) return

    setLoading(true)
    
    try {
      console.log('Updating user with data:', formData)
      const response = await userService.updateUser(user.id, formData)
      
      if (response.success) {
        console.log('User updated successfully:', response.data)
        alert(`User ${formData.name} updated successfully!`)
        onSuccess?.(response.data?.user)
        onClose()
      } else {
        console.error('Failed to update user:', response.error)
        alert(`Failed to update user: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update details for {user?.name}
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
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">Email Address *</Label>
                    <Input
                      id="edit-email"
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
                    <Label htmlFor="edit-phone">Phone Number</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-subscription">Subscription Plan</Label>
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

            {/* Role Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">User Role</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {ROLES.map((role) => (
                      <div
                        key={role.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.role === role.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('role', role.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.role === role.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.role === role.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{role.name}</div>
                            <div className="text-sm text-gray-500">{role.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Updated User Summary</CardTitle>
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
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !formData.name || !formData.email}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating User...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}