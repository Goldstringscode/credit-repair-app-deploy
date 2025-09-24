import pdfParse from "pdf-parse"

interface ExtractionResult {
  success: boolean
  data: any
  confidence: number
  processing_notes: string[]
  raw_sections: any
  validation_results: any
}

interface AccountData {
  creditor_name: string
  account_number_last_4: string
  account_type: string
  balance: number | null
  credit_limit: number | null
  payment_status: string
  account_status: string
  opened_date: string | null
  last_activity: string | null
  monthly_payment: number | null
  payment_history: string | null
  high_balance: number | null
  terms: string | null
  responsibility: string | null
  confidence: number
  extraction_method: string
  raw_text: string
}

export class AdvancedCreditParser {
  private processingNotes: string[] = []
  private rawText = ""
  private sections: any = {}
  private bureau = "Unknown"

  async analyzeDocument(file: File): Promise<ExtractionResult> {
    this.processingNotes = []

    try {
      this.processingNotes.push("🚀 Starting advanced multi-pass analysis...")

      // Stage 1: Enhanced Text Extraction
      const textResult = await this.extractTextWithMultipleMethods(file)
      this.rawText = textResult.text
      this.processingNotes.push(`📄 Extracted ${this.rawText.length} characters using ${textResult.method}`)

      // Stage 2: Document Classification and Bureau Detection
      this.bureau = this.detectBureau(this.rawText)
      this.processingNotes.push(`🏷️ Detected bureau: ${this.bureau}`)

      // Stage 3: Section Identification and Parsing
      this.sections = this.identifySections(this.rawText)
      this.processingNotes.push(`📑 Identified ${Object.keys(this.sections).length} document sections`)

      // Stage 4: Multi-Pass Account Extraction
      const accounts = await this.extractAccountsMultiPass()
      this.processingNotes.push(`💳 Found ${accounts.length} accounts using multi-pass extraction`)

      // Stage 5: Credit Score Extraction
      const scores = this.extractCreditScoresAdvanced()
      this.processingNotes.push(`🎯 Found ${scores.length} credit scores`)

      // Stage 6: Personal Information Extraction
      const personalInfo = this.extractPersonalInfoAdvanced()
      this.processingNotes.push(`👤 Extracted personal information`)

      // Stage 7: Negative Items and Inquiries
      const negativeItems = this.extractNegativeItems()
      const inquiries = this.extractInquiries()
      this.processingNotes.push(`⚠️ Found ${negativeItems.length} negative items, ${inquiries.length} inquiries`)

      // Stage 8: Data Validation and Quality Assessment
      const validationResults = this.validateExtractedData({
        accounts,
        scores,
        personalInfo,
        negativeItems,
        inquiries,
      })
      this.processingNotes.push(
        `✅ Data validation completed with ${(validationResults.overall_quality * 100).toFixed(1)}% quality score`,
      )

      const analysis = {
        personal_info: personalInfo,
        credit_scores: scores,
        accounts: accounts,
        negative_items: negativeItems,
        inquiries: inquiries,
        report_metadata: {
          bureau: this.bureau,
          report_date: new Date().toISOString().split("T")[0],
          pages_processed: textResult.pages || 1,
          data_quality_score: validationResults.overall_quality,
          extraction_confidence: validationResults.confidence,
          total_sections: Object.keys(this.sections).length,
          processing_method: "multi-pass-advanced",
          raw_text: this.rawText.substring(0, 1000), // Add raw text for reference
        },
      }

      return {
        success: true,
        data: analysis,
        confidence: validationResults.confidence,
        processing_notes: this.processingNotes,
        raw_sections: this.sections,
        validation_results: validationResults,
      }
    } catch (error) {
      this.processingNotes.push(`❌ Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`)
      return {
        success: false,
        data: null,
        confidence: 0,
        processing_notes: this.processingNotes,
        raw_sections: {},
        validation_results: {},
      }
    }
  }

