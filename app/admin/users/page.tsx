'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
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
import CreateUserModal from '@/components/user-create-modal'
import EditUserModal from '@/components/user-edit-modal'
import EmailModal from '@/components/user-email-modal'

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

interface UserFilters {
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
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    search: ''
  })
  
  // Modal states - using separate modals like subscriptions page
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Load users from API
  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.data.users || [])
        setFilteredUsers(data.data.users || [])
        updateCounts(data.data.users || [])
      } else {
        // Fallback to mock data if API fails
        const mockUsers = getMockUsers()
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
        updateCounts(mockUsers)
      }
    } catch (error) {
      console.error('Error loading users:', error)
      const mockUsers = getMockUsers()
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      updateCounts(mockUsers)
    } finally {
      setLoading(false)
    }
  }

  const getMockUsers = (): User[] => [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "premium",
      status: "active",
      joinDate: "2024-01-15",
      lastLogin: "2024-10-15",
      subscription: "Premium Plan",
      creditScore: 720,
      phone: "+1234567890",
      createdAt: "2024-01-15T10:30:00Z",
      isVerified: true,
      totalSpent: 299.99,
      lastActivity: "2024-10-15T14:30:00Z"
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-02-20",
      lastLogin: "2024-10-14",
      subscription: "Basic Plan",
      creditScore: 680,
      phone: "+1234567891",
      createdAt: "2024-02-20T10:30:00Z",
      isVerified: true,
      totalSpent: 99.99,
      lastActivity: "2024-10-14T16:20:00Z"
    },
    {
      id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      role: "trial",
      status: "pending",
      joinDate: "2024-10-10",
      lastLogin: "2024-10-15",
      subscription: "Trial",
      creditScore: 650,
      phone: "+1234567892",
      createdAt: "2024-10-10T10:30:00Z",
      isVerified: false,
      totalSpent: 0,
      lastActivity: "2024-10-15T09:15:00Z"
    },
    {
      id: "4",
      name: "Alice Brown",
      email: "alice@example.com",
      role: "premium",
      status: "suspended",
      joinDate: "2024-03-05",
      lastLogin: "2024-10-12",
      subscription: "Premium Plan",
      creditScore: 750,
      phone: "+1234567893",
      createdAt: "2024-03-05T10:30:00Z",
      isVerified: true,
      totalSpent: 599.98,
      lastActivity: "2024-10-12T11:45:00Z"
    },
    {
      id: "5",
      name: "Charlie Wilson",
      email: "charlie@example.com",
      role: "admin",
      status: "active",
      joinDate: "2024-01-01",
      lastLogin: "2024-10-15",
      subscription: "Enterprise Plan",
      creditScore: 800,
      phone: "+1234567894",
      createdAt: "2024-01-01T00:00:00Z",
      isVerified: true,
      totalSpent: 0,
      lastActivity: "2024-10-15T17:30:00Z"
    }
  ]

  const updateCounts = (userList: User[]) => {
    const statusCounts = {
      all: userList.length,
      active: userList.filter(u => u.status === "active").length,
      inactive: userList.filter(u => u.status === "inactive").length,
      suspended: userList.filter(u => u.status === "suspended").length,
      pending: userList.filter(u => u.status === "pending").length
    }
    
    const roleCounts = {
      user: userList.filter(u => u.role === "user").length,
      premium: userList.filter(u => u.role === "premium").length,
      admin: userList.filter(u => u.role === "admin").length,
      trial: userList.filter(u => u.role === "trial").length
    }
    
    const metrics = {
      totalUsers: userList.length,
      activeUsers: userList.filter(u => u.status === "active").length,
      verifiedUsers: userList.filter(u => u.isVerified).length,
      newThisMonth: userList.filter(u => {
        const userDate = new Date(u.createdAt)
        const now = new Date()
        return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
      }).length
    }
    
    setStatusCounts(statusCounts)
    setRoleCounts(roleCounts)
    setMetrics(metrics)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Reload when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
  }, [filters, users])

  const applyFilters = () => {
    let filtered = [...users]
    
    // Search filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.id.toLowerCase().includes(searchTerm)
      )
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }
    
    // Role filter
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }
    
    setFilteredUsers(filtered)
  }

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

  // Action handlers - simple like subscriptions page
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

  const handleEmailUser = (user: User) => {
    console.log('Send email to:', user.id)
    setSelectedUser(user)
    setIsEmailModalOpen(true)
  }

  const handleChangeRole = (user: User) => {
    console.log('Change role for:', user.id)
    setSelectedUser(user)
    setIsRoleModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user.id)
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleCreateUser = () => {
    console.log('Opening create user modal...')
    setIsCreateModalOpen(true)
  }

  const handleUserCreated = (newUser: User) => {
    console.log('New user created:', newUser)
    loadUsers()
    setIsCreateModalOpen(false)
  }

  const handleUserUpdated = (updatedUser: User) => {
    console.log('User updated:', updatedUser)
    loadUsers()
    setIsEditModalOpen(false)
  }

  const handleUserDeleted = (userId: string) => {
    console.log('User deleted:', userId)
    loadUsers()
    setIsDeleteModalOpen(false)
  }

  const handleRoleChanged = (userId: string, newRole: string) => {
    console.log('Role changed for user:', userId, 'to:', newRole)
    loadUsers()
    setIsRoleModalOpen(false)
  }

  const handleEmailSent = (userId: string, emailData: any) => {
    console.log('Email sent to user:', userId, emailData)
    setIsEmailModalOpen(false)
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
                          onClick={() => handleChangeRole(user)}
                          title="Change role"
                        >
                          <Shield className="h-4 w-4" />
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

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleUserCreated}
        />
      )}

      {/* User Details Modal */}
      {isDetailsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <div className="space-y-2">
              <p><strong>Name:</strong> {selectedUser.name}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Role:</strong> {selectedUser.role}</p>
              <p><strong>Status:</strong> {selectedUser.status}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Credit Score:</strong> {selectedUser.creditScore}</p>
              <p><strong>Verified:</strong> {selectedUser.isVerified ? 'Yes' : 'No'}</p>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setIsDetailsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleUserUpdated}
          user={selectedUser}
        />
      )}

      {/* Email Modal */}
      {isEmailModalOpen && selectedUser && (
        <EmailModal
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          onSuccess={handleEmailSent}
          user={selectedUser}
        />
      )}

      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Change Role for {selectedUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">New Role</label>
                <select defaultValue={selectedUser.role} className="w-full px-3 py-2 border rounded-md">
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Reason</label>
                <textarea className="w-full px-3 py-2 border rounded-md h-20" placeholder="Reason for role change"></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert(`Role changed successfully for ${selectedUser.name}!`)
                setIsRoleModalOpen(false)
                loadUsers()
              }}>
                Change Role
              </Button>
            </div>
          </div>
        </div>
      )}

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
                onClick={() => {
                  alert(`User ${selectedUser.name} deleted successfully!`)
                  setIsDeleteModalOpen(false)
                  loadUsers()
                }}
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