import { neon } from "@neondatabase/serverless"

// Add OpenAI import
import OpenAI from "openai"

export interface DisputeItem {
  id: string
  creditorName: string
  accountNumber: string
  itemType: string
  dateReported: string
  amount?: number
  status: string
  disputeReason: string
  supportingEvidence?: string
  previousDisputes?: string[]
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  ssnLast4: string
  dateOfBirth: string
}

export interface DisputeStrategy {
  primaryReason: string
  legalBasis: string[]
  supportingArguments: string[]
  evidenceSuggestions: string[]
  successProbability: number
  expectedTimeline: string
  followUpActions: string[]
  uniqueApproach: string
  psychologicalFactors: string[]
  escalationStrategy: string
}

export interface GeneratedLetter {
  id: string
  content: string
  metadata: {
    letterType: string
    disputeStrategy: DisputeStrategy
    qualityScore: number
    legalCompliance: string[]
    customizationLevel: string
    generatedAt: string
    uniquenessScore: number
    personalizationLevel: string
    writingStyle: string
  }
}

export class AIDisputeLetterGenerator {
  private sql: any
  private openai: OpenAI | null
  private writingStyles: string[]
  private personalizationFactors: string[]
  private letterTemplates: Map<string, string> // Base structure templates (user-facing)
  private hiddenTemplateFolders: Map<string, string[]> // Hidden template variations for interchange
  private generatedLetters: Set<string> = new Set()

