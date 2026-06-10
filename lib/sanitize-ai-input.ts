/**
 * Input sanitization for AI/LLM routes.
 *
 * Three threats addressed:
 *  1. Prompt injection  — users embedding instructions like "Ignore previous instructions..."
 *  2. Token exhaustion  — unbounded input that blows up Anthropic cost
 *  3. Control-character injection — null bytes / escape sequences that confuse the model
 */

// ── Injection patterns ────────────────────────────────────────────────────────
// Conservative list: only patterns that are clearly adversarial, not false-positive-prone.
const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior|above) instructions?/i,
  /disregard (all )?(previous|prior|above|your) instructions?/i,
  /forget (all )?(previous|prior|above) instructions?/i,
  /you are now (a|an|the|my)/i,            // tightened: requires role after
  /adopt (a |the )?new persona/i,           // tightened: requires 'adopt'
  /take on (a |the )?new persona/i,
  /act as (a|an|the)?\s+(different|evil|unrestricted|jailbroken)/i,
  /jailbreak/i,
  /prompt injection/i,
  /\bsystem:\s*you\b/i,
  /<\|.*?\|>/,
  /\[INST\]|\[\/INST\]/,
  /###\s*(instruction|system|human|assistant):/i,
]

// ── Field limits (characters, not tokens — ~4 chars/token) ───────────────────
const FIELD_LIMITS: Record<string, number> = {
  // Long-form text fields
  originalExplanation:  2000,
  additionalContext:    1000,
  explanation:          2000,
  notes:                1000,
  description:          1000,
  reason:               500,
  desiredOutcome:       500,
  // Identity / label fields
  firstName:            100,
  lastName:             100,
  creditorName:         200,
  accountName:          200,
  accountNumber:        50,
  creditBureau:         50,
  disputeReason:        500,
  letterType:           50,
  letterTier:           50,
  // Catch-all for unknown fields
  default:              2000,
}

// ── Core sanitizer ────────────────────────────────────────────────────────────

export interface SanitizeResult {
  value: string
  truncated: boolean
  injectionDetected: boolean
}

/**
 * Sanitize a single string field before it enters an AI prompt.
 * @param value    Raw user input
 * @param field    Field name — used to look up the character limit
 * @returns        Cleaned value + audit flags
 */
export function sanitizeAiInput(value: unknown, field = 'default'): SanitizeResult {
  // Coerce to string
  let str = typeof value === 'string' ? value : String(value ?? '')

  // 1. Strip null bytes and control characters (except \t \n \r)
  str = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

  // 2. Collapse excessive whitespace (>3 consecutive newlines → 2)
  str = str.replace(/\n{3,}/g, '\n\n').trim()

  // 3. Detect injection attempts before truncation (check full input)
  const injectionDetected = INJECTION_PATTERNS.some(p => p.test(str))
  if (injectionDetected) {
    // Log server-side but return a safe placeholder — don't expose the detection
    console.warn('[AI Sanitizer] Injection pattern detected in field:', field)
    str = '[input removed]'
    return { value: str, truncated: false, injectionDetected: true }
  }

  // 4. Enforce length limit
  const limit = FIELD_LIMITS[field] ?? FIELD_LIMITS.default
  const truncated = str.length > limit
  if (truncated) {
    str = str.slice(0, limit).trimEnd() + '...'
    console.warn('[AI Sanitizer] Field truncated:', field, 'original length was >', limit)
  }

  return { value: str, truncated, injectionDetected: false }
}

/**
 * Sanitize an object of fields. Returns cleaned values and an audit summary.
 * Throws with a user-safe message if any injection is detected.
 */
export function sanitizeAiFields<T extends Record<string, unknown>>(fields: T): { [K in keyof T]: string } {
  const result: Record<string, string> = {}
  for (const [key, val] of Object.entries(fields)) {
    if (val === null || val === undefined) { result[key] = ''; continue }
    const { value, injectionDetected } = sanitizeAiInput(val, key)
    if (injectionDetected) {
      throw new Error('Invalid input detected. Please revise your submission.')
    }
    result[key] = value
  }
  return result as { [K in keyof T]: string }
}
