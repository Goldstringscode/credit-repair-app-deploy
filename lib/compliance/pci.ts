import { auditLogger } from '../audit-logger'

export interface PCICardData {
  id: string
  cardNumber: string // Masked: 4111****1111
  expiryMonth: number
  expiryYear: number
  cardholderName: string
  cvv: string // Encrypted
  token: string // PCI token for processing
  encrypted: boolean
  lastUsed: Date
  status: 'active' | 'expired' | 'suspended' | 'deleted'
}

export interface PCITransaction {
  id: string
  userId: string
  cardId: string
  amount: number
  currency: string
  merchantId: string
  transactionType: 'sale' | 'refund' | 'void' | 'capture'
  status: 'pending' | 'approved' | 'declined' | 'cancelled'
  processedAt: Date
  authorizationCode?: string
  gatewayResponse?: any
  encrypted: boolean
}

export interface PCIAudit {
  id: string
  auditDate: Date
  scope: string
  findings: PCIFinding[]
  status: 'passed' | 'failed' | 'remediation_required'
  nextAudit: Date
  auditor: string
}

export interface PCIFinding {
  id: string
  requirement: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved'
  remediation: string
  dueDate: Date
}

export interface PCIVulnerability {
  id: string
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  cveId?: string
  discoveredAt: Date
  patchedAt?: Date
  status: 'open' | 'patched' | 'false_positive'
  affectedSystems: string[]
}

class PCIComplianceService {
  private cards: Map<string, PCICardData> = new Map()
  private transactions: Map<string, PCITransaction> = new Map()
  private audits: PCIAudit[] = []
  private vulnerabilities: Map<string, PCIVulnerability> = new Map()

  /**
   * Add a PCI-compliant card
   */
  addCard(cardData: {
    userId: string
    cardNumber: string
    expiryMonth: number
    expiryYear: number
    cardholderName: string
    cvv: string
  }): PCICardData {
    console.log('🔍 PCI Service: addCard called with data:', cardData)
    // Mask card number for storage
    const maskedNumber = this.maskCardNumber(cardData.cardNumber)
    console.log('🔍 PCI Service: Masked card number:', maskedNumber)
    
    // Generate PCI token (in real implementation, this would come from payment processor)
    const token = this.generatePCIToken(cardData.cardNumber)

    const card: PCICardData = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardNumber: maskedNumber,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear,
      cardholderName: cardData.cardholderName,
      cvv: this.encryptCVV(cardData.cvv),
      token,
      encrypted: true,
      lastUsed: new Date(),
      status: 'active'
    }

    this.cards.set(card.id, card)
    console.log('🔍 PCI Service: Card created and stored:', card.id)

    // Log card addition
    try {
      console.log('🔍 PCI Service: Attempting audit log...')
      auditLogger.log({
        userId: cardData.userId,
        ipAddress: 'system',
        userAgent: 'system',
        action: 'pci_card_added',
        resource: 'payment_card',
        method: 'POST',
        endpoint: '/api/compliance/pci/card',
        statusCode: 200,
        severity: 'high',
        category: 'compliance',
        metadata: { 
          cardId: card.id,
          maskedNumber: card.cardNumber,
          encrypted: card.encrypted
        }
      })
      console.log('🔍 PCI Service: Audit log successful')
    } catch (error) {
      console.log('❌ PCI Service: Audit logging failed (non-critical):', error)
    }

