/**
 * Token Encryption Utilities
 * Uses AES-256-GCM for secure token storage
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

interface EncryptedData {
  encrypted: string
  iv: string
  authTag: string
}

/**
 * Get encryption key from environment variable
 * In production, this should be stored in a secure key management service
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
      'Generate one using: openssl rand -hex 32'
    )
  }
  
  // Ensure key is 32 bytes (64 hex characters)
  if (key.length !== 64) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)')
  }
  
  return Buffer.from(key, 'hex')
}

/**
 * Encrypt sensitive data (tokens, secrets) before storing in database
 */
export function encryptToken(plaintext: string): EncryptedData {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    }
  } catch (error) {
    throw new Error(`Token encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Decrypt sensitive data when retrieving from database
 */
export function decryptToken(encryptedData: EncryptedData): string {
  try {
    const key = getEncryptionKey()
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      key,
      Buffer.from(encryptedData.iv, 'hex')
    )
    
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'))
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    throw new Error(`Token decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generate a secure encryption key
 * Run this once and store the result in ENCRYPTION_KEY env variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToEncrypt: (keyof T)[]
): Record<string, any> {
  const encrypted: Record<string, any> = { ...data }
  
  for (const field of fieldsToEncrypt) {
    const fieldStr = String(field)
    const value = data[field]
    if (value && typeof value === 'string') {
      const encryptedData = encryptToken(value)
      encrypted[`${fieldStr}_encrypted`] = encryptedData.encrypted
      encrypted[`${fieldStr}_iv`] = encryptedData.iv
      encrypted[`${fieldStr}_auth_tag`] = encryptedData.authTag
      delete encrypted[fieldStr]
    }
  }
  
  return encrypted
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields<T extends Record<string, any>>(
  data: T,
  fieldsToDecrypt: string[]
): Record<string, any> {
  const decrypted: Record<string, any> = { ...data }
  
  for (const field of fieldsToDecrypt) {
    const encryptedField = `${field}_encrypted`
    const ivField = `${field}_iv`
    const authTagField = `${field}_auth_tag`
    
    if (data[encryptedField] && data[ivField] && data[authTagField]) {
      try {
        const encryptedData: EncryptedData = {
          encrypted: data[encryptedField] as string,
          iv: data[ivField] as string,
          authTag: data[authTagField] as string,
        }
        
        decrypted[field] = decryptToken(encryptedData)
        delete decrypted[encryptedField]
        delete decrypted[ivField]
        delete decrypted[authTagField]
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error)
        // Keep encrypted fields if decryption fails
      }
    }
  }
  
  return decrypted
}

/**
 * Utility to test encryption/decryption
 */
export function testEncryption(): boolean {
  try {
    const testData = 'test-token-12345'
    const encrypted = encryptToken(testData)
    const decrypted = decryptToken(encrypted)
    
    return decrypted === testData
  } catch (error) {
    console.error('Encryption test failed:', error)
    return false
  }
}

