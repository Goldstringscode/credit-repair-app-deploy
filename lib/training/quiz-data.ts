/**
 * Single source of truth for all quiz content in the training platform.
 *
 * All question banks were consolidated verbatim from the previously hardcoded
 * quiz pages:
 *  - app/dashboard/training/quizzes/[quizId]/page.tsx  (credit-fundamentals, basic-disputes)
 *  - app/dashboard/training/quizzes/credit-building/page.tsx
 *  - app/dashboard/training/quizzes/legal-rights/page.tsx
 *  - app/dashboard/training/comprehensive-quiz/page.tsx
 *
 * The server grades attempts against this module (see /api/training/quiz/attempt),
 * so correct answers and explanations are never shipped to the client until after
 * an attempt is submitted.
 */

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  /** Index into options[] */
  correctAnswer: number
  explanation: string
  category: string
  difficulty?: "Easy" | "Medium" | "Hard"
  points: number
}

export interface QuizDefinition {
  id: string
  title: string
  description: string
  /** Slug of the related course in lib/courses.ts, or null for standalone quizzes */
  courseId: string | null
  courseTitle: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  category: string
  tags: string[]
  timeLimitMinutes: number
  /** Percentage required to pass (0-100) */
  passingScore: number
  questions: QuizQuestion[]
}

/** Question shape that is safe to send to the client while taking a quiz */
export interface SanitizedQuestion {
  id: string
  question: string
  options: string[]
  category: string
  difficulty?: "Easy" | "Medium" | "Hard"
  points: number
}

export interface SanitizedQuiz {
  id: string
  title: string
  description: string
  courseId: string | null
  courseTitle: string
  difficulty: string
  category: string
  tags: string[]
  timeLimitMinutes: number
  passingScore: number
  questionCount: number
  maxScore: number
  questions: SanitizedQuestion[]
}

/**
 * Legacy slugs -> canonical slugs.
 * Keeps every previously reachable quiz URL working.
 */
export const QUIZ_ALIASES: Record<string, string> = {
  "credit-fundamentals": "credit-basics-quiz",
  "basic-disputes": "dispute-strategies-quiz",
  "credit-building": "credit-building-quiz",
  "legal-rights": "legal-rights-quiz",
  "credit-score-quiz": "comprehensive-quiz",
}

export function resolveQuizId(id: string): string {
  return QUIZ_ALIASES[id] ?? id
}

const creditBasicsQuestions: QuizQuestion[] = [
  { id: "q1", question: "What is the most important factor in determining your credit score?", options: ["Length of credit history", "Payment history", "Credit utilization ratio", "Types of credit accounts"], correctAnswer: 1, explanation: "Payment history accounts for 35% of your FICO score, making it the most important factor. Consistently making on-time payments is crucial for maintaining a good credit score.", category: "Credit Basics", points: 1 },
  { id: "q2", question: "What percentage of your available credit should you ideally use?", options: ["50% or less", "30% or less", "10% or less", "90% or less"], correctAnswer: 2, explanation: "Credit experts recommend keeping your credit utilization below 10% for the best credit scores. While 30% is often cited as acceptable, lower utilization typically results in higher scores.", category: "Credit Utilization", points: 1 },
  { id: "q3", question: "How often should you check your credit report?", options: ["Once a year", "Every six months", "Monthly", "Only when applying for credit"], correctAnswer: 0, explanation: "You're entitled to one free credit report from each bureau annually through AnnualCreditReport.com. However, monitoring more frequently through other services can help catch errors early.", category: "Credit Monitoring", points: 1 },
  { id: "q4", question: "Which of the following will NOT appear on your credit report?", options: ["Bankruptcy records", "Your income", "Credit inquiries", "Payment history"], correctAnswer: 1, explanation: "Your income is not reported to credit bureaus and does not appear on your credit report. Lenders may ask for income information separately when you apply for credit.", category: "Credit Reports", points: 1 },
  { id: "q5", question: "What is a 'hard inquiry' on your credit report?", options: ["When you check your own credit", "When a lender checks your credit for a loan application", "When an employer checks your credit", "When you dispute an error"], correctAnswer: 1, explanation: "A hard inquiry occurs when a lender checks your credit as part of a loan or credit application. These can temporarily lower your credit score by a few points.", category: "Credit Inquiries", points: 1 },
  { id: "q6", question: "How long do most negative items stay on your credit report?", options: ["3 years", "5 years", "7 years", "10 years"], correctAnswer: 2, explanation: "Most negative items, including late payments, collections, and charge-offs, remain on your credit report for 7 years from the date of first delinquency.", category: "Credit History", points: 1 },
  { id: "q7", question: "What does FICO stand for?", options: ["Fair Isaac Credit Organization", "Fair Isaac Corporation", "Federal Insurance Credit Office", "Financial Industry Credit Organization"], correctAnswer: 1, explanation: "FICO stands for Fair Isaac Corporation, the company that created the FICO credit scoring model used by most lenders.", category: "Credit Scores", points: 1 },
  { id: "q8", question: "Which credit score range is considered 'excellent'?", options: ["650-699", "700-749", "750-799", "800-850"], correctAnswer: 3, explanation: "A FICO score of 800-850 is considered excellent credit. This range typically qualifies for the best interest rates and credit terms.", category: "Credit Scores", points: 1 },
  { id: "q9", question: "What is the difference between a credit report and a credit score?", options: ["They are the same thing", "A credit report is a detailed history; a credit score is a numerical summary", "A credit score is more detailed than a credit report", "Credit reports are only for lenders"], correctAnswer: 1, explanation: "A credit report is a detailed record of your credit history, while a credit score is a three-digit number that summarizes your creditworthiness based on that report.", category: "Credit Basics", points: 1 },
  { id: "q10", question: "Which action will help improve your credit score the fastest?", options: ["Opening new credit accounts", "Paying down existing balances", "Closing old credit cards", "Applying for a personal loan"], correctAnswer: 1, explanation: "Paying down existing balances reduces your credit utilization ratio, which can improve your credit score relatively quickly since utilization is calculated monthly.", category: "Credit Improvement", points: 1 },
  { id: "q11", question: "What is a credit mix and why is it important?", options: ["Having different types of credit accounts", "Mixing good and bad credit", "Using multiple credit cards", "Having both personal and business credit"], correctAnswer: 0, explanation: "Credit mix refers to having different types of credit accounts (credit cards, auto loans, mortgages, etc.). It accounts for 10% of your FICO score and shows you can manage various types of credit responsibly.", category: "Credit Types", points: 1 },
  { id: "q12", question: "What should you do if you find an error on your credit report?", options: ["Ignore it if it's small", "Contact the credit bureau to dispute it", "Wait for it to fall off naturally", "Contact the police"], correctAnswer: 1, explanation: "You should dispute errors with the credit bureau in writing. They have 30 days to investigate and must remove or correct inaccurate information.", category: "Credit Disputes", points: 1 },
  { id: "q13", question: "How many major credit bureaus are there in the United States?", options: ["Two", "Three", "Four", "Five"], correctAnswer: 1, explanation: "There are three major credit bureaus in the United States: Experian, Equifax, and TransUnion. Each maintains separate credit files and may have slightly different information.", category: "Credit Bureaus", points: 1 },
  { id: "q14", question: "What is the minimum age to have a credit report?", options: ["16 years old", "18 years old", "21 years old", "There is no minimum age"], correctAnswer: 3, explanation: "There is no minimum age to have a credit report. Minors can be added as authorized users on parents' accounts, and some may even have reports due to identity theft or errors.", category: "Credit Basics", points: 1 },
  { id: "q15", question: "What happens to your credit score when you close a credit card?", options: ["It always improves", "It always gets worse", "It may decrease due to reduced available credit", "Nothing happens"], correctAnswer: 2, explanation: "Closing a credit card reduces your total available credit, which can increase your credit utilization ratio and potentially lower your score. It may also affect your credit history length over time.", category: "Credit Management", points: 1 },
]

