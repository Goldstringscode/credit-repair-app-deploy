'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { userService, type User, type UserFilters } from '@/lib/user-service'
import CreateUserModal from '@/components/user-create-modal'
import UserDetailsModal from '@/components/user-details-modal'
import EditUserModal from '@/components/user-edit-modal'
import EmailModal from '@/components/user-email-modal'
import { 
  Search, 
  Download, 
  UserPlus, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Mail, 
  Shield, 
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  Users,
  UserCheck,
  UserX,
  Crown,
  Phone,
  ExternalLink
} from 'lucide-react'

interface LocalUserFilters {
  status: string
  role: string
  search: string
}

export default function AdminUsersPage() {
  const [selectedTab, setSelectedTab] = useState("all")
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    pending: 0
  })
  const [roleCounts, setRoleCounts] = useState({
    user: 0,
    premium: 0,
    admin: 0,
    trial: 0
  })
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    newThisMonth: 0
  })
  const [filters, setFilters] = useState<LocalUserFilters>({
    status: 'all',
    role: 'all',
    search: ''
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Load users from API
  const loadUsers = async () => {
    setLoading(true)
    try {
      const apiFilters: UserFilters = {
        status: filters.status === 'all' ? undefined : filters.status,
        role: filters.role === 'all' ? undefined : filters.role,
        search: filters.search || undefined,
        page: 1,
        limit: 100
      }

      const response = await userService.getUsers(apiFilters)
      
      if (response.success && response.data) {
        setUsers(response.data.users)
        setFilteredUsers(response.data.users)
        setStatusCounts(response.data.statusCounts)
        setRoleCounts(response.data.roleCounts)
        setMetrics(response.data.metrics)
      } else {
        console.error('Failed to load users:', response.error)
      }
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadUsers()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [filters])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: UserX },
      suspended: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.toUpperCase()}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-purple-100 text-purple-800', icon: Crown },
      premium: { color: 'bg-blue-100 text-blue-800', icon: UserCheck },
      user: { color: 'bg-gray-100 text-gray-800', icon: Users },
      trial: { color: 'bg-yellow-100 text-yellow-800', icon: Clock }
    }

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user
    const Icon = config.icon

    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="h-3 w-3 mr-1" />
        {role.toUpperCase()}
      </Badge>
    )
  }

  // Action handlers - following subscriptions pattern exactly
  const handleCreateUser = () => {
    console.log('Opening create user modal...')
    setIsCreateModalOpen(true)
  }

  const handleUserCreated = (newUser: User) => {
    console.log('New user created:', newUser)
    loadUsers()
    setIsCreateModalOpen(false)
  }

  const handleViewUser = (user: User) => {
    console.log('Viewing user:', user.id)
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    console.log('Editing user:', user.id)
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleUserUpdated = (updatedUser: User) => {
    console.log('User updated:', updatedUser)
    loadUsers()
    setIsEditModalOpen(false)
  }

  const handleEmailUser = (user: User) => {
    console.log('Send email to:', user.id)
    setSelectedUser(user)
    setIsEmailModalOpen(true)
  }

  const handleEmailSent = (userId: string, emailData: any) => {
    console.log('Email sent to user:', userId, emailData)
    setIsEmailModalOpen(false)
  }

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user.id)
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return
    
    try {
      const response = await userService.deleteUser(selectedUser.id)
      if (response.success) {
        alert(`User ${selectedUser.name} deleted successfully!`)
        loadUsers()
        setIsDeleteModalOpen(false)
      } else {
        alert(`Failed to delete user: ${response.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleExportUsers = () => {
    console.log('Exporting users...')
    const csvContent = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Subscription', 'Credit Score', 'Phone', 'Join Date', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.subscription,
        user.creditScore,
        user.phone,
        user.joinDate,
        user.lastLogin
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">User Management</h1>
            <p className="text-gray-600">Manage users, roles, and permissions across your platform</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handleExportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={handleCreateUser}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="active">Active ({statusCounts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({statusCounts.inactive})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({statusCounts.suspended})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters & Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Roles</option>
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                  <option value="trial">Trial</option>
                </select>
                <Button variant="outline" onClick={loadUsers}>
                  <Filter className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users</CardTitle>
                  <CardDescription>
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 font-medium text-sm">
                  <div className="col-span-3">User</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Subscription</div>
                  <div className="col-span-1">Credit Score</div>
                  <div className="col-span-1">Verification</div>
                  <div className="col-span-2">Actions</div>
                </div>
                {filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-gray-50">
                    <div className="col-span-3 flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="col-span-1">
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="col-span-2">
                      <Badge variant="outline">{user.subscription}</Badge>
                      <p className="text-xs text-gray-500 mt-1">${user.totalSpent.toFixed(2)} spent</p>
                    </div>
                    <div className="col-span-1">
                      <p className="font-medium">{user.creditScore}</p>
                      <p className="text-xs text-gray-500">
                        {user.creditScore >= 700 ? 'Excellent' : user.creditScore >= 600 ? 'Good' : 'Fair'}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center space-x-1">
                        {user.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-xs">{user.isVerified ? 'Verified' : 'Unverified'}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          title="View user details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          title="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEmailUser(user)}
                          title="Send email"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <Badge variant="outline">{metrics.totalUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Users</span>
                  <Badge variant="default">{metrics.activeUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verified Users</span>
                  <Badge variant="secondary">{metrics.verifiedUsers}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New This Month</span>
                  <Badge variant="outline">{metrics.newThisMonth}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Role Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Regular Users</span>
                  <Badge variant="outline">{roleCounts.user}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Premium Users</span>
                  <Badge variant="default">{roleCounts.premium}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Admins</span>
                  <Badge variant="secondary">{roleCounts.admin}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trial Users</span>
                  <Badge variant="outline">{roleCounts.trial}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Status Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Suspended Users</span>
                  <Badge variant="destructive">{statusCounts.suspended}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Users</span>
                  <Badge variant="secondary">{statusCounts.pending}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Inactive Users</span>
                  <Badge variant="outline">{statusCounts.inactive}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>Last updated: {new Date().toLocaleTimeString()}</p>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Data refreshed automatically</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadUsers}
                  className="w-full"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals - following subscriptions pattern exactly */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      <UserDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onSendEmail={handleEmailUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSuccess={handleUserUpdated}
      />

      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        onSuccess={handleEmailSent}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Delete User</h3>
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Warning</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Are you sure you want to delete {selectedUser.name}? This action cannot be undone.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDeleteUserConfirm}
              >
                Delete User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}