// Type definitions for credit analysis
interface CreditScore {
  id: string
  score: number
  bureau: string
  scoreModel: string
  dateGenerated: string
  confidence: number
}

interface CreditAccount {
  id: string
  creditor: string
  accountType: string | null
  accountNumber: string | null
  balance: number | null
  creditLimit: number | null
  paymentStatus: string | null
  dateOpened: string | null
  lastActivity: string | null
  bureau: string
  confidence: number
  monthsReviewed?: number
}

interface NegativeItem {
  id: string
  type: string
  creditor: string
  description: string | null
  amount: number | null
  status: string | null
  dateReported: string | null
  bureau: string
  confidence: number
  disputeRecommendation?: string
}

interface CreditSummary {
  totalAccounts: number
  openAccounts: number
  totalDebt: number
  totalCreditLimit: number
  utilizationRate: number
}

interface CreditAnalysis {
  scores: CreditScore[]
  accounts: CreditAccount[]
  negativeItems: NegativeItem[]
  summary: CreditSummary
  confidence: number
  parsingMethod: string
  validationResults: string[]
}

export class UltimateCreditParserWorking {
  private text: string
  private lines: string[]
  private confidence: number = 0.0
  private parsingMethod: string = 'ultimate_ai_enhanced'

  constructor(text: string) {
    // Safety check - ensure text is defined and is a string
    if (!text || typeof text !== 'string') {
      text = ''
    }
    
    this.text = text
    this.lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  }

  async parse(): Promise<CreditAnalysis> {
    console.log('🚀 Starting Ultimate Credit Parser...')
    console.log(`📄 Text length: ${this.text ? this.text.length : 0} characters`)
    console.log(`📝 Number of lines: ${this.lines ? this.lines.length : 0}`)

    // Safety check - ensure text is defined and has content
    if (!this.text || this.text.length === 0) {
      console.log('⚠️ No text to parse, returning empty analysis')
      return {
        scores: [],
        accounts: [],
        negativeItems: [],
        summary: {
          totalAccounts: 0,
          openAccounts: 0,
          totalDebt: 0,
          totalCreditLimit: 0,
          utilizationRate: 0
        },
        confidence: 0.0,
        parsingMethod: this.parsingMethod,
        validationResults: ['No text provided for parsing']
      }
    }

    // Phase 1: Advanced Credit Score Detection
    const scores = await this.detectCreditScores()
    console.log(`📊 Found ${scores.length} credit scores`)

    // Phase 2: Intelligent Account Extraction
    const accounts = await this.extractAccounts()
    console.log(`🏦 Found ${accounts.length} credit accounts`)

    // Phase 3: Comprehensive Negative Item Detection
    const negativeItems = await this.detectNegativeItems()
    console.log(`⚠️ Found ${negativeItems.length} negative items`)

    // Phase 4: Confidence Calculation
    this.calculateConfidence(scores, accounts, negativeItems)

    // Phase 5: Generate Summary
    const summary = this.generateSummary(accounts, scores, negativeItems)

    const result: CreditAnalysis = {
      scores,
      accounts,
      negativeItems,
      summary,
      confidence: this.confidence,
      parsingMethod: this.parsingMethod,
      validationResults: []
    }

    console.log(`🎯 Final parsing result:`, result)
    return result
  }

