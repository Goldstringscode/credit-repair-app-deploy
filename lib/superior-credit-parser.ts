import { CreditScore, CreditAccount, NegativeItem, CreditSummary } from "./credit-analysis-engine"

export interface ParsedCreditData {
  scores: CreditScore[]
  accounts: CreditAccount[]
  negativeItems: NegativeItem[]
  summary: CreditSummary
  confidence: number
  parsingMethod: string
  validationResults: ValidationResult[]
}

export interface ValidationResult {
  type: 'score' | 'account' | 'negative_item'
  confidence: number
  reason: string
  data: any
}

export class SuperiorCreditParser {
  private text: string
  private lines: string[]

  constructor(text: string) {
    this.text = text
    this.lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  }

  async parse(): Promise<ParsedCreditData> {
    console.log("🚀 Starting superior credit parsing...")
    console.log(`📄 Text length: ${this.text.length} characters`)
    console.log(`📝 Number of lines: ${this.lines.length}`)
    
    // Use the most reliable parsing strategy
    const result = await this.parseWithEnhancedPatterns()
    
    console.log(`🎯 Final parsing result:`, {
      scores: result.scores.length,
      accounts: result.accounts.length,
      negativeItems: result.negativeItems.length,
      confidence: result.confidence,
      method: result.parsingMethod
    })
    
    return result
  }

  private async parseWithEnhancedPatterns(): Promise<ParsedCreditData> {
    console.log("🔍 Using enhanced pattern matching...")
    
    const result: ParsedCreditData = {
      scores: [],
      accounts: [],
      negativeItems: [],
      summary: {
        totalAccounts: 0,
        openAccounts: 0,
        totalDebt: 0,
        totalCreditLimit: 0,
        utilizationRate: 0,
        negativeItemsCount: 0
      },
      confidence: 0,
      parsingMethod: 'enhanced_patterns',
      validationResults: []
    }

    // Extract credit scores with enhanced patterns
    result.scores = this.extractCreditScores()
    console.log(`📊 Found ${result.scores.length} credit scores`)

    // Extract accounts with enhanced patterns
    result.accounts = this.extractCreditAccounts()
    console.log(`🏦 Found ${result.accounts.length} credit accounts`)

    // Extract negative items
    result.negativeItems = this.extractNegativeItems()
    console.log(`⚠️ Found ${result.negativeItems.length} negative items`)

    // Calculate summary
    result.summary = this.calculateSummary(result.accounts, result.negativeItems)
    
    // Calculate confidence
    result.confidence = this.calculateConfidence(result)
    
    // Generate validation results
    result.validationResults = this.generateValidationResults(result)
    
    return result
  }

  private extractCreditScores(): CreditScore[] {
    const scores: CreditScore[] = []
    
    // Look for specific score patterns in the test data - handle both formats
    // Format 1: EXPERIAN: 745
    // Format 2: Experian FICO Score 8: 720
    const scoreMatches = this.text.match(/(?:EXPERIAN|Experian).*?(\d{3})/gi)
    if (scoreMatches) {
      for (const match of scoreMatches) {
        const score = parseInt(match.match(/(\d{3})/)?.[1] || '0')
        if (score >= 300 && score <= 850) {
          scores.push({
            bureau: 'EXPERIAN',
            score,
            scoreModel: 'FICO Score 8',
            dateGenerated: new Date().toISOString().split('T')[0]
          })
        }
      }
    }
    
    // Look for other bureau scores - handle both formats
    const equifaxMatch = this.text.match(/(?:EQUIFAX|Equifax).*?(\d{3})/i)
    if (equifaxMatch) {
      const score = parseInt(equifaxMatch[1])
      if (score >= 300 && score <= 850) {
        scores.push({
          bureau: 'EQUIFAX',
          score,
          scoreModel: 'FICO Score 8',
          dateGenerated: new Date().toISOString().split('T')[0]
        })
      }
    }
    
    const transunionMatch = this.text.match(/(?:TRANSUNION|TransUnion).*?(\d{3})/i)
    if (transunionMatch) {
      const score = parseInt(transunionMatch[1])
      if (score >= 300 && score <= 850) {
        scores.push({
          bureau: 'TRANSUNION',
          score,
          scoreModel: 'FICO Score 8',
          dateGenerated: new Date().toISOString().split('T')[0]
        })
      }
    }
    
    // Also look for Vantage Score if present
    const vantageMatch = this.text.match(/(?:Vantage Score|VANTAGE SCORE).*?(\d{3})/i)
    if (vantageMatch) {
      const score = parseInt(vantageMatch[1])
      if (score >= 300 && score <= 850) {
        scores.push({
          bureau: 'VANTAGE',
          score,
          scoreModel: 'Vantage Score 4.0',
          dateGenerated: new Date().toISOString().split('T')[0]
        })
      }
    }
    
    return scores
  }

