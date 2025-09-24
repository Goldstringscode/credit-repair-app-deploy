"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Users, 
  Mail, 
  Trash2, 
  Edit, 
  Eye,
  Tag,
  Calendar,
  TrendingUp
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailList {
  id: string
  name: string
  subscribers: number
  activeSubscribers: number
  unsubscribed: number
  createdAt: string
  lastUpdated: string
  tags: string[]
  description: string
}

export default function EmailListsPage() {
  const { toast } = useToast()
  const [emailLists, setEmailLists] = useState<EmailList[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [tagFilter, setTagFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)

  // Form state for creating new list
  const [newList, setNewList] = useState({
    name: "",
    description: "",
    tags: [] as string[]
  })

  useEffect(() => {
    fetchEmailLists()
  }, [])

  const fetchEmailLists = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/email/lists')
      const data = await response.json()
      if (data.success) {
        setEmailLists(data.lists)
      }
    } catch (error) {
      console.error('Error fetching email lists:', error)
      toast({
        title: "Error",
        description: "Failed to fetch email lists. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newList.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a list name.",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/email/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newList)
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Email list created successfully.",
        })
        setNewList({ name: "", description: "", tags: [] })
        setIsCreateDialogOpen(false)
        fetchEmailLists()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create email list. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this email list?')) {
      return
    }

    try {
      const response = await fetch(`/api/email/lists?id=${listId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Success",
          description: "Email list deleted successfully.",
        })
        fetchEmailLists()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete email list. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTagInput = (value: string) => {
    if (value.includes(',')) {
      const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag)
      setNewList(prev => ({ ...prev, tags: [...prev.tags, ...tags] }))
    }
  }

  const removeTag = (tagToRemove: string) => {
    setNewList(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const filteredLists = emailLists.filter(list => {
    const matchesSearch = list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         list.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTag = tagFilter === "all" || list.tags.includes(tagFilter)
    return matchesSearch && matchesTag
  })

  const allTags = Array.from(new Set(emailLists.flatMap(list => list.tags)))

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading email lists...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Email Lists</h1>
            <p className="text-gray-600">
              Manage your subscriber lists and segments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button variant="outline" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create List</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Email List</DialogTitle>
                  <DialogDescription>
                    Create a new email list to organize your subscribers
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">List Name</Label>
                    <Input
                      id="name"
                      value={newList.name}
                      onChange={(e) => setNewList(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter list name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newList.description}
                      onChange={(e) => setNewList(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter list description"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      placeholder="e.g., premium, active, new"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTagInput(e.currentTarget.value)
                          e.currentTarget.value = ''
                        }
                      }}
                    />
                    {newList.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newList.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center space-x-1">
                            <span>{tag}</span>
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateList}
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create List"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search lists..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="all">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLists.map((list) => (
          <Card key={list.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{list.name}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDeleteList(list.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{list.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-900">
                      {list.activeSubscribers.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-green-700">Active</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">
                      {list.subscribers.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
              </div>

              {/* Tags */}
              {list.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {list.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Dates */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Created: {new Date(list.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Updated: {new Date(list.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Unsubscribe Rate */}
              {list.unsubscribed > 0 && (
                <div className="text-xs text-red-600">
                  {list.unsubscribed} unsubscribed
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLists.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No email lists found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || tagFilter !== "all" 
                ? "No lists match your current filters." 
                : "Get started by creating your first email list."
              }
            </p>
            {(!searchTerm && tagFilter === "all") && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First List
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}