const disputeStrategiesQuestions: QuizQuestion[] = [
  { id: "q1", question: "What is the first step in the credit dispute process?", options: ["Contact the creditor directly", "Hire a credit repair company", "Obtain and review your credit reports", "File a complaint with the CFPB"], correctAnswer: 2, explanation: "The first step is always to obtain and carefully review your credit reports from all three bureaus to identify inaccurate, incomplete, or unverifiable information.", category: "Dispute Process", points: 1 },
  { id: "q2", question: "Under the Fair Credit Reporting Act (FCRA), how long do credit bureaus have to investigate a dispute?", options: ["15 days", "30 days", "45 days", "60 days"], correctAnswer: 1, explanation: "Credit bureaus have 30 days to investigate disputes under the FCRA. This can be extended to 45 days if you provide additional information during the investigation.", category: "Legal Requirements", points: 1 },
  { id: "q3", question: "What should you include when disputing an item with a credit bureau?", options: ["Only a verbal explanation", "A detailed letter with supporting documentation", "Just your personal opinion", "A demand for money"], correctAnswer: 1, explanation: "Effective disputes include a detailed letter explaining the error and supporting documentation. This provides the bureau with specific information to investigate your claim.", category: "Dispute Documentation", points: 1 },
  { id: "q4", question: "What is 'frivolous' dispute and why should you avoid it?", options: ["A dispute without merit that bureaus can dismiss", "A dispute filed too frequently", "A dispute for small amounts", "A dispute filed online"], correctAnswer: 0, explanation: "A frivolous dispute is one without merit or basis. Credit bureaus can dismiss these without investigation, so it's important to have legitimate grounds for your disputes.", category: "Dispute Strategy", points: 1 },
  { id: "q5", question: "Which method of dispute submission is generally most effective?", options: ["Online dispute forms", "Phone calls", "Certified mail", "Email"], correctAnswer: 2, explanation: "Certified mail provides proof of delivery and creates a paper trail. While online disputes are convenient, mail disputes often receive more thorough investigation.", category: "Dispute Methods", points: 1 },
  { id: "q6", question: "What happens if a credit bureau doesn't respond to your dispute within the required timeframe?", options: ["Nothing, you must wait longer", "The item must be removed", "You can file a lawsuit immediately", "The dispute is automatically denied"], correctAnswer: 1, explanation: "If a credit bureau fails to respond within 30 days (or 45 days if extended), they must remove the disputed item from your credit report.", category: "Legal Rights", points: 1 },
  { id: "q7", question: "What is the difference between disputing with credit bureaus vs. creditors?", options: ["There is no difference", "Bureaus investigate accuracy; creditors investigate validity", "Only bureaus can remove items", "Creditors are faster"], correctAnswer: 1, explanation: "Credit bureaus investigate whether information is accurate and verifiable, while creditors (furnishers) investigate the validity and completeness of the debt itself.", category: "Dispute Strategy", points: 1 },
  { id: "q8", question: "What should you do if your dispute is denied?", options: ["Give up immediately", "File the same dispute again", "Request method of verification or dispute with the creditor", "Hire an attorney immediately"], correctAnswer: 2, explanation: "If denied, you can request the method of verification from the bureau or dispute directly with the creditor. You may also have grounds for a second dispute with additional information.", category: "Dispute Follow-up", points: 1 },
  { id: "q9", question: "What is a 'method of verification' request?", options: ["Asking how the bureau verified disputed information", "Requesting your credit score calculation", "Asking for proof of your identity", "Requesting a copy of your credit report"], correctAnswer: 0, explanation: "A method of verification request asks the credit bureau to explain how they verified the disputed information, which can reveal weaknesses in their investigation process.", category: "Advanced Disputes", points: 1 },
  { id: "q10", question: "Which items are typically easiest to dispute successfully?", options: ["Recent accurate items", "Old, incomplete, or inaccurate items", "Large debt amounts", "Items from major banks"], correctAnswer: 1, explanation: "Older items, incomplete information, or clearly inaccurate data are typically easier to dispute successfully because they're harder for creditors to verify.", category: "Dispute Strategy", points: 1 },
  { id: "q11", question: "What is the 'nuclear option' in credit disputes?", options: ["Filing bankruptcy", "Disputing everything at once", "Hiring multiple attorneys", "Closing all credit accounts"], correctAnswer: 1, explanation: "The 'nuclear option' refers to disputing all negative items simultaneously. While sometimes effective, it can backfire if bureaus flag your disputes as frivolous.", category: "Dispute Strategy", points: 1 },
  { id: "q12", question: "How should you handle medical collections on your credit report?", options: ["Ignore them since they don't matter", "Pay them immediately", "Dispute them and request validation", "File for bankruptcy"], correctAnswer: 2, explanation: "Medical collections should be disputed and validated like any other debt. Many medical collections contain errors or may be removed if the original creditor can't verify them properly.", category: "Medical Debt", points: 1 },
  { id: "q13", question: "What is 'pay for delete' and is it legal?", options: ["An illegal practice that should be avoided", "A legal agreement to remove items after payment", "A type of credit card", "A government program"], correctAnswer: 1, explanation: "Pay for delete is a legal agreement where a creditor agrees to remove a negative item in exchange for payment. While not guaranteed, it's a legitimate negotiation strategy.", category: "Negotiation", points: 1 },
  { id: "q14", question: "What should you do before disputing student loan defaults?", options: ["File bankruptcy", "Ignore them completely", "Research rehabilitation and consolidation options", "Move to another country"], correctAnswer: 2, explanation: "Before disputing student loan defaults, research rehabilitation, consolidation, or forgiveness programs that might be more beneficial than simple dispute strategies.", category: "Student Loans", points: 1 },
  { id: "q15", question: "How long should you keep dispute-related documentation?", options: ["30 days", "1 year", "3 years", "Indefinitely"], correctAnswer: 3, explanation: "Keep all dispute documentation indefinitely. Items can reappear on credit reports, and you may need this documentation for future disputes or legal action.", category: "Record Keeping", points: 1 },
  { id: "q16", question: "What is the best approach for disputing multiple items?", options: ["Dispute everything at once", "Dispute items strategically in small batches", "Only dispute the largest items", "Wait until all items are old"], correctAnswer: 1, explanation: "Disputing items in small, strategic batches (3-5 items at a time) is often more effective than mass disputes, which may be flagged as frivolous.", category: "Dispute Strategy", points: 1 },
  { id: "q17", question: "What should you do if the same item appears on multiple credit reports?", options: ["Only dispute it with one bureau", "Dispute it with all three bureaus separately", "Choose the bureau with the worst version", "Ignore the duplicates"], correctAnswer: 1, explanation: "You must dispute the item with each credit bureau separately, as they maintain independent files and don't automatically share dispute results.", category: "Multiple Bureaus", points: 1 },
  { id: "q18", question: "What is a 'goodwill letter' and when should you use it?", options: ["A legal demand letter", "A polite request to remove accurate but negative items", "A complaint to regulators", "A dispute letter template"], correctAnswer: 1, explanation: "A goodwill letter is a polite request to a creditor asking them to remove accurate but negative information as a gesture of goodwill, often used for isolated late payments.", category: "Goodwill Requests", points: 1 },
]

