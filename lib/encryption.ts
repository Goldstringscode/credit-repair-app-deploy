import crypto from 'crypto'

interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  tagLength: number
}

// GCM's recommended IV length is 96 bits (12 bytes) — the previous 128-bit
// (16 byte) IV worked but was non-standard. AES-256-GCM throughout.
const defaultConfig: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 12,  // 96 bits (NIST-recommended for GCM)
  tagLength: 16, // 128 bits
}

// Fixed 32-byte salt used only for the optional per-call password path
// (scrypt requires a salt; it does not need to be secret, only unique
// per password — a fresh random salt is generated per encryption below).
const PASSWORD_SALT_LENGTH = 32

class EncryptionService {
  private config: EncryptionConfig
  private _masterKey: Buffer | null = null

  constructor(config: EncryptionConfig = defaultConfig) {
    this.config = config
    // Deliberately NOT loading/deriving the master key here. This class is
    // instantiated as a module-level singleton (see bottom of file), which
    // means the constructor runs the moment anything imports this module —
    // including, transiently, during Next.js's build-time page-data
    // collection. If ENCRYPTION_MASTER_KEY were required eagerly here, a
    // missing env var during build would crash the entire build (the same
    // class of bug fixed earlier today in the Twilio client and
    // useRealtimeTracking.ts). Instead the key is loaded lazily, only when
    // encryption is actually used at request time, when env vars are
    // guaranteed to be present.
  }

  /**
   * Loads and caches a STABLE 32-byte key derived from ENCRYPTION_MASTER_KEY.
   *
   * Throws if the env var is missing or too short — there is intentionally
   * no insecure fallback default key. A silent fallback would mean anyone
   * with read access to this source file could decrypt production data.
   *
   * Uses HKDF with a fixed, application-specific (non-secret) salt. HKDF's
   * salt does not need to be secret — only the input keying material
   * (the master key secret itself) does. Using a FIXED salt is the critical
   * fix: the previous implementation generated a brand-new random salt on
   * every process start with no way to reproduce it, so anything encrypted
   * became permanently undecryptable after any restart or on any other
   * serverless instance. A fixed salt makes key derivation deterministic
   * everywhere, every time, from the same secret.
   */
  private getMasterKey(): Buffer {
    if (this._masterKey) return this._masterKey

    const secret = process.env.ENCRYPTION_MASTER_KEY
    if (!secret) {
      throw new Error(
        'ENCRYPTION_MASTER_KEY is not set. Refusing to encrypt/decrypt with an insecure default key — set this environment variable before using field encryption.'
      )
    }
    if (secret.length < 32) {
      throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters long.')
    }

    const fixedSalt = Buffer.from('credit-repair-app:encryption:v1', 'utf8')
    const derived = crypto.hkdfSync('sha512', secret, fixedSalt, 'field-encryption', this.config.keyLength)
    this._masterKey = Buffer.from(derived)
    return this._masterKey
  }

  private generateIV(): Buffer {
    return crypto.randomBytes(this.config.ivLength)
  }

  /**
   * Encrypt sensitive data with AES-256-GCM.
   *
   * A fresh random IV is generated on every call and stored alongside the
   * ciphertext (never reused across encryptions with the same key — reusing
   * a GCM IV breaks both confidentiality and authenticity). Output is
   * base64([salt if password given] + iv + authTag + ciphertext).
   *
   * The optional `password` parameter derives a one-off key via scrypt
   * instead of the shared master key, for callers that need a caller-supplied
   * secret rather than the app-wide key. No current caller uses this, but
   * the signature is preserved for compatibility.
   */
  encrypt(data: string, password?: string): string {
    try {
      const iv = this.generateIV()
      let key: Buffer
      let salt: Buffer | null = null

      if (password) {
        salt = crypto.randomBytes(PASSWORD_SALT_LENGTH)
        key = crypto.scryptSync(password, salt, this.config.keyLength)
      } else {
        key = this.getMasterKey()
      }

      const cipher = crypto.createCipheriv(this.config.algorithm, key, iv)
      const ciphertext = Buffer.concat([cipher.update(data, 'utf8'), cipher.final()])
      const tag = cipher.getAuthTag()

      const parts = salt ? [salt, iv, tag, ciphertext] : [iv, tag, ciphertext]
      return Buffer.concat(parts).toString('base64')
    } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
    }
  }

  /**
   * Decrypt data produced by encrypt(). Pass the same password argument
   * (or omit it) that was used to encrypt.
   */
  decrypt(encryptedData: string, password?: string): string {
    try {
      const combined = Buffer.from(encryptedData, 'base64')
      let offset = 0
      let key: Buffer

      if (password) {
        const salt = combined.subarray(0, PASSWORD_SALT_LENGTH)
        offset = PASSWORD_SALT_LENGTH
        key = crypto.scryptSync(password, salt, this.config.keyLength)
      } else {
        key = this.getMasterKey()
      }

      const iv = combined.subarray(offset, offset + this.config.ivLength)
      const tag = combined.subarray(
        offset + this.config.ivLength,
        offset + this.config.ivLength + this.config.tagLength
      )
      const ciphertext = combined.subarray(offset + this.config.ivLength + this.config.tagLength)

      const decipher = crypto.createDecipheriv(this.config.algorithm, key, iv)
      decipher.setAuthTag(tag)

      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
      return decrypted.toString('utf8')
    } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
    }
  }

  /**
   * Hash data one-way (e.g. deterministic blind-indexing / lookup hashes).
   * NOT used for password storage — passwords are hashed with bcryptjs
   * elsewhere in this app, which is the correct tool for that job (bcrypt
   * is deliberately slow and per-hash salted in a way suited to password
   * storage; this pbkdf2-based hash is kept for other one-way use cases
   * and for backward compatibility with this module's existing exports).
   */
  hash(data: string, salt?: string): string {
    const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(32)
    const hash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512')
    return saltBuffer.toString('hex') + ':' + hash.toString('hex')
  }

  /**
   * Verify data against a hash produced by hash().
   */
  verifyHash(data: string, hashedData: string): boolean {
    try {
      const [salt, hash] = hashedData.split(':')
      const saltBuffer = Buffer.from(salt, 'hex')
      const hashBuffer = Buffer.from(hash, 'hex')
      const newHash = crypto.pbkdf2Sync(data, saltBuffer, 100000, 64, 'sha512')
      return hashBuffer.length === newHash.length && crypto.timingSafeEqual(hashBuffer, newHash)
    } catch (error) {
      console.error('Hash verification error:', error)
      return false
    }
  }

  generateSecureRandom(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('base64url')
  }
}

// Module-level singleton. Safe to construct eagerly at import time because
// the constructor no longer touches ENCRYPTION_MASTER_KEY — see getMasterKey().
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

