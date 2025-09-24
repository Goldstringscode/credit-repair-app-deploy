'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Shield, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface TrustedUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'tester' | 'beta';
  accessLevel: number;
  addedAt: string;
  addedBy: string;
  isActive: boolean;
}

export default function TrustedUsersPage() {
  const [users, setUsers] = useState<TrustedUser[]>([]);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'beta' as 'admin' | 'tester' | 'beta',
    accessLevel: 1
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Load users (in a real app, this would come from an API)
  useEffect(() => {
    // For now, we'll use the static list
    // In production, you'd fetch from your database
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/admin/trusted-users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        // Fallback to static data for demo
        setUsers([
          {
            id: 'trusted-user-1',
            email: 'your-email@example.com',
            name: 'Your Name',
            role: 'admin',
            accessLevel: 3,
            addedAt: new Date().toISOString(),
            addedBy: 'system',
            isActive: true
          }
        ]);
      }
    };

    loadUsers();
  }, []);

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/admin/trusted-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers([...users, data.user]);
        setNewUser({ email: '', name: '', role: 'beta', accessLevel: 1 });
        setShowAddForm(false);
        toast.success('User added successfully');
      } else {
        throw new Error('Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      toast.error('Failed to add user');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/trusted-users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setUsers(users.filter(user => user.id !== userId));
        toast.success('User removed successfully');
      } else {
        throw new Error('Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      toast.error('Failed to remove user');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'tester': return 'bg-blue-100 text-blue-800';
      case 'beta': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessLevelText = (level: number) => {
    switch (level) {
      case 3: return 'Full Access';
      case 2: return 'Advanced';
      case 1: return 'Basic';
      default: return 'No Access';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Users className="w-8 h-8" />
          Trusted Users Management
        </h1>
        <p className="text-gray-600">
          Manage access to your Credit Repair App beta version
        </p>
      </div>

      <div className="grid gap-6">
        {/* Add User Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Trusted User
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: 'admin' | 'tester' | 'beta') => 
                        setNewUser({ ...newUser, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beta">Beta User</SelectItem>
                        <SelectItem value="tester">Tester</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="accessLevel">Access Level</Label>
                    <Select
                      value={newUser.accessLevel.toString()}
                      onValueChange={(value) => 
                        setNewUser({ ...newUser, accessLevel: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Basic (1)</SelectItem>
                        <SelectItem value="2">Advanced (2)</SelectItem>
                        <SelectItem value="3">Full (3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddUser}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Current Trusted Users ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{user.name}</span>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant="outline">
                        {getAccessLevelText(user.accessLevel)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-xs text-gray-500">
                      Added: {new Date(user.addedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveUser(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No trusted users found</p>
                  <p className="text-sm">Add your first user to get started</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