  private async extractTextWithMultipleMethods(file: File): Promise<{ text: string; method: string; pages?: number }> {
    const buffer = await file.arrayBuffer()

    if (file.type === "application/pdf") {
      // Method 1: Standard PDF parsing
      try {
        const pdfData = await pdfParse(buffer, {
          normalizeWhitespace: false,
          disableCombineTextItems: false,
        })

        if (pdfData.text.length > 1000) {
          return {
            text: pdfData.text,
            method: "pdf-parse-standard",
            pages: pdfData.numpages,
          }
        }
      } catch (error) {
        console.log("Standard PDF parsing failed:", error)
      }

      // Method 2: Alternative PDF parsing
      try {
        const pdfData = await pdfParse(buffer, {
          normalizeWhitespace: true,
          disableCombineTextItems: true,
        })

        return {
          text: pdfData.text,
          method: "pdf-parse-alternative",
          pages: pdfData.numpages,
        }
      } catch (error) {
        console.log("Alternative PDF parsing failed:", error)
      }

      throw new Error("All PDF extraction methods failed")
    } else {
      // Text file
      const text = new TextDecoder().decode(buffer)
      return {
        text,
        method: "text-direct",
      }
    }
  }

  private detectBureau(text: string): string {
    const textLower = text.toLowerCase()

    // Bureau-specific indicators
    const bureauIndicators = {
      Experian: [
        "experian",
        "experian.com",
        "experian information solutions",
        "experian consumer services",
        "national consumer assistance center",
      ],
      Equifax: [
        "equifax",
        "equifax.com",
        "equifax information services",
        "equifax consumer services",
        "p.o. box 740241",
      ],
      TransUnion: ["transunion", "transunion.com", "trans union", "transunion consumer relations", "p.o. box 2000"],
    }

    for (const [bureau, indicators] of Object.entries(bureauIndicators)) {
      for (const indicator of indicators) {
        if (textLower.includes(indicator)) {
          return bureau
        }
      }
    }

    return "Unknown"
  }

  private identifySections(text: string): any {
    const sections: any = {}
    const lines = text.split(/\r?\n/)

    // Common section headers
    const sectionHeaders = {
      personal_info: [
        "personal information",
        "consumer information",
        "identification information",
        "personal data",
        "consumer data",
        "report summary",
      ],
      credit_scores: ["credit score", "fico score", "vantagescore", "score information", "risk score", "credit rating"],
      accounts: [
        "account information",
        "credit accounts",
        "revolving accounts",
        "installment accounts",
        "mortgage accounts",
        "open accounts",
        "closed accounts",
        "account history",
        "tradelines",
      ],
      inquiries: [
        "inquiries",
        "credit inquiries",
        "requests for credit history",
        "companies that requested",
        "promotional inquiries",
      ],
      negative_items: [
        "potentially negative",
        "negative information",
        "public records",
        "collections",
        "charge offs",
        "bankruptcies",
        "foreclosures",
      ],
      payment_history: ["payment history", "payment information", "account payment history"],
    }

    let currentSection = "unknown"
    let sectionContent: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim().toLowerCase()

      // Check if this line is a section header
      let foundSection = false
      for (const [sectionName, headers] of Object.entries(sectionHeaders)) {
        for (const header of headers) {
          if (line.includes(header)) {
            // Save previous section
            if (currentSection !== "unknown" && sectionContent.length > 0) {
              sections[currentSection] = sectionContent.join("\n")
            }

            currentSection = sectionName
            sectionContent = []
            foundSection = true
            break
          }
        }
        if (foundSection) break
      }

      if (!foundSection) {
        sectionContent.push(lines[i])
      }
    }

    // Save final section
    if (currentSection !== "unknown" && sectionContent.length > 0) {
      sections[currentSection] = sectionContent.join("\n")
    }

    // If no sections found, create a general section
    if (Object.keys(sections).length === 0) {
      sections.full_document = text
    }

