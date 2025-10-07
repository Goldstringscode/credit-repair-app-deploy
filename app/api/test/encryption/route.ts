import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export const POST = async (request: NextRequest) => {
  try {
    const { ssn, creditScore } = await request.json()
    
    // Simple encryption test using Node.js crypto
    const testData = ssn || '1234'
    const algorithm = 'aes-256-cbc'
    const secretKey = process.env.ENCRYPTION_MASTER_KEY || 'default-key-for-testing'
    const key = crypto.scryptSync(secretKey, 'salt', 32)
    const iv = crypto.randomBytes(16)
    
    const cipher = crypto.createCipheriv(algorithm, key, iv)
    let encrypted = cipher.update(testData, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    // Verify encryption worked
    const isEncrypted = encrypted !== testData && encrypted.length > 0
    
    return NextResponse.json({ 
      success: true, 
      message: 'Encryption test completed',
      encrypted: encrypted,
      original: testData,
      isEncrypted: isEncrypted,
      algorithm: algorithm
    })
  } catch (error: any) {
    console.error('Encryption test error:', error)
    return NextResponse.json({ 
      error: 'Encryption test failed',
      message: error?.message || 'Unknown error',
      details: error?.stack
    }, { status: 500 })
  }
}
