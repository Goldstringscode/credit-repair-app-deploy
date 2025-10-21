'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import CreateUserModal from '@/components/user-create-modal'
import { userService, type User, type UserFilters } from '@/lib/user-service'
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

// User interface is now imported from user-service

export default function AdminUsersPage() {
  console.log('AdminUsersPage component rendering')
  
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
  const [error, setError] = useState<string | null>(null)

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

  // Load users using user service
  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      console.log('Loading users...')
      const userFilters: UserFilters = {
        status: filters.status !== 'all' ? filters.status : undefined,
        role: filters.role !== 'all' ? filters.role : undefined,
        search: filters.search || undefined
      }
      
      console.log('Calling userService.getUsers with filters:', userFilters)
      const result = await userService.getUsers(userFilters)
      console.log('Users loaded result:', result)
      
      if (result.success && result.data) {
        setUsers(result.data.users || [])
        setFilteredUsers(result.data.users || [])
        setStatusCounts(result.data.statusCounts || {
          all: 0,
          active: 0,
          inactive: 0,
          suspended: 0,
          pending: 0
        })
      } else {
        console.error('Failed to load users:', result.error)
        setError(result.error || 'Failed to load users')
        // Fallback to mock data
        const mockUsers = getMockUsers()
        setUsers(mockUsers)
        setFilteredUsers(mockUsers)
        setStatusCounts({
          all: mockUsers.length,
          active: mockUsers.filter(u => u.status === "active").length,
          inactive: mockUsers.filter(u => u.status === "inactive").length,
          suspended: mockUsers.filter(u => u.status === "suspended").length,
          pending: mockUsers.filter(u => u.status === "pending").length
        })
      }
    } catch (error) {
      console.error('Error loading users:', error)
      setError(error instanceof Error ? error.message : 'Unknown error occurred')
      // Fallback to mock data
      const mockUsers = getMockUsers()
      setUsers(mockUsers)
      setFilteredUsers(mockUsers)
      setStatusCounts({
        all: mockUsers.length,
        active: mockUsers.filter(u => u.status === "active").length,
        inactive: mockUsers.filter(u => u.status === "inactive").length,
        suspended: mockUsers.filter(u => u.status === "suspended").length,
        pending: mockUsers.filter(u => u.status === "pending").length
      })
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
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    if (filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status)
    }

    if (filters.role !== 'all') {
      filtered = filtered.filter(user => user.role === filters.role)
    }

    setFilteredUsers(filtered)
  }, [users, filters])

  const handleCreateUser = () => {
    console.log('Opening create user modal...')
    console.log('Current modal state:', isCreateModalOpen)
    setIsCreateModalOpen(true)
    console.log('Modal state set to true')
  }

  const handleUserCreated = (newUser: User) => {
    console.log('New user created:', newUser)
    // Reload users to show the new one
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

  const handleEmailUser = (user: User) => {
    console.log('Emailing user:', user.id)
    setSelectedUser(user)
    setIsEmailModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    console.log('Deleting user:', user.id)
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteUserConfirm = async () => {
    if (selectedUser) {
      console.log('Confirming delete for user:', selectedUser.id)
      try {
        const result = await userService.deleteUser(selectedUser.id)
        if (result.success) {
          // Reload users to get updated data
          await loadUsers()
          alert(`User ${selectedUser.name} deleted successfully!`)
        } else {
          alert(`Error deleting user: ${result.error}`)
        }
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error deleting user. Please try again.')
      }
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
    }
  }

  const handleExportUsers = () => {
    console.log('Exporting users...')
    // Create CSV export
    const csvContent = [
      ['ID', 'Name', 'Email', 'Role', 'Status', 'Subscription', 'Join Date', 'Last Login'].join(','),
      ...filteredUsers.map(user => [
        user.id,
        user.name,
        user.email,
        user.role,
        user.status,
        user.subscription,
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
      case 'admin': return <Crown className="h-4 w-4 text-purple-500" />
      case 'premium': return <UserCheck className="h-4 w-4 text-blue-500" />
      case 'user': return <Users className="h-4 w-4 text-gray-500" />
      case 'trial': return <Clock className="h-4 w-4 text-yellow-500" />
      default: return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading users...</p>
          <p className="text-sm text-gray-500 mt-2">Debug: Loading state active</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-medium">Error loading users</p>
          <p className="text-sm text-gray-500 mt-2">{error}</p>
          <Button onClick={loadUsers} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
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
          <Button onClick={(e) => {
            console.log('Add User button clicked!', e)
            alert('Add User button clicked!')
            handleCreateUser()
          }}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-600">{statusCounts.inactive}</p>
              </div>
              <UserX className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Suspended</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.suspended}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 border rounded-md"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <select
                className="px-3 py-2 border rounded-md"
                value={filters.role}
                onChange={(e) => setFilters({...filters, role: e.target.value})}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="premium">Premium</option>
                <option value="user">User</option>
                <option value="trial">Trial</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Subscription</th>
                  <th className="text-left p-3">Join Date</th>
                  <th className="text-left p-3">Last Login</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getRoleIcon(user.role)}
                        <span className="capitalize">{user.role}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(user.status)}
                        {getStatusBadge(user.status)}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.subscription}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.joinDate}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm">{user.lastLogin}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEmailUser(user)}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {console.log('Rendering CreateUserModal with isOpen:', isCreateModalOpen)}
      
      {/* Simple Test Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Test Modal - Add User</h2>
            <p className="mb-4">This is a simple test modal to verify the button works.</p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                console.log('Test modal button clicked')
                setIsCreateModalOpen(false)
              }}>
                Test Button
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          console.log('Modal close requested')
          setIsCreateModalOpen(false)
        }}
        onSuccess={handleUserCreated}
      />

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete User</h2>
            <p className="mb-4">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteUserConfirm}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}