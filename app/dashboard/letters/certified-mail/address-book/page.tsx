"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Building,
  Phone,
  Mail,
  Star,
  Download,
  Upload,
  Filter,
  Copy,
} from "lucide-react"

interface Contact {
  id: string
  name: string
  company: string
  title?: string
  address: string
  city: string
  state: string
  zip: string
  email?: string
  phone?: string
  category: "Credit Bureau" | "Creditor" | "Collection Agency" | "Attorney" | "Government" | "Other"
  notes?: string
  tags: string[]
  isFavorite: boolean
  lastUsed?: string
  timesUsed: number
  createdAt: string
  updatedAt: string
}

export default function AddressBookPage() {
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: "1",
      name: "Experian Consumer Services",
      company: "Experian",
      title: "Credit Reporting Agency",
      address: "P.O. Box 4500",
      city: "Allen",
      state: "TX",
      zip: "75013",
      email: "disputes@experian.com",
      phone: "(888) 397-3742",
      category: "Credit Bureau",
      notes: "Primary credit bureau for disputes. Best response time for certified mail.",
      tags: ["credit-bureau", "disputes", "primary"],
      isFavorite: true,
      lastUsed: "2024-01-20",
      timesUsed: 45,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-20",
    },
    {
      id: "2",
      name: "TransUnion Consumer Relations",
      company: "TransUnion",
      title: "Credit Reporting Agency",
      address: "P.O. Box 2000",
      city: "Chester",
      state: "PA",
      zip: "19016",
      email: "disputes@transunion.com",
      phone: "(800) 916-8800",
      category: "Credit Bureau",
      notes: "Requires specific format for identity theft disputes.",
      tags: ["credit-bureau", "disputes"],
      isFavorite: true,
      lastUsed: "2024-01-18",
      timesUsed: 38,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-18",
    },
    {
      id: "3",
      name: "Equifax Information Services",
      company: "Equifax",
      title: "Credit Reporting Agency",
      address: "P.O. Box 740256",
      city: "Atlanta",
      state: "GA",
      zip: "30374",
      email: "disputes@equifax.com",
      phone: "(866) 349-5191",
      category: "Credit Bureau",
      notes: "Fastest processing for goodwill letters.",
      tags: ["credit-bureau", "disputes", "goodwill"],
      isFavorite: true,
      lastUsed: "2024-01-15",
      timesUsed: 42,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-15",
    },
    {
      id: "4",
      name: "Capital One Customer Service",
      company: "Capital One",
      title: "Credit Card Company",
      address: "P.O. Box 30285",
      city: "Salt Lake City",
      state: "UT",
      zip: "84130",
      email: "customerservice@capitalone.com",
      phone: "(800) 227-4825",
      category: "Creditor",
      notes: "Responsive to goodwill letters. Include account number in subject line.",
      tags: ["creditor", "credit-card", "goodwill"],
      isFavorite: false,
      lastUsed: "2024-01-12",
      timesUsed: 12,
      createdAt: "2024-01-05",
      updatedAt: "2024-01-12",
    },
  ])

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterFavorites, setFilterFavorites] = useState(false)

  const [newContact, setNewContact] = useState<Partial<Contact>>({
    name: "",
    company: "",
    title: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    email: "",
    phone: "",
    category: "Other",
    notes: "",
    tags: [],
    isFavorite: false,
  })

  const categories = ["Credit Bureau", "Creditor", "Collection Agency", "Attorney", "Government", "Other"]

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = filterCategory === "all" || contact.category === filterCategory
    const matchesFavorites = !filterFavorites || contact.isFavorite

    return matchesSearch && matchesCategory && matchesFavorites
  })

  const handleCreateContact = () => {
    if (newContact.name && newContact.address) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        company: newContact.company || "",
        title: newContact.title,
        address: newContact.address,
        city: newContact.city || "",
        state: newContact.state || "",
        zip: newContact.zip || "",
        email: newContact.email,
        phone: newContact.phone,
        category: newContact.category as Contact["category"],
        notes: newContact.notes,
        tags: newContact.tags || [],
        isFavorite: newContact.isFavorite || false,
        timesUsed: 0,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      }

      setContacts([contact, ...contacts])
      setNewContact({
        name: "",
        company: "",
        title: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        email: "",
        phone: "",
        category: "Other",
        notes: "",
        tags: [],
        isFavorite: false,
      })
      setShowCreateDialog(false)
    }
  }

  const handleUpdateContact = () => {
    if (selectedContact) {
      setContacts(contacts.map((c) => (c.id === selectedContact.id ? selectedContact : c)))
      setIsEditing(false)
    }
  }

  const handleDeleteContact = (contactId: string) => {
    setContacts(contacts.filter((c) => c.id !== contactId))
    if (selectedContact?.id === contactId) {
      setSelectedContact(null)
    }
  }

  const toggleFavorite = (contactId: string) => {
    setContacts(contacts.map((c) => (c.id === contactId ? { ...c, isFavorite: !c.isFavorite } : c)))
    if (selectedContact?.id === contactId) {
      setSelectedContact({ ...selectedContact, isFavorite: !selectedContact.isFavorite })
    }
  }

  const duplicateContact = (contact: Contact) => {
    const duplicated: Contact = {
      ...contact,
      id: Date.now().toString(),
      name: `${contact.name} (Copy)`,
      timesUsed: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    }
    setContacts([duplicated, ...contacts])
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Credit Bureau":
        return <Building className="h-4 w-4 text-blue-600" />
      case "Creditor":
        return <Building className="h-4 w-4 text-green-600" />
      case "Collection Agency":
        return <Building className="h-4 w-4 text-red-600" />
      case "Attorney":
        return <Building className="h-4 w-4 text-purple-600" />
      case "Government":
        return <Building className="h-4 w-4 text-gray-600" />
      default:
        return <Building className="h-4 w-4 text-gray-400" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Credit Bureau":
        return "bg-blue-100 text-blue-800"
      case "Creditor":
        return "bg-green-100 text-green-800"
      case "Collection Agency":
        return "bg-red-100 text-red-800"
      case "Attorney":
        return "bg-purple-100 text-purple-800"
      case "Government":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Address Book</h1>
              <p className="text-gray-600 mt-1">Manage your contacts and mailing addresses</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-blue-100 text-blue-800">
                <Users className="h-4 w-4 mr-1" />
                {contacts.length} Contacts
              </Badge>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Contact</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newName">Contact Name *</Label>
                        <Input
                          id="newName"
                          value={newContact.name || ""}
                          onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                          placeholder="John Smith"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newCompany">Company</Label>
                        <Input
                          id="newCompany"
                          value={newContact.company || ""}
                          onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                          placeholder="Experian"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newTitle">Title</Label>
                        <Input
                          id="newTitle"
                          value={newContact.title || ""}
                          onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                          placeholder="Credit Reporting Agency"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newCategory">Category</Label>
                        <Select
                          value={newContact.category || "Other"}
                          onValueChange={(value) =>
                            setNewContact({ ...newContact, category: value as Contact["category"] })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newAddress">Address *</Label>
                      <Input
                        id="newAddress"
                        value={newContact.address || ""}
                        onChange={(e) => setNewContact({ ...newContact, address: e.target.value })}
                        placeholder="P.O. Box 4500"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newCity">City</Label>
                        <Input
                          id="newCity"
                          value={newContact.city || ""}
                          onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                          placeholder="Allen"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newState">State</Label>
                        <Input
                          id="newState"
                          value={newContact.state || ""}
                          onChange={(e) => setNewContact({ ...newContact, state: e.target.value })}
                          placeholder="TX"
                          maxLength={2}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newZip">ZIP Code</Label>
                        <Input
                          id="newZip"
                          value={newContact.zip || ""}
                          onChange={(e) => setNewContact({ ...newContact, zip: e.target.value })}
                          placeholder="75013"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newEmail">Email</Label>
                        <Input
                          id="newEmail"
                          type="email"
                          value={newContact.email || ""}
                          onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                          placeholder="contact@company.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPhone">Phone</Label>
                        <Input
                          id="newPhone"
                          value={newContact.phone || ""}
                          onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                          placeholder="(555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newNotes">Notes</Label>
                      <Textarea
                        id="newNotes"
                        value={newContact.notes || ""}
                        onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                        placeholder="Any additional notes about this contact..."
                        rows={3}
                      />
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateContact} disabled={!newContact.name || !newContact.address}>
                        Add Contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Contacts
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={filterFavorites ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFilterFavorites(!filterFavorites)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedContact?.id === contact.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedContact(contact)
                        setIsEditing(false)
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-sm">{contact.name}</h3>
                            {contact.isFavorite && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                          </div>
                          {contact.company && <p className="text-xs text-gray-600 mb-1">{contact.company}</p>}
                          <div className="flex items-center space-x-1 mb-2">
                            {getCategoryIcon(contact.category)}
                            <Badge variant="outline" className="text-xs">
                              {contact.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            {contact.city}, {contact.state}
                          </p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>Used {contact.timesUsed} times</span>
                            {contact.lastUsed && <span>Last: {contact.lastUsed}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <span>{selectedContact.name}</span>
                          {selectedContact.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </CardTitle>
                        {selectedContact.company && (
                          <p className="text-sm text-gray-600 mt-1">{selectedContact.company}</p>
                        )}
                      </div>
                      <Badge className={getCategoryColor(selectedContact.category)}>
                        {getCategoryIcon(selectedContact.category)}
                        <span className="ml-1">{selectedContact.category}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleFavorite(selectedContact.id)}>
                        <Star
                          className={`h-4 w-4 ${selectedContact.isFavorite ? "fill-current text-yellow-500" : ""}`}
                        />
                      </Button>
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={handleUpdateContact}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => duplicateContact(selectedContact)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteContact(selectedContact.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactName">Contact Name</Label>
                            <Input
                              id="contactName"
                              value={selectedContact.name}
                              onChange={(e) => setSelectedContact({ ...selectedContact, name: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactCompany">Company</Label>
                            <Input
                              id="contactCompany"
                              value={selectedContact.company}
                              onChange={(e) => setSelectedContact({ ...selectedContact, company: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactTitle">Title</Label>
                            <Input
                              id="contactTitle"
                              value={selectedContact.title || ""}
                              onChange={(e) => setSelectedContact({ ...selectedContact, title: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactEmail">Email</Label>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <Input
                                id="contactEmail"
                                type="email"
                                value={selectedContact.email || ""}
                                onChange={(e) => setSelectedContact({ ...selectedContact, email: e.target.value })}
                                disabled={!isEditing}
                                className={isEditing ? "" : "bg-gray-50"}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactPhone">Phone</Label>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <Input
                                id="contactPhone"
                                value={selectedContact.phone || ""}
                                onChange={(e) => setSelectedContact({ ...selectedContact, phone: e.target.value })}
                                disabled={!isEditing}
                                className={isEditing ? "" : "bg-gray-50"}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactCategory">Category</Label>
                            <Select
                              value={selectedContact.category}
                              onValueChange={(value) =>
                                setSelectedContact({ ...selectedContact, category: value as Contact["category"] })
                              }
                              disabled={!isEditing}
                            >
                              <SelectTrigger className={isEditing ? "" : "bg-gray-50"}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="contactAddress">Address</Label>
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <Input
                              id="contactAddress"
                              value={selectedContact.address}
                              onChange={(e) => setSelectedContact({ ...selectedContact, address: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="contactCity">City</Label>
                            <Input
                              id="contactCity"
                              value={selectedContact.city}
                              onChange={(e) => setSelectedContact({ ...selectedContact, city: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactState">State</Label>
                            <Input
                              id="contactState"
                              value={selectedContact.state}
                              onChange={(e) => setSelectedContact({ ...selectedContact, state: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                              maxLength={2}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="contactZip">ZIP Code</Label>
                            <Input
                              id="contactZip"
                              value={selectedContact.zip}
                              onChange={(e) => setSelectedContact({ ...selectedContact, zip: e.target.value })}
                              disabled={!isEditing}
                              className={isEditing ? "" : "bg-gray-50"}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-600">{selectedContact.timesUsed}</p>
                          <p className="text-sm text-blue-700">Times Used</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-600">{selectedContact.lastUsed || "Never"}</p>
                          <p className="text-sm text-green-700">Last Used</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-600">{selectedContact.createdAt}</p>
                          <p className="text-sm text-purple-700">Created</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold">Recent Activity</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Credit Dispute Letter</p>
                              <p className="text-sm text-gray-600">Sent via certified mail</p>
                            </div>
                            <span className="text-sm text-gray-500">2024-01-20</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">Goodwill Letter</p>
                              <p className="text-sm text-gray-600">Sent via certified mail</p>
                            </div>
                            <span className="text-sm text-gray-500">2024-01-15</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactNotes">Notes</Label>
                        <Textarea
                          id="contactNotes"
                          value={selectedContact.notes || ""}
                          onChange={(e) => setSelectedContact({ ...selectedContact, notes: e.target.value })}
                          disabled={!isEditing}
                          className={`min-h-32 ${isEditing ? "" : "bg-gray-50"}`}
                          placeholder="Add notes about this contact..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedContact.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex items-center justify-between pt-6 border-t">
                    <div className="text-sm text-gray-600">
                      Created: {selectedContact.createdAt} • Updated: {selectedContact.updatedAt}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                      <Button size="sm">Use for Mail</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Contact</h3>
                  <p className="text-gray-600 mb-6">Choose a contact from the list to view and edit their details.</p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Contact
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