  private async detectCreditScores(): Promise<CreditScore[]> {
    const scores: CreditScore[] = []
    
    // Safety check - ensure text is defined and is a string
    if (!this.text || typeof this.text !== 'string') {
      return scores
    }
    
    // Advanced credit score patterns with real-world examples
    const scorePatterns = [
      // Bureau-specific patterns (most reliable)
      { 
        regex: /(?:EXPERIAN|experian|Experian)\s*:?\s*(\d{3})/gi, 
        bureau: 'EXPERIAN', 
        model: 'FICO Score 8',
        confidence: 0.98
      },
      { 
        regex: /(?:EQUIFAX|equifax|Equifax)\s*:?\s*(\d{3})/gi, 
        bureau: 'EQUIFAX', 
        model: 'FICO Score 8',
        confidence: 0.98
      },
      { 
        regex: /(?:TRANSUNION|transunion|TransUnion)\s*:?\s*(\d{3})/gi, 
        bureau: 'TRANSUNION', 
        model: 'FICO Score 8',
        confidence: 0.98
      },
      
      // FICO Score patterns
      { 
        regex: /(?:FICO|fico)\s*(?:score|Score)?\s*:?\s*(\d{3})/gi, 
        model: 'FICO Score',
        confidence: 0.95
      },
      { 
        regex: /(\d{3})\s*(?:FICO|fico)/gi, 
        model: 'FICO Score',
        confidence: 0.95
      },
      
      // Generic credit score patterns
      { 
        regex: /(?:credit\s+)?score\s*:?\s*(\d{3})/gi, 
        model: 'Credit Score',
        confidence: 0.90
      },
      { 
        regex: /(\d{3})\s*(?:points?|pts?)/gi, 
        model: 'Credit Score',
        confidence: 0.85
      },
      { 
        regex: /score\s*(\d{3})/gi, 
        model: 'Credit Score',
        confidence: 0.85
      },
      
      // VantageScore patterns
      { 
        regex: /(?:VantageScore|vantage\s*score)\s*:?\s*(\d{3})/gi, 
        model: 'VantageScore 4.0',
        confidence: 0.92
      },
      
      // Generic 3-digit patterns (fallback)
      { 
        regex: /\b(\d{3})\b/gi, 
        model: 'Credit Score',
        confidence: 0.70
      }
    ]

    for (const pattern of scorePatterns) {
      const matches = this.text.matchAll(pattern.regex)
      for (const match of matches) {
        if (match && match[1]) {
          const score = parseInt(match[1])
          if (score >= 300 && score <= 850) {
            const bureau = pattern.bureau || this.detectBureauFromContext(match[0])
            const existingScore = scores.find(s => s.bureau === bureau && s.score === score)
            
            if (!existingScore) {
              scores.push({
                id: `score_${Date.now()}_${Math.random()}`,
                bureau: bureau || 'UNKNOWN',
                score,
                scoreModel: pattern.model || 'FICO Score 8',
                dateGenerated: this.extractDateFromContext(match[0]) || new Date().toISOString().split('T')[0],
                confidence: pattern.confidence || 0.8
              })
            }
          }
        }
      }
    }

    // Remove duplicates and sort by confidence
    return this.removeDuplicateScores(scores).sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  private async extractAccounts(): Promise<CreditAccount[]> {
    const accounts: CreditAccount[] = []
    
    // Safety check - ensure lines is defined and is an array
    if (!this.lines || !Array.isArray(this.lines)) {
      return accounts
    }
    
    // Find account sections in the text
    const accountSections = this.findAccountSections()
    
    for (const section of accountSections) {
      if (section && typeof section === 'string') {
        const accountsInSection = this.parseAccountSection(section)
        if (accountsInSection && Array.isArray(accountsInSection)) {
          accounts.push(...accountsInSection)
        }
      }
    }

    return accounts
  }

  private findAccountSections(): string[] {
    const sections: string[] = []
    
    // Safety check - ensure lines is defined and is an array
    if (!this.lines || !Array.isArray(this.lines)) {
      return sections
    }
    
    let currentSection: string[] = []
    let inAccountSection = false
    
    for (const line of this.lines) {
      // Safety check - ensure line is defined
      if (!line || typeof line !== 'string') {
        continue
      }
      
      // Detect start of account sections
      if (this.isAccountSectionStart(line)) {
        if (currentSection.length > 0) {
          sections.push(currentSection.join('\n'))
        }
        currentSection = [line]
        inAccountSection = true
      }
      // Detect end of account sections
      else if (inAccountSection && this.isAccountSectionEnd(line)) {
        currentSection.push(line)
        sections.push(currentSection.join('\n'))
        currentSection = []
        inAccountSection = false
      }
      // Continue building current section
      else if (inAccountSection) {
        currentSection.push(line)
      }
    }
    
    // Add the last section if it exists
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'))
    }
    
    return sections
  }

  private isAccountSectionStart(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const sectionStartPatterns = [
      /(?:revolving|revolving\s+accounts?)/gi,
      /(?:installment|installment\s+accounts?)/gi,
      /(?:credit\s+)?accounts?/gi,
      /(?:account\s+)?summary/gi,
      /(?:tradeline|tradelines)/gi,
      // More flexible patterns
      /^\d+\.\s+[A-Z\s&]+/i, // Numbered lists like "1. Chase Bank"
      /^[A-Z\s&]+(?:credit\s+)?card/i, // Credit card lines
      /^[A-Z\s&]+(?:mortgage|loan)/i, // Mortgage/loan lines
      /^[A-Z\s&]+\s+\*\*\*\*\d{4}/i, // Bank names with account numbers
      // Simple section headers
      /^accounts?$/i, // "ACCOUNTS" or "ACCOUNT"
      /^accounts?:$/i // "ACCOUNTS:" or "ACCOUNT:"
    ]
    
    return sectionStartPatterns.some(pattern => pattern.test(line))
  }

