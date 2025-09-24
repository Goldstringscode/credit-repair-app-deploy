"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { attorneyNetwork, type Attorney } from "@/lib/attorney-network"
import { Star, MapPin, DollarSign, Scale, Phone, Mail, Calendar, MessageSquare, Filter, Search } from "lucide-react"

export default function AttorneysPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [attorneys, setAttorneys] = useState<Attorney[]>(attorneyNetwork)
  const [filteredAttorneys, setFilteredAttorneys] = useState<Attorney[]>(attorneyNetwork)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    specialization: "",
    state: "",
    maxRate: "",
    availability: "",
    rating: "",
    experience: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    filterAttorneys()
  }, [searchTerm, filters])

  const filterAttorneys = () => {
    let filtered = attorneys

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (attorney) =>
          attorney.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attorney.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())) ||
          attorney.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          attorney.location.state.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Specialization filter
    if (filters.specialization) {
      filtered = filtered.filter((attorney) =>
        attorney.specializations.some((spec) => spec.toLowerCase().includes(filters.specialization.toLowerCase())),
      )
    }

    // State filter
    if (filters.state) {
      filtered = filtered.filter((attorney) => attorney.location.state === filters.state)
    }

    // Max rate filter
    if (filters.maxRate) {
      filtered = filtered.filter((attorney) => attorney.hourlyRate <= Number.parseInt(filters.maxRate))
    }

    // Availability filter
    if (filters.availability) {
      filtered = filtered.filter((attorney) => attorney.availability.status === filters.availability)
    }

    // Rating filter
    if (filters.rating) {
      filtered = filtered.filter((attorney) => attorney.rating >= Number.parseFloat(filters.rating))
    }

    // Experience filter
    if (filters.experience) {
      filtered = filtered.filter((attorney) => attorney.experience >= Number.parseInt(filters.experience))
    }

    // Sort by rating and availability
    filtered.sort((a, b) => {
      if (a.availability.status === "available" && b.availability.status !== "available") return -1
      if (b.availability.status === "available" && a.availability.status !== "available") return 1
      return b.rating - a.rating
    })

    setFilteredAttorneys(filtered)
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      specialization: "",
      state: "",
      maxRate: "",
      availability: "",
      rating: "",
      experience: "",
    })
    setSearchTerm("")
  }

  const handleViewProfile = (attorneyId: string) => {
    router.push(`/dashboard/attorneys/${attorneyId}`)
  }

  const handleSendMessage = (attorneyId: string) => {
    router.push(`/dashboard/attorneys/${attorneyId}/message`)
  }

  const handleBookConsultation = (attorneyId: string) => {
    router.push(`/dashboard/attorneys/${attorneyId}/book`)
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "offline":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "elite":
        return "bg-purple-100 text-purple-800"
      case "premium":
        return "bg-blue-100 text-blue-800"
      case "standard":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Attorney</h1>
          <p className="text-gray-600">
            Connect with licensed attorneys specializing in consumer credit law and FCRA violations
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, specialization, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="lg:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div>
                    <Label>Specialization</Label>
                    <Select
                      value={filters.specialization}
                      onValueChange={(value) => handleFilterChange("specialization", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="Consumer Credit Law">Consumer Credit Law</SelectItem>
                        <SelectItem value="FCRA Violations">FCRA Violations</SelectItem>
                        <SelectItem value="Identity Theft">Identity Theft</SelectItem>
                        <SelectItem value="Debt Collection">Debt Collection</SelectItem>
                        <SelectItem value="Bankruptcy">Bankruptcy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select value={filters.state} onValueChange={(value) => handleFilterChange("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="California">California</SelectItem>
                        <SelectItem value="Texas">Texas</SelectItem>
                        <SelectItem value="New York">New York</SelectItem>
                        <SelectItem value="Florida">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Max Rate</Label>
                    <Select value={filters.maxRate} onValueChange={(value) => handleFilterChange("maxRate", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="200">Under $200/hr</SelectItem>
                        <SelectItem value="300">Under $300/hr</SelectItem>
                        <SelectItem value="400">Under $400/hr</SelectItem>
                        <SelectItem value="500">Under $500/hr</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Availability</Label>
                    <Select
                      value={filters.availability}
                      onValueChange={(value) => handleFilterChange("availability", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="available">Available Now</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Rating</Label>
                    <Select value={filters.rating} onValueChange={(value) => handleFilterChange("rating", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        <SelectItem value="4.7">4.7+ Stars</SelectItem>
                        <SelectItem value="4.8">4.8+ Stars</SelectItem>
                        <SelectItem value="4.9">4.9+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Experience</Label>
                    <Select
                      value={filters.experience}
                      onValueChange={(value) => handleFilterChange("experience", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any</SelectItem>
                        <SelectItem value="5">5+ Years</SelectItem>
                        <SelectItem value="10">10+ Years</SelectItem>
                        <SelectItem value="15">15+ Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAttorneys.length} of {attorneys.length} attorneys
          </p>
        </div>

        {/* Attorney Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredAttorneys.map((attorney) => (
            <Card key={attorney.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={
                      attorney.profileImage ||
                      "/placeholder.svg?height=64&width=64&text=" +
                        attorney.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                    }
                    alt={attorney.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{attorney.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge className={getAvailabilityColor(attorney.availability.status)}>
                          {attorney.availability.status}
                        </Badge>
                        <Badge className={getTierColor(attorney.premiumTier)}>{attorney.premiumTier}</Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span>{attorney.rating}</span>
                        <span className="ml-1">({attorney.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center">
                        <Scale className="h-4 w-4 mr-1" />
                        <span>{attorney.experience} years</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>
                          {attorney.location.city}, {attorney.location.state}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>${attorney.hourlyRate}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 text-sm">{attorney.bio}</p>

                <div className="space-y-3 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Specializations</p>
                    <div className="flex flex-wrap gap-1">
                      {attorney.specializations.map((spec, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Success Rate</p>
                      <p className="text-green-600 font-semibold">{attorney.successRate}%</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Cases Handled</p>
                      <p className="font-semibold">{attorney.casesHandled.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Response Time</p>
                      <p className="font-semibold">{attorney.responseTime}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Consultation Fee</p>
                      <p className="font-semibold">${attorney.consultationFee}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Languages</p>
                    <p className="text-sm text-gray-600">{attorney.languages.join(", ")}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Credentials</p>
                    <div className="flex flex-wrap gap-1">
                      {attorney.credentials.map((cred, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {cred}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span>{attorney.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span>{attorney.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewProfile(attorney.id)}>
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleSendMessage(attorney.id)}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleBookConsultation(attorney.id)}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Book Consultation
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredAttorneys.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Scale className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No attorneys found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search criteria or filters to find more attorneys.
              </p>
              <Button onClick={clearFilters}>Clear All Filters</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