const creditBuildingQuestions: QuizQuestion[] = [
  { id: "cb1", question: "What is the best first step for someone with no credit history?", options: ["Apply for multiple credit cards", "Get a secured credit card", "Take out a personal loan", "Wait until you're older"], correctAnswer: 1, explanation: "A secured credit card is the best first step for building credit from scratch. It requires a deposit that serves as your credit limit, making it accessible even with no credit history.", category: "Credit Building Basics", difficulty: "Easy", points: 5 },
  { id: "cb2", question: "How much should you deposit on a secured credit card?", options: ["$50-100", "$200-500", "$1000+", "As much as possible"], correctAnswer: 1, explanation: "$200-500 is typically the sweet spot for a secured card deposit. It provides enough credit limit to be useful while not tying up too much money.", category: "Secured Cards", difficulty: "Easy", points: 5 },
  { id: "cb3", question: "What is 'credit piggybacking'?", options: ["Using someone else's credit card", "Being added as an authorized user", "Copying someone's credit information", "Sharing credit accounts illegally"], correctAnswer: 1, explanation: "Credit piggybacking involves being added as an authorized user on someone else's credit card account to potentially benefit from their positive payment history and low utilization.", category: "Authorized Users", difficulty: "Medium", points: 10 },
  { id: "cb4", question: "Which type of account helps build credit mix?", options: ["Only credit cards", "Only loans", "A variety of credit types", "Checking accounts"], correctAnswer: 2, explanation: "Credit mix accounts for 10% of your FICO score. Having different types of credit (credit cards, auto loans, mortgages, etc.) shows you can manage various forms of credit responsibly.", category: "Credit Mix", difficulty: "Medium", points: 10 },
  { id: "cb5", question: "How long does it typically take to build a good credit score from scratch?", options: ["1-3 months", "6-12 months", "2-3 years", "5+ years"], correctAnswer: 1, explanation: "With responsible use, you can typically build a good credit score (700+) within 6-12 months. However, building excellent credit (800+) usually takes 2-3 years or more.", category: "Timeline", difficulty: "Medium", points: 10 },
  { id: "cb6", question: "What is a credit builder loan?", options: ["A loan to pay off credit cards", "A loan where funds are held until paid off", "A loan for home improvements", "A loan with no interest"], correctAnswer: 1, explanation: "A credit builder loan is where the lender holds the loan amount in a savings account while you make payments. Once paid off, you receive the funds, and the payment history helps build credit.", category: "Credit Builder Loans", difficulty: "Medium", points: 10 },
  { id: "cb7", question: "Should you close your first credit card once you get better cards?", options: ["Yes, to avoid fees", "No, keep it open", "Only if it has an annual fee", "It doesn't matter"], correctAnswer: 1, explanation: "Generally, you should keep your first credit card open as it helps with credit history length and available credit. Only consider closing if there's a high annual fee and you can't get it waived.", category: "Account Management", difficulty: "Medium", points: 10 },
  { id: "cb8", question: "What's the ideal number of credit cards for building credit?", options: ["1 card", "2-4 cards", "5-10 cards", "As many as possible"], correctAnswer: 1, explanation: "2-4 credit cards is typically ideal for building credit. This provides enough credit mix and available credit without being difficult to manage or appearing risky to lenders.", category: "Credit Cards", difficulty: "Medium", points: 10 },
  { id: "cb9", question: "When should you ask for a credit limit increase?", options: ["Immediately after getting the card", "After 6-12 months of good payment history", "Only when you need more credit", "Never ask, wait for automatic increases"], correctAnswer: 1, explanation: "After 6-12 months of responsible use and on-time payments, you can request a credit limit increase. This can help lower your utilization ratio and improve your credit score.", category: "Credit Limits", difficulty: "Medium", points: 10 },
  { id: "cb10", question: "What is the 'thin file' problem?", options: ["Having too many credit accounts", "Having insufficient credit history", "Having a low credit score", "Having errors on your credit report"], correctAnswer: 1, explanation: "A 'thin file' refers to having insufficient credit history to generate a credit score. This typically affects people new to credit or those who haven't used credit in a long time.", category: "Credit History", difficulty: "Hard", points: 15 },
  { id: "cb11", question: "Which secured card feature is most important for credit building?", options: ["Low fees", "High credit limit", "Reports to all three credit bureaus", "Rewards program"], correctAnswer: 2, explanation: "The most important feature is that the secured card reports to all three major credit bureaus (Experian, Equifax, TransUnion). Without reporting, the card won't help build your credit.", category: "Secured Cards", difficulty: "Hard", points: 15 },
  { id: "cb12", question: "What is 'credit seasoning'?", options: ["Adding spices to credit applications", "The aging process of credit accounts", "Improving credit through disputes", "Paying off all debts at once"], correctAnswer: 1, explanation: "Credit seasoning refers to the aging process of credit accounts. Older accounts with good payment history are viewed more favorably and contribute to a stronger credit profile.", category: "Credit History", difficulty: "Hard", points: 15 },
  { id: "cb13", question: "How does being an authorized user affect the primary cardholder?", options: ["It always hurts their credit", "It has no effect on their credit", "It can affect their credit if the AU overspends", "It always helps their credit"], correctAnswer: 2, explanation: "The authorized user's spending affects the primary cardholder's utilization ratio and payment obligations. If the AU overspends or doesn't pay their portion, it can negatively impact the primary cardholder's credit.", category: "Authorized Users", difficulty: "Hard", points: 15 },
  { id: "cb14", question: "What is the 'credit utilization sweet spot' for building credit?", options: ["0% utilization", "1-9% utilization", "10-30% utilization", "30-50% utilization"], correctAnswer: 1, explanation: "1-9% utilization is the sweet spot for building credit. 0% can sometimes be viewed as inactive, while 1-9% shows you use credit responsibly without being dependent on it.", category: "Credit Utilization", difficulty: "Hard", points: 15 },
  { id: "cb15", question: "Which strategy helps build credit fastest?", options: ["Making minimum payments only", "Paying off balances in full monthly", "Carrying small balances", "Using cash for everything"], correctAnswer: 1, explanation: "Paying off balances in full monthly is the fastest way to build credit. It shows responsible use, keeps utilization low, avoids interest charges, and demonstrates strong payment history.", category: "Payment Strategy", difficulty: "Medium", points: 10 },
  { id: "cb16", question: "What is a 'student credit card' and who should use it?", options: ["Any card used by students", "Cards designed for students with limited credit history", "Cards only for graduate students", "Cards with educational rewards"], correctAnswer: 1, explanation: "Student credit cards are designed for college students with limited or no credit history. They typically have lower credit requirements and may offer educational resources about credit management.", category: "Student Credit", difficulty: "Easy", points: 5 },
  { id: "cb17", question: "How often should you check your credit when building credit?", options: ["Daily", "Weekly", "Monthly", "Annually"], correctAnswer: 2, explanation: "Monthly monitoring is ideal when building credit. It allows you to track progress, catch errors early, and understand how your actions affect your credit score without obsessing over daily fluctuations.", category: "Credit Monitoring", difficulty: "Easy", points: 5 },
  { id: "cb18", question: "What is the biggest mistake people make when building credit?", options: ["Not using credit at all", "Applying for too many cards at once", "Only making minimum payments", "Not checking their credit report"], correctAnswer: 1, explanation: "Applying for too many cards at once is a major mistake. It results in multiple hard inquiries, can lower your credit score, and makes you appear desperate for credit to lenders.", category: "Common Mistakes", difficulty: "Medium", points: 10 },
  { id: "cb19", question: "How does income affect credit building?", options: ["Higher income always means better credit", "Income doesn't directly affect credit scores", "You need high income to build credit", "Income determines your credit limit"], correctAnswer: 1, explanation: "Income doesn't directly affect credit scores, but it can influence credit limits and loan approvals. You can build excellent credit regardless of income level through responsible credit management.", category: "Income and Credit", difficulty: "Medium", points: 10 },
  { id: "cb20", question: "What should you do if your secured card doesn't graduate to unsecured?", options: ["Keep it forever", "Close it immediately", "Apply for an unsecured card elsewhere", "Increase the deposit"], correctAnswer: 2, explanation: "If your secured card doesn't graduate after 12-18 months of good payment history, consider applying for an unsecured card elsewhere while keeping the secured card open to maintain credit history.", category: "Card Graduation", difficulty: "Hard", points: 15 },
]