  private isAccountSectionEnd(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const sectionEndPatterns = [
      /(?:negative\s+items?|collections?|public\s+records?)/gi,
      /(?:inquiries?|credit\s+inquiries?)/gi,
      /(?:summary|total|end\s+of\s+report)/gi
    ]
    
    return sectionEndPatterns.some(pattern => pattern.test(line))
  }

  private parseAccountSection(section: string): CreditAccount[] {
    const accounts: CreditAccount[] = []
    
    // Safety check - ensure section is defined and is a string
    if (!section || typeof section !== 'string') {
      return accounts
    }
    
    const lines = section.split('\n')
    
    let currentAccount: Partial<CreditAccount> = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip empty lines or undefined lines
      if (!line || line.trim() === '') {
        continue
      }
      
      // Detect new account start
      if (this.isNewAccountStart(line)) {
        if (Object.keys(currentAccount).length > 0) {
          const finalizedAccount = this.finalizeAccount(currentAccount)
          if (finalizedAccount.creditor) {
            accounts.push(finalizedAccount)
          }
        }
        currentAccount = { id: `account_${Date.now()}_${Math.random()}` }
      }
      
      // Extract account information
      this.extractAccountInfo(line, currentAccount)
    }
    
    // Add the last account
    if (Object.keys(currentAccount).length > 0) {
      const finalizedAccount = this.finalizeAccount(currentAccount)
      if (finalizedAccount.creditor) {
        accounts.push(finalizedAccount)
      }
    }
    
