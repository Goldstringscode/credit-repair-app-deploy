/**
 * Single source of truth for all training course + lesson content.
 *
 * Every course in this file renders through the same template
 * (components/training/course-view.tsx). Progress and completion are
 * persisted per user in the `training_progress` Supabase table via
 * /api/training/progress — never in browser localStorage.
 *
 * Credit Basics' and Advanced Disputes' lesson content was ported verbatim
 * from the previous per-course pages. Legal Rights, Credit Building,
 * Business Credit, and Mortgage Preparation had no real lesson content
 * before this rebuild; their lessons are new.
 */

export interface CourseLesson {
  /** Stable id, persisted as lesson_id in training_progress */
  id: string
  title: string
  duration: string
  description: string
  /** Rich HTML, rendered directly in the Lesson tab */
  content: string
}

export interface CourseDefinition {
  /** Stable id, matches the route segment and course_id in training_progress */
  id: string
  title: string
  tagline: string
  description: string
  whatYouWillLearn: string[]
  instructor: string
  rating: number
  students: number
  level: "Beginner" | "Intermediate" | "Advanced"
  category: string
  duration: string
  tags: string[]
  /** Free-tier users cannot access this course */
  requiresPaid: boolean
  lessons: CourseLesson[]
}

/** Display order for the training hub and for "first 3 are free" gating */
export const COURSE_ORDER = [
  "credit-basics",
  "advanced-disputes",
  "legal-rights",
  "credit-building",
  "business-credit",
  "mortgage-preparation",
] as const