const legalRightsQuestions: QuizQuestion[] = [
  { id: "lr1", question: "What does FCRA stand for?", options: ["Fair Credit Reporting Act", "Federal Credit Reporting Agency", "Fair Consumer Rights Act", "Federal Consumer Reporting Act"], correctAnswer: 0, explanation: "FCRA stands for Fair Credit Reporting Act, the federal law that regulates how consumer credit information is collected, shared, and used.", category: "FCRA Basics", difficulty: "Easy", points: 5 },
  { id: "lr2", question: "Under the FCRA, how long do credit bureaus have to investigate disputes?", options: ["15 days", "30 days", "45 days", "60 days"], correctAnswer: 1, explanation: "Credit bureaus have 30 days to investigate disputes under the FCRA. This can be extended to 45 days if you provide additional information during the investigation.", category: "FCRA Rights", difficulty: "Easy", points: 5 },
  { id: "lr3", question: "What does FDCPA stand for?", options: ["Fair Debt Collection Practices Act", "Federal Debt Collection Protection Act", "Fair Debt Consumer Protection Act", "Federal Debt Collection Procedures Act"], correctAnswer: 0, explanation: "FDCPA stands for Fair Debt Collection Practices Act, which regulates how debt collectors can communicate with and treat consumers.", category: "FDCPA Basics", difficulty: "Easy", points: 5 },
  { id: "lr4", question: "Under the FDCPA, when can debt collectors NOT contact you?", options: ["Before 8 AM or after 9 PM", "At your workplace if prohibited", "When you have an attorney", "All of the above"], correctAnswer: 3, explanation: "The FDCPA prohibits debt collectors from contacting you before 8 AM or after 9 PM, at work if prohibited, or directly if you have legal representation.", category: "FDCPA Rights", difficulty: "Medium", points: 10 },
  { id: "lr5", question: "What is a 'validation letter' under the FDCPA?", options: ["A letter validating your identity", "A letter requesting proof of debt", "A letter validating your address", "A letter from your attorney"], correctAnswer: 1, explanation: "A validation letter requests that a debt collector provide proof that you owe the debt, including the original creditor's name and the amount owed.", category: "Debt Validation", difficulty: "Medium", points: 10 },
  { id: "lr6", question: "How long do you have to request debt validation after first contact?", options: ["15 days", "30 days", "45 days", "60 days"], correctAnswer: 1, explanation: "You have 30 days from the first contact to request debt validation. The collector must stop collection efforts until they provide validation.", category: "Debt Validation", difficulty: "Medium", points: 10 },
  { id: "lr7", question: "What does FCBA stand for?", options: ["Fair Credit Billing Act", "Federal Credit Bureau Act", "Fair Consumer Banking Act", "Federal Credit Billing Agency"], correctAnswer: 0, explanation: "FCBA stands for Fair Credit Billing Act, which provides protection against billing errors on credit card and other revolving credit accounts.", category: "FCBA Basics", difficulty: "Easy", points: 5 },
  { id: "lr8", question: "Under the FCBA, how long do you have to dispute a billing error?", options: ["30 days", "60 days", "90 days", "120 days"], correctAnswer: 1, explanation: "Under the FCBA, you have 60 days from when the statement was mailed to dispute a billing error in writing.", category: "FCBA Rights", difficulty: "Medium", points: 10 },
  { id: "lr9", question: "What is the maximum penalty for willful FCRA violations?", options: ["$1,000", "$2,500", "$5,000", "No maximum"], correctAnswer: 3, explanation: "There is no maximum penalty for willful FCRA violations. Courts can award actual damages, punitive damages, and attorney fees.", category: "FCRA Violations", difficulty: "Hard", points: 15 },
  { id: "lr10", question: "What is 'furnisher liability' under the FCRA?", options: ["Liability of furniture companies", "Responsibility of creditors reporting to bureaus", "Liability of credit repair companies", "Responsibility of consumers"], correctAnswer: 1, explanation: "Furnisher liability refers to the legal responsibility of creditors and other entities that report information to credit bureaus to ensure accuracy.", category: "Furnisher Liability", difficulty: "Hard", points: 15 },
  { id: "lr11", question: "Under the FDCPA, what must be included in the initial communication?", options: ["Amount of debt only", "Creditor name only", "Validation notice", "Payment options only"], correctAnswer: 2, explanation: "The initial communication must include a validation notice explaining your right to dispute the debt and request validation within 30 days.", category: "FDCPA Requirements", difficulty: "Medium", points: 10 },
  { id: "lr12", question: "What is the statute of limitations for FDCPA violations?", options: ["6 months", "1 year", "2 years", "3 years"], correctAnswer: 1, explanation: "You have one year from the date of the FDCPA violation to file a lawsuit against a debt collector.", category: "FDCPA Violations", difficulty: "Hard", points: 15 },
  { id: "lr13", question: "What is a 'permissible purpose' under the FCRA?", options: ["Any reason to check credit", "Legitimate business need for credit info", "Curiosity about someone's credit", "Employment background checks only"], correctAnswer: 1, explanation: "A permissible purpose is a legitimate business need for credit information, such as credit applications, employment screening (with consent), or insurance underwriting.", category: "Permissible Purpose", difficulty: "Medium", points: 10 },
  { id: "lr14", question: "What is 'method of verification' (MOV) under the FCRA?", options: ["How you verify your identity", "How bureaus verify disputed information", "How creditors verify payments", "How consumers verify reports"], correctAnswer: 1, explanation: "Method of verification refers to how credit bureaus verify disputed information, which they must provide to consumers upon request.", category: "Verification Process", difficulty: "Hard", points: 15 },
  { id: "lr15", question: "Under the FCRA, who can access your credit report?", options: ["Anyone who pays for it", "Only you", "Only those with permissible purpose", "Government agencies only"], correctAnswer: 2, explanation: "Only entities with a permissible purpose under the FCRA can access your credit report, such as lenders, employers (with consent), and landlords.", category: "Credit Report Access", difficulty: "Medium", points: 10 },
  { id: "lr16", question: "What is the maximum FDCPA penalty for individual violations?", options: ["$500", "$1,000", "$2,500", "$5,000"], correctAnswer: 1, explanation: "The maximum penalty for individual FDCPA violations is $1,000, plus actual damages and attorney fees.", category: "FDCPA Penalties", difficulty: "Medium", points: 10 },
  { id: "lr17", question: "What is a 'cease and desist' letter?", options: ["A letter to stop credit reporting", "A letter to stop debt collection contact", "A letter to stop credit inquiries", "A letter to stop employment checks"], correctAnswer: 1, explanation: "A cease and desist letter instructs debt collectors to stop contacting you. Under the FDCPA, they must comply except to notify you of specific actions.", category: "Cease and Desist", difficulty: "Medium", points: 10 },
  { id: "lr18", question: "What is 'reinvestigation' under the FCRA?", options: ["A second credit check", "Bureau's process for investigating disputes", "Creditor's review of accounts", "Consumer's right to review reports"], correctAnswer: 1, explanation: "Reinvestigation is the credit bureau's process of investigating disputed information by contacting the furnisher of the information.", category: "Dispute Process", difficulty: "Medium", points: 10 },
  { id: "lr19", question: "Under the FCRA, what happens if a furnisher doesn't respond to a dispute?", options: ["Nothing happens", "Information must be deleted", "Investigation continues", "Consumer pays penalty"], correctAnswer: 1, explanation: "If a furnisher doesn't respond to a dispute within the required timeframe, the credit bureau must delete the disputed information.", category: "Furnisher Response", difficulty: "Hard", points: 15 },
  { id: "lr20", question: "What is the 'business day rule' under the FCBA?", options: ["Disputes must be filed on business days", "Creditors have 2 business days to respond", "Payments posted within 2 business days", "Statements mailed on business days only"], correctAnswer: 1, explanation: "Under the FCBA, creditors must acknowledge billing error disputes within 30 days and resolve them within 2 billing cycles (but not more than 90 days).", category: "FCBA Timeline", difficulty: "Hard", points: 15 },
  { id: "lr21", question: "What is 'mixed file' under the FCRA?", options: ["A file with multiple credit types", "Information from different consumers mixed together", "A file with both positive and negative items", "A file with disputed items"], correctAnswer: 1, explanation: "A mixed file occurs when credit information from different consumers is incorrectly combined in one credit report, often due to similar names or SSNs.", category: "Credit Report Errors", difficulty: "Hard", points: 15 },
  { id: "lr22", question: "Under the FDCPA, what constitutes harassment?", options: ["Calling once per day", "Sending written notices", "Repeated calls intended to annoy", "Requesting payment"], correctAnswer: 2, explanation: "Harassment under the FDCPA includes repeated phone calls intended to annoy, abuse, or harass, as well as threats of violence or use of obscene language.", category: "FDCPA Harassment", difficulty: "Medium", points: 10 },
  { id: "lr23", question: "What is the 'original creditor' exception under the FDCPA?", options: ["Original creditors are exempt from FDCPA", "Original creditors have more rights", "Original creditors can't collect debts", "Original creditors must validate debts"], correctAnswer: 0, explanation: "Original creditors are generally exempt from the FDCPA. The act primarily applies to third-party debt collectors, not the original creditor collecting their own debts.", category: "FDCPA Scope", difficulty: "Hard", points: 15 },
  { id: "lr24", question: "What is 'summary judgment' in credit law?", options: ["A quick court decision", "A judgment without trial when facts aren't disputed", "A judgment in favor of consumers", "A judgment requiring payment"], correctAnswer: 1, explanation: "Summary judgment is a court ruling without trial when there are no genuine disputes about material facts, often used in debt collection cases.", category: "Legal Procedures", difficulty: "Hard", points: 15 },
  { id: "lr25", question: "What is the 'bona fide error' defense under the FDCPA?", options: ["Collectors can make any error", "Defense for unintentional violations with procedures to avoid errors", "Errors are always acceptable", "Defense for intentional violations"], correctAnswer: 1, explanation: "The bona fide error defense protects debt collectors from liability for unintentional violations if they had procedures in place to avoid such errors.", category: "FDCPA Defenses", difficulty: "Hard", points: 15 },
]

