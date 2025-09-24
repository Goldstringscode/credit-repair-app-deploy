import crypto from 'crypto'

interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  tagLength: number
  saltLength: number
}

const defaultConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
  saltLength: 32 // 256 bits
}

class EncryptionService {
  private config: EncryptionConfig
  private masterKey: Buffer

  constructor(config: EncryptionConfig = defaultConfig) {
    this.config = config
    this.masterKey = this.deriveKey(process.env.ENCRYPTION_MASTER_KEY || 'default-key-change-in-production')
  }

  private deriveKey(password: string, salt?: Buffer): Buffer {
    const saltBuffer = salt || crypto.randomBytes(this.config.saltLength)
    return crypto.pbkdf2Sync(password, saltBuffer, 100000, this.config.keyLength, 'sha512')
  }

  private generateIV(): Buffer {
    return crypto.randomBytes(this.config.ivLength)
  }

  private generateSalt(): Buffer {
    return crypto.randomBytes(this.config.saltLength)
  }

  /**
   * Encrypt sensitive data
   */
  encrypt(data: string, password?: string): string {
    try {
      const iv = this.generateIV()
      const salt = this.generateSalt()
      const key = password ? this.deriveKey(password, salt) : this.masterKey
      
      const cipher = crypto.createCipher(this.config.algorithm, key)
      cipher.setAAD(salt) // Additional authenticated data
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      // Combine salt + iv + tag + encrypted data
      const combined = Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
      ])
      
      return combined.toString('base64')
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(encryptedData: string, password?: string): string {
    try {
      const combined = Buffer.from(encryptedData, 'base64')
      
      // Extract components
      const salt = combined.subarray(0, this.config.saltLength)
      const iv = combined.subarray(this.config.saltLength, this.config.saltLength + this.config.ivLength)
      const tag = combined.subarray(
        this.config.saltLength + this.config.ivLength,
        this.config.saltLength + this.config.ivLength + this.config.tagLength
      )
      const encrypted = combined.subarray(this.config.saltLength + this.config.ivLength + this.config.tagLength)
      
      const key = password ? this.deriveKey(password, salt) : this.masterKey
      
      const decipher = crypto.createDecipher(this.config.algorithm, key)
      decipher.setAAD(salt)
      decipher.setAuthTag(tag)
      
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  hash(data: string, salt?: string): string {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(32)
    const hash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512')
    return saltBuffer.toString('hex') + ':' + hash.toString('hex')
  }

  /**
   * Verify hashed data
   */
  verifyHash(data: string, hashedData: string): boolean {
    try {
      const [salt, hash] = hashedData.split(':')
      const saltBuffer = Buffer.from(salt, 'hex')
      const hashBuffer = Buffer.from(hash, 'hex')
      const newHash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512')
      return crypto.timingSafeEqual(hashBuffer, newHash)
    } catch (error) {
      console.error('Hash verification error:', error)
      return false
    }
  }

  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate secure token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  }
}

// Create singleton instance
export const encryptionService = new EncryptionService()

// Field-level encryption for specific data types
export class FieldEncryption {
  private static instance: FieldEncryption
  private encryptionService: EncryptionService

  private constructor() {
    this.encryptionService = encryptionService
  }

  static getInstance(): FieldEncryption {
    if (!FieldEncryption.instance) {
      FieldEncryption.instance = new FieldEncryption()
    }
    return FieldEncryption.instance
  }

  /**
   * Encrypt PII (Personally Identifiable Information)
   */
  encryptPII(data: {
    ssn?: string
    dateOfBirth?: string
    address?: string
    phone?: string
    email?: string
  }): {
    ssn?: string
    dateOfBirth?: string
    address?: string
    phone?: string
    email?: string
  } {
    const encrypted: any = {}
    
    if (data.ssn) {
      encrypted.ssn = this.encryptionService.encrypt(data.ssn)
    }
    if (data.dateOfBirth) {
      encrypted.dateOfBirth = this.encryptionService.encrypt(data.dateOfBirth)
    }
    if (data.address) {
      encrypted.address = this.encryptionService.encrypt(data.address)
    }
    if (data.phone) {
      encrypted.phone = this.encryptionService.encrypt(data.phone)
    }
    if (data.email) {
      encrypted.email = this.encryptionService.encrypt(data.email)
    }
    
    return encrypted
  }

  /**
   * Decrypt PII
   */
  decryptPII(data: {
    ssn?: string
    dateOfBirth?: string
    address?: string
    phone?: string
    email?: string
  }): {
    ssn?: string
    dateOfBirth?: string
    address?: string
    phone?: string
    email?: string
  } {
    const decrypted: any = {}
    
    if (data.ssn) {
      decrypted.ssn = this.encryptionService.decrypt(data.ssn)
    }
    if (data.dateOfBirth) {
      decrypted.dateOfBirth = this.encryptionService.decrypt(data.dateOfBirth)
    }
    if (data.address) {
      decrypted.address = this.encryptionService.decrypt(data.address)
    }
    if (data.phone) {
      decrypted.phone = this.encryptionService.decrypt(data.phone)
    }
    if (data.email) {
      decrypted.email = this.encryptionService.decrypt(data.email)
    }
    
    return decrypted
  }