    return accounts
  }

  private isNewAccountStart(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const accountStartPatterns = [
      // Bank names with account numbers
      /^[A-Z\s&]+(?:\*\*\*\*\d{4}|\d{4}|\*\*\*\*|\d{4}\*)/i,
      // Bank names with common suffixes
      /^[A-Z\s&]+(?:BANK|NA|INC|LLC|CORP|CO|COMPANY|UNION|FEDERAL)/i,
      // Account labels
      /^account\s*:?\s*[A-Z\s&]+/i,
      /^creditor\s*:?\s*[A-Z\s&]+/i,
      // Credit card patterns
      /^[A-Z\s&]+\s+(?:credit\s+)?card/i,
      // Numbered account entries
      /^\d+\.\s+[A-Z\s&]+/i,
      // Bank names followed by account types
      /^[A-Z\s&]+\s+(?:mortgage|loan|credit\s+card)/i
    ]
    
    return accountStartPatterns.some(pattern => pattern.test(line))
  }

  private extractAccountInfo(line: string, account: Partial<CreditAccount>): void {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return
    }
    
    // Safety check - ensure account is defined and is an object
    if (!account || typeof account !== 'object') {
      return
    }
    
    // Extract creditor name
    if (!account.creditor && this.isCreditorLine(line)) {
      account.creditor = this.extractCreditorName(line)
    }
    
    // Extract account type
    if (!account.accountType) {
      const type = this.extractAccountType(line)
      if (type) account.accountType = type
    }
    
    // Extract balance
    if (!account.balance) {
      const balance = this.extractBalance(line)
      if (balance !== null) account.balance = balance
    }
    
    // Extract credit limit
    if (!account.creditLimit) {
      const limit = this.extractCreditLimit(line)
      if (limit !== null) account.creditLimit = limit
    }
    
    // Extract payment status
    if (!account.paymentStatus) {
      const status = this.extractPaymentStatus(line)
      if (status) account.paymentStatus = status
    }
    
    // Extract dates
    if (!account.dateOpened) {
      const opened = this.extractDate(line, 'opened|opening|start')
      if (opened) account.dateOpened = opened
    }
    
    if (!account.lastActivity) {
      const activity = this.extractDate(line, 'activity|last|recent')
      if (activity) account.lastActivity = activity
    }
    
    // Extract account number
    if (!account.accountNumber) {
      const accountNum = this.extractAccountNumber(line)
      if (accountNum) account.accountNumber = accountNum
    }
  }

  private isCreditorLine(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    // Skip section headers
    const sectionHeaders = [
      /^accounts?:?$/i,
      /^negative\s+items?:?$/i,
      /^inquiries?:?$/i,
      /^credit\s+scores?:?$/i
    ]
    
    if (sectionHeaders.some(pattern => pattern.test(line.trim()))) {
      return false
    }
    
    const creditorPatterns = [
      /^[A-Z\s&]+(?:BANK|NA|INC|LLC|CORP|CO|COMPANY|UNION|FEDERAL)/i,
      /^[A-Z\s&]+\*\*\*\*\d{4}/i,
      // Numbered creditor entries
      /^\d+\.\s+[A-Z\s&]+/i, // "1. Chase Bank"
      // Bank names followed by account types
      /^[A-Z\s&]+\s+(?:credit\s+)?card/i,
      /^[A-Z\s&]+\s+(?:mortgage|loan)/i
    ]
    
    return creditorPatterns.some(pattern => pattern.test(line))
  }

  private extractCreditorName(line: string): string {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return 'Unknown'
    }
    
    // Remove account numbers and common suffixes
    let creditor = line.replace(/\*\*\*\*\d{4}|\d{4}|\*\*\*\*/g, '').trim()
    
    // Remove numbered prefixes like "1. ", "2. "
    creditor = creditor.replace(/^\d+\.\s*/, '')
    
    // Remove common suffixes
    creditor = creditor.replace(/\s+(?:BANK|NA|INC|LLC|CORP|CO|COMPANY|UNION|FEDERAL)$/i, '')
    
    // Remove account type suffixes
    creditor = creditor.replace(/\s+(?:credit\s+)?card$/i, '')
    creditor = creditor.replace(/\s+(?:mortgage|loan)$/i, '')
    
    return creditor.trim()
  }

  private extractAccountType(line: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const typePatterns = [
      { pattern: /(?:credit\s+)?card/gi, type: 'Credit Card' },
      { pattern: /(?:auto|car)\s+loan/gi, type: 'Auto Loan' },
      { pattern: /mortgage/gi, type: 'Mortgage' },
      { pattern: /student\s+loan/gi, type: 'Student Loan' },
      { pattern: /personal\s+loan/gi, type: 'Personal Loan' },
      { pattern: /installment/gi, type: 'Installment' },
      { pattern: /revolving/gi, type: 'Revolving' }
    ]
    
    for (const typePattern of typePatterns) {
      if (typePattern.pattern.test(line)) {
        return typePattern.type
      }
    }
    
    return null
  }

  private extractBalance(line: string): number | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const balancePatterns = [
      // Explicit balance with label
      /(?:balance|bal)\s*:?\s*\$?([\d,]+\.?\d*)/gi,
      /\$([\d,]+\.?\d*)\s*(?:balance|bal)/gi,
      // Dollar amounts with proper context (avoid dates)
      /\$([\d,]+\.?\d*)/gi // Dollar amounts
    ]
    
    for (const pattern of balancePatterns) {
      const match = pattern.exec(line)
      if (match && match[1]) {
        const balance = parseFloat(match[1].replace(/,/g, ''))
        // Validate: must be reasonable balance (not a year like 2020)
        if (!isNaN(balance) && balance >= 0 && balance < 10000000) {
          // Additional validation: don't extract years as balances
          const balanceStr = match[1]
          if (balanceStr.length === 4 && parseInt(balanceStr) >= 1900 && parseInt(balanceStr) <= 2030) {
            continue // Skip years
          }
          return balance
        }
      }
    }
    
    return null
  }

  private extractCreditLimit(line: string): number | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const limitPatterns = [
      /(?:credit\s+)?limit\s*:?\s*\$?([\d,]+\.?\d*)/gi,
      /\$([\d,]+\.?\d*)\s*(?:credit\s+)?limit/gi,
      /limit\s*\$?([\d,]+\.?\d*)/gi
    ]
    
    for (const pattern of limitPatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        const limit = parseFloat(match[1].replace(/,/g, ''))
        if (!isNaN(limit) && limit >= 0) {
          return limit
        }
      }
    }
    
    return null
  }

  private extractPaymentStatus(line: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const statusPatterns = [
      { pattern: /(?:payment\s+)?status\s*:?\s*(current|paid|paid\s+as\s+agreed)/gi, status: 'Current' },
      { pattern: /(?:payment\s+)?status\s*:?\s*(late|delinquent|past\s+due)/gi, status: 'Late' },
      { pattern: /(?:payment\s+)?status\s*:?\s*(charge\s+off|charged\s+off)/gi, status: 'Charge Off' },
      { pattern: /(?:payment\s+)?status\s*:?\s*(collection|collected)/gi, status: 'Collection' }
    ]
    
    for (const statusPattern of statusPatterns) {
      if (statusPattern.pattern.test(line)) {
        return statusPattern.status
      }
    }
    
    return null
  }

  private extractDate(line: string, context: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
      /(\d{1,2}-\d{1,2}-\d{2,4})/g,
      /(\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g
    ]
    
    for (const pattern of datePatterns) {
      const match = line.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  private extractAccountNumber(line: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const accountPatterns = [
      /\*\*\*\*\d{4}/g, // Masked account numbers
      /(?:account|acct)\s*:?\s*(\d{4,})/gi, // Account with label
      /(?:ending|last)\s*:?\s*(\d{4})/gi // "ending in 1234"
    ]
    
    for (const pattern of accountPatterns) {
      const match = pattern.exec(line)
      if (match) {
        const accountNum = match[1] || match[0]
        // Don't extract years as account numbers
        if (accountNum.length === 4) {
          const year = parseInt(accountNum)
          if (year >= 1900 && year <= 2030) {
            continue // Skip years
          }
        }
        return accountNum
      }
    }
    
    return null
  }

  private async detectNegativeItems(): Promise<NegativeItem[]> {
    const negativeItems: NegativeItem[] = []
    
    // Safety check - ensure lines is defined and is an array
    if (!this.lines || !Array.isArray(this.lines)) {
      return negativeItems
    }
    
    // Find negative item sections
    const negativeSections = this.findNegativeSections()
    
    for (const section of negativeSections) {
      if (section && typeof section === 'string') {
        const itemsInSection = this.parseNegativeSection(section)
        if (itemsInSection && Array.isArray(itemsInSection)) {
          negativeItems.push(...itemsInSection)
        }
      }
    }
    
    return negativeItems
  }

  private findNegativeSections(): string[] {
    const sections: string[] = []
    
    // Safety check - ensure lines is defined and is an array
    if (!this.lines || !Array.isArray(this.lines)) {
      return sections
    }
    
    let currentSection: string[] = []
    let inNegativeSection = false
    
    for (const line of this.lines) {
      // Safety check - ensure line is defined
      if (!line || typeof line !== 'string') {
        continue
      }
      
      // Detect start of negative sections
      if (this.isNegativeSectionStart(line)) {
        if (currentSection.length > 0) {
          sections.push(currentSection.join('\n'))
        }
        currentSection = [line]
        inNegativeSection = true
      }
      // Detect end of negative sections
      else if (inNegativeSection && this.isNegativeSectionEnd(line)) {
        currentSection.push(line)
        sections.push(currentSection.join('\n'))
        currentSection = []
        inNegativeSection = false
      }
      // Continue building current section
      else if (inNegativeSection) {
        currentSection.push(line)
      }
    }
    
    // Add the last section if it exists
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'))
    }
    
    return sections
  }

  private isNegativeSectionStart(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const negativeStartPatterns = [
      /(?:negative\s+items?|collections?|public\s+records?)/gi,
      /(?:derogatory|adverse|problems?)/gi,
      /(?:late\s+payments?|delinquencies?)/gi,
      // Simple section headers
      /^negative\s+items?$/i, // "NEGATIVE ITEMS" or "NEGATIVE ITEM"
      /^negative\s+items?:$/i // "NEGATIVE ITEMS:" or "NEGATIVE ITEM:"
    ]
    
    return negativeStartPatterns.some(pattern => pattern.test(line))
  }

  private isNegativeSectionEnd(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const negativeEndPatterns = [
      /(?:inquiries?|credit\s+inquiries?)/gi,
      /(?:summary|total|end\s+of\s+report)/gi,
      /(?:positive|good|excellent)/gi
    ]
    
    return negativeEndPatterns.some(pattern => pattern.test(line))
  }

  private parseNegativeSection(section: string): NegativeItem[] {
    const items: NegativeItem[] = []
    
    // Safety check - ensure section is defined and is a string
    if (!section || typeof section !== 'string') {
      return items
    }
    
    const lines = section.split('\n')
    
    let currentItem: Partial<NegativeItem> = {}
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // Skip empty lines or undefined lines
      if (!line || line.trim() === '') {
        continue
      }
      
      // Detect new negative item start
      if (this.isNewNegativeItemStart(line)) {
        if (Object.keys(currentItem).length > 0) {
          const finalizedItem = this.finalizeNegativeItem(currentItem)
          if (finalizedItem.type) {
            items.push(finalizedItem)
          }
        }
        currentItem = { id: `negative_${Date.now()}_${Math.random()}` }
      }
      
      // Extract negative item information
      this.extractNegativeItemInfo(line, currentItem)
    }
    
    // Add the last item
    if (Object.keys(currentItem).length > 0) {
      const finalizedItem = this.finalizeNegativeItem(currentItem)
      if (finalizedItem.type) {
        items.push(finalizedItem)
      }
    }
    
    return items
  }

  private isNewNegativeItemStart(line: string): boolean {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return false
    }
    
    const itemStartPatterns = [
      /^[A-Z\s&]+(?:BANK|NA|INC|LLC|CORP|CO|COMPANY)/i,
      /^collection\s+account/i,
      /^late\s+payment/i,
      /^charge\s+off/i,
      /^bankruptcy/i,
      /^tax\s+lien/i,
      /^judgment/i
    ]
    
    return itemStartPatterns.some(pattern => pattern.test(line))
  }

  private extractNegativeItemInfo(line: string, item: Partial<NegativeItem>): void {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return
    }
    
    // Safety check - ensure item is defined and is an object
    if (!item || typeof item !== 'object') {
      return
    }
    
    // Extract type
    if (!item.type) {
      const type = this.extractNegativeItemType(line)
      if (type) item.type = type
    }
    
    // Extract creditor
    if (!item.creditor && this.isCreditorLine(line)) {
      item.creditor = this.extractCreditorName(line)
    }
    
    // Extract amount
    if (!item.amount) {
      const amount = this.extractBalance(line)
      if (amount !== null) item.amount = amount
    }
    
    // Extract date
    if (!item.dateReported) {
      const date = this.extractDate(line, 'reported|filed|date')
      if (date) item.dateReported = date
    }
    
    // Extract status
    if (!item.status) {
      const status = this.extractPaymentStatus(line)
      if (status) item.status = status
    }
    
    // Extract description
    if (!item.description) {
      const desc = this.extractDescription(line)
      if (desc) item.description = desc
    }
  }

  private extractNegativeItemType(line: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    const typePatterns = [
      { pattern: /collection/gi, type: 'Collection' },
      { pattern: /late\s+payment/gi, type: 'Late Payment' },
      { pattern: /charge\s+off/gi, type: 'Charge Off' },
      { pattern: /bankruptcy/gi, type: 'Bankruptcy' },
      { pattern: /tax\s+lien/gi, type: 'Tax Lien' },
      { pattern: /judgment/gi, type: 'Judgment' }
    ]
    
    for (const typePattern of typePatterns) {
      if (typePattern.pattern.test(line)) {
        return typePattern.type
      }
    }
    
    return null
  }

  private extractDescription(line: string): string | null {
    // Safety check - ensure line is defined and is a string
    if (!line || typeof line !== 'string') {
      return null
    }
    
    // Extract meaningful description from the line
    const desc = line.replace(/[A-Z\s&]+(?:BANK|NA|INC|LLC|CORP|CO|COMPANY|UNION|FEDERAL)/gi, '')
                     .replace(/\$[\d,]+\.?\d*/g, '')
                     .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '')
                     .trim()
    
    return desc.length > 0 ? desc : null
  }

  private calculateConfidence(scores: CreditScore[], accounts: CreditAccount[], negativeItems: NegativeItem[]): void {
    // Safety check - ensure all parameters are defined and are arrays
    if (!scores || !Array.isArray(scores)) scores = []
    if (!accounts || !Array.isArray(accounts)) accounts = []
    if (!negativeItems || !Array.isArray(negativeItems)) negativeItems = []
    
    let totalConfidence = 0
    let totalItems = 0
    
    // Score confidence (highest weight)
    scores.forEach(score => {
      if (score && typeof score.confidence === 'number') {
        totalConfidence += score.confidence * 1.2
        totalItems += 1.2
      }
    })
    
    // Account confidence (medium weight)
    accounts.forEach(account => {
      if (account && typeof account.confidence === 'number') {
        totalConfidence += account.confidence * 1.0
        totalItems += 1.0
      }
    })
    
    // Negative item confidence (medium weight)
    negativeItems.forEach(item => {
      if (item && typeof item.confidence === 'number') {
        totalConfidence += item.confidence * 1.0
        totalItems += 1.0
      }
    })
    
    this.confidence = totalItems > 0 ? Math.min(totalConfidence / totalItems, 1.0) : 0.5
  }

  private generateSummary(accounts: CreditAccount[], scores: CreditScore[], negativeItems: NegativeItem[]): CreditSummary {
    // Safety check - ensure all parameters are defined and are arrays
    if (!accounts || !Array.isArray(accounts)) accounts = []
    if (!scores || !Array.isArray(scores)) scores = []
    if (!negativeItems || !Array.isArray(negativeItems)) negativeItems = []
    
    const totalAccounts = accounts.length
    const openAccounts = accounts.filter(acc => acc && acc.paymentStatus === 'Current').length
    const totalDebt = accounts.reduce((sum, acc) => {
      if (acc && typeof acc.balance === 'number') {
        return sum + acc.balance
      }
      return sum
    }, 0)
    const totalCreditLimit = accounts.reduce((sum, acc) => {
      if (acc && typeof acc.creditLimit === 'number') {
        return sum + acc.creditLimit
      }
      return sum
    }, 0)
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0
    
    return {
      totalAccounts,
      openAccounts,
      totalDebt,
      totalCreditLimit,
      utilizationRate
    }
  }

  private finalizeAccount(account: Partial<CreditAccount>): CreditAccount {
    // Safety check - ensure account is defined and is an object
    if (!account || typeof account !== 'object') {
      account = {}
    }
    
    return {
      id: account.id || `account_${Date.now()}_${Math.random()}`,
      creditor: account.creditor || 'Unknown',
      accountNumber: account.accountNumber || null,
      accountType: account.accountType || null,
      balance: account.balance || null,
      creditLimit: account.creditLimit || null,
      paymentStatus: account.paymentStatus || null,
      monthsReviewed: account.monthsReviewed || 24,
      dateOpened: account.dateOpened || null,
      lastActivity: account.lastActivity || null,
      bureau: account.bureau || 'unknown',
      confidence: account.confidence || 0.7
    }
  }

  private finalizeNegativeItem(item: Partial<NegativeItem>): NegativeItem {
    // Safety check - ensure item is defined and is an object
    if (!item || typeof item !== 'object') {
      item = {}
    }
    
    return {
      id: item.id || `negative_${Date.now()}_${Math.random()}`,
      type: item.type || 'Unknown',
      creditor: item.creditor || 'Unknown',
      description: item.description || null,
      amount: item.amount || null,
      dateReported: item.dateReported || null,
      status: item.status || null,
      bureau: item.bureau || 'unknown',
      confidence: item.confidence || 0.8,
      disputeRecommendation: item.disputeRecommendation || 'Consider disputing this item'
    }
  }

  private detectBureauFromContext(text: string): string {
    // Safety check - ensure text is defined and is a string
    if (!text || typeof text !== 'string') {
      return 'UNKNOWN'
    }
    
    const bureauPatterns = [
      { pattern: /experian/gi, bureau: 'EXPERIAN' },
      { pattern: /equifax/gi, bureau: 'EQUIFAX' },
      { pattern: /transunion/gi, bureau: 'TRANSUNION' }
    ]
    
    for (const bureauPattern of bureauPatterns) {
      if (bureauPattern.pattern.test(text)) {
        return bureauPattern.bureau
      }
    }
    
    return 'UNKNOWN'
  }

  private extractDateFromContext(text: string): string | null {
    // Safety check - ensure text is defined and is a string
    if (!text || typeof text !== 'string') {
      return null
    }
    
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/g,
      /(\d{1,2}-\d{1,2}-\d{2,4})/g,
      /(\d{1,2}\/\d{4})/g
    ]
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    
    return null
  }

  private removeDuplicateScores(scores: CreditScore[]): CreditScore[] {
    // Safety check - ensure scores is defined and is an array
    if (!scores || !Array.isArray(scores)) {
      return []
    }
    
    const uniqueScores: CreditScore[] = []
    const seen = new Set<string>()
    
    for (const score of scores) {
      if (score && score.bureau && typeof score.score === 'number') {
        const key = `${score.bureau}_${score.score}`
        if (!seen.has(key)) {
          seen.add(key)
          uniqueScores.push(score)
        }
      }
    }
    
    return uniqueScores
  }
}