const comprehensiveQuestions: QuizQuestion[] = [
  { id: "q1", question: "What is the most significant factor affecting your credit score?", options: ["Credit utilization ratio", "Payment history", "Length of credit history", "Types of credit used"], correctAnswer: 1, explanation: "Payment history accounts for 35% of your credit score, making it the most important factor. Consistently making on-time payments is crucial for maintaining a good credit score.", category: "Credit Basics", difficulty: "Easy", points: 5 },
  { id: "q2", question: "Under the Fair Credit Reporting Act (FCRA), how long can most negative information remain on your credit report?", options: ["5 years", "7 years", "10 years", "15 years"], correctAnswer: 1, explanation: "Most negative information, including late payments, collections, and charge-offs, can remain on your credit report for 7 years from the date of first delinquency.", category: "Legal Rights", difficulty: "Medium", points: 10 },
  { id: "q3", question: "What is the ideal credit utilization ratio to maintain for optimal credit scores?", options: ["Under 50%", "Under 30%", "Under 10%", "Under 5%"], correctAnswer: 2, explanation: "While keeping utilization under 30% is generally recommended, maintaining it under 10% typically results in the highest credit scores. Lower utilization demonstrates better credit management.", category: "Credit Optimization", difficulty: "Medium", points: 10 },
  { id: "q4", question: "Which dispute method involves requesting verification of debt under Section 609 of the FCRA?", options: ["Direct dispute with creditor", "609 verification method", "Goodwill letter", "Pay-for-delete agreement"], correctAnswer: 1, explanation: "The 609 method involves requesting that credit bureaus provide verification and documentation of negative items on your credit report, as required under Section 609 of the FCRA.", category: "Advanced Disputes", difficulty: "Hard", points: 15 },
  { id: "q5", question: "How many days do credit bureaus have to investigate a dispute under the FCRA?", options: ["15 days", "30 days", "45 days", "60 days"], correctAnswer: 1, explanation: "Credit bureaus must complete their investigation within 30 days of receiving a dispute, unless they determine the dispute is frivolous or irrelevant.", category: "Legal Rights", difficulty: "Medium", points: 10 },
  { id: "q6", question: "What happens to your credit score when you close an old credit card account?", options: ["It always improves", "It typically decreases", "It has no effect", "It only affects utilization"], correctAnswer: 1, explanation: "Closing old credit cards typically decreases your credit score by reducing your available credit (increasing utilization) and potentially shortening your credit history length.", category: "Credit Management", difficulty: "Medium", points: 10 },
  { id: "q7", question: "Which type of credit inquiry does NOT affect your credit score?", options: ["Mortgage application", "Credit card application", "Employer background check", "Auto loan application"], correctAnswer: 2, explanation: "Employer background checks are considered 'soft inquiries' and do not affect your credit score. Only 'hard inquiries' from credit applications impact your score.", category: "Credit Basics", difficulty: "Easy", points: 5 },
  { id: "q8", question: "What is a 'pay-for-delete' agreement?", options: ["Paying to remove accurate information", "Negotiating to remove negative items upon payment", "Paying credit bureaus to delete reports", "Automatic deletion after payment"], correctAnswer: 1, explanation: "A pay-for-delete agreement is a negotiation with a creditor or collection agency where they agree to remove the negative item from your credit report in exchange for payment.", category: "Advanced Disputes", difficulty: "Hard", points: 15 },
  { id: "q9", question: "How long does a bankruptcy remain on your credit report?", options: ["7 years", "10 years", "15 years", "Permanently"], correctAnswer: 1, explanation: "Chapter 7 bankruptcy remains on your credit report for 10 years, while Chapter 13 bankruptcy remains for 7 years from the filing date.", category: "Legal Rights", difficulty: "Medium", points: 10 },
  { id: "q10", question: "What is the primary purpose of a goodwill letter?", options: ["To dispute inaccurate information", "To request removal of accurate negative items", "To negotiate payment terms", "To request credit limit increases"], correctAnswer: 1, explanation: "A goodwill letter is used to request the removal of accurate negative information based on your positive payment history and relationship with the creditor.", category: "Credit Repair Strategies", difficulty: "Medium", points: 10 },
  { id: "q11", question: "Which credit scoring model is most commonly used by lenders?", options: ["VantageScore 3.0", "FICO Score 8", "TransUnion Score", "Experian Score"], correctAnswer: 1, explanation: "FICO Score 8 is the most widely used credit scoring model by lenders, though newer versions like FICO Score 9 and 10 are being adopted.", category: "Credit Basics", difficulty: "Medium", points: 10 },
  { id: "q12", question: "What is 'credit piggybacking'?", options: ["Using someone else's credit card", "Being added as an authorized user", "Copying someone's credit profile", "Sharing credit accounts illegally"], correctAnswer: 1, explanation: "Credit piggybacking involves being added as an authorized user on someone else's credit card account to potentially benefit from their positive payment history.", category: "Advanced Strategies", difficulty: "Hard", points: 15 },
  { id: "q13", question: "How often should you check your credit reports for errors?", options: ["Monthly", "Quarterly", "Annually", "Only when applying for credit"], correctAnswer: 2, explanation: "You should check your credit reports at least annually from all three bureaus. You're entitled to one free report per year from each bureau through annualcreditreport.com.", category: "Credit Monitoring", difficulty: "Easy", points: 5 },
  { id: "q14", question: "What is the statute of limitations for most debts?", options: ["3-6 years", "7-10 years", "10-15 years", "No limit"], correctAnswer: 0, explanation: "The statute of limitations for most debts varies by state and debt type but typically ranges from 3-6 years. After this period, creditors cannot sue you for the debt.", category: "Legal Rights", difficulty: "Hard", points: 15 },
  { id: "q15", question: "What is the best strategy for building credit from scratch?", options: ["Apply for multiple credit cards", "Get a secured credit card", "Take out a large loan", "Wait for credit to build naturally"], correctAnswer: 1, explanation: "A secured credit card is often the best way to build credit from scratch. It requires a deposit but helps establish payment history and credit utilization patterns.", category: "Credit Building", difficulty: "Easy", points: 5 },
]