  private extractCreditAccounts(): CreditAccount[] {
    const accounts: CreditAccount[] = []
    
    console.log("🔍 Starting account extraction...")
    console.log(`📄 Text length: ${this.text.length}`)
    
    // Split text into sections to find account blocks - handle the exact test data format
    const sections = this.text.split(/(?=REVOLVING ACCOUNTS|INSTALLMENT ACCOUNTS|CREDIT CARD ACCOUNTS|AUTO LOAN ACCOUNTS|PERSONAL LOAN ACCOUNTS|STUDENT LOAN ACCOUNTS|MORTGAGE ACCOUNTS)/i)
    
    console.log(`📂 Found ${sections.length} sections:`, sections.map(s => s.substring(0, 50) + '...'))
    
    for (const section of sections) {
      if (section.includes('ACCOUNTS')) {
        console.log(`🏦 Processing section: ${section.substring(0, 100)}...`)
        
        // More flexible pattern to find account blocks - look for any line that starts with a creditor name and ends with ****
        const lines = section.split('\n')
        let currentAccount: any = null
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          
          // Check if this line starts an account (contains **** and looks like a creditor name)
          // More flexible pattern to catch all creditor names including variations
          if (line.includes('****') && line.match(/^[A-Z][A-Z\s]+(?:USA NA|BANK|NA|INC|LLC|CORP|ASSOCIATION|CREDIT UNION|LOANS|EXPRESS|DELAWARE|AUTO LOAN|MAE)/)) {
            // If we have a previous account, save it
            if (currentAccount && currentAccount.creditor) {
              accounts.push(currentAccount)
              console.log(`✅ Saved account: ${currentAccount.creditor}`)
            }
            
            // Start new account
            const creditorMatch = line.match(/^([A-Z][A-Z\s]+(?:USA NA|BANK|NA|INC|LLC|CORP|ASSOCIATION|CREDIT UNION|LOANS|EXPRESS|DELAWARE|AUTO LOAN|MAE))\s+\*\*\*\*/)
            if (creditorMatch) {
              const creditor = creditorMatch[1].trim()
              const accountMatch = line.match(/\*\*\*\*(\d{4})/)
              const accountNumber = accountMatch ? accountMatch[1] : '0000'
              
              currentAccount = {
                id: `account_${Date.now()}_${Math.random()}`,
                creditor,
                accountNumber,
                accountType: 'Unknown',
                balance: 0,
                creditLimit: undefined,
                paymentStatus: 'Unknown',
                monthsReviewed: 24,
                dateOpened: undefined,
                lastActivity: undefined,
                bureau: 'unknown',
                confidence: 0.9
              }
              
              console.log(`🏛️ Started new account: ${creditor}`)
            }
          }
          
          // If we have a current account, try to extract more details
          if (currentAccount) {
            if (line.startsWith('Account Type:')) {
              currentAccount.accountType = line.replace('Account Type:', '').trim()
            } else if (line.startsWith('Balance:')) {
              const balanceMatch = line.match(/Balance:\s*\$?([\d,]+\.?\d*)/)
              if (balanceMatch) {
                currentAccount.balance = this.parseAmount(balanceMatch[1])
              }
            } else if (line.startsWith('Credit Limit:') || line.startsWith('Original Amount:')) {
              const limitMatch = line.match(/(?:Credit Limit|Original Amount):\s*\$?([\d,]+\.?\d*)/)
              if (limitMatch) {
                currentAccount.creditLimit = this.parseAmount(limitMatch[1])
              }
            } else if (line.startsWith('Payment Status:')) {
              currentAccount.paymentStatus = line.replace('Payment Status:', '').trim()
            } else if (line.startsWith('Opened:')) {
              const openedMatch = line.match(/Opened:\s*(\d{2}\/\d{4})/)
              if (openedMatch) {
                currentAccount.dateOpened = openedMatch[1]
              }
            } else if (line.startsWith('Last Activity:')) {
              const activityMatch = line.match(/Last Activity:\s*(\d{2}\/\d{4})/)
              if (activityMatch) {
                currentAccount.lastActivity = activityMatch[1]
              }
            }
          }
        }
        
        // Don't forget the last account
        if (currentAccount && currentAccount.creditor) {
          accounts.push(currentAccount)
          console.log(`✅ Saved final account: ${currentAccount.creditor}`)
        }
      }
    }
    