export const COURSES: Record<string, CourseDefinition> = {
  "credit-basics": {
    id: "credit-basics",
    title: "Credit Basics & Fundamentals",
    tagline: "Credit Basics 101",
    description: "Learn the foundation of credit repair and understand how credit scores work.",
    whatYouWillLearn: [
      "What credit is and the different types of credit accounts",
      "How your credit score is calculated and what moves it",
      "How to read every section of your credit report",
      "The habits that build strong, lasting credit health",
    ],
    instructor: "Maria Garcia, Credit Counselor",
    rating: 4.9,
    students: 15847,
    level: "Beginner",
    category: "Fundamentals",
    duration: "45 min",
    tags: ["Credit Score", "Basics", "FICO"],
    requiresPaid: false,
    lessons: [
      {
        id: "lesson-1",
        title: "What is Credit?",
        duration: "5 min",
        description: "Understanding the basic concept of credit and how it works in the financial system.",
        content: `
<h3>Understanding Credit</h3>
<p>Credit is essentially trust. When you use credit, you're borrowing money with the promise to pay it back later. This fundamental concept affects nearly every major financial decision you'll make.</p>

<h4>Key Points:</h4>
<ul>
<li>Credit allows you to make purchases now and pay later</li>
<li>Lenders evaluate your creditworthiness before extending credit</li>
<li>Your credit history becomes a record of how you handle borrowed money</li>
<li>Good credit opens doors to better financial opportunities</li>
</ul>

<h4>Types of Credit:</h4>
<ul>
<li><strong>Revolving Credit:</strong> Credit cards, lines of credit</li>
<li><strong>Installment Credit:</strong> Auto loans, mortgages, personal loans</li>
<li><strong>Open Credit:</strong> Utility bills, cell phone plans</li>
</ul>
`,
      },
      {
        id: "lesson-2",
        title: "Understanding Credit Scores",
        duration: "8 min",
        description: "Deep dive into how credit scores are calculated and what they mean.",
        content: `
<h3>Credit Scores Explained</h3>
<p>Your credit score is a three-digit number that represents your creditworthiness. Most scores range from 300 to 850, with higher scores indicating better credit.</p>

<h4>Score Ranges:</h4>
<ul>
<li><strong>Excellent (800-850):</strong> Best rates and terms</li>
<li><strong>Very Good (740-799):</strong> Good rates and terms</li>
<li><strong>Good (670-739):</strong> Fair rates and terms</li>
<li><strong>Fair (580-669):</strong> Higher rates, limited options</li>
<li><strong>Poor (300-579):</strong> Difficulty getting approved</li>
</ul>

<h4>Factors That Affect Your Score:</h4>
<ul>
<li>Payment history (35%)</li>
<li>Credit utilization (30%)</li>
<li>Length of credit history (15%)</li>
<li>Credit mix (10%)</li>
<li>New credit inquiries (10%)</li>
</ul>
`,
      },
      {
        id: "lesson-3",
        title: "Reading Your Credit Report",
        duration: "12 min",
        description: "Learn how to read and understand every section of your credit report.",
        content: `
<h3>Your Credit Report Breakdown</h3>
<p>Your credit report contains detailed information about your credit history. Understanding each section helps you identify areas for improvement.</p>

<h4>Main Sections:</h4>
<ul>
<li><strong>Personal Information:</strong> Name, address, SSN, employment</li>
<li><strong>Credit Accounts:</strong> All your credit cards, loans, and lines of credit</li>
<li><strong>Public Records:</strong> Bankruptcies, tax liens, judgments</li>
<li><strong>Inquiries:</strong> Who has checked your credit recently</li>
</ul>

<h4>How to Get Your Free Reports:</h4>
<ul>
<li>Visit AnnualCreditReport.com</li>
<li>Request from all three bureaus: Experian, Equifax, TransUnion</li>
<li>Review for errors and discrepancies</li>
<li>Dispute any inaccurate information</li>
</ul>
`,
      },
      {
        id: "lesson-4",
        title: "Credit Utilization Explained",
        duration: "6 min",
        description: "Master the most important factor in credit scoring after payment history.",
        content: `
<h3>Credit Utilization Ratio</h3>
<p>Credit utilization is the percentage of your available credit that you're currently using. It's the second most important factor in your credit score.</p>

<h4>How It's Calculated:</h4>
<p>Total Credit Card Balances &divide; Total Credit Limits = Utilization Ratio</p>

<h4>Best Practices:</h4>
<ul>
<li>Keep overall utilization below 30%</li>
<li>Aim for under 10% for excellent scores</li>
<li>Pay down balances before statement dates</li>
<li>Consider requesting credit limit increases</li>
<li>Don't close old credit cards</li>
</ul>

<h4>Per-Card vs Overall Utilization:</h4>
<ul>
<li>Both individual card and overall utilization matter</li>
<li>Avoid maxing out any single card</li>
<li>Spread balances across multiple cards if needed</li>
</ul>
`,
      },
      {
        id: "lesson-5",
        title: "Payment History Impact",
        duration: "7 min",
        description: "Why payment history is the most critical factor in your credit score.",
        content: `
<h3>Payment History: The Foundation of Credit</h3>
<p>Payment history accounts for 35% of your credit score, making it the most important factor. Even one late payment can significantly impact your score.</p>

<h4>What Counts as Payment History:</h4>
<ul>
<li>Credit card payments</li>
<li>Loan payments (auto, mortgage, personal)</li>
<li>Some utility and phone bills</li>
<li>Collections accounts</li>
</ul>

<h4>Late Payment Timeline:</h4>
<ul>
<li><strong>1-29 days late:</strong> Usually no credit report impact</li>
<li><strong>30 days late:</strong> Reported to credit bureaus</li>
<li><strong>60-90 days late:</strong> Increasingly severe impact</li>
<li><strong>120+ days late:</strong> May be sent to collections</li>
</ul>

<h4>Recovery Strategies:</h4>
<ul>
<li>Set up automatic payments</li>
<li>Use calendar reminders</li>
<li>Pay more than the minimum</li>
<li>Contact lenders if you're struggling</li>
</ul>
`,
      },
      {
        id: "lesson-6",
        title: "Length of Credit History",
        duration: "4 min",
        description: "How the age of your accounts affects your credit score.",
        content: `
<h3>Credit History Length</h3>
<p>The length of your credit history accounts for 15% of your credit score. Lenders want to see a long track record of responsible credit use.</p>

<h4>What's Considered:</h4>
<ul>
<li>Age of your oldest account</li>
<li>Age of your newest account</li>
<li>Average age of all accounts</li>
<li>How long specific accounts have been established</li>
</ul>

<h4>Strategies to Improve:</h4>
<ul>
<li>Keep old accounts open, even if unused</li>
<li>Use old cards occasionally to keep them active</li>
<li>Think carefully before closing accounts</li>
<li>Be patient - time is your friend</li>
</ul>

<h4>Common Mistakes:</h4>
<ul>
<li>Closing your oldest credit card</li>
<li>Opening too many new accounts quickly</li>
<li>Letting old accounts close due to inactivity</li>
</ul>
`,
      },
      {
        id: "lesson-7",
        title: "Types of Credit Accounts",
        duration: "8 min",
        description: "Understanding different types of credit and how they affect your score.",
        content: `
<h3>Credit Mix and Account Types</h3>
<p>Credit mix accounts for 10% of your credit score. Having different types of credit shows lenders you can manage various forms of debt responsibly.</p>

<h4>Types of Credit Accounts:</h4>
<ul>
<li><strong>Revolving Credit:</strong> Credit cards, HELOCs</li>
<li><strong>Installment Loans:</strong> Mortgages, auto loans, personal loans</li>
<li><strong>Open Credit:</strong> Charge cards, some business accounts</li>
</ul>

<h4>Building a Good Mix:</h4>
<ul>
<li>Start with a credit card</li>
<li>Add an installment loan when appropriate</li>
<li>Don't open accounts just for mix</li>
<li>Focus on accounts you actually need</li>
</ul>

<h4>Account Status Meanings:</h4>
<ul>
<li><strong>Open:</strong> Active account in good standing</li>
<li><strong>Closed:</strong> Account closed by you or lender</li>
<li><strong>Paid as Agreed:</strong> Payments made on time</li>
<li><strong>Charge-off:</strong> Lender wrote off the debt</li>
</ul>
`,
      },
      {
        id: "lesson-8",
        title: "New Credit Inquiries",
        duration: "5 min",
        description: "How credit inquiries affect your score and when to be concerned.",
        content: `
<h3>Credit Inquiries and New Credit</h3>
<p>New credit inquiries account for 10% of your credit score. While the impact is small, too many inquiries can signal risk to lenders.</p>

<h4>Types of Inquiries:</h4>
<ul>
<li><strong>Hard Inquiries:</strong> When you apply for credit (affects score)</li>
<li><strong>Soft Inquiries:</strong> Background checks, pre-approvals (no impact)</li>
</ul>

<h4>Hard Inquiry Impact:</h4>
<ul>
<li>Usually drops score by 5-10 points</li>
<li>Effect diminishes over time</li>
<li>Falls off report after 2 years</li>
<li>Multiple inquiries for same loan type count as one</li>
</ul>

<h4>Rate Shopping Rules:</h4>
<ul>
<li>Multiple auto/mortgage inquiries within 14-45 days count as one</li>
<li>Credit card inquiries are always counted separately</li>
<li>Shop for rates within a focused time period</li>
</ul>
`,
      },
    ],
  },
  "advanced-disputes": {
    id: "advanced-disputes",
    title: "Advanced Dispute Strategies",
    tagline: "Advanced Dispute Strategies",
    description: "Master advanced dispute strategies and legal techniques to maximize your credit repair success.",
    whatYouWillLearn: [
      "Sophisticated dispute letter techniques beyond simple accuracy challenges",
      "The legal framework (FCRA, FDCPA) that supports strong disputes",
      "Procedural disputes that target violations, not just inaccuracies",
      "How to time and sequence disputes for maximum effectiveness",
    ],
    instructor: "Credit Repair Pro",
    rating: 4.9,
    students: 2847,
    level: "Advanced",
    category: "Dispute Strategies",
    duration: "3 hours",
    tags: ["Disputes", "Advanced", "Letters"],
    requiresPaid: false,
    lessons: [
      {
        id: "lesson-1",
        title: "Advanced Dispute Letter Strategies",
        duration: "12 min",
        description: "Learn sophisticated dispute letter techniques that go beyond basic challenges.",
        content: `
<h3>Advanced Dispute Strategies</h3>
<p>Advanced dispute strategies involve sophisticated techniques that go beyond simple "not mine" disputes.</p>

<h4>Key Advanced Techniques:</h4>
<ul>
<li>Procedural dispute strategies</li>
<li>Legal precedent research</li>
<li>Timing optimization</li>
<li>Multiple round strategies</li>
</ul>

<h4>Procedural Disputes:</h4>
<ul>
<li>FCRA compliance violations</li>
<li>Investigation procedure failures</li>
<li>Timeline violations</li>
<li>Documentation requirements</li>
</ul>
`,
      },
      {
        id: "lesson-2",
        title: "Legal Framework Mastery",
        duration: "15 min",
        description: "Understand the legal foundations that support advanced dispute strategies.",
        content: `
<h3>Legal Framework for Disputes</h3>
<p>Understanding the legal framework is crucial for effective dispute strategies.</p>

<h4>Key Legal Concepts:</h4>
<ul>
<li>FCRA requirements and violations</li>
<li>FDCPA compliance issues</li>
<li>State law variations</li>
<li>Statute of limitations</li>
</ul>

<h4>Building Legal Cases:</h4>
<ul>
<li>Documentation requirements</li>
<li>Evidence collection</li>
<li>Legal precedent research</li>
<li>Regulatory complaint preparation</li>
</ul>
`,
      },
      {
        id: "lesson-3",
        title: "Procedural Dispute Mastery",
        duration: "18 min",
        description: "Master procedural disputes that focus on violations rather than accuracy.",
        content: `
<h3>Procedural Dispute Mastery</h3>
<p>Procedural disputes focus on violations of credit reporting laws and procedures rather than just accuracy.</p>

<h4>Key Procedural Areas:</h4>
<ul>
<li>FCRA compliance violations</li>
<li>Reporting timeline violations</li>
<li>Notification requirement failures</li>
<li>Investigation procedure violations</li>
</ul>

<h4>Common Procedural Violations:</h4>
<ul>
<li>Failure to provide required notices</li>
<li>Inadequate investigation procedures</li>
<li>Reporting beyond statute of limitations</li>
<li>Mixing files or identity errors</li>
</ul>

<h4>Building Procedural Cases:</h4>
<ul>
<li>Document all communications</li>
<li>Track response times</li>
<li>Identify pattern violations</li>
<li>Prepare regulatory complaints</li>
</ul>
`,
      },
      {
        id: "lesson-4",
        title: "Timing and Strategy Optimization",
        duration: "14 min",
        description: "Learn when and how to time your disputes for maximum effectiveness.",
        content: `
<h3>Strategic Timing for Disputes</h3>
<p>Timing your disputes strategically can significantly improve your success rates.</p>

<h4>Optimal Timing Windows:</h4>
<ul>
<li>End of fiscal quarters</li>
<li>Summer vacation periods</li>
<li>Tax season impacts</li>
</ul>

<h4>Multiple Round Strategy:</h4>
<ul>
<li>Space disputes appropriately</li>
<li>Vary dispute reasons</li>
<li>Escalate complexity over time</li>
<li>Use different communication methods</li>
</ul>
`,
      },
    ],
  },
  "legal-rights": {
    id: "legal-rights",
    title: "Consumer Legal Rights",
    tagline: "Consumer Legal Rights",
    description: "Understand your rights under FCRA, FDCPA, and other consumer protection laws.",
    whatYouWillLearn: [
      "What the Fair Credit Reporting Act actually guarantees you",
      "What debt collectors are legally allowed and not allowed to do",
      "Your rights when you dispute information on your credit report",
      "How to file complaints and pursue remedies when your rights are violated",
    ],
    instructor: "Credit Repair Pro",
    rating: 4.7,
    students: 967,
    level: "Intermediate",
    category: "Legal",
    duration: "2.5 hours",
    tags: ["FCRA", "FDCPA", "Legal Rights"],
    requiresPaid: false,
    lessons: [
      {
        id: "lesson-1",
        title: "Understanding the FCRA",
        duration: "11 min",
        description: "The federal law that governs how your credit information is collected and used.",
        content: `
<h3>The Fair Credit Reporting Act</h3>
<p>The Fair Credit Reporting Act (FCRA) is the primary federal law regulating how consumer credit information is collected, shared, and used. It's the foundation of nearly every right you have when it comes to your credit report.</p>

<h4>What the FCRA Guarantees You:</h4>
<ul>
<li>The right to know what's in your credit file</li>
<li>The right to dispute inaccurate or incomplete information</li>
<li>The right to have outdated negative information removed</li>
<li>The right to know who has accessed your credit report</li>
<li>The right to limit "prescreened" credit and insurance offers</li>
</ul>

<h4>Who the FCRA Applies To:</h4>
<ul>
<li>The three major credit bureaus: Experian, Equifax, TransUnion</li>
<li>Any creditor or "furnisher" that reports information to the bureaus</li>
<li>Employers who use credit reports for background checks (with your consent)</li>
</ul>

<h4>Time Limits Under the FCRA:</h4>
<ul>
<li>Most negative information: 7 years from the date of first delinquency</li>
<li>Chapter 7 bankruptcy: 10 years</li>
<li>Hard inquiries: 2 years</li>
</ul>
`,
      },
      {
        id: "lesson-2",
        title: "The FDCPA and Debt Collectors",
        duration: "13 min",
        description: "What third-party debt collectors can and cannot legally do when contacting you.",
        content: `
<h3>The Fair Debt Collection Practices Act</h3>
<p>The FDCPA regulates how third-party debt collectors can communicate with and treat consumers. It does not apply to original creditors collecting their own debts, only to collection agencies and debt buyers.</p>

<h4>What Debt Collectors Cannot Do:</h4>
<ul>
<li>Call before 8 a.m. or after 9 p.m. your local time</li>
<li>Contact you at work if you've told them your employer prohibits it</li>
<li>Contact you directly if you're represented by an attorney</li>
<li>Use threats, obscene language, or repeated calls meant to harass</li>
<li>Misrepresent the amount you owe or threaten actions they can't legally take</li>
</ul>

<h4>Your Validation Rights:</h4>
<ul>
<li>Collectors must send a written validation notice within 5 days of first contact</li>
<li>You have 30 days to dispute the debt in writing</li>
<li>Once you dispute, collection efforts must stop until they provide validation</li>
</ul>

<h4>Sending a Cease and Desist:</h4>
<ul>
<li>You can demand in writing that a collector stop contacting you</li>
<li>They may only contact you once more, to confirm they'll stop or to notify you of specific legal action</li>
<li>This does not erase the debt, it only stops the contact</li>
</ul>
`,
      },
      {
        id: "lesson-3",
        title: "Your Dispute Rights Under the Law",
        duration: "12 min",
        description: "What credit bureaus and furnishers are legally obligated to do when you dispute an item.",
        content: `
<h3>Your Rights When You Dispute</h3>
<p>Disputing isn't just a courtesy the bureaus extend you, it's a legal process with binding deadlines and obligations on their side.</p>

<h4>What the Bureau Must Do:</h4>
<ul>
<li>Investigate your dispute within 30 days (45 if you submit more information mid-investigation)</li>
<li>Forward all relevant information to the furnisher that reported the item</li>
<li>Remove any information that cannot be verified as accurate</li>
<li>Provide you with the written results of the investigation</li>
</ul>

<h4>What the Furnisher Must Do:</h4>
<ul>
<li>Conduct a reasonable investigation into disputed information</li>
<li>Report the results back to the credit bureau</li>
<li>Correct or delete information found to be inaccurate</li>
<li>Not report the same information again without noting it's disputed</li>
</ul>

<h4>If They Miss the Deadline:</h4>
<p>If a bureau or furnisher fails to complete a proper investigation within the required timeframe, the disputed item must be removed from your report.</p>
`,
      },
      {
        id: "lesson-4",
        title: "Taking Action: Complaints and Legal Remedies",
        duration: "14 min",
        description: "How to escalate when your rights under the FCRA or FDCPA have been violated.",
        content: `
<h3>Escalating a Violation</h3>
<p>When a bureau, furnisher, or debt collector violates your rights, you have real paths for escalation beyond just disputing again.</p>

<h4>Filing a Regulatory Complaint:</h4>
<ul>
<li>The Consumer Financial Protection Bureau (CFPB) accepts complaints online and typically gets a company response within 15 days</li>
<li>Your state Attorney General's consumer protection division is another avenue</li>
<li>The Federal Trade Commission (FTC) tracks patterns of debt collection abuse</li>
</ul>

<h4>Private Right of Action:</h4>
<ul>
<li>Both the FCRA and FDCPA allow consumers to sue for violations</li>
<li>Statutory damages are available even without proof of actual financial harm</li>
<li>Willful violations can result in punitive damages and attorney's fees</li>
</ul>

<h4>Documentation That Strengthens Your Case:</h4>
<ul>
<li>Copies of all letters sent and received, with dates</li>
<li>Certified mail receipts showing what was delivered and when</li>
<li>A log of phone calls, including dates, times, and what was said</li>
<li>Screenshots or copies of your credit report before and after disputes</li>
</ul>
`,
      },
    ],
  },
  "credit-building": {
    id: "credit-building",
    title: "Credit Building Strategies",
    tagline: "Credit Building Strategies",
    description: "Learn proven methods to build and maintain excellent credit scores.",
    whatYouWillLearn: [
      "How to start building credit with no history, the right way",
      "The tools built specifically for establishing credit from scratch",
      "How to manage utilization and payment timing for maximum score impact",
      "How to protect and grow your credit over the long term",
    ],
    instructor: "Credit Repair Pro",
    rating: 4.6,
    students: 1456,
    level: "Intermediate",
    category: "Credit Building",
    duration: "2 hours",
    tags: ["Credit Building", "Strategies", "Maintenance"],
    requiresPaid: true,
    lessons: [
      {
        id: "lesson-1",
        title: "Foundations of Building Credit",
        duration: "9 min",
        description: "The right first steps when you're starting with no credit history or rebuilding from setbacks.",
        content: `
<h3>Starting From Scratch</h3>
<p>Having no credit history, a "thin file," can be almost as limiting as having bad credit. Lenders have nothing to evaluate, so building a track record is the first priority.</p>

<h4>The Best First Steps:</h4>
<ul>
<li>Get a secured credit card that reports to all three bureaus</li>
<li>Consider becoming an authorized user on a family member's well-managed account</li>
<li>Look into credit builder loans offered by credit unions and community banks</li>
</ul>

<h4>What NOT to Do:</h4>
<ul>
<li>Don't apply for multiple cards at once, each application is a hard inquiry</li>
<li>Don't take out a large loan just to "build credit"</li>
<li>Don't assume a debit card builds credit, it doesn't report to bureaus at all</li>
</ul>

<h4>Realistic Timeline:</h4>
<p>With consistent, responsible use, most people can establish a solid credit score (700+) within 6-12 months. Excellent credit (800+) typically takes 2-3 years or more of sustained good habits.</p>
`,
      },
      {
        id: "lesson-2",
        title: "Secured Cards and Credit-Builder Loans",
        duration: "10 min",
        description: "How the two most reliable credit-building tools actually work.",
        content: `
<h3>Secured Cards and Credit-Builder Loans</h3>
<p>These two products exist specifically to help people establish or rebuild credit, and understanding how they work helps you pick the right one.</p>

<h4>Secured Credit Cards:</h4>
<ul>
<li>You put down a cash deposit, typically $200&ndash;$500, which becomes your credit limit</li>
<li>Used responsibly, they function and report exactly like a normal credit card</li>
<li>The single most important feature: confirm it reports to all three bureaus before applying</li>
<li>Many secured cards "graduate" to unsecured after 12&ndash;18 months of on-time payments</li>
</ul>

<h4>Credit-Builder Loans:</h4>
<ul>
<li>The lender holds the loan amount in a locked savings account while you make payments</li>
<li>Each on-time payment is reported to the credit bureaus</li>
<li>Once fully paid, you receive the funds, essentially you're paying yourself while building a payment history</li>
</ul>

<h4>Choosing Between Them:</h4>
<p>A secured card is generally faster to start using and shows up on your report as revolving credit. A credit-builder loan adds installment credit to your mix. Using both together, if you can afford it, builds a stronger credit mix faster.</p>
`,
      },
      {
        id: "lesson-3",
        title: "Utilization and Payment Strategy",
        duration: "11 min",
        description: "How to manage balances and payment timing for the strongest possible score impact.",
        content: `
<h3>Getting Utilization and Timing Right</h3>
<p>Once you have credit accounts open, how you use them matters more than how many you have.</p>

<h4>The Utilization Sweet Spot:</h4>
<ul>
<li>Keep overall utilization under 30%, and ideally under 10%, for the best scores</li>
<li>0% utilization can occasionally be read as an inactive account, 1&ndash;9% is often the ideal range</li>
<li>Utilization is calculated from whatever balance is reported on your statement date, not what you owe today</li>
</ul>

<h4>Timing Your Payments:</h4>
<ul>
<li>Paying down your balance before the statement closing date lowers what gets reported</li>
<li>Paying in full every month avoids interest entirely and demonstrates the strongest payment pattern</li>
<li>If you carry a balance, always pay at least the minimum on time, a missed payment does far more damage than any utilization ratio</li>
</ul>

<h4>Requesting Credit Limit Increases:</h4>
<p>After 6-12 months of on-time payments, ask your issuer for a credit limit increase. A higher limit with the same spending automatically lowers your utilization ratio.</p>
`,
      },
      {
        id: "lesson-4",
        title: "Building Long-Term Credit Health",
        duration: "10 min",
        description: "The habits and account management decisions that protect your credit for the long run.",
        content: `
<h3>Playing the Long Game</h3>
<p>Building credit isn't a one-time project, it's an ongoing set of habits. The accounts you keep open and how you monitor them matter for years.</p>

<h4>Protect Your Account Age:</h4>
<ul>
<li>Keep your oldest accounts open even if you rarely use them</li>
<li>Use old cards occasionally (a small recurring charge works well) so the issuer doesn't close them for inactivity</li>
<li>Think carefully before closing any card, you lose both available credit and account history</li>
</ul>

<h4>Build a Healthy Credit Mix:</h4>
<ul>
<li>A mix of revolving credit (cards) and installment credit (loans) shows lenders you can handle different types of debt</li>
<li>Only add new account types when you actually need them, not purely for mix</li>
</ul>

<h4>Ongoing Monitoring:</h4>
<ul>
<li>Check your credit report at least annually through AnnualCreditReport.com</li>
<li>Set up free credit monitoring alerts to catch new accounts or inquiries you didn't authorize</li>
<li>Review your score monthly, but don't obsess over small fluctuations</li>
</ul>
`,
      },
    ],
  },
  "business-credit": {
    id: "business-credit",
    title: "Business Credit Mastery",
    tagline: "Business Credit Mastery",
    description: "Establish and build business credit separate from personal credit.",
    whatYouWillLearn: [
      "Why and how to separate your business credit from your personal credit",
      "How to formally establish a business credit profile lenders can find",
      "How to build trade lines and vendor credit that report to business bureaus",
      "How to scale your business credit responsibly as your company grows",
    ],
    instructor: "Credit Repair Pro",
    rating: 4.8,
    students: 543,
    level: "Advanced",
    category: "Business",
    duration: "4 hours",
    tags: ["Business Credit", "EIN", "D-U-N-S"],
    requiresPaid: true,
    lessons: [
      {
        id: "lesson-1",
        title: "Separating Personal and Business Credit",
        duration: "10 min",
        description: "Why keeping business credit separate protects you and unlocks better financing.",
        content: `
<h3>Why Separation Matters</h3>
<p>Many small business owners unknowingly run their business entirely on personal credit. That limits how much financing you can access and puts your personal assets at risk.</p>

<h4>The Case for Separation:</h4>
<ul>
<li>Business credit can scale far beyond typical personal credit limits</li>
<li>It protects your personal credit score from business ups and downs</li>
<li>Properly structured, it can limit your personal liability for business debts</li>
<li>It makes your business look more established to lenders, landlords, and vendors</li>
</ul>

<h4>The Foundation You Need First:</h4>
<ul>
<li>A formal business entity: LLC or corporation, not a sole proprietorship</li>
<li>A federal Employer Identification Number (EIN) from the IRS</li>
<li>A dedicated business bank account, never mixing business and personal funds</li>
<li>A business address and phone number that's listed and verifiable</li>
</ul>

<h4>A Common Mistake:</h4>
<p>Personally guaranteeing every piece of business credit defeats the purpose of separation. As your business credit matures, look for accounts that don't require a personal guarantee.</p>
`,
      },
      {
        id: "lesson-2",
        title: "Establishing Your Business Credit Profile",
        duration: "12 min",
        description: "The concrete steps to make your business visible to the commercial credit bureaus.",
        content: `
<h3>Building a Findable Business Credit File</h3>
<p>Business credit bureaus need to be able to find and verify your business before they can build a file, and before lenders will extend credit.</p>

<h4>Get a D-U-N-S Number:</h4>
<ul>
<li>Issued free by Dun &amp; Bradstreet, one of the three major business credit bureaus</li>
<li>Many vendors and lenders check D&amp;B before extending business credit</li>
<li>Apply directly through D&amp;B's website; it typically takes 1-2 weeks</li>
</ul>

<h4>The Three Major Business Bureaus:</h4>
<ul>
<li><strong>Dun &amp; Bradstreet:</strong> Uses the PAYDEX score, based on payment history</li>
<li><strong>Experian Business:</strong> Uses the Intelliscore Plus model</li>
<li><strong>Equifax Business:</strong> Focuses heavily on payment trends and public records</li>
</ul>

<h4>Consistency Is Critical:</h4>
<p>Use the exact same business name, address, and phone number everywhere, your EIN application, bank account, vendor accounts, and business licenses. Inconsistent information is the most common reason business credit files fail to build properly.</p>
`,
      },
      {
        id: "lesson-3",
        title: "Building Trade Lines and Vendor Credit",
        duration: "13 min",
        description: "How to open accounts that actually report and build your payment history.",
        content: `
<h3>Trade Lines and Vendor Credit</h3>
<p>A trade line is simply a credit account that reports to a business credit bureau. Building several strong trade lines is how your business credit file grows.</p>

<h4>Start With Net-30 Vendor Accounts:</h4>
<ul>
<li>"Net-30" means you have 30 days to pay an invoice in full</li>
<li>Many office supply, shipping, and wholesale vendors offer these accounts specifically to help businesses build credit</li>
<li>Look for vendors that explicitly state they report to D&amp;B, Experian Business, or Equifax Business</li>
</ul>

<h4>Building a Strong Trade Line Portfolio:</h4>
<ul>
<li>Open 3-5 reporting vendor accounts before applying for larger business credit</li>
<li>Always pay before the due date, early payment history strengthens scores like PAYDEX faster than "on time"</li>
<li>Use each account regularly rather than opening it and letting it sit idle</li>
</ul>

<h4>Graduating to Business Credit Cards and Lines:</h4>
<p>Once you have several reporting trade lines with a strong payment history, you become a much stronger candidate for business credit cards and lines of credit that don't require a personal guarantee.</p>
`,
      },
      {
        id: "lesson-4",
        title: "Scaling and Monitoring Business Credit",
        duration: "11 min",
        description: "How to grow your business credit responsibly and keep it funding-ready.",
        content: `
<h3>Scaling Responsibly</h3>
<p>As your business credit file matures, the goal shifts from establishing it to using it strategically to fund growth.</p>

<h4>Growing Your Credit Limits:</h4>
<ul>
<li>Request limit increases on existing accounts as your payment history lengthens</li>
<li>Add new trade lines gradually rather than all at once</li>
<li>Keep your business utilization low on revolving accounts, the same principles from personal credit apply</li>
</ul>

<h4>Monitoring Your Business Credit:</h4>
<ul>
<li>Business credit reports aren't free the way personal ones are, budget for periodic monitoring</li>
<li>Check your D&amp;B, Experian Business, and Equifax Business files at least twice a year</li>
<li>Watch for accounts or inquiries you don't recognize, business identity theft is a real risk</li>
</ul>

<h4>Becoming Funding-Ready:</h4>
<ul>
<li>Lenders want to see 2+ years of established trade lines before larger financing</li>
<li>Keep clean, organized financial statements alongside your credit file</li>
<li>A strong business credit profile is one of the biggest factors in qualifying for SBA loans and larger lines of credit</li>
</ul>
`,
      },
    ],
  },
  "mortgage-preparation": {
    id: "mortgage-preparation",
    title: "Mortgage Preparation",
    tagline: "Mortgage Preparation",
    description: "Prepare your credit for mortgage approval and get the best rates.",
    whatYouWillLearn: [
      "How mortgage underwriting evaluates credit differently than other lending",
      "How to optimize your credit profile in the months before applying",
      "How to work with lenders and shop rates without hurting your score",
      "The final checklist to follow in the weeks before closing",
    ],
    instructor: "Credit Repair Pro",
    rating: 4.5,
    students: 789,
    level: "Intermediate",
    category: "Mortgage",
    duration: "1.5 hours",
    tags: ["Mortgage", "Home Buying", "Rates"],
    requiresPaid: true,
    lessons: [
      {
        id: "lesson-1",
        title: "How Mortgage Underwriting Uses Credit",
        duration: "9 min",
        description: "Why mortgage lenders look at your credit differently than a credit card issuer does.",
        content: `
<h3>Credit Through a Mortgage Lender's Eyes</h3>
<p>Mortgage underwriting is more rigorous and uses different scoring models than the score you see on a typical credit app. Understanding this helps you prepare accurately.</p>

<h4>Mortgage-Specific Scoring:</h4>
<ul>
<li>Most mortgage lenders use older FICO scoring models (FICO 2, 4, or 5) rather than the newest versions</li>
<li>Lenders typically pull all three bureau scores and use the middle score for qualification</li>
<li>For joint applications, lenders generally use the lower of the two applicants' middle scores</li>
</ul>

<h4>What Underwriters Weigh Heavily:</h4>
<ul>
<li>Payment history, especially on housing-related accounts like rent and prior mortgages</li>
<li>Total debt-to-income ratio (DTI), not just your credit score</li>
<li>Length and stability of your credit history</li>
<li>Recent credit inquiries and newly opened accounts</li>
</ul>

<h4>Score Tiers and Rate Impact:</h4>
<p>Even small score differences can meaningfully change your interest rate. Moving from the "good" (670-739) to "very good" (740+) tier can save tens of thousands of dollars over the life of a loan.</p>
`,
      },
      {
        id: "lesson-2",
        title: "Optimizing Your Credit Profile Before Applying",
        duration: "11 min",
        description: "The concrete moves to make in the months leading up to a mortgage application.",
        content: `
<h3>Preparing in the Months Before You Apply</h3>
<p>Mortgage preparation works best started 6-12 months before you plan to apply, giving changes time to actually show up in your score.</p>

<h4>Priority Actions:</h4>
<ul>
<li>Pull all three credit reports and dispute any errors immediately, this can take months to resolve</li>
<li>Pay down credit card balances to well under 30% utilization, ideally under 10%</li>
<li>Bring any past-due accounts current and keep them current</li>
<li>Avoid closing old credit accounts, doing so shortens your credit history</li>
</ul>

<h4>What to Avoid Right Before Applying:</h4>
<ul>
<li>Don't open any new credit accounts or loans</li>
<li>Don't make large purchases on credit, even if you can afford them</li>
<li>Don't co-sign for anyone else's loan</li>
<li>Don't change jobs if it can be avoided, lenders want employment stability</li>
</ul>

<h4>Building Your Down Payment Documentation:</h4>
<p>Alongside credit prep, keep large deposits well-documented. Underwriters will ask for a paper trail on any unusual account activity in the months before you apply.</p>
`,
      },
      {
        id: "lesson-3",
        title: "Working with Lenders and Rate Shopping",
        duration: "10 min",
        description: "How to compare lenders and shop for rates without damaging your credit.",
        content: `
<h3>Shopping for a Mortgage the Right Way</h3>
<p>Comparing lenders is one of the highest-value things you can do, but it needs to be done within the credit scoring system's rules to avoid unnecessary score damage.</p>

<h4>The Rate Shopping Window:</h4>
<ul>
<li>Multiple mortgage inquiries within a 14-45 day window (depending on the scoring model) count as a single inquiry</li>
<li>Concentrate your lender shopping into as short a window as possible, ideally within two weeks</li>
<li>Getting quotes from 3-5 lenders in that window costs you far less than spreading applications out over months</li>
</ul>

<h4>Getting Pre-Approved vs. Pre-Qualified:</h4>
<ul>
<li>Pre-qualification is a quick estimate based on self-reported information, it carries little weight with sellers</li>
<li>Pre-approval involves a real credit pull and document review, and signals you're a serious, ready buyer</li>
</ul>

<h4>Understanding Your Loan Estimate:</h4>
<p>Every lender must provide a standardized Loan Estimate within 3 days of application. Compare the interest rate, APR, and closing costs side by side, they're required to use the same format, which makes real comparison possible.</p>
`,
      },
      {
        id: "lesson-4",
        title: "Your Closing-Ready Checklist",
        duration: "9 min",
        description: "The final steps and common last-minute mistakes to avoid before closing.",
        content: `
<h3>The Home Stretch: Staying Closing-Ready</h3>
<p>Approval isn't final until closing. Lenders re-verify credit and employment right before closing, and it's common for deals to fall apart from an avoidable mistake in this window.</p>

<h4>Between Approval and Closing:</h4>
<ul>
<li>Don't apply for any new credit, even "0% financing" offers on furniture or appliances</li>
<li>Don't make large purchases or big cash deposits without documentation</li>
<li>Continue paying every bill on time, exactly as before</li>
<li>Don't change bank accounts or move money between accounts unnecessarily</li>
</ul>

<h4>Final Documentation Checklist:</h4>
<ul>
<li>Recent pay stubs and, if self-employed, updated profit and loss statements</li>
<li>Bank statements covering the most recent 2 full months</li>
<li>Documentation for any large deposits that appear in your accounts</li>
<li>Homeowner's insurance binder for the property</li>
</ul>

<h4>Common Last-Minute Mistakes:</h4>
<ul>
<li>Financing a moving truck or new furniture before closing</li>
<li>Co-signing a loan for a family member</li>
<li>Quitting a job or switching to a new employer mid-process</li>
</ul>
`,
      },
    ],
  },
}

export function getCourse(id: string): CourseDefinition | null {
  return COURSES[id] ?? null
}

/** Metadata only, for the training hub — no lesson content */
export function getCourseList() {
  return COURSE_ORDER.map(id => {
    const c = COURSES[id]
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      instructor: c.instructor,
      rating: c.rating,
      students: c.students,
      level: c.level,
      category: c.category,
      duration: c.duration,
      tags: c.tags,
      requiresPaid: c.requiresPaid,
      lessonCount: c.lessons.length,
    }
  })
}