export const QUIZZES: Record<string, QuizDefinition> = {
  "credit-basics-quiz": {
    id: "credit-basics-quiz",
    title: "Credit Fundamentals Quiz",
    description: "Test your understanding of basic credit concepts, scores, and reports",
    courseId: "credit-basics",
    courseTitle: "Credit Basics & Fundamentals",
    difficulty: "Beginner",
    category: "Fundamentals",
    tags: ["Credit Report", "FICO Score", "Basics"],
    timeLimitMinutes: 20,
    passingScore: 70,
    questions: creditBasicsQuestions,
  },
  "dispute-strategies-quiz": {
    id: "dispute-strategies-quiz",
    title: "Dispute Strategies & Techniques",
    description: "Test your knowledge of credit dispute methods and legal rights",
    courseId: "advanced-disputes",
    courseTitle: "Advanced Dispute Strategies",
    difficulty: "Advanced",
    category: "Disputes",
    tags: ["FCRA", "Disputes", "Legal Rights"],
    timeLimitMinutes: 22,
    passingScore: 70,
    questions: disputeStrategiesQuestions,
  },
  "credit-building-quiz": {
    id: "credit-building-quiz",
    title: "Credit Building Mastery Quiz",
    description: "Test knowledge of building and maintaining good credit",
    courseId: "credit-building-strategies",
    courseTitle: "Credit Building Strategies",
    difficulty: "Intermediate",
    category: "Credit Building",
    tags: ["Building Credit", "Maintenance", "Strategies"],
    timeLimitMinutes: 30,
    passingScore: 75,
    questions: creditBuildingQuestions,
  },
  "legal-rights-quiz": {
    id: "legal-rights-quiz",
    title: "Consumer Legal Rights Quiz",
    description: "Understanding your rights under consumer protection laws",
    courseId: "legal-credit-repair",
    courseTitle: "Legal Credit Repair",
    difficulty: "Intermediate",
    category: "Legal",
    tags: ["FCRA", "FDCPA", "Rights"],
    timeLimitMinutes: 40,
    passingScore: 75,
    questions: legalRightsQuestions,
  },
  "comprehensive-quiz": {
    id: "comprehensive-quiz",
    title: "Comprehensive Credit Repair Quiz",
    description: "A full assessment covering credit basics, disputes, legal rights, and credit building",
    courseId: null,
    courseTitle: "All Courses",
    difficulty: "Advanced",
    category: "Comprehensive",
    tags: ["FICO", "FCRA", "Disputes", "Credit Building"],
    timeLimitMinutes: 30,
    passingScore: 70,
    questions: comprehensiveQuestions,
  },
}