  /**
   * Encrypt credit report data
   */
  encryptCreditData(data: {
    creditScore?: number
    accountNumbers?: string[]
    accountBalances?: number[]
    personalInfo?: any
  }): {
    creditScore?: string
    accountNumbers?: string[]
    accountBalances?: string[]
    personalInfo?: string
  } {
    const encrypted: any = {}
    
    if (data.creditScore !== undefined) {
      encrypted.creditScore = this.encryptionService.encrypt(data.creditScore.toString())
    }
    if (data.accountNumbers) {
      encrypted.accountNumbers = data.accountNumbers.map(num => 
        this.encryptionService.encrypt(num)
      )
    }
    if (data.accountBalances) {
      encrypted.accountBalances = data.accountBalances.map(balance => 
        this.encryptionService.encrypt(balance.toString())
      )
    }
    if (data.personalInfo) {
      encrypted.personalInfo = this.encryptionService.encrypt(JSON.stringify(data.personalInfo))
    }
    
    return encrypted
  }

  /**
   * Decrypt credit report data
   */
  decryptCreditData(data: {
    creditScore?: string
    accountNumbers?: string[]
    accountBalances?: string[]
    personalInfo?: string
  }): {
    creditScore?: number
    accountNumbers?: string[]
    accountBalances?: number[]
    personalInfo?: any
  } {
    const decrypted: any = {}
    
    if (data.creditScore) {
      decrypted.creditScore = parseInt(this.encryptionService.decrypt(data.creditScore))
    }
    if (data.accountNumbers) {
      decrypted.accountNumbers = data.accountNumbers.map(num => 
        this.encryptionService.decrypt(num)
      )
    }
    if (data.accountBalances) {
      decrypted.accountBalances = data.accountBalances.map(balance => 
        parseFloat(this.encryptionService.decrypt(balance))
      )
    }
    if (data.personalInfo) {
      decrypted.personalInfo = JSON.parse(this.encryptionService.decrypt(data.personalInfo))
    }
    
    return decrypted
  }

  /**
   * Encrypt dispute data
   */
  encryptDisputeData(data: {
    accountName?: string
    accountNumber?: string
    disputeReason?: string
    personalInfo?: any
  }): {
    accountName?: string
    accountNumber?: string
    disputeReason?: string
    personalInfo?: string
  } {
    const encrypted: any = {}
    
    if (data.accountName) {
      encrypted.accountName = this.encryptionService.encrypt(data.accountName)
    }
    if (data.accountNumber) {
      encrypted.accountNumber = this.encryptionService.encrypt(data.accountNumber)
    }
    if (data.disputeReason) {
      encrypted.disputeReason = this.encryptionService.encrypt(data.disputeReason)
    }
    if (data.personalInfo) {
      encrypted.personalInfo = this.encryptionService.encrypt(JSON.stringify(data.personalInfo))
    }
    
    return encrypted
  }

  /**
   * Decrypt dispute data
   */
  decryptDisputeData(data: {
    accountName?: string
    accountNumber?: string
    disputeReason?: string
    personalInfo?: string
  }): {
    accountName?: string
    accountNumber?: string
    disputeReason?: string
    personalInfo?: any
  } {
    const decrypted: any = {}
    
    if (data.accountName) {
      decrypted.accountName = this.encryptionService.decrypt(data.accountName)
    }
    if (data.accountNumber) {
      decrypted.accountNumber = this.encryptionService.decrypt(data.accountNumber)
    }
    if (data.disputeReason) {
      decrypted.disputeReason = this.encryptionService.decrypt(data.disputeReason)
    }
    if (data.personalInfo) {
      decrypted.personalInfo = JSON.parse(this.encryptionService.decrypt(data.personalInfo))
    }
    
    return decrypted
  }
}

// Export singleton instance
export const fieldEncryption = FieldEncryption.getInstance()

// Utility functions
export function encryptSensitiveField(value: string): string {
  return encryptionService.encrypt(value)
}

export function decryptSensitiveField(encryptedValue: string): string {
  return encryptionService.decrypt(encryptedValue)
}

export function hashPassword(password: string): string {
  return encryptionService.hash(password)
}

export function verifyPassword(password: string, hashedPassword: string): boolean {
  return encryptionService.verifyHash(password, hashedPassword)
}

export function generateSecureId(): string {
  return encryptionService.generateSecureRandom(16)
}

export function generateApiKey(): string {
  return encryptionService.generateToken(32)
}

// Database field encryption helpers
export function encryptDatabaseField(value: any): string {
  if (typeof value === 'object') {
    return encryptionService.encrypt(JSON.stringify(value))
  }
  return encryptionService.encrypt(String(value))
}

export function decryptDatabaseField(encryptedValue: string, expectedType: 'string' | 'number' | 'object' = 'string'): any {
  const decrypted = encryptionService.decrypt(encryptedValue)
  
  switch (expectedType) {
    case 'number':
      return parseFloat(decrypted)
    case 'object':
      return JSON.parse(decrypted)
    default:
      return decrypted
  }
}