  constructor() {
    const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL
    if (databaseUrl) {
      this.sql = neon(databaseUrl)
    }
    
    // Initialize OpenAI if API key is available
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      })
    } else {
      this.openai = null
      console.warn("⚠️ OpenAI API key not found. AI generation will be limited to template variations.")
    }
    
    // Multiple writing styles for uniqueness
    this.writingStyles = [
      "assertive_professional",
      "diplomatic_but_firm", 
      "legal_technical",
      "empathetic_understanding",
      "direct_authoritative",
      "analytical_detailed",
      "persuasive_emotional",
      "formal_business"
    ]
    
    // Personalization factors for uniqueness
    this.personalizationFactors = [
      "credit_history_length",
      "previous_disputes",
      "financial_situation",
      "employment_status",
      "education_level",
      "geographic_location",
      "age_group",
      "credit_score_range"
    ]

    // Initialize letter templates and hidden template folders
    this.letterTemplates = new Map()
    this.hiddenTemplateFolders = new Map()
    this.initializeTemplates()
  }

  private initializeTemplates() {
    // ===== DISPUTE LETTER TEMPLATES =====
    // Base structure template (user-facing)
    this.letterTemplates.set("dispute", `{client_first_name} {client_last_name}
{client_address}
{client_previous_address}
{t_no}
{bdate}
{ss_number}

{bureau_address}

{curr_date}

Re: Creditor Verification of incorrect items on my credit history report.
Credit Report Number:

To Whom It May Concern,

On (DATE), I received my credit report from you. It included the following incorrect information:

{dispute_item_and_explanation}

I am enclosing a copy of my credit report with the incorrect data highlighted.I just received a letter from that creditor verifying that this information on my credit report is inaccurate and should be removed from my credit file. I have enclosed a copy of the letter.

OR

On (DATE) I spoke with (CONTACT PERSON) from . This person verified that this information on my credit report is indeed inaccurate and should be removed from my credit file.

{dispute_item_and_explanation}

You can reach this person at (CONTACT NUMBER)

I am enclosing a copy of my credit report with the incorrect data highlighted.This incorrect and negative information is damaging my credit. Please remove this incorrect information at once and send me an updated copy of my credit history report.I also request that you please send notices of corrections to anyone who received my credit report in the past six months.

Thank you for your time and help in this matter.

Sincerely yours,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

cc: Federal Trade Commission

(ENCLOSE A COPY OF CREDIT REPORT WITH THE INCORRECT ITEMS IN QUESTION HIGHLITED. ALSO INCLUDE ALL OTHER DOCUMENTATION VERIFYING THE ABOVE FACTS)`)

    // Hidden dispute letter template variations for interchange
    this.hiddenTemplateFolders.set("dispute", [
      // Variation 1: More formal approach
      `{client_first_name} {client_last_name}
{client_address}
{client_previous_address}
{t_no}
{bdate}
{ss_number}

{bureau_address}

{curr_date}

Re: Dispute of Inaccurate Credit Information
Credit Report Number:

Dear Credit Department,

Upon reviewing my credit report dated {curr_date}, I discovered the following erroneous information:

{dispute_item_and_explanation}

I have enclosed supporting documentation that verifies the inaccuracy of this information. The creditor has confirmed that this data is incorrect and should be removed from my credit file.

I am requesting immediate correction of these reporting errors and notification to all parties who have received my credit report within the past six months.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

cc: Federal Trade Commission`,

      // Variation 2: Legal-focused approach
      `{client_first_name} {client_last_name}
{client_address}
{client_previous_address}
{t_no}
{bdate}
{ss_number}

{bureau_address}

{curr_date}

Re: Formal Dispute Under FCRA Section 611
Credit Report Number:

To Whom It May Concern,

This letter constitutes a formal dispute under the Fair Credit Reporting Act (FCRA) regarding the following inaccurate information:

{dispute_item_and_explanation}

I have obtained written verification from the creditor that this information is incorrect. Enclosed please find supporting documentation.

Pursuant to FCRA requirements, I request immediate reinvestigation and correction of these errors.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

cc: Federal Trade Commission`,

      // Variation 3: Direct and assertive approach
      `{client_first_name} {client_last_name}
{client_address}
{client_previous_address}
{t_no}
{bdate}
{ss_number}

{bureau_address}

{curr_date}

Re: Incorrect Credit Information Dispute
Credit Report Number:

Attention: Credit Dispute Department,

I am disputing the following incorrect information on my credit report:

{dispute_item_and_explanation}

The creditor has verified that this information is inaccurate. I demand immediate removal of these errors.

Please correct my credit report and notify all parties who have received it within the past six months.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

cc: Federal Trade Commission`
    ])

    // ===== DEBT VALIDATION LETTER TEMPLATES =====
    // Base structure template (user-facing)
    this.letterTemplates.set("debt_validation", `{client_first_name} {client_last_name}
{client_address}

{bureau_address}

{curr_date}

To Whom It May Concern,

This letter is a formal complaint that you are reporting inaccurate and incomplete credit information.

I am distressed that you have included the information below in my credit profile and that you have failed to maintain reasonable procedures in your operations to assure maximum possible accuracy in the credit reports you publish. Credit reporting laws ensure that bureaus report only 100% accurate credit information. Every step must be taken to assure the information reported is completely accurate and correct. The following information therefore needs to be re-investigated.

{dispute_item_and_explanation}

I respectfully request to be provided proof of this alleged item, specifically the contract, note or other instrument bearing my signature.

Failing that, the item must be deleted from the report as soon as possible. The listed item is entirely inaccurate and incomplete, and as such represents a very serious error in your reporting. Please delete this misleading information and supply a corrected credit profile to all creditors who have received a copy within the last six months, or the last two years for employment purposes.

Additionally, please provide the name, address, and telephone number of each credit grantor or other subscriber.

Under federal law, you have thirty (30) days to complete your re-investigation. Be advised that the description of the procedure used to determine the accuracy and completeness of the information is hereby requested as well, to be provided within fifteen (15) days of the completion of your re-investigation.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`)

    // Hidden debt validation template variations
    this.hiddenTemplateFolders.set("debt_validation", [
      // Variation 1: More formal legal approach
      `{client_first_name} {client_last_name}
{client_address}

{bureau_address}

{curr_date}

To Whom It May Concern,

This letter serves as a formal complaint regarding inaccurate and incomplete credit information in my profile.

I am concerned that your organization has failed to maintain reasonable procedures to ensure maximum possible accuracy in credit reports. Federal law requires that credit reporting agencies report only 100% accurate information.

{dispute_item_and_explanation}

I hereby request validation of this alleged debt, including the original contract or agreement bearing my signature.

If you cannot provide proper validation, this item must be removed from my report immediately. Please also provide a corrected credit profile to all parties who have received my report within the past six months.

Under federal law, you have 30 days to complete this reinvestigation.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`,

      // Variation 2: Direct and assertive approach
      `{client_first_name} {client_last_name}
{client_address}

{bureau_address}

{curr_date}

To Whom It May Concern,

I am formally disputing the following inaccurate information in my credit profile:

{dispute_item_and_explanation}

I demand proof of this alleged debt, specifically the original contract with my signature.

This information is completely inaccurate and must be removed immediately. I also require notification to all parties who have received my report within the past six months.

You have 30 days to complete this reinvestigation as required by federal law.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`
    ])

    // ===== GOODWILL LETTER TEMPLATES =====
    // Base structure template (user-facing) - YOUR NEW TEMPLATE
    this.letterTemplates.set("goodwill", `{client_first_name} {client_last_name}
{client_address}

{creditor_name}
{creditor_address}
{creditor_city}, {creditor_state} {creditor_zip}

{curr_date}

Re: Account number: {account_number}

To Whom It May Concern,
I am a natural person, consumer and original creditor pursuant to 15 USC 1692a demand you to remove all late payment(s) from my account. Be advise pursuant to 15 USC 1666b(a)(b). A creditor may not treat a payment on a credit card account under an open end consumer credit plan as late for any purpose, unless the creditor has adopted reasonable procedures designed to ensure that each periodic statement including the information required by section 1637(b) of this title is mailed or delivered to the consumer not later than 21 days before the payment due date.
(b) Grace period
If an open end consumer credit plan provides a time period within which an obligor may repay any portion of the credit extended without incurring an additional finance charge, such additional finance charge may not be imposed with respect to such portion of the credit extended for the billing cycle of which such period is a part, unless a statement which includes the amount upon which the finance charge for the period is based was mailed or delivered to the consumer not later than 21 days before the date specified in the statement by which payment must be made in order to avoid imposition of that finance charge. 
Also pursuant to 15 USC 1602(i)(m)
(l)
The term "credit card" means any card, plate, coupon book or other credit device existing for the purpose of obtaining money, property, labor, or services on credit.
(m)
The term "accepted credit card" means any credit card which the cardholder has requested and received or has signed or has used, or authorized another to use, for the purpose of obtaining money, property, labor, or services on credit.  
I am notifying you in writing that I would like these late payment(s) removed immediately. I am also demanding that you reframe from ever reporting another late payment(s) future wise. I hope that you comply and that this issue will be resolved and handled here amicably.
Sincerely,
{client_signature}
_________________________________________
{client_first_name} {client_last_name}


Cc: CFPB
Cc: FTC
Cc: ATTORNEY GENERAL`)

    // Hidden goodwill template variations
    this.hiddenTemplateFolders.set("goodwill", [
      // Variation 1: More respectful approach
      `{client_first_name} {client_last_name}
{client_address}

{creditor_name}
{creditor_address}
{creditor_city}, {creditor_state} {creditor_zip}

{curr_date}

Re: Account number: {account_number}

To Whom It May Concern,

I am writing as a consumer pursuant to 15 USC 1692a to request the removal of late payment(s) from my account.

Under 15 USC 1666b(a)(b), a creditor may not treat a payment as late unless reasonable procedures ensure that periodic statements are mailed or delivered to the consumer not later than 21 days before the payment due date.

Additionally, pursuant to 15 USC 1602(i)(m), credit card terms are clearly defined for consumer protection.

I respectfully request that these late payment(s) be removed from my account. I also ask that you refrain from reporting future late payments.

I hope this matter can be resolved amicably.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

Cc: CFPB
Cc: FTC
Cc: ATTORNEY GENERAL`,

      // Variation 2: Legal citation focused
      `{client_first_name} {client_last_name}
{client_address}

{creditor_name}
{creditor_address}
{creditor_city}, {creditor_state} {creditor_zip}

{curr_date}

Re: Account number: {account_number}

To Whom It May Concern,

As a consumer under 15 USC 1692a, I am requesting removal of late payment(s) from my account.

Pursuant to 15 USC 1666b(a)(b), late payment treatment requires reasonable procedures ensuring statements are delivered 21 days before due dates.

Under 15 USC 1602(i)(m), credit card definitions protect consumer rights.

I request immediate removal of these late payment(s) and assurance that future late payments will not be reported.

I trust you will handle this matter appropriately.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

Cc: CFPB
Cc: FTC
Cc: ATTORNEY GENERAL`,

      // Variation 3: Direct but professional
      `{client_first_name} {client_last_name}
{client_address}

{creditor_name}
{creditor_address}
{creditor_city}, {creditor_state} {creditor_zip}

{curr_date}

Re: Account number: {account_number}

To Whom It May Concern,

I am a consumer pursuant to 15 USC 1692a requesting removal of late payment(s) from my account.

15 USC 1666b(a)(b) prohibits late payment treatment unless statements are delivered 21 days before due dates.

15 USC 1602(i)(m) defines credit card terms for consumer protection.

I demand removal of these late payment(s) and assurance against future late payment reporting.

I expect this matter to be resolved promptly.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}

Cc: CFPB
Cc: FTC
Cc: ATTORNEY GENERAL`
    ])

    // ===== IDENTITY THEFT LETTER TEMPLATES =====
    // Base structure template (user-facing) - YOUR NEW TEMPLATE
    this.letterTemplates.set("identity_theft", `{client_first_name} {client_last_name}
{client_address}
{bdate} 
{ss_number}

{bureau_address} 

{curr_date} 

Dear Sir/Madam:

I am contacting you about the compromising of my social security number. I am a victim of Identity Theft. I contacted the Federal Trade Commission and filed a complaint # and contacted the police department and obtained a police report # which both are attached. Please block and remove all information from my credit report, and send me an updated copy of my credit report. The following items do not belong to me and is a result of fraud that I did not authorize:

{dispute_item_and_explanation}

Please block and remove all information resulting from Identity Theft pursuant to FCRA 605B (15 U.S.C. & 1681 c-2) which states that these accounts must be removed within 4 Business Days of receipt.

Also, please send an updated copy of my credit report to the above address. According to the act, there shall be no charge for this updated report. I also request that you please send notices of corrections to anyone who received my credit report in the past six months.

Sincerely,

{client_signature}
_____________________________

{client_first_name} {client_last_name}`)

    // Hidden identity theft template variations
    this.hiddenTemplateFolders.set("identity_theft", [
      // Variation 1: More formal legal approach
      `{client_first_name} {client_last_name}
{client_address}
{bdate} 
{ss_number}

{bureau_address} 

{curr_date} 

Dear Sir/Madam:

I am writing to report a serious case of identity theft involving my social security number. I have been victimized by fraud and have taken the necessary legal steps to document this crime.

I have filed a complaint with the Federal Trade Commission and obtained a police report, both of which are attached for your reference. I demand that you immediately block and remove all fraudulent information from my credit report.

The following items are fraudulent and were not authorized by me:

{dispute_item_and_explanation}

Under FCRA 605B (15 U.S.C. § 1681c-2), you are required to remove these fraudulent accounts within 4 business days of receiving this notice.

Please send an updated copy of my credit report to the address above at no charge, as required by law. Also notify all parties who have received my credit report within the past six months of these corrections.

Sincerely,

{client_signature}
_____________________________

{client_first_name} {client_last_name}`,

      // Variation 2: Direct and assertive approach
      `{client_first_name} {client_last_name}
{client_address}
{bdate} 
{ss_number}

{bureau_address} 

{curr_date} 

Dear Sir/Madam:

I am a victim of identity theft and my social security number has been compromised. I have documented this crime with both the Federal Trade Commission and local law enforcement.

I demand immediate action to block and remove all fraudulent information from my credit report. The following items are the result of fraud and must be removed:

{dispute_item_and_explanation}

FCRA 605B (15 U.S.C. § 1681c-2) requires removal of these fraudulent accounts within 4 business days.

Send me an updated credit report immediately at no charge. Notify all parties who received my report in the past six months of these corrections.

Sincerely,

{client_signature}
_____________________________

{client_first_name} {client_last_name}`,

      // Variation 3: Professional but urgent approach
      `{client_first_name} {client_last_name}
{client_address}
{bdate} 
{ss_number}

{bureau_address} 

{curr_date} 

Dear Sir/Madam:

I am writing to report that I have been a victim of identity theft. My social security number has been compromised, and I have taken appropriate legal action to document this crime.

I have filed complaints with the Federal Trade Commission and local law enforcement, and both reports are attached. I require immediate action to block and remove all fraudulent information from my credit report.

The following items are fraudulent and were not authorized by me:

{dispute_item_and_explanation}

Pursuant to FCRA 605B (15 U.S.C. § 1681c-2), these fraudulent accounts must be removed within 4 business days.

Please provide an updated credit report at no charge and notify all parties who received my report within the past six months of these corrections.

Sincerely,

{client_signature}
_____________________________

{client_first_name} {client_last_name}`
    ])

    // ===== CEASE AND DESIST LETTER TEMPLATES =====
    // Base structure template (user-facing)
    this.letterTemplates.set("cease_and_desist", `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

This letter serves as formal notice to cease and desist all collection activities regarding the alleged debt referenced below.

{dispute_item_and_explanation}

I dispute the validity of this debt and request that you provide verification of the debt as required by the Fair Debt Collection Practices Act.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`)

    // Hidden cease and desist template variations
    this.hiddenTemplateFolders.set("cease_and_desist", [
      // Variation 1: More formal legal approach
      `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

This letter constitutes formal notice to immediately cease and desist all collection activities.

{dispute_item_and_explanation}

I dispute the validity of this alleged debt and demand verification as required by the Fair Debt Collection Practices Act.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`,

      // Variation 2: Direct and assertive
      `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

I hereby demand that you cease and desist all collection activities immediately.

{dispute_item_and_explanation}

I dispute this debt and require verification under the Fair Debt Collection Practices Act.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`
    ])

    // ===== PAY FOR DELETE LETTER TEMPLATES =====
    // Base structure template (user-facing)
    this.letterTemplates.set("pay_for_delete", `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

I am writing to propose a settlement agreement regarding the debt referenced below.

{dispute_item_and_explanation}

I am willing to settle this debt for a reduced amount in exchange for the complete removal of this item from my credit report.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`)

    // Hidden pay for delete template variations
    this.hiddenTemplateFolders.set("pay_for_delete", [
      // Variation 1: Business-focused approach
      `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

I am writing to discuss a settlement arrangement for the debt referenced below.

{dispute_item_and_explanation}

I propose settling this debt for a reduced amount in exchange for complete removal from my credit report.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`,

      // Variation 2: Negotiation approach
      `{client_first_name} {client_last_name}
{client_address}

{curr_date}

To Whom It May Concern,

I would like to discuss a settlement proposal for the debt referenced below.

{dispute_item_and_explanation}

I am prepared to settle this debt for a reduced amount if you agree to remove it from my credit report.

Sincerely,

{client_signature}
_________________________________________
{client_first_name} {client_last_name}`
    ])
  }

  async generateDisputeLetter(
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    letterTier: "standard" | "enhanced" | "premium" | "attorney",
    creditBureau: string,
    additionalContext?: any
  ): Promise<GeneratedLetter> {
    try {
      // Get the actual dispute type from additionalContext
      const actualDisputeType = additionalContext?.letterPurpose || "dispute"
      
      // Step 1: Generate unique dispute strategy with advanced analysis
      const disputeStrategy = await this.generateAdvancedDisputeStrategy(disputeItems, letterTier, personalInfo, additionalContext)
      
      // Step 2: Select unique writing style and personalization approach
      const writingStyle = this.selectUniqueWritingStyle(personalInfo, disputeItems, letterTier)
      const personalizationLevel = this.calculatePersonalizationLevel(personalInfo, disputeItems, additionalContext)
      
      // Step 3: Generate highly personalized letter content using AI + base template
      const enhancedContext = {
        ...additionalContext,
        letterTier: letterTier // Add the tier to the context
      }
      const letterContent = await this.generateAdvancedLetterContent(
        personalInfo,
        disputeItems,
        disputeStrategy,
        actualDisputeType, // Use the actual dispute type
        creditBureau,
        writingStyle,
        personalizationLevel,
        enhancedContext
      )
      
      // Step 4: Apply advanced optimization and uniqueness
      const optimizedContent = await this.applyAdvancedOptimization(letterContent, disputeStrategy, writingStyle)
      
      // Step 5: Calculate advanced quality metrics
      const qualityScore = await this.calculateAdvancedQualityScore(optimizedContent, disputeStrategy, personalizationLevel, letterTier)
      const uniquenessScore = await this.calculateUniquenessScore(optimizedContent, personalInfo, disputeItems, letterTier)
      
      // Step 6: Save to database (if available)
      const letterId = await this.saveGeneratedLetter(
        personalInfo,
        disputeItems,
        optimizedContent,
        disputeStrategy,
        actualDisputeType, // Use the actual dispute type
        creditBureau
      )
      
      return {
        id: letterId,
        content: optimizedContent,
        metadata: {
          letterType: actualDisputeType, // Return the actual dispute type
          letterTier: letterTier, // Also include the tier
          disputeStrategy,
          qualityScore,
          legalCompliance: this.getAdvancedLegalCompliance(optimizedContent),
          customizationLevel: personalizationLevel,
          generatedAt: new Date().toISOString(),
          uniquenessScore,
          personalizationLevel,
          writingStyle,
        },
      }
    } catch (error) {
      console.error("AI dispute letter generation failed:", error)
      throw new Error("Failed to generate AI-powered dispute letter")
    }
  }

  private async generateAdvancedDisputeStrategy(
    disputeItems: DisputeItem[],
    letterType: string,
    personalInfo: PersonalInfo,
    additionalContext?: any
  ): Promise<DisputeStrategy> {
    // Advanced strategy generation with multiple layers
    const baseStrategies = this.getBaseStrategies()
    const enhancedStrategies = this.enhanceStrategiesWithContext(baseStrategies, personalInfo, additionalContext)
    const personalizedStrategies = this.personalizeStrategies(enhancedStrategies, disputeItems, letterType)
    
    // Select primary strategy and add unique elements
    const primaryType = this.determinePrimaryDisputeType(disputeItems)
    const baseStrategy = personalizedStrategies[primaryType] || personalizedStrategies.late_payment
    
    // Add unique approach and psychological factors
    return {
      ...baseStrategy,
      uniqueApproach: this.generateUniqueApproach(disputeItems, personalInfo, letterType),
      psychologicalFactors: this.generatePsychologicalFactors(disputeItems, personalInfo),
      escalationStrategy: this.generateEscalationStrategy(letterType, disputeItems)
    }
  }

  private getBaseStrategies(): { [key: string]: DisputeStrategy } {
    return {
      late_payment: {
        primaryReason: "Incorrect payment history reporting",
        legalBasis: [
          "FCRA Section 1681i(a)(1) - Right to dispute inaccurate information",
          "FCRA Section 1681s-2 - Furnisher responsibilities",
          "State consumer protection laws",
          "Regulation V - Accuracy and integrity rules"
        ],
        supportingArguments: [
          "Payment records show on-time payments",
          "Creditor failed to properly investigate previous disputes",
          "Information is outdated beyond reporting period",
          "Payment processing delays caused reporting errors"
        ],
        evidenceSuggestions: [
          "Bank statements showing payments",
          "Payment confirmation emails",
          "Previous correspondence with creditor",
          "Payment processing confirmations"
        ],
        successProbability: 0.75,
        expectedTimeline: "30-45 days",
        followUpActions: [
          "Send certified mail with return receipt",
          "Follow up after 30 days",
          "File CFPB complaint if no response",
          "Request supervisory review"
        ],
        uniqueApproach: "",
        psychologicalFactors: [],
        escalationStrategy: ""
      },
      identity_theft: {
        primaryReason: "Account opened without authorization",
        legalBasis: [
          "FCRA Section 1681c-2 - Identity theft prevention",
          "FCRA Section 1681i(a)(1) - Right to dispute",
          "FTC Identity Theft Report requirements",
          "State identity theft laws",
          "Regulation V - Identity theft prevention"
        ],
        supportingArguments: [
          "Account opened without knowledge or consent",
          "Personal information compromised",
          "Police report filed for identity theft",
          "FTC Identity Theft Report submitted",
          "No prior relationship with creditor"
        ],
        evidenceSuggestions: [
          "FTC Identity Theft Report",
          "Police report",
          "Affidavit of fraud",
          "Credit monitoring alerts",
          "Previous identity theft incidents"
        ],
        successProbability: 0.95,
        expectedTimeline: "15-30 days",
        followUpActions: [
          "Include FTC report and police report",
          "Request fraud alert placement",
          "Monitor for additional fraudulent accounts",
          "File police report if not already done"
        ],
        uniqueApproach: "",
        psychologicalFactors: [],
        escalationStrategy: ""
      },
      incorrect_balance: {
        primaryReason: "Inaccurate account balance reporting",
        legalBasis: [
          "FCRA Section 1681s-2 - Furnisher accuracy obligations",
          "FCRA Section 1681i(a)(1) - Consumer dispute rights",
          "Regulation V - Accuracy requirements",
          "State consumer protection laws"
        ],
        supportingArguments: [
          "Current balance differs from reported amount",
          "Recent payments not reflected",
          "Account status incorrectly reported",
          "Balance calculation errors",
          "Payment application issues"
        ],
        evidenceSuggestions: [
          "Current account statement",
          "Payment receipts",
          "Account agreement",
          "Payment history records",
          "Correspondence with creditor"
        ],
        successProbability: 0.80,
        expectedTimeline: "30-45 days",
        followUpActions: [
          "Provide current account documentation",
          "Request immediate correction",
          "Follow up for verification",
          "Request payment history audit"
        ],
        uniqueApproach: "",
        psychologicalFactors: [],
        escalationStrategy: ""
      }
    }
  }

  private enhanceStrategiesWithContext(
    strategies: { [key: string]: DisputeStrategy },
    personalInfo: PersonalInfo,
    additionalContext?: any
  ): { [key: string]: DisputeStrategy } {
    const enhanced = { ...strategies }
    
    // Add context-specific legal basis
    Object.keys(enhanced).forEach(key => {
      const strategy = enhanced[key]
      
      // Add state-specific laws based on location
      if (personalInfo.state === "CA") {
        strategy.legalBasis.push("California Consumer Credit Reporting Agencies Act")
        strategy.legalBasis.push("California Civil Code Section 1785.1")
      } else if (personalInfo.state === "NY") {
        strategy.legalBasis.push("New York General Business Law Article 25")
      } else if (personalInfo.state === "TX") {
        strategy.legalBasis.push("Texas Finance Code Chapter 392")
      }
      
      // Add context-specific arguments
      if (additionalContext?.previousDisputes) {
        strategy.supportingArguments.push("Previous disputes demonstrate pattern of reporting errors")
        strategy.supportingArguments.push("Creditor has failed to maintain accurate records")
      }
      
      if (additionalContext?.financialHardship) {
        strategy.supportingArguments.push("Financial hardship documentation available")
        strategy.legalBasis.push("Regulation V - Financial hardship considerations")
      }
    })
    
    return enhanced
  }

  private personalizeStrategies(
    strategies: { [key: string]: DisputeStrategy },
    disputeItems: DisputeItem[],
    letterType: string
  ): { [key: string]: DisputeStrategy } {
    const personalized = { ...strategies }
    
    // Adjust based on letter type
    if (letterType === "premium" || letterType === "attorney") {
      Object.keys(personalized).forEach(key => {
        const strategy = personalized[key]
        strategy.legalBasis.push("15 U.S.C. § 1681n - Civil liability for willful noncompliance")
        strategy.legalBasis.push("15 U.S.C. § 1681o - Civil liability for negligent noncompliance")
        strategy.followUpActions.push("Prepare for potential legal action if dispute not resolved")
      })
    }
    
    // Adjust based on dispute complexity
    if (disputeItems.length > 3) {
      Object.keys(personalized).forEach(key => {
        const strategy = personalized[key]
        strategy.supportingArguments.push("Multiple reporting errors suggest systemic issues")
        strategy.legalBasis.push("Pattern and practice violations under FCRA")
      })
    }
    
    return personalized
  }

  private generateUniqueApproach(disputeItems: DisputeItem[], personalInfo: PersonalInfo, letterType: string): string {
    const approaches = [
      "Emphasize consumer rights under recent FCRA amendments",
      "Highlight regulatory enforcement trends in credit reporting",
      "Focus on data accuracy requirements under Regulation V",
      "Stress the importance of proper investigation procedures",
      "Emphasize consumer protection agency oversight",
      "Highlight successful dispute resolution patterns",
      "Focus on creditor accountability and responsibility",
      "Stress the impact on consumer financial opportunities"
    ]
    
    // Select based on personalization factors
    const index = (personalInfo.firstName.length + disputeItems.length + letterType.length) % approaches.length
    return approaches[index]
  }

  private generatePsychologicalFactors(disputeItems: DisputeItem[], personalInfo: PersonalInfo): string[] {
    const factors = [
      "Stress and anxiety caused by credit reporting errors",
      "Financial opportunities lost due to inaccurate information",
      "Impact on family financial security",
      "Professional reputation affected by credit issues",
      "Housing and employment opportunities compromised",
      "Emotional distress from repeated reporting errors",
      "Loss of financial independence and control",
      "Impact on future financial planning and goals"
    ]
    
    // Select 2-3 factors based on personalization
    const selectedCount = 2 + (personalInfo.lastName.length % 2)
    const shuffled = factors.sort(() => 0.5 - Math.random())
    return shuffled.slice(0, selectedCount)
  }

  private generateEscalationStrategy(letterType: string, disputeItems: DisputeItem[]): string {
    if (letterType === "attorney") {
      return "Immediate legal action preparation if dispute not resolved within 30 days"
    } else if (letterType === "premium") {
      return "CFPB complaint and regulatory escalation if no response within 30 days"
    } else if (letterType === "enhanced") {
      return "CFPB complaint filing if dispute not resolved within 45 days"
    } else {
      return "Follow-up and escalation if no response within 45 days"
    }
  }

  private selectUniqueWritingStyle(personalInfo: PersonalInfo, disputeItems: DisputeItem[], letterType: string): string {
    // Add randomization for better variation
    const randomFactor = Math.floor(Math.random() * this.writingStyles.length)
    
    // Use personalization factors to select unique style
    const factor1 = personalInfo.firstName.length % this.writingStyles.length
    const factor2 = disputeItems.length % this.writingStyles.length
    const factor3 = letterType.length % this.writingStyles.length
    
    const styleIndex = (factor1 + factor2 + factor3 + randomFactor) % this.writingStyles.length
    return this.writingStyles[styleIndex]
  }

  private calculatePersonalizationLevel(personalInfo: PersonalInfo, disputeItems: DisputeItem[], additionalContext?: any): string {
    let score = 0
    
    if (disputeItems.length > 1) score += 20
    if (additionalContext?.previousDisputes) score += 25
    if (additionalContext?.financialHardship) score += 15
    if (personalInfo.state !== "CA") score += 10 // Different state laws
    if (disputeItems.some(item => item.supportingEvidence)) score += 20
    
    // Add randomization for variation
    const randomVariation = Math.floor(Math.random() * 21) - 10 // -10 to +10
    score += randomVariation
    
    if (score >= 70) return "High"
    if (score >= 40) return "Medium"
    return "Standard"
  }

  private async generateAdvancedLetterContent(
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    strategy: DisputeStrategy,
    disputeType: string, // The actual dispute type (dispute, goodwill, etc.)
    creditBureau: string,
    writingStyle: string,
    personalizationLevel: string,
    additionalContext?: any
  ): Promise<string> {
    // Use AI to generate unique variations if OpenAI is available
    if (this.openai) {
      try {
        return await this.generateAILetterContent(
          personalInfo,
          disputeItems,
          strategy,
          letterType,
          creditBureau,
          writingStyle,
          personalizationLevel,
          additionalContext
        )
      } catch (error) {
        console.warn("AI generation failed, falling back to template:", error)
      }
    }
    
    // Fallback to template-based generation with tier-specific enhancements
    // Get the correct template based on the dispute type and fill it with data
    let content = this.fillBaseTemplate(personalInfo, disputeItems, strategy, creditBureau, additionalContext)
    
    // Apply tier-specific enhancements (get tier from additionalContext)
    const letterTier = additionalContext?.letterTier || "standard"
    if (letterTier.toLowerCase() === "enhanced") {
      content = this.applyEnhancedFeatures(content, disputeItems, strategy)
    } else if (letterTier.toLowerCase() === "premium") {
      content = this.applyPremiumFeatures(content, disputeItems, strategy, personalInfo)
    }
    
    // Apply writing style and personalization
    content = this.applyWritingStyle(content, writingStyle, personalizationLevel)
    content = this.addAdvancedPersonalization(content, personalInfo, disputeItems, strategy, additionalContext)
    
    return Promise.resolve(content)
  }

  private applyEnhancedFeatures(content: string, disputeItems: DisputeItem[], strategy: DisputeStrategy): string {
    let enhanced = content
    
    // Add enhanced legal language
    enhanced = enhanced.replace(
      "Please remove this incorrect information at once",
      "I respectfully but firmly request that you remove this incorrect information promptly, as required under the Fair Credit Reporting Act (FCRA)"
    )
    
    // Add supporting arguments
    if (disputeItems.length > 1) {
      enhanced += "\n\nADDITIONAL SUPPORTING ARGUMENTS:\n"
      enhanced += "The presence of multiple reporting errors suggests potential systemic issues that require immediate attention and correction."
    }
    
    return enhanced
  }

  private applyPremiumFeatures(content: string, disputeItems: DisputeItem[], strategy: DisputeStrategy, personalInfo: PersonalInfo): string {
    let premium = content
    
    // Add premium legal citations
    premium = premium.replace(
      "Please remove this incorrect information at once",
      "I demand the immediate removal of this incorrect information pursuant to 15 U.S.C. § 1681i(a)(1)(A) of the Fair Credit Reporting Act, which requires credit reporting agencies to conduct a reasonable reinvestigation of disputed information"
    )
    
    // Add comprehensive legal analysis
    premium += "\n\nLEGAL ANALYSIS:\n"
    premium += "Under the FCRA, credit reporting agencies have a legal obligation to ensure the accuracy and completeness of consumer credit information. The disputed items represent violations of these requirements and must be corrected immediately.\n\n"
    
    // Add escalation strategy
    premium += "ESCALATION STRATEGY:\n"
    premium += "If this dispute is not resolved within 30 days, I will file a complaint with the Consumer Financial Protection Bureau (CFPB) and pursue all available legal remedies, including potential litigation under the FCRA.\n\n"
    
    // Add psychological impact section
    premium += "IMPACT ASSESSMENT:\n"
    premium += "These reporting errors have caused significant financial harm, including reduced access to credit, higher interest rates, and emotional distress. The immediate correction of these errors is essential to restore my financial standing and creditworthiness."
    
    return premium
  }

  private async generateAILetterContent(
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    strategy: DisputeStrategy,
    letterType: string,
    creditBureau: string,
    writingStyle: string,
    personalizationLevel: string,
    additionalContext?: any,
    attemptNumber: number = 1
  ): Promise<string> {
    if (!this.openai) {
      throw new Error("OpenAI not initialized")
    }

    // Prepare the base template with placeholders filled
    const baseTemplate = this.fillBaseTemplate(personalInfo, disputeItems, strategy, creditBureau, additionalContext)
    
    // Generate unique content with retry logic for uniqueness
    let attempts = 0
    const maxAttempts = 3
    let aiGeneratedContent = ""
    
    while (attempts < maxAttempts) {
      attempts++
      
      // Create AI prompt for generating unique variations
      const prompt = this.createAILetterPrompt(
        baseTemplate,
        personalInfo,
        disputeItems,
        strategy,
        letterType,
        creditBureau,
        writingStyle,
        personalizationLevel,
        additionalContext,
        attempts // Pass attempt number for additional uniqueness
      )

      try {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are an expert credit repair attorney specializing in FCRA compliance and dispute letter generation. Your task is to create unique, personalized dispute letters that maintain legal compliance while being distinct from previous versions."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8 + (attempts * 0.1), // Increase temperature with each attempt
          max_tokens: 2000,
          presence_penalty: 0.6 + (attempts * 0.1), // Increase presence penalty
          frequency_penalty: 0.8 + (attempts * 0.1), // Increase frequency penalty
        })

        const content = completion.choices[0]?.message?.content
        if (!content) {
          throw new Error("No content generated by AI")
        }

        // Check if this content is unique
        const contentHash = this.generateContentHash(content)
        if (!this.generatedLetters.has(contentHash)) {
          aiGeneratedContent = content
          this.generatedLetters.add(contentHash)
          break
        } else {
          console.log(`Attempt ${attempts}: Generated content was not unique, retrying...`)
        }
      } catch (error) {
        console.error(`AI letter generation attempt ${attempts} failed:`, error)
        if (attempts === maxAttempts) {
          throw new Error("Failed to generate unique AI-powered letter content after multiple attempts")
        }
      }
    }

    if (!aiGeneratedContent) {
      throw new Error("Failed to generate unique AI content")
    }

    // Clean and validate the AI-generated content
    const cleanedContent = this.cleanAndValidateAIContent(aiGeneratedContent, baseTemplate)
    
    // Apply final personalization and optimization
    const personalizedContent = this.addAdvancedPersonalization(cleanedContent, personalInfo, disputeItems, strategy, additionalContext)
    
    return personalizedContent
  }

  private createAILetterPrompt(
    baseTemplate: string,
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    strategy: DisputeStrategy,
    letterType: string,
    creditBureau: string,
    writingStyle: string,
    personalizationLevel: string,
    additionalContext?: any,
    attemptNumber: number = 1
  ): string {
    const writingStyleInstructions = {
      "assertive_professional": "Use confident, professional language that demonstrates knowledge of consumer rights",
      "diplomatic_but_firm": "Be respectful but assertive, showing understanding while maintaining firmness",
      "legal_technical": "Include specific legal citations and technical FCRA language",
      "empathetic_understanding": "Show understanding of the credit bureau's challenges while advocating for consumer rights",
      "direct_authoritative": "Use direct, authoritative language that commands attention and respect",
      "analytical_detailed": "Present detailed analysis and logical arguments",
      "persuasive_emotional": "Appeal to emotions while maintaining professionalism",
      "formal_business": "Use formal business language with clear structure and professionalism"
    }

    const tierSpecificInstructions = {
      "standard": "Focus on basic legal requirements and clear dispute presentation. Keep language straightforward and professional.",
      "enhanced": "Include detailed legal analysis, multiple supporting arguments, and enhanced personalization. Use more sophisticated language and reasoning.",
      "premium": "Create comprehensive, attorney-level content with advanced legal strategies, detailed case analysis, multiple legal citations, and sophisticated argumentation. This should be the highest quality possible."
    }

    const uniquenessInstructions = [
      "Use completely different sentence structures and vocabulary - rewrite every sentence with new phrasing",
      "Change the tone and approach while maintaining professionalism - use alternative legal language",
      "Vary the emotional appeal and argumentative style - present arguments in a completely different way",
      "Use different examples and analogies - change the way you present evidence and reasoning",
      "Rewrite with a completely different writing personality - make it sound like a different attorney wrote it"
    ]

    const attemptSpecificInstructions = [
      "FIRST ATTEMPT: Focus on legal precision and professional tone",
      "SECOND ATTEMPT: Emphasize emotional impact and personal consequences",
      "THIRD ATTEMPT: Use analytical approach with detailed reasoning and examples"
    ]

    return `Generate a unique, personalized credit dispute letter based on the following foundation template. This is attempt ${attemptNumber} - make it significantly different from any previous versions while maintaining the same legal structure and compliance.

IMPORTANT: The base template below already contains the correct bureau information and personal details. Use this as your foundation and maintain all the specific information while rewriting the content to be unique.

BASE TEMPLATE (ALREADY FILLED WITH CORRECT INFORMATION):
${baseTemplate}

REQUIREMENTS:
1. Maintain the same legal structure and FCRA compliance
2. Use ${writingStyleInstructions[writingStyle as keyof typeof writingStyleInstructions]}
3. Personalization level: ${personalizationLevel}
4. Letter type: ${letterType} (${tierSpecificInstructions[letterType.toLowerCase() as keyof typeof tierSpecificInstructions]})
5. Credit bureau: ${creditBureau}
6. UNIQUENESS: ${uniquenessInstructions[attemptNumber - 1] || uniquenessInstructions[0]}
7. ATTEMPT FOCUS: ${attemptSpecificInstructions[attemptNumber - 1] || attemptSpecificInstructions[0]}

CRITICAL BUREAU REQUIREMENTS:
- The letter MUST be addressed specifically to: ${additionalContext?.bureauName || creditBureau}
- The letter MUST include the correct address: ${additionalContext?.bureauAddress || 'Use standard credit bureau address'}
- Replace any generic "Credit Bureau" references with the specific bureau name: ${additionalContext?.bureauName || creditBureau}
- Each letter should be unique to the specific bureau it's being sent to

PERSONAL INFORMATION:
- Name: ${personalInfo.firstName} ${personalInfo.lastName}
- State: ${personalInfo.state}
- Previous disputes: ${additionalContext?.previousDisputes ? 'Yes' : 'No'}
- Financial hardship: ${additionalContext?.financialHardship ? 'Yes' : 'No'}

DISPUTE ITEMS:
${disputeItems.map(item => `- ${item.creditorName} (${item.accountNumber}): ${item.disputeReason}`).join('\n')}

DISPUTE STRATEGY:
- Primary reason: ${strategy.primaryReason}
- Legal basis: ${strategy.legalBasis.slice(0, 3).join(', ')}
- Success probability: ${strategy.successProbability}
- Expected timeline: ${strategy.expectedTimeline}

TIER-SPECIFIC REQUIREMENTS:
${tierSpecificInstructions[letterType.toLowerCase() as keyof typeof tierSpecificInstructions]}

CRITICAL INSTRUCTIONS FOR UNIQUENESS (ATTEMPT ${attemptNumber}):
1. This is attempt ${attemptNumber} - make it completely different from previous versions
2. Use different sentence structures, vocabulary, and phrasing throughout
3. Change the way you present arguments and evidence
4. Vary the emotional tone and persuasive approach
5. Use alternative legal language and different examples
6. Make it sound like it was written by a completely different person
7. Maintain all legal requirements and FCRA compliance
8. Keep the same overall length and structure
9. ${attemptSpecificInstructions[attemptNumber - 1] || attemptSpecificInstructions[0]}
10. Use ${uniquenessInstructions[attemptNumber - 1] || uniquenessInstructions[0]}

BUREAU-SPECIFIC CONTENT REQUIREMENTS:
- Address the letter specifically to: ${additionalContext?.bureauName || creditBureau}
- Include the correct mailing address: ${additionalContext?.bureauAddress || 'Use standard credit bureau address'}
- Make the letter content unique to this specific bureau
- Ensure the greeting and closing are personalized to the bureau

IMPORTANT: The base template above already contains the correct bureau address and personal information. Use this as your foundation and rewrite the content to be unique while maintaining all the specific details. Do NOT change the addresses, names, or other factual information - only rewrite the language and presentation to be unique.

Generate the complete letter with all the same sections but completely rewritten content that sounds unique and different. Focus on making this attempt ${attemptNumber} distinct from any previous versions. The quality should reflect the ${letterType} tier pricing level. The letter MUST be specifically addressed to ${additionalContext?.bureauName || creditBureau} with the correct address.`
  }

  private cleanAndValidateAIContent(aiContent: string, baseTemplate: string): string {
    let cleaned = aiContent.trim()
    
    // Remove any markdown formatting if present
    cleaned = cleaned.replace(/```/g, '').replace(/^letter\s*:\s*/i, '').replace(/^dispute\s*letter\s*:\s*/i, '')
    
    // Ensure the letter has the basic required structure
    const requiredElements = [
      'To Whom It May Concern',
      'dispute',
      'credit report',
      'Sincerely',
      'Federal Trade Commission'
    ]
    
    const missingElements = requiredElements.filter(element => 
      !cleaned.toLowerCase().includes(element.toLowerCase())
    )
    
    if (missingElements.length > 0) {
      console.warn("AI content missing required elements, using base template as fallback")
      return baseTemplate
    }
    
    // Ensure proper formatting
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
    cleaned = cleaned.replace(/\s{2,}/g, ' ') // Remove excessive spaces
    
    return cleaned
  }

  private fillBaseTemplate(
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    strategy: DisputeStrategy,
    creditBureau: string,
    additionalContext?: any
  ): string {
    // Get the dispute type from additionalContext
    const disputeType = additionalContext?.letterPurpose || "dispute"
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    // Generate unique variations for key sections
    const uniqueDateVariations = [
      `On ${currentDate}, I received my credit report from you.`,
      `Upon reviewing my credit report dated ${currentDate}, I discovered`,
      `My recent credit report from ${currentDate} contains`,
      `After examining my credit report of ${currentDate}, I found`,
      `My credit report dated ${currentDate} includes`
    ]
    
    const uniqueDisputeExplanations = this.generateUniqueDisputeExplanations(disputeItems, strategy)
    const uniqueContactVariations = this.generateUniqueContactVariations(disputeItems, personalInfo)
    const uniqueClosingVariations = this.generateUniqueClosingVariations(disputeItems, strategy, additionalContext)
    
    // Select variations based on personalization factors
    const dateIndex = (personalInfo.firstName.length + personalInfo.lastName.length) % uniqueDateVariations.length
    const contactIndex = (personalInfo.phone.length + disputeItems.length) % uniqueContactVariations.length
    const closingIndex = (personalInfo.state.length + disputeItems.length) % uniqueClosingVariations.length
    
    let letter = this.letterTemplates.get(disputeType) || this.letterTemplates.get("dispute") || ""
    
    // Replace template variables with actual data
    letter = letter.replace(/{client_first_name}/g, personalInfo.firstName)
    letter = letter.replace(/{client_last_name}/g, personalInfo.lastName)
    letter = letter.replace(/{client_address}/g, `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}`)
    letter = letter.replace(/{client_previous_address}/g, this.generatePreviousAddress(personalInfo))
    letter = letter.replace(/{t_no}/g, personalInfo.phone)
    letter = letter.replace(/{bdate}/g, personalInfo.dateOfBirth)
    letter = letter.replace(/{ss_number}/g, `XXX-XX-${personalInfo.ssnLast4}`)
    letter = letter.replace(/{bureau_address}/g, this.getBureauAddress(creditBureau))
    letter = letter.replace(/{curr_date}/g, currentDate)
    
    // Replace the generic date section with unique variation
    letter = letter.replace(
      "On (DATE), I received my credit report from you. It included the following incorrect information:",
      uniqueDateVariations[dateIndex] + " It included the following incorrect information:"
    )
    
    // Replace dispute item explanation with AI-generated content
    letter = letter.replace(/{dispute_item_and_explanation}/g, uniqueDisputeExplanations)
    
    // Replace contact variations
    letter = letter.replace(/{CONTACT PERSON}/g, uniqueContactVariations[contactIndex].contactPerson)
    letter = letter.replace(/{CONTACT NUMBER}/g, uniqueContactVariations[contactIndex].contactNumber)
    
    // Replace closing with unique variation
    letter = letter.replace(
      "This incorrect and negative information is damaging my credit. Please remove this incorrect information at once and send me an updated copy of my credit history report.",
      uniqueClosingVariations[closingIndex]
    )
    
    // Add unique signature variations
    const signatureVariations = [
      "Sincerely yours,",
      "Respectfully,",
      "Best regards,",
      "Thank you for your attention to this matter,",
      "I appreciate your prompt attention to this issue,"
    ]
    const signatureIndex = (personalInfo.firstName.length + personalInfo.lastName.length) % signatureVariations.length
    letter = letter.replace("Sincerely yours,", signatureVariations[signatureIndex])
    
    // Clean up any remaining placeholders
    letter = letter.replace(/{client_signature}/g, "")
    letter = letter.replace(/{CONTACT PERSON}/g, "a customer service representative")
    letter = letter.replace(/{CONTACT NUMBER}/g, personalInfo.phone)
    letter = letter.replace(/{DATE}/g, currentDate)
    
    return letter
  }

  private generateUniqueDisputeExplanations(disputeItems: DisputeItem[], strategy: DisputeStrategy): string {
    const explanations = disputeItems.map((item, index) => {
      const variations = [
        `Item ${index + 1}: ${item.creditorName} (Account: ${item.accountNumber}) - ${item.disputeReason}. This information is incorrect and should be removed.`,
        `Account ${index + 1}: ${item.creditorName} - ${item.disputeReason}. The reported information is inaccurate and needs immediate correction.`,
        `Dispute ${index + 1}: ${item.creditorName} account - ${item.disputeReason}. This negative information is erroneous and must be deleted.`,
        `Credit Item ${index + 1}: ${item.creditorName} - ${item.disputeReason}. The information shown is wrong and should be expunged.`,
        `Reported Item ${index + 1}: ${item.creditorName} - ${item.disputeReason}. This data is incorrect and requires removal.`
      ]
      
      const variationIndex = (item.id.length + item.creditorName.length) % variations.length
      return variations[variationIndex]
    })
    
    return explanations.join("\n\n")
  }

  private generateUniqueContactVariations(disputeItems: DisputeItem[], personalInfo: PersonalInfo): Array<{contactPerson: string, contactNumber: string}> {
    const contactVariations = [
      {
        contactPerson: `a representative from ${disputeItems[0]?.creditorName || "the creditor"}`,
        contactNumber: personalInfo.phone
      },
      {
        contactPerson: `a customer service agent at ${disputeItems[0]?.creditorName || "the company"}`,
        contactNumber: personalInfo.phone
      },
      {
        contactPerson: `an account manager from ${disputeItems[0]?.creditorName || "the financial institution"}`,
        contactNumber: personalInfo.phone
      },
      {
        contactPerson: `a supervisor at ${disputeItems[0]?.creditorName || "the creditor's office"}`,
        contactNumber: personalInfo.phone
      },
      {
        contactPerson: `a verification specialist from ${disputeItems[0]?.creditorName || "the company"}`,
        contactNumber: personalInfo.phone
      }
    ]
    
    return contactVariations
  }

  private generateUniqueClosingVariations(disputeItems: DisputeItem[], strategy: DisputeStrategy, additionalContext?: any): string {
    const baseClosings = [
      "This incorrect and negative information is damaging my credit. Please remove this incorrect information at once and send me an updated copy of my credit history report.",
      "This inaccurate information is adversely affecting my credit standing. I request immediate removal of these errors and an updated credit report.",
      "These reporting errors are harming my credit profile. Please correct this information promptly and provide an updated credit history report.",
      "This incorrect data is negatively impacting my credit score. I need these errors removed immediately and an updated credit report sent.",
      "These inaccurate entries are damaging my credit reputation. Please delete this incorrect information and send me an updated credit report."
    ]
    
    // Add context-specific variations
    if (additionalContext?.financialHardship) {
      baseClosings.push("This incorrect information is severely impacting my financial situation and ability to access credit. Please remove these errors immediately and provide an updated credit report.")
    }
    
    if (disputeItems.length > 1) {
      baseClosings.push("These multiple reporting errors suggest systemic issues that require immediate attention. Please remove all incorrect information and send me an updated credit report.")
    }
    
    const closingIndex = (disputeItems.length + strategy.legalBasis.length) % baseClosings.length
    return baseClosings[closingIndex]
  }

  private generatePreviousAddress(personalInfo: PersonalInfo): string {
    // Generate a realistic previous address based on current location
    const previousAddresses = [
      `${personalInfo.address.replace(/\d+/, (match) => (parseInt(match) - 1).toString())}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}`,
      `${personalInfo.address.replace(/\d+/, (match) => (parseInt(match) + 1).toString())}, ${personalInfo.city}, ${personalInfo.state} ${personalInfo.zipCode}`,
      `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${(parseInt(personalInfo.zipCode) - 1).toString().padStart(5, '0')}`,
      `${personalInfo.address}, ${personalInfo.city}, ${personalInfo.state} ${(parseInt(personalInfo.zipCode) + 1).toString().padStart(5, '0')}`
    ]
    
    const addressIndex = (personalInfo.firstName.length + personalInfo.lastName.length) % previousAddresses.length
    return previousAddresses[addressIndex]
  }

  private applyWritingStyle(content: string, writingStyle: string, personalizationLevel: string): string {
    let enhanced = content
    
    switch (writingStyle) {
      case "assertive_professional":
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I firmly request that you remove this incorrect information immediately"
        )
        enhanced = enhanced.replace(
          "Thank you for your time and help in this matter.",
          "I expect your prompt attention to this matter and immediate resolution."
        )
        break
        
      case "diplomatic_but_firm":
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I respectfully but firmly request that you remove this incorrect information promptly"
        )
        enhanced = enhanced.replace(
          "Thank you for your time and help in this matter.",
          "I appreciate your attention to this matter and look forward to your prompt response."
        )
        break
        
      case "legal_technical":
        enhanced = enhanced.replace(
          "This incorrect and negative information is damaging my credit",
          "This incorrect and negative information constitutes a violation of my rights under the Fair Credit Reporting Act (FCRA) and is damaging my credit"
        )
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I hereby request that you remove this incorrect information immediately pursuant to FCRA requirements"
        )
        break
        
      case "empathetic_understanding":
        enhanced = enhanced.replace(
          "This incorrect and negative information is damaging my credit",
          "I understand the challenges of maintaining accurate credit information, but this incorrect and negative information is damaging my credit"
        )
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I trust you will remove this incorrect information promptly"
        )
        break
        
      case "direct_authoritative":
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "You must remove this incorrect information immediately"
        )
        enhanced = enhanced.replace(
          "Thank you for your time and help in this matter.",
          "This matter requires your immediate attention and resolution."
        )
        break
        
      case "analytical_detailed":
        enhanced = enhanced.replace(
          "This incorrect and negative information is damaging my credit",
          "After careful analysis, I have determined that this incorrect and negative information is damaging my credit"
        )
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I expect you to remove this incorrect information immediately and provide detailed documentation of the correction"
        )
        break
        
      case "persuasive_emotional":
        enhanced = enhanced.replace(
          "This incorrect and negative information is damaging my credit",
          "This incorrect and negative information is causing me significant emotional and financial distress and is damaging my credit"
        )
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I sincerely hope you will remove this incorrect information immediately to alleviate this situation"
        )
        break
        
      case "formal_business":
        enhanced = enhanced.replace(
          "Please remove this incorrect information at once",
          "I hereby request that you remove this incorrect information immediately"
        )
        enhanced = enhanced.replace(
          "Thank you for your time and help in this matter.",
          "I appreciate your attention to this matter and await your response."
        )
        break
    }
    
    return enhanced
  }

  private addAdvancedPersonalization(
    content: string,
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    strategy: DisputeStrategy,
    additionalContext?: any
  ): string {
    let personalized = content
    
    // Add personalized opening based on dispute type
    if (disputeItems.some(item => item.itemType.toLowerCase().includes("identity"))) {
      const identityOpening = `\n\nAs a victim of identity theft, I have experienced significant emotional and financial distress. This dispute represents not just a credit reporting issue, but a violation of my personal security and financial integrity.`
      personalized = personalized.replace(
        "To Whom It May Concern,",
        `To Whom It May Concern,${identityOpening}`
      )
    }
    
    // Add personalized closing based on context
    if (additionalContext?.financialHardship) {
      const hardshipClosing = `\n\nI want to emphasize that these reporting errors have had a significant impact on my financial situation and ability to access credit. I am committed to resolving these issues to restore my financial stability.`
      personalized = personalized.replace(
        "Thank you for your time and help in this matter.",
        `${hardshipClosing}\n\nThank you for your time and help in this matter.`
      )
    }
    
    // Add state-specific legal references
    if (personalInfo.state === "CA") {
      const caReference = `\n\nAdditionally, this dispute is filed pursuant to California Consumer Credit Reporting Agencies Act and California Civil Code Section 1785.1, which provide additional consumer protections beyond federal law.`
      personalized = personalized.replace(
        "I also request that you please send notices of corrections to anyone who received my credit report in the past six months.",
        `${caReference}\n\nI also request that you please send notices of corrections to anyone who received my credit report in the past six months.`
      )
    }
    
    return personalized
  }

  private async applyAdvancedOptimization(content: string, strategy: DisputeStrategy, writingStyle: string): Promise<string> {
    let optimized = content
    
    // Add urgency for high-success-probability disputes
    if (strategy.successProbability > 0.8) {
      optimized = optimized.replace(
        "Please remove this incorrect information at once",
        "I urgently request that you remove this incorrect information immediately"
      )
    }
    
    // Add specific legal citations for enhanced credibility
    if (strategy.legalBasis.length > 3) {
      const legalSection = optimized.indexOf("Re: Creditor Verification of incorrect items on my credit history report.")
      if (legalSection !== -1) {
        const legalText = `\n\nThis dispute is filed pursuant to the Fair Credit Reporting Act (FCRA), specifically:\n${strategy.legalBasis.slice(0, 3).map(basis => `• ${basis}`).join("\n")}`
        optimized = optimized.replace(
          "Re: Creditor Verification of incorrect items on my credit history report.",
          `Re: Creditor Verification of incorrect items on my credit history report.${legalText}`
        )
      }
    }
    
    // Add writing style-specific enhancements
    if (writingStyle === "legal_technical") {
      optimized = optimized.replace(
        "30-day timeframe",
        "30-day timeframe as mandated by 15 U.S.C. § 1681i(a)(1)"
      )
    }
    
    return optimized
  }

  private async calculateAdvancedQualityScore(content: string, strategy: DisputeStrategy, personalizationLevel: string, letterType: string): Promise<number> {
    let score = 0
    
    // Base score based on letter type (pricing tier)
    const tierBaseScores = {
      "standard": 25,
      "enhanced": 45,
      "premium": 65
    }
    
    score += tierBaseScores[letterType.toLowerCase() as keyof typeof tierBaseScores] || 25
    
    // Content length and completeness
    if (content.length > 1200) score += 25
    else if (content.length > 1000) score += 20
    else if (content.length > 800) score += 15
    else score += 10
    
    // Legal compliance and citations
    if (content.includes("FCRA")) score += 15
    if (content.includes("15 U.S.C.")) score += 10
    if (content.includes("legal")) score += 8
    if (content.includes("evidence")) score += 8
    if (content.includes("certified mail")) score += 8
    
    // Strategy-based scoring with variation
    const strategyScore = strategy.successProbability * 20
    score += strategyScore
    
    // Legal basis strength
    if (strategy.legalBasis.length >= 4) score += 15
    else if (strategy.legalBasis.length >= 3) score += 12
    else if (strategy.legalBasis.length >= 2) score += 8
    else score += 5
    
    // Personalization scoring with variation
    if (personalizationLevel === "High") score += 18
    else if (personalizationLevel === "Medium") score += 12
    else score += 8
    
    // Content sophistication
    if (content.includes("UNIQUE APPROACH:")) score += 8
    if (content.includes("PSYCHOLOGICAL IMPACT:")) score += 8
    if (content.includes("ESCALATION STRATEGY:")) score += 8
    
    // Random quality variation factor (0-15 points)
    const randomVariation = Math.floor(Math.random() * 16)
    score += randomVariation
    
    // Ensure minimum quality based on tier
    const minScores = {
      "standard": 30,
      "enhanced": 50,
      "premium": 70
    }
    
    score = Math.max(score, minScores[letterType.toLowerCase() as keyof typeof minScores] || 30)
    
    return Math.min(score, 100)
  }

  private async calculateUniquenessScore(content: string, personalInfo: PersonalInfo, disputeItems: DisputeItem[], letterType: string): Promise<number> {
    let score = 0
    
    // Base uniqueness score based on letter type (pricing tier)
    const tierBaseScores = {
      "standard": 20,
      "enhanced": 40,
      "premium": 60
    }
    
    score += tierBaseScores[letterType.toLowerCase() as keyof typeof tierBaseScores] || 20
    
    // Content uniqueness factors - check for actual content variation
    const contentHash = this.generateContentHash(content)
    const isNewContent = !this.generatedLetters.has(contentHash)
    
    if (isNewContent) {
      score += 40 // Major boost for truly unique content
      this.generatedLetters.add(contentHash)
    }
    
    // Content diversity scoring
    const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size
    if (uniqueWords > 200) score += 20
    else if (uniqueWords > 150) score += 15
    else if (uniqueWords > 100) score += 10
    
    // Sentence structure variation
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length
    if (avgSentenceLength > 120) score += 15
    else if (avgSentenceLength > 80) score += 10
    
    // Personalization factors
    if (personalInfo.state !== "CA") score += 10
    if (disputeItems.length > 1) score += 10
    if (disputeItems.some(item => item.supportingEvidence)) score += 5
    
    // Random variation factor (0-10 points)
    const randomVariation = Math.floor(Math.random() * 11)
    score += randomVariation
    
    // Ensure minimum uniqueness based on tier
    const minScores = {
      "standard": 25,
      "enhanced": 45,
      "premium": 65
    }
    
    score = Math.max(score, minScores[letterType.toLowerCase() as keyof typeof minScores] || 25)
    
    return Math.min(score, 100)
  }

  private getAdvancedLegalCompliance(content: string): string[] {
    const compliance: string[] = []
    
    if (content.includes("FCRA")) compliance.push("FCRA Compliance")
    if (content.includes("15 U.S.C.")) compliance.push("Legal Citation Compliance")
    if (content.includes("legal")) compliance.push("Legal Language Compliance")
    if (content.includes("evidence")) compliance.push("Evidence Presentation Compliance")
    if (content.includes("certified mail")) compliance.push("Delivery Compliance")
    if (content.includes("Social Security")) compliance.push("Identity Verification")
    if (content.includes("Regulation V")) compliance.push("Regulatory Compliance")
    
    return compliance
  }

  private determinePrimaryDisputeType(disputeItems: DisputeItem[]): string {
    const typeCounts: { [key: string]: number } = {}
    
    disputeItems.forEach(item => {
      const type = item.itemType.toLowerCase()
      if (type.includes("late") || type.includes("payment")) typeCounts.late_payment = (typeCounts.late_payment || 0) + 1
      if (type.includes("identity") || type.includes("theft")) typeCounts.identity_theft = (typeCounts.identity_theft || 0) + 1
      if (type.includes("balance") || type.includes("amount")) typeCounts.incorrect_balance = (typeCounts.incorrect_balance || 0) + 1
    })
    
    return Object.keys(typeCounts).reduce((a, b) => typeCounts[a] > typeCounts[b] ? a : b, "late_payment")
  }

  private getBureauAddress(bureau: string): string {
    const addresses: { [key: string]: string } = {
      experian: "P.O. Box 4500, Allen, TX 75013",
      equifax: "P.O. Box 740256, Atlanta, GA 30374-0256",
      transunion: "P.O. Box 2000, Chester, PA 19016-2000"
    }
    return addresses[bureau.toLowerCase()] || addresses.experian
  }

  private applyTemplateInterchange(content: string, letterType: string): string {
    // Get hidden templates for this letter type
    const hiddenTemplates = this.hiddenTemplateFolders.get(letterType) || []
    if (hiddenTemplates.length === 0) return content
    
    // Select a random hidden template for interchange
    const randomTemplate = hiddenTemplates[Math.floor(Math.random() * hiddenTemplates.length)]
    
    // Extract key phrases from the hidden template for interchange
    const phrases = this.extractKeyPhrases(randomTemplate)
    
    // Apply phrase interchange to create uniqueness
    let enhancedContent = content
    phrases.forEach(phrase => {
      if (Math.random() > 0.5) { // 50% chance to apply each phrase
        enhancedContent = this.interchangePhrase(enhancedContent, phrase)
      }
    })
    
    return enhancedContent
  }

  private extractKeyPhrases(template: string): string[] {
    // Extract key legal phrases and sentences for interchange
    const phrases: string[] = []
    
    // Common legal phrases
    const legalPhrases = [
      "pursuant to",
      "in accordance with",
      "as required by",
      "under the provisions of",
      "I hereby request",
      "I respectfully request",
      "I formally request",
      "I am requesting",
      "I would like to request"
    ]
    
    legalPhrases.forEach(phrase => {
      if (template.toLowerCase().includes(phrase.toLowerCase())) {
        phrases.push(phrase)
      }
    })
    
    // Extract complete sentences for more complex interchange
    const sentences = template.split(/[.!?]+/).filter(s => s.trim().length > 20)
    sentences.slice(0, 3).forEach(sentence => {
      if (sentence.trim().length > 0) {
        phrases.push(sentence.trim())
      }
    })
    
    return phrases
  }

  private interchangePhrase(content: string, phrase: string): string {
    // Create variations of the phrase for interchange
    const variations: { [key: string]: string[] } = {
      "pursuant to": ["pursuant to", "in accordance with", "as required by", "under the provisions of"],
      "I hereby request": ["I hereby request", "I formally request", "I respectfully request", "I am requesting"],
      "I respectfully request": ["I respectfully request", "I hereby request", "I formally request", "I would like to request"],
      "I formally request": ["I formally request", "I hereby request", "I respectfully request", "I am requesting"]
    }
    
    // Find matching variations
    for (const [key, values] of Object.entries(variations)) {
      if (phrase.toLowerCase().includes(key.toLowerCase())) {
        const randomVariation = values[Math.floor(Math.random() * values.length)]
        if (randomVariation !== phrase) {
          return content.replace(new RegExp(phrase, 'gi'), randomVariation)
        }
      }
    }
    
    return content
  }

  private async saveGeneratedLetter(
    personalInfo: PersonalInfo,
    disputeItems: DisputeItem[],
    content: string,
    strategy: DisputeStrategy,
    letterType: string,
    creditBureau: string
  ): Promise<string> {
    if (!this.sql) {
      console.log("📝 Database not available, using generated ID")
      return `letter_${Date.now()}`
    }

    try {
      const result = await this.sql`
        INSERT INTO letters (
          user_id, dispute_id, letter_type, recipient, recipient_address, 
          letter_content, generated_at
        ) VALUES (
          ${personalInfo.email}, 
          ${`dispute_${Date.now()}`}, 
          ${letterType}, 
          ${creditBureau}, 
          ${this.getBureauAddress(creditBureau)}, 
          ${content}, 
          ${new Date().toISOString()}
        ) RETURNING id
      `
      
      console.log("✅ Letter saved to database with ID:", result[0]?.id)
      return result[0]?.id || `letter_${Date.now()}`
    } catch (error) {
      console.warn("⚠️ Failed to save letter to database (continuing without database save):", error.message)
      // Don't throw error, just return a generated ID
      return `letter_${Date.now()}`
    }
  }

  private generateContentHash(content: string): string {
    // Create a simple hash of the content to check for uniqueness
    const normalized = content.toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim()
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < normalized.length; i++) {
      const char = normalized.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Public method to get system status and statistics
  public getSystemStatus() {
    return {
      openaiAvailable: !!this.openai,
      databaseAvailable: !!this.sql,
      totalLettersGenerated: this.generatedLetters.size,
      writingStylesAvailable: this.writingStyles.length,
      personalizationFactors: this.personalizationFactors.length,
             baseTemplateLength: this.letterTemplates.get("dispute")?.length || 0,
      systemHealth: this.openai && this.sql ? "Full" : this.openai ? "AI Only" : this.sql ? "Database Only" : "Template Only"
    }
  }

  // Method to reset uniqueness tracking (useful for testing)
  public resetUniquenessTracking() {
    this.generatedLetters.clear()
    console.log("Uniqueness tracking reset")
  }
}

export const aiDisputeLetterGenerator = new AIDisputeLetterGenerator()