    return sections
  }

  private async extractAccountsMultiPass(): Promise<AccountData[]> {
    const accounts: AccountData[] = []
    const accountsFound = new Set<string>()

    // Pass 1: Section-based extraction
    if (this.sections.accounts) {
      const sectionAccounts = this.extractAccountsFromSection(this.sections.accounts, "section-based")
      for (const account of sectionAccounts) {
        const key = `${account.creditor_name}-${account.account_number_last_4}`
        if (!accountsFound.has(key)) {
          accountsFound.add(key)
          accounts.push(account)
        }
      }
    }

    // Pass 2: Pattern-based extraction from full document
    const patternAccounts = this.extractAccountsWithPatterns(this.rawText, "pattern-based")
    for (const account of patternAccounts) {
      const key = `${account.creditor_name}-${account.account_number_last_4}`
      if (!accountsFound.has(key)) {
        accountsFound.add(key)
        accounts.push(account)
      }
    }

    // Pass 3: Line-by-line contextual extraction
    const contextualAccounts = this.extractAccountsContextual(this.rawText, "contextual")
    for (const account of contextualAccounts) {
      const key = `${account.creditor_name}-${account.account_number_last_4}`
      if (!accountsFound.has(key)) {
        accountsFound.add(key)
        accounts.push(account)
      }
    }

    // Pass 4: Bureau-specific extraction
    const bureauAccounts = this.extractAccountsBureauSpecific(this.rawText, "bureau-specific")
    for (const account of bureauAccounts) {
      const key = `${account.creditor_name}-${account.account_number_last_4}`
      if (!accountsFound.has(key)) {
        accountsFound.add(key)
        accounts.push(account)
      }
    }

    // Pass 5: Fuzzy matching for missed accounts
    const fuzzyAccounts = this.extractAccountsFuzzy(this.rawText, "fuzzy-matching")
    for (const account of fuzzyAccounts) {
      const key = `${account.creditor_name}-${account.account_number_last_4}`
      if (!accountsFound.has(key)) {
        accountsFound.add(key)
        accounts.push(account)
      }
    }

    return accounts
  }

  private extractAccountsFromSection(sectionText: string, method: string): AccountData[] {
    const accounts: AccountData[] = []
    const lines = sectionText.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      // Look for creditor names (usually in caps or title case)
      if (this.looksLikeCreditorName(line)) {
        const account = this.extractAccountDetails(line, lines, i, method)
        if (account) {
          accounts.push(account)
        }
      }
    }

    return accounts
  }

  private extractAccountsWithPatterns(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []

    // Enhanced patterns for different account formats
    const patterns = [
      // Pattern 1: Creditor Name followed by account details
      {
        regex:
          /([A-Z][A-Z\s&\-.,']{4,60}(?:BANK|CREDIT|CARD|LOAN|VISA|MASTERCARD|DISCOVER|AMEX|CAPITAL|CHASE|WELLS|CITI|SYNCHRONY|BARCLAYS))[^\d]*?(\d{4})[^\d]*?(?:Balance|Bal|Amount)[:\s]*\$?([\d,]+)/gi,
        confidence: 0.9,
      },
      // Pattern 2: Account number first format
      {
        regex: /(\d{4})[^\d]*?([A-Z][A-Z\s&\-.,']{4,60})[^\d]*?(?:Balance|Bal)[:\s]*\$?([\d,]+)/gi,
        confidence: 0.8,
      },
      // Pattern 3: Tabular format
      {
        regex: /([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{4})\s+\$?([\d,]+)/gi,
        confidence: 0.85,
      },
      // Pattern 4: Multi-line format
      {
        regex: /([A-Z][A-Z\s&\-.,']{4,60})\n[^\d]*(\d{4})[^\d]*\n[^\d]*\$?([\d,]+)/gi,
        confidence: 0.7,
      },
    ]

    for (const pattern of patterns) {
      const matches = Array.from(text.matchAll(pattern.regex))
      for (const match of matches) {
        let creditorName: string, accountLast4: string, balance: number

        if (pattern.regex.source.includes("(d{4})[^\\d]*?([A-Z]")) {
          // Account number first
          accountLast4 = match[1]
          creditorName = match[2].trim()
          balance = Number.parseInt(match[3].replace(/,/g, ""))
        } else {
          // Creditor name first
          creditorName = match[1].trim()
          accountLast4 = match[2]
          balance = Number.parseInt(match[3].replace(/,/g, ""))
        }

        if (!isNaN(balance) && balance >= 0 && this.isValidCreditorName(creditorName)) {
          accounts.push({
            creditor_name: creditorName,
            account_number_last_4: accountLast4,
            account_type: this.inferAccountType(creditorName),
            balance: balance,
            credit_limit: null,
            payment_status: "Current",
            account_status: "Open",
            opened_date: null,
            last_activity: null,
            monthly_payment: null,
            payment_history: null,
            high_balance: null,
            terms: null,
            responsibility: null,
            confidence: pattern.confidence,
            extraction_method: method,
            raw_text: match[0],
          })
        }
      }
    }

    return accounts
  }

  private extractAccountsContextual(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []
    const lines = text.split(/\r?\n/)

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()

      if (this.looksLikeCreditorName(line)) {
        // Look for account details in surrounding lines
        const contextLines = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5))
        const account = this.extractAccountFromContext(line, contextLines, method)
        if (account) {
          accounts.push(account)
        }
      }
    }

    return accounts
  }

  private extractAccountsBureauSpecific(text: string, method: string): AccountData[] {
    switch (this.bureau) {
      case "Experian":
        return this.extractExperianAccounts(text, method)
      case "Equifax":
        return this.extractEquifaxAccounts(text, method)
      case "TransUnion":
        return this.extractTransUnionAccounts(text, method)
      default:
        return []
    }
  }

  private extractExperianAccounts(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []

    // Experian-specific patterns
    const experianPatterns = [
      /Account\s+Name[:\s]*([A-Z][A-Z\s&\-.,']{4,60})\s+Account\s+Number[:\s]*\*+(\d{4})\s+Balance[:\s]*\$?([\d,]+)/gi,
      /([A-Z][A-Z\s&\-.,']{4,60})\s+\*+(\d{4})\s+(?:Open|Closed)\s+\$?([\d,]+)/gi,
    ]

    for (const pattern of experianPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const creditorName = match[1].trim()
        const accountLast4 = match[2]
        const balance = Number.parseInt(match[3].replace(/,/g, ""))

        if (!isNaN(balance) && this.isValidCreditorName(creditorName)) {
          accounts.push({
            creditor_name: creditorName,
            account_number_last_4: accountLast4,
            account_type: this.inferAccountType(creditorName),
            balance: balance,
            credit_limit: null,
            payment_status: "Current",
            account_status: "Open",
            opened_date: null,
            last_activity: null,
            monthly_payment: null,
            payment_history: null,
            high_balance: null,
            terms: null,
            responsibility: null,
            confidence: 0.9,
            extraction_method: method,
            raw_text: match[0],
          })
        }
      }
    }

    return accounts
  }

  private extractEquifaxAccounts(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []

    // Equifax-specific patterns
    const equifaxPatterns = [
      /([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{4})\s+(?:Open|Closed)\s+\$?([\d,]+)/gi,
      /Account\s+([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{4})\s+Balance[:\s]*\$?([\d,]+)/gi,
    ]

    for (const pattern of equifaxPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const creditorName = match[1].trim()
        const accountLast4 = match[2]
        const balance = Number.parseInt(match[3].replace(/,/g, ""))

        if (!isNaN(balance) && this.isValidCreditorName(creditorName)) {
          accounts.push({
            creditor_name: creditorName,
            account_number_last_4: accountLast4,
            account_type: this.inferAccountType(creditorName),
            balance: balance,
            credit_limit: null,
            payment_status: "Current",
            account_status: "Open",
            opened_date: null,
            last_activity: null,
            monthly_payment: null,
            payment_history: null,
            high_balance: null,
            terms: null,
            responsibility: null,
            confidence: 0.9,
            extraction_method: method,
            raw_text: match[0],
          })
        }
      }
    }

    return accounts
  }

  private extractTransUnionAccounts(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []

    // TransUnion-specific patterns
    const transUnionPatterns = [
      /([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{4})\s+(?:Open|Closed)\s+\$?([\d,]+)/gi,
      /Account\s+([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{4})\s+Balance[:\s]*\$?([\d,]+)/gi,
    ]

    for (const pattern of transUnionPatterns) {
      const matches = Array.from(text.matchAll(pattern))
      for (const match of matches) {
        const creditorName = match[1].trim()
        const accountLast4 = match[2]
        const balance = Number.parseInt(match[3].replace(/,/g, ""))

        if (!isNaN(balance) && this.isValidCreditorName(creditorName)) {
          accounts.push({
            creditor_name: creditorName,
            account_number_last_4: accountLast4,
            account_type: this.inferAccountType(creditorName),
            balance: balance,
            credit_limit: null,
            payment_status: "Current",
            account_status: "Open",
            opened_date: null,
            last_activity: null,
            monthly_payment: null,
            payment_history: null,
            high_balance: null,
            terms: null,
            responsibility: null,
            confidence: 0.9,
            extraction_method: method,
            raw_text: match[0],
          })
        }
      }
    }

    return accounts
  }

  private extractAccountsFuzzy(text: string, method: string): AccountData[] {
    const accounts: AccountData[] = []

    // Find potential creditor names that might have been missed
    const potentialCreditors = this.findPotentialCreditors(text)

    for (const creditor of potentialCreditors) {
      // Look for account numbers near this creditor
      const accountNumbers = this.findAccountNumbersNear(text, creditor)

      for (const accountNum of accountNumbers) {
        // Look for balance information
        const balance = this.findBalanceNear(text, creditor, accountNum)

        if (balance !== null) {
          accounts.push({
            creditor_name: creditor,
            account_number_last_4: accountNum,
            account_type: this.inferAccountType(creditor),
            balance: balance,
            credit_limit: null,
            payment_status: "Current",
            account_status: "Open",
            opened_date: null,
            last_activity: null,
            monthly_payment: null,
            payment_history: null,
            high_balance: null,
            terms: null,
            responsibility: null,
            confidence: 0.6,
            extraction_method: method,
            raw_text: "",
          })
        }
      }
    }

    return accounts
  }

  private extractAccountDetails(
    creditorLine: string,
    allLines: string[],
    lineIndex: number,
    method: string,
  ): AccountData | null {
    const contextLines = allLines.slice(Math.max(0, lineIndex), Math.min(allLines.length, lineIndex + 5))
    return this.extractAccountFromContext(creditorLine, contextLines, method)
  }

  private extractAccountFromContext(creditorName: string, contextLines: string[], method: string): AccountData | null {
    const contextText = contextLines.join(" ")

    // Look for account number (last 4 digits)
    const accountMatch = contextText.match(/\*+(\d{4})|\b(\d{4})\b/)
    if (!accountMatch) return null

    const accountLast4 = accountMatch[1] || accountMatch[2]

    // Look for balance
    const balanceMatch = contextText.match(/(?:Balance|Bal|Amount)[:\s]*\$?([\d,]+)/)
    const balance = balanceMatch ? Number.parseInt(balanceMatch[1].replace(/,/g, "")) : null

    // Look for credit limit
    const limitMatch = contextText.match(/(?:Limit|Credit\s+Limit)[:\s]*\$?([\d,]+)/)
    const creditLimit = limitMatch ? Number.parseInt(limitMatch[1].replace(/,/g, "")) : null

    // Look for payment status
    const paymentStatus = this.extractPaymentStatus(contextText)

    // Look for account status
    const accountStatus = this.extractAccountStatus(contextText)

    return {
      creditor_name: creditorName.trim(),
      account_number_last_4: accountLast4,
      account_type: this.inferAccountType(creditorName),
      balance: balance,
      credit_limit: creditLimit,
      payment_status: paymentStatus,
      account_status: accountStatus,
      opened_date: null,
      last_activity: null,
      monthly_payment: null,
      payment_history: null,
      high_balance: null,
      terms: null,
      responsibility: null,
      confidence: 0.8,
      extraction_method: method,
      raw_text: contextText.substring(0, 200),
    }
  }

  private extractCreditScoresAdvanced(): any[] {
    const scores = []

    // Ultra-comprehensive score patterns
    const patterns = [
      // VantageScore patterns
      {
        pattern: /VANTAGESCORE\s*3\.0\s*(\d{3})/gi,
        model: "VantageScore",
        version: "3.0",
        confidence: 0.95,
      },
      {
        pattern: /VantageScore\s*(\d\.\d)\s*(\d{3})/gi,
        model: "VantageScore",
        version: null,
        confidence: 0.9,
      },
      // FICO patterns
      {
        pattern: /FICO\s*Score\s*(\d+)\s*(\d{3})/gi,
        model: "FICO",
        version: null,
        confidence: 0.95,
      },
      {
        pattern: /FICO\s*(\d{3})/gi,
        model: "FICO",
        version: null,
        confidence: 0.8,
      },
      // Generic patterns
      {
        pattern: /Credit\s*Score[:\s]*(\d{3})/gi,
        model: "Other",
        version: null,
        confidence: 0.7,
      },
    ]

    for (const { pattern, model, version, confidence } of patterns) {
      const matches = Array.from(this.rawText.matchAll(pattern))
      for (const match of matches) {
        const scoreIndex = match.length - 1
        const score = Number.parseInt(match[scoreIndex])

        if (score >= 300 && score <= 850) {
          // Context validation
          const context = this.getContext(this.rawText, match.index!, 200)
          if (this.isValidScoreContext(context, score)) {
            scores.push({
              score,
              model,
              version: version || (match[1] !== match[scoreIndex] ? match[1] : null),
              bureau: this.bureau,
              confidence,
              date: null,
              raw_match: match[0],
              context: context.substring(0, 100),
            })
          }
        }
      }
    }

    return scores
  }

  private extractPersonalInfoAdvanced(): any {
    const personalInfo: any = {}

    // Enhanced name extraction
    const namePatterns = [
      /(?:Name|Consumer)[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
      /Report\s+for[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
      /Personal\s+Information[:\s]*([A-Z][a-z]+\s+[A-Z][a-z]+)/g,
    ]

    for (const pattern of namePatterns) {
      const match = this.rawText.match(pattern)
      if (match) {
        personalInfo.name = match[1]
        break
      }
    }

    // Enhanced SSN extraction
    const ssnPatterns = [/SSN[:\s]*(?:\*+|xxx-xx-)(\d{4})/i, /Social\s+Security[:\s]*(?:\*+|xxx-xx-)(\d{4})/i]

    for (const pattern of ssnPatterns) {
      const match = this.rawText.match(pattern)
      if (match) {
        personalInfo.ssn_last_4 = match[1]
        break
      }
    }

    // Enhanced DOB extraction
    const dobPatterns = [
      /(?:Date\s+of\s+Birth|DOB)[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
      /Birth\s+Date[:\s]*(\d{1,2}[/-]\d{1,2}[/-]\d{4})/i,
    ]

    for (const pattern of dobPatterns) {
      const match = this.rawText.match(pattern)
      if (match) {
        personalInfo.date_of_birth = match[1]
        break
      }
    }

    return personalInfo
  }

  private extractNegativeItems(): any[] {
    const negativeItems = []

    // Look for negative item indicators
    const negativePatterns = [
      /Collection[:\s]*([A-Z][A-Z\s&\-.,']{4,60})[^\d]*\$?([\d,]+)/gi,
      /Charge\s*Off[:\s]*([A-Z][A-Z\s&\-.,']{4,60})[^\d]*\$?([\d,]+)/gi,
      /Bankruptcy/gi,
      /Foreclosure/gi,
    ]

    for (const pattern of negativePatterns) {
      const matches = Array.from(this.rawText.matchAll(pattern))
      for (const match of matches) {
        if (match[1] && match[2]) {
          const amount = Number.parseInt(match[2].replace(/,/g, ""))
          if (!isNaN(amount)) {
            negativeItems.push({
              type: match[0].includes("Collection") ? "Collection" : "Charge Off",
              creditor_name: match[1].trim(),
              amount: amount,
              status: "Open",
              date_reported: null,
            })
          }
        }
      }
    }

    return negativeItems
  }

  private extractInquiries(): any[] {
    const inquiries = []

    // Look for inquiry patterns
    const inquiryPatterns = [/([A-Z][A-Z\s&\-.,']{4,60})\s+(\d{1,2}[/-]\d{1,2}[/-]\d{4})\s+(?:Hard|Soft)/gi]

    for (const pattern of inquiryPatterns) {
      const matches = Array.from(this.rawText.matchAll(pattern))
      for (const match of matches) {
        inquiries.push({
          creditor_name: match[1].trim(),
          inquiry_date: match[2],
          inquiry_type: match[0].includes("Hard") ? "Hard" : "Soft",
          purpose: null,
        })
      }
    }

    return inquiries
  }

  private validateExtractedData(data: any): any {
    let qualityScore = 0
    let confidence = 0
    const validationResults: any = {}

    // Validate credit scores
    const validScores = data.scores.filter((s: any) => s.score >= 300 && s.score <= 850)
    validationResults.scores_valid = validScores.length
    validationResults.scores_total = data.scores.length
    if (validScores.length > 0) qualityScore += 0.2

    // Validate accounts
    const validAccounts = data.accounts.filter(
      (a: any) =>
        a.creditor_name &&
        a.account_number_last_4 &&
        a.account_number_last_4.length === 4 &&
        /^\d{4}$/.test(a.account_number_last_4),
    )
    validationResults.accounts_valid = validAccounts.length
    validationResults.accounts_total = data.accounts.length
    if (validAccounts.length > 5) qualityScore += 0.3
    else if (validAccounts.length > 0) qualityScore += 0.1

    // Validate personal info
    if (data.personalInfo.name) qualityScore += 0.1
    if (data.personalInfo.ssn_last_4) qualityScore += 0.1

    // Calculate confidence based on extraction methods
    const highConfidenceAccounts = data.accounts.filter((a: any) => a.confidence > 0.8).length
    confidence = Math.min(0.95, 0.5 + (highConfidenceAccounts / data.accounts.length) * 0.4)

    validationResults.overall_quality = Math.min(1.0, qualityScore)
    validationResults.confidence = confidence

    return validationResults
  }

  // Helper methods
  private looksLikeCreditorName(line: string): boolean {
    return (
      line.length > 5 &&
      line.length < 80 &&
      /^[A-Z]/.test(line) &&
      !/^\d/.test(line) &&
      !line.includes("$") &&
      !line.includes("Balance") &&
      !line.includes("Payment") &&
      !line.includes("Date") &&
      this.isValidCreditorName(line)
    )
  }

  private isValidCreditorName(name: string): boolean {
    const commonWords = [
      "BANK",
      "CREDIT",
      "CARD",
      "LOAN",
      "VISA",
      "MASTERCARD",
      "DISCOVER",
      "AMEX",
      "CAPITAL",
      "CHASE",
      "WELLS",
      "CITI",
      "SYNCHRONY",
      "BARCLAYS",
    ]
    const nameUpper = name.toUpperCase()

    // Must contain at least one common financial word or be a reasonable length
    return commonWords.some((word) => nameUpper.includes(word)) || (name.length > 8 && name.length < 50)
  }

  private inferAccountType(creditorName: string): string {
    const name = creditorName.toLowerCase()
    if (name.includes("mortgage") || name.includes("home")) return "Mortgage"
    if (name.includes("auto") || name.includes("car") || name.includes("vehicle")) return "Auto Loan"
    if (name.includes("student") || name.includes("education")) return "Student Loan"
    if (name.includes("loan") || name.includes("installment")) return "Installment Loan"
    return "Credit Card"
  }

  private extractPaymentStatus(text: string): string {
    const statusPatterns = [
      { pattern: /current/i, status: "Current" },
      { pattern: /30\s*days?\s*late/i, status: "30 Days Late" },
      { pattern: /60\s*days?\s*late/i, status: "60 Days Late" },
      { pattern: /90\s*days?\s*late/i, status: "90+ Days Late" },
    ]

    for (const { pattern, status } of statusPatterns) {
      if (pattern.test(text)) {
        return status
      }
    }

    return "Current"
  }

  private extractAccountStatus(text: string): string {
    if (/closed/i.test(text)) return "Closed"
    if (/paid/i.test(text)) return "Paid"
    if (/charge.*off/i.test(text)) return "Charged Off"
    return "Open"
  }

  private getContext(text: string, index: number, length: number): string {
    const start = Math.max(0, index - length / 2)
    const end = Math.min(text.length, index + length / 2)
    return text.substring(start, end)
  }

  private isValidScoreContext(context: string, score: number): boolean {
    const contextLower = context.toLowerCase()

    // Exclude obvious false positives
    const excludes = ["phone", "address", "zip", "account number", "routing", "date", "year"]
    for (const exclude of excludes) {
      if (contextLower.includes(exclude)) return false
    }

    // Include obvious score contexts
    const includes = ["score", "fico", "vantage", "credit", "risk"]
    for (const include of includes) {
      if (contextLower.includes(include)) return true
    }

    return score >= 500 && score <= 800
  }

  private findPotentialCreditors(text: string): string[] {
    const creditors: string[] = []
    const lines = text.split(/\r?\n/)

    for (const line of lines) {
      const trimmed = line.trim()
      if (this.looksLikeCreditorName(trimmed) && !creditors.includes(trimmed)) {
        creditors.push(trimmed)
      }
    }

    return creditors
  }

  private findAccountNumbersNear(text: string, creditor: string): string[] {
    const accountNumbers = []
    const creditorIndex = text.indexOf(creditor)

    if (creditorIndex !== -1) {
      const surrounding = text.substring(
        Math.max(0, creditorIndex - 200),
        Math.min(text.length, creditorIndex + creditor.length + 200),
      )

      const matches = surrounding.match(/\b\d{4}\b/g)
      if (matches) {
        accountNumbers.push(...matches)
      }
    }

    return [...new Set(accountNumbers)]
  }

  private findBalanceNear(text: string, creditor: string, accountNum: string): number | null {
    const creditorIndex = text.indexOf(creditor)
    const accountIndex = text.indexOf(accountNum)

    if (creditorIndex !== -1 && accountIndex !== -1) {
      const start = Math.min(creditorIndex, accountIndex)
      const end = Math.max(creditorIndex + creditor.length, accountIndex + accountNum.length)

      const surrounding = text.substring(Math.max(0, start - 100), Math.min(text.length, end + 100))

      const balanceMatch = surrounding.match(/\$?([\d,]+)/)
      if (balanceMatch) {
        const balance = Number.parseInt(balanceMatch[1].replace(/,/g, ""))
        if (!isNaN(balance) && balance > 0 && balance < 1000000) {
          return balance
        }
      }
    }

    return null
  }
}
