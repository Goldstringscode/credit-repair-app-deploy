export interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "text" | "quiz"
  content: string
  videoUrl?: string
  quiz?: {
    question: string
    options: string[]
    correctAnswer: number
    explanation: string
  }[]
}

export const courseLessons: Record<string, Lesson[]> = {
  "credit-basics": [
    {
      id: "lesson-1",
      title: "What is Credit?",
      duration: "8 minutes",
      type: "video",
      content: "Learn the fundamental concepts of credit, how it works, and why it matters for your financial future.",
      videoUrl: "/placeholder.svg?height=400&width=600&text=Credit+Basics+Video",
    },
    {
      id: "lesson-2",
      title: "Understanding Credit Scores",
      duration: "6 minutes",
      type: "text",
      content: `# Understanding Credit Scores

Credit scores are three-digit numbers that represent your creditworthiness. They typically range from 300 to 850, with higher scores indicating better credit.

## Credit Score Ranges:
- **Excellent (800-850)**: You'll qualify for the best rates and terms
- **Very Good (740-799)**: You'll get favorable rates on most loans
- **Good (670-739)**: You'll get reasonable rates, though not the best
- **Fair (580-669)**: You may face higher interest rates
- **Poor (300-579)**: You'll have difficulty getting approved for credit

## Factors That Affect Your Score:
1. **Payment History (35%)** - Your track record of making payments on time
2. **Credit Utilization (30%)** - How much of your available credit you're using
3. **Length of Credit History (15%)** - How long you've had credit accounts
4. **Credit Mix (10%)** - The variety of credit types you have
5. **New Credit (10%)** - Recent credit inquiries and new accounts

Understanding these factors is crucial for improving your credit score over time.`,
    },
    {
      id: "lesson-3",
      title: "Credit Score Knowledge Check",
      duration: "5 minutes",
      type: "quiz",
      content: "Test your understanding of credit scores with this quick quiz.",
      quiz: [
        {
          question: "What is the most important factor in your credit score?",
          options: ["Credit utilization", "Payment history", "Length of credit history", "Credit mix"],
          correctAnswer: 1,
          explanation: "Payment history accounts for 35% of your credit score, making it the most important factor.",
        },
        {
          question: "What is considered an excellent credit score?",
          options: ["700-750", "750-800", "800-850", "850-900"],
          correctAnswer: 2,
          explanation: "Credit scores of 800-850 are considered excellent and will qualify you for the best rates.",
        },
        {
          question: "What percentage of your credit score is based on credit utilization?",
          options: ["15%", "20%", "25%", "30%"],
          correctAnswer: 3,
          explanation:
            "Credit utilization accounts for 30% of your credit score, making it the second most important factor.",
        },
      ],
    },
    {
      id: "lesson-4",
      title: "Reading Your Credit Report",
      duration: "10 minutes",
      type: "text",
      content: `# Reading Your Credit Report

Your credit report contains detailed information about your credit history. Understanding how to read it is essential for managing your credit effectively.

## Main Sections of a Credit Report:

### 1. Personal Information
- Full name, current and previous addresses
- Social Security number
- Date of birth
- Employment information

### 2. Credit Accounts
- **Revolving accounts** (credit cards)
- **Installment loans** (auto loans, mortgages)
- Account status, payment history, balances

### 3. Credit Inquiries
- **Hard inquiries**: When you apply for credit
- **Soft inquiries**: Background checks that don't affect your score

### 4. Public Records
- Bankruptcies, tax liens, civil judgments
- These can significantly impact your credit score

### 5. Collections
- Accounts that have been sent to collection agencies
- Can remain on your report for up to 7 years

## Red Flags to Look For:
- Accounts you don't recognize
- Incorrect personal information
- Wrong account balances or payment history
- Duplicate accounts
- Accounts that should have been removed

Regular monitoring helps you catch errors early and protect against identity theft.`,
    },
    {
      id: "lesson-5",
      title: "Credit Utilization Explained",
      duration: "7 minutes",
      type: "video",
      content: "Learn how credit utilization affects your score and strategies to optimize it.",
      videoUrl: "/placeholder.svg?height=400&width=600&text=Credit+Utilization+Video",
    },
    {
      id: "lesson-6",
      title: "Building Credit from Scratch",
      duration: "9 minutes",
      type: "text",
      content: `# Building Credit from Scratch

If you're new to credit or have no credit history, here's how to start building a positive credit profile.

## Step 1: Get Your First Credit Card
- **Secured credit cards**: Require a deposit but easier to get approved
- **Student credit cards**: Designed for college students
- **Authorized user**: Ask family to add you to their account

## Step 2: Use Credit Responsibly
- Keep balances low (under 30% of credit limit)
- Pay your full balance every month
- Never miss a payment

## Step 3: Monitor Your Progress
- Check your credit score monthly
- Review credit reports regularly
- Look for improvements over time

## Step 4: Gradually Expand Your Credit
- After 6-12 months, apply for additional credit
- Consider different types of credit (installment loans)
- Don't apply for too much credit at once

## Timeline for Building Credit:
- **1-3 months**: First credit score appears
- **6 months**: Score becomes more stable
- **12+ months**: Eligible for better credit products

Building credit takes time and patience, but following these steps will set you on the right path.`,
    },
    {
      id: "lesson-7",
      title: "Common Credit Mistakes",
      duration: "6 minutes",
      type: "text",
      content: `# Common Credit Mistakes to Avoid

Learning from others' mistakes can save you time and money. Here are the most common credit mistakes people make.

## 1. Making Late Payments
- Even one late payment can hurt your score
- Set up automatic payments to avoid this
- Payment history is 35% of your score

## 2. Maxing Out Credit Cards
- High utilization hurts your score immediately
- Keep balances under 30% of credit limits
- Ideally, keep them under 10%

## 3. Closing Old Credit Cards
- Reduces your available credit
- Shortens your credit history
- Keep old cards open with small purchases

## 4. Applying for Too Much Credit
- Multiple hard inquiries lower your score
- Space out credit applications
- Only apply when you really need credit

## 5. Not Checking Credit Reports
- Errors are common and hurt your score
- Identity theft can go unnoticed
- Check reports at least annually

## 6. Co-signing Without Understanding Risks
- You're responsible if they don't pay
- Their payment history affects your credit
- Consider alternatives before co-signing

## 7. Ignoring Credit Altogether
- Credit affects many aspects of life
- Employers, landlords, and insurers check credit
- Start building credit early

Avoiding these mistakes will help you maintain a healthy credit profile.`,
    },
    {
      id: "lesson-8",
      title: "Final Assessment",
      duration: "10 minutes",
      type: "quiz",
      content: "Complete this final assessment to test your overall understanding of credit basics.",
      quiz: [
        {
          question: "What should you do with old credit cards you no longer use?",
          options: ["Close them immediately", "Keep them open", "Use them frequently", "Transfer the balance"],
          correctAnswer: 1,
          explanation: "Keeping old credit cards open helps maintain your credit history length and available credit.",
        },
        {
          question: "How often should you check your credit report?",
          options: ["Monthly", "Quarterly", "Annually", "Only when applying for credit"],
          correctAnswer: 2,
          explanation:
            "You should check your credit report at least annually, though more frequent monitoring is beneficial.",
        },
        {
          question: "What is the ideal credit utilization ratio?",
          options: ["Under 50%", "Under 30%", "Under 10%", "It doesn't matter"],
          correctAnswer: 2,
          explanation: "While under 30% is good, keeping utilization under 10% is ideal for the best credit scores.",
        },
        {
          question: "Which type of credit inquiry affects your credit score?",
          options: ["Soft inquiries", "Hard inquiries", "Both types", "Neither type"],
          correctAnswer: 1,
          explanation:
            "Hard inquiries, which occur when you apply for credit, can temporarily lower your credit score.",
        },
        {
          question: "How long do most negative items stay on your credit report?",
          options: ["3 years", "5 years", "7 years", "10 years"],
          correctAnswer: 2,
          explanation:
            "Most negative items, including late payments and collections, stay on your credit report for 7 years.",
        },
      ],
    },
  ],
  "advanced-disputes": [
    {
      id: "lesson-1",
      title: "Advanced Dispute Strategies Overview",
      duration: "12 minutes",
      type: "video",
      content: "Learn advanced techniques for disputing complex credit report errors.",
      videoUrl: "/placeholder.svg?height=400&width=600&text=Advanced+Disputes+Overview",
    },
    {
      id: "lesson-2",
      title: "The 609 Method Explained",
      duration: "15 minutes",
      type: "text",
      content: `# The 609 Method Explained

The 609 method refers to Section 609 of the Fair Credit Reporting Act (FCRA), which gives you the right to know what information is in your credit file.

## What is Section 609?
Section 609 requires credit bureaus to provide you with:
- All information in your file
- Sources of the information
- Anyone who has received your credit report

## How to Use the 609 Method:
1. **Request verification** of negative items
2. **Demand original contracts** and documentation
3. **Challenge incomplete responses**
4. **Follow up persistently**

## Sample 609 Letter Template:
[Date]
[Credit Bureau Address]

Dear Sir/Madam,

I am writing to request verification of the following items on my credit report:
- [List specific items]

Under Section 609 of the FCRA, I have the right to request and receive all information in my file. Please provide:
1. Complete payment history
2. Original creditor information
3. Method of verification used
4. Copy of original contract or agreement

If you cannot provide complete verification, these items must be removed from my credit report.

Sincerely,
[Your Name]

## Success Tips:
- Be specific about what you're disputing
- Keep detailed records of all correspondence
- Follow up if you don't receive a response
- Know your rights under the FCRA`,
    },
    // Add more lessons for advanced disputes...
  ],
}

export function getLessonsForCourse(courseId: string): Lesson[] {
  return courseLessons[courseId] || []
}

export function getLessonById(courseId: string, lessonId: string): Lesson | undefined {
  const lessons = courseLessons[courseId] || []
  return lessons.find((lesson) => lesson.id === lessonId)
}
