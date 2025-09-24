export interface Attorney {
  id: string
  name: string
  email: string
  phone: string
  profileImage?: string
  bio: string
  specializations: string[]
  caseTypes: string[]
  location: {
    city: string
    state: string
    zipCode: string
    timezone: string
  }
  experience: number
  rating: number
  reviewCount: number
  hourlyRate: number
  consultationFee: number
  successRate: number
  casesHandled: number
  responseTime: string
  languages: string[]
  credentials: string[]
  premiumTier: "standard" | "premium" | "elite"
  verified: boolean
  availability: {
    status: "available" | "busy" | "offline"
    nextAvailable: Date
    timezone: string
  }
  state: string
  barNumber: string
}

export const attorneyNetwork: Attorney[] = [
  {
    id: "sarah-johnson",
    name: "Sarah Johnson",
    email: "sarah.johnson@lawfirm.com",
    phone: "(555) 123-4567",
    profileImage: "/placeholder.svg?height=100&width=100&text=SJ",
    bio: "Experienced consumer protection attorney with over 12 years specializing in FCRA violations and credit repair. Successfully helped over 2,500 clients improve their credit scores and remove inaccurate information from credit reports.",
    specializations: ["Consumer Credit Law", "FCRA Violations", "Identity Theft Protection", "Debt Collection Defense"],
    caseTypes: ["Credit Report Disputes", "FCRA Lawsuits", "Identity Theft Cases", "Debt Validation"],
    location: {
      city: "Los Angeles",
      state: "California",
      zipCode: "90210",
      timezone: "PST",
    },
    experience: 12,
    rating: 4.9,
    reviewCount: 247,
    hourlyRate: 350,
    consultationFee: 75,
    successRate: 94,
    casesHandled: 2547,
    responseTime: "2-4 hours",
    languages: ["English", "Spanish"],
    credentials: ["California State Bar", "NACA Certified", "FCRA Specialist"],
    premiumTier: "elite",
    verified: true,
    availability: {
      status: "available",
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000),
      timezone: "PST",
    },
    state: "California",
    barNumber: "CA123456",
  },
  {
    id: "michael-chen",
    name: "Michael Chen",
    email: "michael.chen@creditlaw.com",
    phone: "(555) 234-5678",
    profileImage: "/placeholder.svg?height=100&width=100&text=MC",
    bio: "Former credit bureau attorney turned consumer advocate. Deep understanding of credit reporting systems and extensive experience in complex FCRA litigation. Recovered over $2.3M in damages for clients.",
    specializations: ["FCRA Violations", "Credit Reporting Errors", "Consumer Protection", "Class Action Lawsuits"],
    caseTypes: ["Complex FCRA Cases", "Credit Bureau Lawsuits", "Damages Recovery", "Class Actions"],
    location: {
      city: "New York",
      state: "New York",
      zipCode: "10001",
      timezone: "EST",
    },
    experience: 15,
    rating: 4.8,
    reviewCount: 189,
    hourlyRate: 425,
    consultationFee: 100,
    successRate: 91,
    casesHandled: 1834,
    responseTime: "1-3 hours",
    languages: ["English", "Mandarin"],
    credentials: ["New York State Bar", "FCRA Expert", "Consumer Law Specialist"],
    premiumTier: "elite",
    verified: true,
    availability: {
      status: "busy",
      nextAvailable: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      timezone: "EST",
    },
    state: "New York",
    barNumber: "NY789012",
  },
  {
    id: "jennifer-martinez",
    name: "Jennifer Martinez",
    email: "jennifer.martinez@consumerlaw.com",
    phone: "(555) 345-6789",
    profileImage: "/placeholder.svg?height=100&width=100&text=JM",
    bio: "Dedicated consumer rights attorney with a passion for helping individuals rebuild their financial lives. Specializes in credit repair, debt settlement, and financial rehabilitation strategies.",
    specializations: ["Credit Repair", "Debt Settlement", "Financial Rehabilitation", "Consumer Rights"],
    caseTypes: ["Credit Repair Plans", "Debt Negotiation", "Financial Counseling", "Consumer Education"],
    location: {
      city: "Miami",
      state: "Florida",
      zipCode: "33101",
      timezone: "EST",
    },
    experience: 8,
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 275,
    consultationFee: 50,
    successRate: 89,
    casesHandled: 1245,
    responseTime: "3-6 hours",
    languages: ["English", "Spanish", "Portuguese"],
    credentials: ["Florida State Bar", "Credit Counseling Certified", "Debt Settlement Specialist"],
    premiumTier: "premium",
    verified: true,
    availability: {
      status: "available",
      nextAvailable: new Date(Date.now() + 12 * 60 * 60 * 1000),
      timezone: "EST",
    },
    state: "Florida",
    barNumber: "FL345678",
  },
  {
    id: "robert-williams",
    name: "Robert Williams",
    email: "robert.williams@texaslaw.com",
    phone: "(555) 456-7890",
    profileImage: "/placeholder.svg?height=100&width=100&text=RW",
    bio: "Texas-based attorney with extensive experience in consumer protection and credit law. Known for aggressive representation and successful outcomes in challenging credit disputes.",
    specializations: ["Consumer Protection", "Credit Disputes", "Bankruptcy Law", "Debt Collection Defense"],
    caseTypes: ["Credit Disputes", "Bankruptcy Filings", "Debt Defense", "Consumer Litigation"],
    location: {
      city: "Houston",
      state: "Texas",
      zipCode: "77001",
      timezone: "CST",
    },
    experience: 10,
    rating: 4.6,
    reviewCount: 203,
    hourlyRate: 300,
    consultationFee: 75,
    successRate: 87,
    casesHandled: 1678,
    responseTime: "4-8 hours",
    languages: ["English"],
    credentials: ["Texas State Bar", "Consumer Law Certified", "Bankruptcy Specialist"],
    premiumTier: "premium",
    verified: true,
    availability: {
      status: "available",
      nextAvailable: new Date(Date.now() + 6 * 60 * 60 * 1000),
      timezone: "CST",
    },
    state: "Texas",
    barNumber: "TX901234",
  },
  {
    id: "lisa-thompson",
    name: "Lisa Thompson",
    email: "lisa.thompson@credithelp.com",
    phone: "(555) 567-8901",
    profileImage: "/placeholder.svg?height=100&width=100&text=LT",
    bio: "Compassionate attorney focused on helping families overcome credit challenges. Specializes in identity theft recovery and credit restoration for victims of financial fraud.",
    specializations: ["Identity Theft Recovery", "Credit Restoration", "Financial Fraud", "Family Financial Law"],
    caseTypes: ["Identity Theft Cases", "Fraud Recovery", "Credit Restoration", "Family Finance"],
    location: {
      city: "Chicago",
      state: "Illinois",
      zipCode: "60601",
      timezone: "CST",
    },
    experience: 7,
    rating: 4.8,
    reviewCount: 134,
    hourlyRate: 250,
    consultationFee: 50,
    successRate: 92,
    casesHandled: 987,
    responseTime: "2-5 hours",
    languages: ["English"],
    credentials: ["Illinois State Bar", "Identity Theft Specialist", "Financial Recovery Expert"],
    premiumTier: "standard",
    verified: true,
    availability: {
      status: "available",
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000),
      timezone: "CST",
    },
    state: "Illinois",
    barNumber: "IL567890",
  },
]

export function findAttorneyById(id: string): Attorney | undefined {
  return attorneyNetwork.find((attorney) => attorney.id === id)
}

export function getAttorneysByState(state: string): Attorney[] {
  return attorneyNetwork.filter((attorney) => attorney.location.state === state)
}

export function getAvailableAttorneys(): Attorney[] {
  return attorneyNetwork.filter((attorney) => attorney.availability.status === "available")
}

export function getAttorneysBySpecialization(specialization: string): Attorney[] {
  return attorneyNetwork.filter((attorney) =>
    attorney.specializations.some((spec) => spec.toLowerCase().includes(specialization.toLowerCase())),
  )
}