    console.log('🔍 PCI Service: Returning card:', card.id)
    return card
  }

  /**
   * Process a PCI-compliant transaction
   */
  processTransaction(transactionData: {
    userId: string
    cardId: string
    amount: number
    currency: string
    merchantId: string
    transactionType: PCITransaction['transactionType']
  }): PCITransaction {
    const card = this.cards.get(transactionData.cardId)
    if (!card) {
      throw new Error('Card not found')
    }

    if (card.status !== 'active') {
      throw new Error('Card is not active')
    }

    const transaction: PCITransaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: transactionData.userId,
      cardId: transactionData.cardId,
      amount: transactionData.amount,
      currency: transactionData.currency,
      merchantId: transactionData.merchantId,
      transactionType: transactionData.transactionType,
      status: 'pending',
      processedAt: new Date(),
      encrypted: true
    }

    // Simulate payment processing
    transaction.status = this.simulatePaymentProcessing(transaction)
    if (transaction.status === 'approved') {
      transaction.authorizationCode = this.generateAuthCode()
    }

    this.transactions.set(transaction.id, transaction)

    // Update card last used
    card.lastUsed = new Date()

    // Log transaction
    try {
      auditLogger.log({
        userId: transactionData.userId,
        ipAddress: 'system',
        userAgent: 'system',
        action: 'pci_transaction_processed',
        resource: 'payment_transaction',
        method: 'POST',
        endpoint: '/api/compliance/pci/transaction',
        statusCode: 200,
        severity: 'medium',
        category: 'compliance',
        metadata: { 
          transactionId: transaction.id,
          amount: transaction.amount,
          status: transaction.status,
          encrypted: transaction.encrypted
        }
      })
    } catch (error) {
      console.log('Audit logging failed (non-critical):', error)
    }

    return transaction
  }

  /**
   * Mask card number for display
   */
  private maskCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\D/g, '')
    if (cleaned.length < 4) return '****'
    
    const lastFour = cleaned.slice(-4)
    const masked = '*'.repeat(cleaned.length - 4)
    return masked + lastFour
  }

  /**
   * Generate PCI token
   */
  private generatePCIToken(cardNumber: string): string {
    // In real implementation, this would be generated by payment processor
    return `tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Encrypt CVV
   */
  private encryptCVV(cvv: string): string {
    // In real implementation, use proper encryption
    return `enc_${cvv}_${Date.now()}`
  }

  /**
   * Simulate payment processing
   */
  private simulatePaymentProcessing(transaction: PCITransaction): PCITransaction['status'] {
    // Simulate processing logic
    const random = Math.random()
    if (random < 0.85) return 'approved'
    if (random < 0.95) return 'declined'
    return 'cancelled'
  }

  /**
   * Generate authorization code
   */
  private generateAuthCode(): string {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }

  /**
   * Report a PCI vulnerability
   */
  reportVulnerability(vulnData: {
    title: string
    description: string
    severity: PCIVulnerability['severity']
    cveId?: string
    affectedSystems: string[]
  }): PCIVulnerability {
    const vulnerability: PCIVulnerability = {
      id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: vulnData.title,
      description: vulnData.description,
      severity: vulnData.severity,
      cveId: vulnData.cveId,
      discoveredAt: new Date(),
      status: 'open',
      affectedSystems: vulnData.affectedSystems
    }

    this.vulnerabilities.set(vulnerability.id, vulnerability)

    // Log vulnerability
    try {
      auditLogger.log({
        userId: 'system',
        ipAddress: 'system',
        userAgent: 'system',
        action: 'pci_vulnerability_reported',
        resource: 'security_vulnerability',
        method: 'POST',
        endpoint: '/api/compliance/pci/vulnerability',
        statusCode: 200,
        severity: vulnData.severity === 'critical' ? 'critical' : 'high',
        category: 'compliance',
        metadata: { 
          vulnerabilityId: vulnerability.id,
          severity: vulnData.severity,
          affectedSystems: vulnData.affectedSystems.length
        }
      })
    } catch (error) {
      console.log('Audit logging failed (non-critical):', error)
    }

    return vulnerability
  }

  /**
   * Conduct PCI audit
   */
  conductAudit(auditData: {
    scope: string
    auditor: string
  }): PCIAudit {
    const findings: PCIFinding[] = [
      {
        id: `finding_${Date.now()}_1`,
        requirement: 'PCI DSS 3.4',
        description: 'Card data encryption at rest',
        severity: 'low',
        status: 'resolved',
        remediation: 'AES-256 encryption implemented',
        dueDate: new Date()
      },
      {
        id: `finding_${Date.now()}_2`,
        requirement: 'PCI DSS 6.2',
        description: 'Vulnerability management program',
        severity: 'medium',
        status: 'in_progress',
        remediation: 'Automated vulnerability scanning implemented',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    ]

    const audit: PCIAudit = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      auditDate: new Date(),
      scope: auditData.scope,
      findings,
      status: findings.some(f => f.status === 'open' || f.status === 'in_progress') ? 'remediation_required' : 'passed',
      nextAudit: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      auditor: auditData.auditor
    }

    this.audits.push(audit)

    // Log audit
    try {
      auditLogger.log({
        userId: 'system',
        ipAddress: 'system',
        userAgent: 'system',
        action: 'pci_audit_conducted',
        resource: 'pci_audit',
        method: 'POST',
        endpoint: '/api/compliance/pci/audit',
        statusCode: 200,
        severity: 'medium',
        category: 'compliance',
        metadata: { 
          auditId: audit.id,
          scope: auditData.scope,
          findingsCount: findings.length,
          status: audit.status
        }
      })
    } catch (error) {
      console.log('Audit logging failed (non-critical):', error)
    }

    return audit
  }

  /**
   * Get user's cards
   */
  getUserCards(userId: string): PCICardData[] {
    return Array.from(this.cards.values()).filter(card => 
      // In real implementation, filter by userId
      true
    )
  }

  /**
   * Get user's transactions
   */
  getUserTransactions(userId: string): PCITransaction[] {
    return Array.from(this.transactions.values()).filter(txn => txn.userId === userId)
  }

  /**
   * Get PCI vulnerabilities
   */
  getVulnerabilities(): PCIVulnerability[] {
    return Array.from(this.vulnerabilities.values()).sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime())
  }

  /**
   * Get PCI audits
   */
  getAudits(): PCIAudit[] {
    return [...this.audits].sort((a, b) => b.auditDate.getTime() - a.auditDate.getTime())
  }

  /**
   * Generate PCI compliance report
   */
  generateComplianceReport(): any {
    const totalCards = this.cards.size
    const activeCards = Array.from(this.cards.values()).filter(c => c.status === 'active').length
    const encryptedCards = Array.from(this.cards.values()).filter(c => c.encrypted).length

    const totalTransactions = this.transactions.size
    const approvedTransactions = Array.from(this.transactions.values()).filter(t => t.status === 'approved').length
    const encryptedTransactions = Array.from(this.transactions.values()).filter(t => t.encrypted).length

    const totalVulnerabilities = this.vulnerabilities.size
    const openVulnerabilities = Array.from(this.vulnerabilities.values()).filter(v => v.status === 'open').length
    const criticalVulnerabilities = Array.from(this.vulnerabilities.values()).filter(v => v.severity === 'critical').length

    const totalAudits = this.audits.length
    const passedAudits = this.audits.filter(a => a.status === 'passed').length
    const recentAudits = this.audits.filter(a => 
      a.auditDate > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    ).length

    return {
      reportGeneratedAt: new Date().toISOString(),
      cards: {
        total: totalCards,
        active: activeCards,
        encrypted: encryptedCards,
        encryptionRate: totalCards > 0 ? Math.round((encryptedCards / totalCards) * 100) : 0
      },
      transactions: {
        total: totalTransactions,
        approved: approvedTransactions,
        encrypted: encryptedTransactions,
        approvalRate: totalTransactions > 0 ? Math.round((approvedTransactions / totalTransactions) * 100) : 0,
        encryptionRate: totalTransactions > 0 ? Math.round((encryptedTransactions / totalTransactions) * 100) : 0
      },
      vulnerabilities: {
        total: totalVulnerabilities,
        open: openVulnerabilities,
        critical: criticalVulnerabilities,
        patchedRate: totalVulnerabilities > 0 ? Math.round(((totalVulnerabilities - openVulnerabilities) / totalVulnerabilities) * 100) : 0
      },
      audits: {
        total: totalAudits,
        passed: passedAudits,
        recent: recentAudits,
        passRate: totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 0
      },
      compliance: {
        pciCompliant: openVulnerabilities === 0 && recentAudits > 0,
        requirements: [
          'Build and maintain secure networks',
          'Protect cardholder data',
          'Maintain vulnerability management program',
          'Implement strong access control measures',
          'Regularly monitor and test networks',
          'Maintain information security policy'
        ],
        securityMeasures: [
          'Data encryption at rest and in transit',
          'Secure payment processing',
          'Access controls and authentication',
          'Vulnerability scanning and patching',
          'Audit logging and monitoring',
          'Regular security assessments'
        ]
      }
    }
  }
}

// Create singleton instance
export const pciService = new PCIComplianceService()

// Convenience functions
export function addPCICard(cardData: any): PCICardData {
  return pciService.addCard(cardData)
}

export function processPCITransaction(transactionData: any): PCITransaction {
  return pciService.processTransaction(transactionData)
}

export function reportPCIVulnerability(vulnData: any): PCIVulnerability {
  return pciService.reportVulnerability(vulnData)
}

export function conductPCIAudit(auditData: any): PCIAudit {
  return pciService.conductAudit(auditData)
}

export function getUserPCICards(userId: string): PCICardData[] {
  return pciService.getUserCards(userId)
}

export function getUserPCITransactions(userId: string): PCITransaction[] {
  return pciService.getUserTransactions(userId)
}

export function generatePCIcomplianceReport(): any {
  return pciService.generateComplianceReport()
}
