export interface Course {
  id: string
  title: string
  description: string
  duration: string
  students: number
  rating: number
  progress: number
  instructor: string
  category: string
  free: boolean
  lessons: number
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  tags: string[]
}

export const courses: Course[] = [
  // Free Courses
  {
    id: "credit-basics",
    title: "Credit Fundamentals",
    description: "Learn the basics of credit scores, reports, and how credit works",
    duration: "45 minutes",
    students: 15420,
    rating: 4.8,
    progress: 65,
    instructor: "Sarah Johnson",
    category: "basics",
    free: true,
    lessons: 8,
    difficulty: "Beginner",
    tags: ["credit score", "credit report", "fundamentals"],
  },
  {
    id: "understanding-credit-reports",
    title: "Understanding Credit Reports",
    description: "Deep dive into reading and interpreting your credit report",
    duration: "35 minutes",
    students: 12850,
    rating: 4.7,
    progress: 0,
    instructor: "Michael Chen",
    category: "basics",
    free: true,
    lessons: 6,
    difficulty: "Beginner",
    tags: ["credit report", "analysis", "interpretation"],
  },
  {
    id: "basic-dispute-process",
    title: "Basic Dispute Process",
    description: "Learn how to dispute errors on your credit report",
    duration: "50 minutes",
    students: 9340,
    rating: 4.6,
    progress: 25,
    instructor: "Lisa Rodriguez",
    category: "disputes",
    free: true,
    lessons: 7,
    difficulty: "Beginner",
    tags: ["disputes", "credit repair", "process"],
  },
  {
    id: "credit-building-strategies",
    title: "Credit Building Strategies",
    description: "Proven methods to build and improve your credit score",
    duration: "40 minutes",
    students: 11200,
    rating: 4.9,
    progress: 0,
    instructor: "David Kim",
    category: "basics",
    free: true,
    lessons: 5,
    difficulty: "Beginner",
    tags: ["credit building", "strategies", "improvement"],
  },

  // Premium Courses
  {
    id: "advanced-disputes",
    title: "Advanced Dispute Strategies",
    description: "Master advanced techniques for complex credit disputes",
    duration: "2 hours",
    students: 5680,
    rating: 4.9,
    progress: 0,
    instructor: "Jennifer Martinez",
    category: "disputes",
    free: false,
    lessons: 12,
    difficulty: "Advanced",
    tags: ["advanced disputes", "complex cases", "strategies"],
  },
  {
    id: "legal-credit-repair",
    title: "Legal Aspects of Credit Repair",
    description: "Understanding FCRA, FDCPA, and your legal rights",
    duration: "90 minutes",
    students: 4320,
    rating: 4.8,
    progress: 0,
    instructor: "Robert Thompson",
    category: "legal",
    free: false,
    lessons: 10,
    difficulty: "Intermediate",
    tags: ["legal", "FCRA", "FDCPA", "rights"],
  },
  {
    id: "business-credit-mastery",
    title: "Business Credit Mastery",
    description: "Build and manage business credit profiles effectively",
    duration: "3 hours",
    students: 3450,
    rating: 4.7,
    progress: 0,
    instructor: "Amanda Foster",
    category: "business",
    free: false,
    lessons: 15,
    difficulty: "Advanced",
    tags: ["business credit", "corporate", "financing"],
  },
  {
    id: "credit-repair-business",
    title: "Starting a Credit Repair Business",
    description: "Complete guide to starting your own credit repair company",
    duration: "4 hours",
    students: 2890,
    rating: 4.6,
    progress: 0,
    instructor: "Mark Williams",
    category: "business",
    free: false,
    lessons: 20,
    difficulty: "Advanced",
    tags: ["business", "entrepreneurship", "credit repair"],
  },
  {
    id: "mortgage-credit-optimization",
    title: "Mortgage Credit Optimization",
    description: "Optimize your credit for the best mortgage rates",
    duration: "75 minutes",
    students: 6780,
    rating: 4.8,
    progress: 0,
    instructor: "Patricia Davis",
    category: "basics",
    free: false,
    lessons: 9,
    difficulty: "Intermediate",
    tags: ["mortgage", "optimization", "rates"],
  },
  {
    id: "identity-theft-recovery",
    title: "Identity Theft Recovery",
    description: "Complete recovery process for identity theft victims",
    duration: "2.5 hours",
    students: 4560,
    rating: 4.9,
    progress: 0,
    instructor: "Thomas Anderson",
    category: "legal",
    free: false,
    lessons: 14,
    difficulty: "Intermediate",
    tags: ["identity theft", "recovery", "protection"],
  },
  {
    id: "credit-score-hacking",
    title: "Credit Score Optimization Secrets",
    description: "Advanced techniques to maximize your credit score quickly",
    duration: "2 hours",
    students: 7890,
    rating: 4.7,
    progress: 0,
    instructor: "Rachel Green",
    category: "basics",
    free: false,
    lessons: 11,
    difficulty: "Advanced",
    tags: ["optimization", "secrets", "advanced"],
  },
  {
    id: "collections-negotiation",
    title: "Collections & Debt Negotiation",
    description: "Master the art of negotiating with debt collectors",
    duration: "90 minutes",
    students: 5230,
    rating: 4.6,
    progress: 0,
    instructor: "Kevin Brown",
    category: "disputes",
    free: false,
    lessons: 8,
    difficulty: "Intermediate",
    tags: ["collections", "negotiation", "debt"],
  },
]

export const getCourseById = (id: string): Course | undefined => {
  return courses.find((course) => course.id === id)
}

export const getCoursesByCategory = (category: string): Course[] => {
  if (category === "all") return courses
  return courses.filter((course) => course.category === category)
}

export const getFreeCourses = (): Course[] => {
  return courses.filter((course) => course.free)
}

export const getPremiumCourses = (): Course[] => {
  return courses.filter((course) => !course.free)
}
