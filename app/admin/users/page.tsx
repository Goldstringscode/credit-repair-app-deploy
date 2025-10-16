"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Search, 
  Filter, 
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
  Clock
} from "lucide-react"

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
}

export default function UsersPage() {
  // Mock users data
  const [users, setUsers] = useState<User[]>([
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
      createdAt: "2024-01-15T10:30:00Z"
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
      createdAt: "2024-02-20T10:30:00Z"
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
      createdAt: "2024-10-10T10:30:00Z"
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
      createdAt: "2024-03-05T10:30:00Z"
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  
  // Simplified modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'edit' | 'view' | 'email' | 'role' | 'delete' | null>(null)
  
  // Selected user for operations
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    subscription: "Basic Plan"
  })
  
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    subscription: "Basic Plan"
  })
  
  const [emailData, setEmailData] = useState({
    subject: "",
    message: "",
    type: "general"
  })
  
  const [roleData, setRoleData] = useState({
    role: "user",
    reason: ""
  })
  
  const [isLoading, setIsLoading] = useState(false)

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    
    return matchesSearch && matchesRole && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4 text-green-600" />
      case "inactive": return <XCircle className="h-4 w-4 text-gray-600" />
      case "suspended": return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "pending": return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  // Simplified handler functions
  const handleViewUser = (user: User) => {
    console.log('View user clicked:', user)
    setSelectedUser(user)
    setModalType('view')
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    console.log('Edit user clicked:', user)
    setSelectedUser(user)
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: "+1234567890", // Mock phone
      subscription: user.subscription
    })
    setModalType('edit')
    setIsModalOpen(true)
  }

  const handleEmailUser = (user: User) => {
    console.log('Email user clicked:', user)
    setSelectedUser(user)
    setEmailData({
      subject: "",
      message: "",
      type: "general"
    })
    setModalType('email')
    setIsModalOpen(true)
  }

  const handleChangeRole = (user: User) => {
    console.log('Change role clicked:', user)
    setSelectedUser(user)
    setRoleData({
      role: user.role,
      reason: ""
    })
    setModalType('role')
    setIsModalOpen(true)
  }

  const handleDeleteUser = (user: User) => {
    console.log('Delete user clicked:', user)
    setSelectedUser(user)
    setModalType('delete')
    setIsModalOpen(true)
  }

  const handleAddUser = () => {
    setModalType('add')
    setIsModalOpen(true)
  }

  const handleAddUserSubmit = async () => {
    console.log('Adding user:', newUser)
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })
      
      if (response.ok) {
        const result = await response.json()
        setUsers([...users, result.data.user])
        alert(`User ${newUser.name} created successfully!`)
        setIsModalOpen(false)
        setModalType(null)
        setNewUser({ name: "", email: "", role: "user", phone: "", subscription: "Basic Plan" })
      } else {
        const errorData = await response.json()
        alert(`Failed to create user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error adding user:', error)
      alert(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser)
      })
      
      if (response.ok) {
        const result = await response.json()
        setUsers(users.map(user => user.id === selectedUser.id ? { ...user, ...result.data.user } : user))
        alert(`User ${selectedUser.name} updated successfully!`)
        setIsModalOpen(false)
        setModalType(null)
        setSelectedUser(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to update user: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Email sent successfully to ${selectedUser.email}!`)
        setIsModalOpen(false)
        setModalType(null)
        setSelectedUser(null)
        setEmailData({ subject: "", message: "", type: "general" })
        setIsLoading(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to send email: ${errorData.error || 'Unknown error'}`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const handleChangeUserRole = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setUsers(users.map(user => user.id === selectedUser.id ? { ...user, role: roleData.role } : user))
        alert(`User ${selectedUser.name} role changed to ${roleData.role} successfully!`)
        setIsModalOpen(false)
        setModalType(null)
        setSelectedUser(null)
      } else {
        const errorData = await response.json()
        alert(`Failed to change role: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error changing role:', error)
      alert(`Failed to change role: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteUserConfirm = async () => {
    if (!selectedUser) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setUsers(users.filter(user => user.id !== selectedUser.id))
        alert(`User ${selectedUser.name} deleted successfully!`)
        setIsModalOpen(false)
        setModalType(null)
        setSelectedUser(null)
        setIsLoading(false)
      } else {
        const errorData = await response.json()
        alert(`Failed to delete user: ${errorData.error || 'Unknown error'}`)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsLoading(false)
    }
  }

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    premium: users.filter(u => u.role === "premium").length,
    trial: users.filter(u => u.role === "trial").length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across your platform.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button 
            className="flex items-center space-x-2"
            onClick={handleAddUser}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add User</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premium}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trial}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
          <CardDescription>
            A list of all users in your platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Credit Score</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'premium' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(user.status)}
                      <span className="capitalize">{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.subscription}</TableCell>
                  <TableCell>{user.creditScore}</TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => {
                          console.log('View Details clicked for user:', user)
                          alert('View Details clicked!')
                          handleViewUser(user)
                        }}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          console.log('Edit User clicked for user:', user)
                          alert('Edit User clicked!')
                          handleEditUser(user)
                        }}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          console.log('Send Email clicked for user:', user)
                          alert('Send Email clicked!')
                          handleEmailUser(user)
                        }}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          console.log('Change Role clicked for user:', user)
                          alert('Change Role clicked!')
                          handleChangeRole(user)
                        }}>
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            console.log('Delete User clicked for user:', user)
                            alert('Delete User clicked!')
                            handleDeleteUser(user)
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Single Unified Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false)
          setModalType(null)
          setSelectedUser(null)
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          {modalType === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create a new user account with the specified details.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Full name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="col-span-3"
                    placeholder="user@example.com"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Phone</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    className="col-span-3"
                    placeholder="+1234567890"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="subscription" className="text-right">Subscription</Label>
                  <Select value={newUser.subscription} onValueChange={(value) => setNewUser({...newUser, subscription: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                      <SelectItem value="Premium Plan">Premium Plan</SelectItem>
                      <SelectItem value="Enterprise Plan">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUserSubmit} disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'view' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>User Details</DialogTitle>
                <DialogDescription>
                  View details for {selectedUser.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Name</Label>
                  <div className="col-span-3">{selectedUser.name}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Email</Label>
                  <div className="col-span-3">{selectedUser.email}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Role</Label>
                  <div className="col-span-3">
                    <Badge variant={selectedUser.role === 'premium' ? 'default' : 'secondary'}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Status</Label>
                  <div className="col-span-3">
                    <Badge variant={selectedUser.status === 'active' ? 'default' : 'destructive'}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Subscription</Label>
                  <div className="col-span-3">{selectedUser.subscription}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Credit Score</Label>
                  <div className="col-span-3">{selectedUser.creditScore}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Join Date</Label>
                  <div className="col-span-3">{selectedUser.joinDate}</div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right font-medium">Last Login</Label>
                  <div className="col-span-3">{selectedUser.lastLogin}</div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsModalOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'edit' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Edit User</DialogTitle>
                <DialogDescription>
                  Update details for {selectedUser.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Name</Label>
                  <Input
                    id="edit-name"
                    value={editUser.name}
                    onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-email" className="text-right">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-role" className="text-right">Role</Label>
                  <Select value={editUser.role} onValueChange={(value) => setEditUser({...editUser, role: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-phone" className="text-right">Phone</Label>
                  <Input
                    id="edit-phone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({...editUser, phone: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-subscription" className="text-right">Subscription</Label>
                  <Select value={editUser.subscription} onValueChange={(value) => setEditUser({...editUser, subscription: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Basic Plan">Basic Plan</SelectItem>
                      <SelectItem value="Premium Plan">Premium Plan</SelectItem>
                      <SelectItem value="Enterprise Plan">Enterprise Plan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser} disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update User"}
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'email' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Send Email</DialogTitle>
                <DialogDescription>
                  Send an email to {selectedUser.name} ({selectedUser.email})
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-subject" className="text-right">Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({...emailData, subject: e.target.value})}
                    className="col-span-3"
                    placeholder="Email subject"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-type" className="text-right">Type</Label>
                  <Select value={emailData.type} onValueChange={(value) => setEmailData({...emailData, type: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="email-message" className="text-right mt-2">Message</Label>
                  <Textarea
                    id="email-message"
                    value={emailData.message}
                    onChange={(e) => setEmailData({...emailData, message: e.target.value})}
                    className="col-span-3"
                    placeholder="Email message content"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSendEmail} 
                  disabled={isLoading || !emailData.subject || !emailData.message}
                >
                  {isLoading ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'role' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Change User Role</DialogTitle>
                <DialogDescription>
                  Change the role for {selectedUser.name}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role-select" className="text-right">New Role</Label>
                  <Select value={roleData.role} onValueChange={(value) => setRoleData({...roleData, role: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="role-reason" className="text-right mt-2">Reason</Label>
                  <Textarea
                    id="role-reason"
                    value={roleData.reason}
                    onChange={(e) => setRoleData({...roleData, reason: e.target.value})}
                    className="col-span-3"
                    placeholder="Reason for role change"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleChangeUserRole} disabled={isLoading}>
                  {isLoading ? "Changing..." : "Change Role"}
                </Button>
              </DialogFooter>
            </>
          )}

          {modalType === 'delete' && selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle>Delete User</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Warning</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>This will permanently delete the user account and all associated data.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteUserConfirm} 
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete User"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}