export function getQuiz(id: string): QuizDefinition | null {
  return QUIZZES[resolveQuizId(id)] ?? null
}

export function getMaxScore(quiz: QuizDefinition): number {
  return quiz.questions.reduce((sum, q) => sum + q.points, 0)
}

/** Quiz catalog metadata without any question content */
export function getQuizList() {
  return Object.values(QUIZZES).map(quiz => ({
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    courseId: quiz.courseId,
    courseTitle: quiz.courseTitle,
    difficulty: quiz.difficulty,
    category: quiz.category,
    tags: quiz.tags,
    timeLimitMinutes: quiz.timeLimitMinutes,
    passingScore: quiz.passingScore,
    questionCount: quiz.questions.length,
    maxScore: getMaxScore(quiz),
  }))
}

/** Quiz with questions but WITHOUT correct answers or explanations */
export function getSanitizedQuiz(id: string): SanitizedQuiz | null {
  const quiz = getQuiz(id)
  if (!quiz) return null
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    courseId: quiz.courseId,
    courseTitle: quiz.courseTitle,
    difficulty: quiz.difficulty,
    category: quiz.category,
    tags: quiz.tags,
    timeLimitMinutes: quiz.timeLimitMinutes,
    passingScore: quiz.passingScore,
    questionCount: quiz.questions.length,
    maxScore: getMaxScore(quiz),
    questions: quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      category: q.category,
      difficulty: q.difficulty,
      points: q.points,
    })),
  }
}

