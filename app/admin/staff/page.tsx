"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Trash2, Shield, Users } from "lucide-react"
import { toast } from "sonner"

interface StaffMember {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null
  email_verified: boolean | null
}

const roleBadgeVariant: Record<string, string> = {
  admin: "bg-red-100 text-red-800",
  moderator: "bg-yellow-100 text-yellow-800",
  staff: "bg-blue-100 text-blue-800",
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Never"
  return new Date(dateStr).toLocaleDateString()
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<string>("staff")
  const [inviting, setInviting] = useState(false)
  const [revoking, setRevoking] = useState<string | null>(null)

  async function loadStaff() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/staff")
      const data = await res.json()
      if (data.success) {
        setStaffList(data.staff ?? [])
      } else {
        toast.error("Failed to load staff list")
      }
    } catch {
      toast.error("Failed to load staff list")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStaff()
  }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail) return
    setInviting(true)
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Invitation sent to ${inviteEmail}`)
        setInviteOpen(false)
        setInviteEmail("")
        setInviteRole("staff")
        loadStaff()
      } else {
        toast.error(data.error ?? "Failed to send invitation")
      }
    } catch {
      toast.error("Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  async function handleRevoke(id: string, email: string) {
    setRevoking(id)
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (data.success) {
        toast.success(`Access revoked for ${email}`)
        loadStaff()
      } else {
        toast.error(data.error ?? "Failed to revoke access")
      }
    } catch {
      toast.error("Failed to revoke access")
    } finally {
      setRevoking(null)
    }
  }

  const totalStaff = staffList.length
  const adminCount = staffList.filter(s => s.role === "admin").length
  const activeToday = staffList.filter(s => {
    if (!s.last_sign_in_at) return false
    const today = new Date()
    const last = new Date(s.last_sign_in_at)
    return last.toDateString() === today.toDateString()
  }).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage staff members, roles, and access</p>
        </div>
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Staff Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="staff@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-role">Role</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger id="invite-role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStaff}</div>
            <CardDescription>All roles combined</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <CardDescription>Administrator accounts</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeToday}</div>
            <CardDescription>Logged in today</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Staff table */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
          <CardDescription>All users with admin, staff, or moderator roles</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : staffList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm">No staff members found.</p>
              <p className="text-xs mt-1">Use the "Invite Staff" button to add team members.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffList.map(member => {
                  const name = [member.first_name, member.last_name].filter(Boolean).join(" ") || "—"
                  const isActive = member.email_verified !== false
                  return (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadgeVariant[member.role] ?? "bg-gray-100 text-gray-800"}`}>
                          {member.role}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(member.last_sign_in_at)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={revoking === member.id}
                          onClick={() => handleRevoke(member.id, member.email)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          {revoking === member.id ? "Revoking..." : "Revoke"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