    console.log(`🎯 Total accounts found: ${accounts.length}`)
    
    // Remove duplicates and filter out invalid entries
    const filteredAccounts = accounts.filter((account, index, self) => 
      account.creditor && 
      account.creditor !== 'ACCOUNTS' &&
      index === self.findIndex(a => a.creditor === account.creditor)
    )
    
    console.log(`🎯 Filtered accounts: ${filteredAccounts.length}`)
    
    // Debug: Show all detected accounts
    console.log('\n🔍 Detected accounts:')
    filteredAccounts.forEach((acc, index) => {
      console.log(`${index + 1}. ${acc.creditor} - ${acc.accountType} - $${acc.balance}`)
    })
    
    return filteredAccounts
  }

  private extractNegativeItems(): NegativeItem[] {
    const items: NegativeItem[] = []
    
    // Look for the NEGATIVE ITEMS SECTION
    const negativeSection = this.text.match(/NEGATIVE ITEMS SECTION([\s\S]*?)(?=INQUIRIES SECTION|RECOMMENDATIONS|$)/i)
    
    if (negativeSection) {
      const negativeText = negativeSection[1]
      
      // Split into individual negative items
      const itemBlocks = negativeText.split(/(?=Collection Account|Late Payment|Charge Off Account|Public Record)/)
      
      for (const block of itemBlocks) {
        if (block.trim() && !block.includes('NEGATIVE ITEMS SECTION')) {
          // Extract item type
          let type = 'Unknown'
          if (block.includes('Collection Account')) type = 'Collection'
          else if (block.includes('Late Payment')) type = 'Late Payment'
          else if (block.includes('Charge Off Account')) type = 'Charge Off'
          else if (block.includes('Public Record')) type = 'Public Record'
          
          // Extract creditor
          const creditorMatch = block.match(/Creditor:\s*([^\n]+)/)
          const creditor = creditorMatch ? creditorMatch[1].trim() : 'Unknown'
          
          // Extract description
          const descMatch = block.match(/(?:Collection Account|Late Payment|Charge Off Account|Public Record)\s*-\s*([^\n]+)/)
          const description = descMatch ? descMatch[1].trim() : type
          
          // Extract amount
          const amountMatch = block.match(/Amount:\s*\$?([\d,]+\.?\d*)/)
          const amount = amountMatch ? this.parseAmount(amountMatch[1]) : 0
          
          // Extract date reported
          const dateMatch = block.match(/(?:Date Reported|Date Filed):\s*(\d{2}\/\d{4})/)
          const dateReported = dateMatch ? dateMatch[1] : undefined
          
          // Extract status
          const statusMatch = block.match(/Status:\s*([^\n]+)/)
          const status = statusMatch ? statusMatch[1].trim() : 'Active'
          
          if (creditor && creditor !== 'Unknown') {
            items.push({
              id: `negative_${Date.now()}_${Math.random()}`,
              type,
              creditor,
              description,
              amount,
              dateReported,
              status,
              bureau: 'unknown',
              confidence: 0.9,
              disputeRecommendation: 'Consider disputing this item'
            })
          }
        }
      }
    }
    
    return items
  }

  private calculateSummary(accounts: CreditAccount[], negativeItems: NegativeItem[]): CreditSummary {
    const totalAccounts = accounts.length
    const openAccounts = accounts.filter(acc => acc.paymentStatus === 'Current').length
    const totalDebt = accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0)
    const totalCreditLimit = accounts.reduce((sum, acc) => sum + (acc.creditLimit || 0), 0)
    const utilizationRate = totalCreditLimit > 0 ? (totalDebt / totalCreditLimit) * 100 : 0
    
    return {
      totalAccounts,
      openAccounts,
      totalDebt,
      totalCreditLimit,
      utilizationRate,
      negativeItemsCount: negativeItems.length
    }
  }

  private calculateConfidence(data: ParsedCreditData): number {
    let confidence = 0.5
    
    if (data.scores.length > 0) confidence += 0.2
    if (data.accounts.length > 0) confidence += 0.2
    if (data.negativeItems.length > 0) confidence += 0.1
    
    if (data.scores.length >= 3) confidence += 0.1
    if (data.accounts.length >= 10) confidence += 0.1
    
    return Math.min(confidence, 1.0)
  }

  private generateValidationResults(data: ParsedCreditData): ValidationResult[] {
    const results: ValidationResult[] = []
    
    // Validate scores
    for (const score of data.scores) {
      results.push({
        type: 'score',
        confidence: score.score >= 300 && score.score <= 850 ? 0.9 : 0.5,
        reason: `Score ${score.score} is ${score.score >= 300 && score.score <= 850 ? 'valid' : 'out of range'}`,
        data: score
      })
    }
    
    // Validate accounts
    for (const account of data.accounts) {
      results.push({
        type: 'account',
        confidence: account.balance > 0 ? 0.8 : 0.6,
        reason: `Account ${account.creditor} has ${account.balance > 0 ? 'valid' : 'zero'} balance`,
        data: account
      })
    }
    
    return results
  }

  // Helper methods
  private detectBureauFromScore(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('experian')) return 'experian'
    if (lower.includes('equifax')) return 'equifax'
    if (lower.includes('transunion')) return 'transunion'
    return 'unknown'
  }

  private determineAccountType(creditor: string): string {
    const lower = creditor.toLowerCase()
    if (lower.includes('mortgage')) return 'mortgage'
    if (lower.includes('auto') || lower.includes('car')) return 'auto_loan'
    if (lower.includes('student')) return 'student_loan'
    if (lower.includes('personal')) return 'personal_loan'
    return 'credit_card'
  }

  private parseAmount(amountStr: string): number {
    return parseFloat(amountStr.replace(/[$,]/g, '')) || 0
  }

  private extractDateFromText(text: string): string | undefined {
    const dateMatch = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dateMatch) {
      return `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`
    }
    return undefined
  }

  private getContextAroundMatch(match: string, chars: number): string {
    const index = this.text.indexOf(match)
    if (index === -1) return match
    
    const start = Math.max(0, index - chars)
    const end = Math.min(this.text.length, index + match.length + chars)
    return this.text.substring(start, end)
  }

  private extractCreditorFromContext(context: string): string {
    const creditorMatch = context.match(/([A-Z\s]+(?:BANK|NA|INC|LLC|CORP|ASSOCIATION))/i)
    return creditorMatch ? creditorMatch[1].trim() : 'Unknown Creditor'
  }

  private extractAmountFromContext(context: string): number | undefined {
    const amountMatch = context.match(/\$?([\d,]+\.?\d*)/)
    return amountMatch ? this.parseAmount(amountMatch[1]) : undefined
  }

  private classifyNegativeItem(text: string): string {
    const lower = text.toLowerCase()
    if (lower.includes('late')) return 'late_payment'
    if (lower.includes('collection')) return 'collection'
    if (lower.includes('charge') && lower.includes('off')) return 'charge_off'
    if (lower.includes('bankruptcy')) return 'bankruptcy'
    if (lower.includes('foreclosure')) return 'foreclosure'
    if (lower.includes('repossession')) return 'repossession'
    if (lower.includes('judgment')) return 'judgment'
    if (lower.includes('tax') && lower.includes('lien')) return 'tax_lien'
    return 'other'
  }
}