export interface QuestionReview {
  questionId: string
  question: string
  options: string[]
  selectedIndex: number | null
  correctIndex: number
  isCorrect: boolean
  explanation: string
  points: number
  pointsEarned: number
}

export interface GradeResult {
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  correctAnswers: number
  totalQuestions: number
  passingScore: number
  review: QuestionReview[]
}

/**
 * Server-side grading. `answers` maps questionId -> selected option index.
 */
export function gradeQuiz(id: string, answers: Record<string, number>): GradeResult | null {
  const quiz = getQuiz(id)
  if (!quiz) return null

  let score = 0
  let correctAnswers = 0
  const maxScore = getMaxScore(quiz)

  const review: QuestionReview[] = quiz.questions.map(q => {
    const raw = answers?.[q.id]
    const selectedIndex = typeof raw === "number" && Number.isInteger(raw) && raw >= 0 && raw < q.options.length ? raw : null
    const isCorrect = selectedIndex === q.correctAnswer
    const pointsEarned = isCorrect ? q.points : 0
    if (isCorrect) {
      score += q.points
      correctAnswers++
    }
    return {
      questionId: q.id,
      question: q.question,
      options: q.options,
      selectedIndex,
      correctIndex: q.correctAnswer,
      isCorrect,
      explanation: q.explanation,
      points: q.points,
      pointsEarned,
    }
  })

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
  const passed = percentage >= quiz.passingScore

  return {
    score,
    maxScore,
    percentage,
    passed,
    correctAnswers,
    totalQuestions: quiz.questions.length,
    passingScore: quiz.passingScore,
    review,
  }
}
