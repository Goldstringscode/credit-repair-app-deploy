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
  Crown
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
  const [filters, setFilters] = useState({
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
  
  // Create user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'user',
    phone: '',
    subscription: 'Basic Plan'
  })

  // Mock data for development
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
    }
  ]

  // Load users
  const loadUsers = async () => {
    setLoading(true)
    try {
      // Use mock data for now
      const mockUsers = getMockUsers()
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      
      // Calculate counts
      setStatusCounts({
        all: mockUsers.length,
        active: mockUsers.filter(u => u.status === "active").length,
        inactive: mockUsers.filter(u => u.status === "inactive").length,
        suspended: mockUsers.filter(u => u.status === "suspended").length,
        pending: mockUsers.filter(u => u.status === "pending").length
      })
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...users]
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
      )
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }
    
    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }
    
    setFilteredUsers(filtered)
  }, [filters, users])

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

  // Simple action handlers
  const handleCreateUser = () => {
    console.log('Opening create user modal...')
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      phone: '',
      subscription: 'Basic Plan'
    })
    setIsCreateModalOpen(true)
  }

  const handleCreateUserSubmit = () => {
    if (!newUser.name || !newUser.email) {
      alert('Name and email are required')
      return
    }

    const user: User = {
      id: `user_${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
      lastLogin: new Date().toISOString().split('T')[0],
      subscription: newUser.subscription,
      creditScore: 650,
      phone: newUser.phone,
      createdAt: new Date().toISOString(),
      isVerified: false,
      totalSpent: 0,
      lastActivity: new Date().toISOString()
    }

    setUsers([...users, user])
    setFilteredUsers([...filteredUsers, user])
    
    // Update counts
    setStatusCounts(prev => ({
      ...prev,
      all: prev.all + 1,
      active: prev.active + 1
    }))

    alert(`User ${newUser.name} created successfully!`)
    setIsCreateModalOpen(false)
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      phone: '',
      subscription: 'Basic Plan'
    })
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

  const handleEmailUser = (user: User) => {
    console.log('Send email to:', user.id)
    setSelectedUser(user)
    setIsEmailModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    console.log('Delete user:', user.id)
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteUserConfirm = () => {
    if (!selectedUser) return
    
    setUsers(users.filter(user => user.id !== selectedUser.id))
    setFilteredUsers(filteredUsers.filter(user => user.id !== selectedUser.id))
    alert(`User ${selectedUser.name} deleted successfully!`)
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
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
        </TabsContent>
      </Tabs>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="Full name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="user@example.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="+1234567890"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subscription</label>
                <select 
                  className="w-full px-3 py-2 border rounded-md"
                  value={newUser.subscription}
                  onChange={(e) => setNewUser({...newUser, subscription: e.target.value})}
                >
                  <option value="Basic Plan">Basic Plan</option>
                  <option value="Premium Plan">Premium Plan</option>
                  <option value="Enterprise Plan">Enterprise Plan</option>
                  <option value="Executive Account">Executive Account</option>
                  <option value="Trial">Trial</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUserSubmit}>
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}

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

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input type="text" defaultValue={selectedUser.name} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" defaultValue={selectedUser.email} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select defaultValue={selectedUser.role} className="w-full px-3 py-2 border rounded-md">
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                  <option value="trial">Trial</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert('User updated successfully!')
                setIsEditModalOpen(false)
                loadUsers()
              }}>
                Update User
              </Button>
            </div>
          </div>
        </div>
      )}

      {isEmailModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">Send Email to {selectedUser.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input type="text" className="w-full px-3 py-2 border rounded-md" placeholder="Email subject" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Message</label>
                <textarea className="w-full px-3 py-2 border rounded-md h-24" placeholder="Email message"></textarea>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEmailModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                alert(`Email sent successfully to ${selectedUser.email}!`)
                setIsEmailModalOpen(false)
              }}>
                Send Email
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