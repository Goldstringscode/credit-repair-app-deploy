import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- module mocks (hoisted before imports) ---

const mockGetMLMUser = vi.fn()

vi.mock('@/lib/mlm/database-service', () => ({
  mlmDatabaseService: {
    getMLMUser: mockGetMLMUser,
  },
}))

vi.mock('@/lib/mlm/notification-system', () => ({
  mlmNotificationSystem: { sendNotification: vi.fn() },
}))

vi.mock('@/lib/mlm/commission-engine', () => ({
  mlmCommissionEngine: { checkRankAdvancement: vi.fn() },
}))

// Supabase mock — we expose `mockFrom` so individual tests can control it
const mockMaybySingle = vi.fn()
const mockEq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ from: mockFrom })),
}))

// --- helpers ---

/** Build a Supabase query-chain stub that resolves to `value`. */
function buildChain(value: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(value),
  }
  return chain
}

// --- tests ---

describe('MLMUserManager.validateUserEligibility', () => {
  // Use dynamic import so that env vars are read at instantiation time
  let manager: InstanceType<typeof import('@/lib/mlm/user-manager').MLMUserManager>

  beforeEach(async () => {
    vi.resetAllMocks()
    // Ensure Supabase is "configured" for these tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

    // Re-import to pick up fresh env vars / mocks
    vi.resetModules()
    const mod = await import('@/lib/mlm/user-manager')
    manager = new mod.MLMUserManager()
  })

  it('returns ineligible when user already exists in MLM system', async () => {
    mockGetMLMUser.mockResolvedValue({ id: 'mlm-existing' })

    // All Supabase checks pass
    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('User already exists in MLM system')
  })

  it('returns ineligible when user account is not active', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'inactive', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('User account is not active')
  })

  it('returns ineligible when user is not verified', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: false }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('User account is not verified')
  })

  it('returns ineligible when no active subscription exists', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: null, error: null }) // no active sub
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Active subscription required to join MLM program')
  })

  it('returns ineligible when MLM terms have not been accepted', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: null, error: null }) // terms not accepted
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('MLM program terms have not been accepted')
  })

  it('returns eligible with empty reasons when all checks pass', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('accumulates multiple failure reasons', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'inactive', is_verified: false }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: null, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: null, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('User account is not active')
    expect(result.reasons).toContain('User account is not verified')
    expect(result.reasons).toContain('Active subscription required to join MLM program')
    expect(result.reasons).toContain('MLM program terms have not been accepted')
  })

  it('skips Supabase checks gracefully when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY

    vi.resetModules()
    const mod = await import('@/lib/mlm/user-manager')
    const unconfiguredManager = new mod.MLMUserManager()

    mockGetMLMUser.mockResolvedValue(null)

    const result = await unconfiguredManager.validateUserEligibility('user-1')

    // Without Supabase, only the MLM duplicate check runs; no extra reasons
    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('skips active/verified check gracefully when users table is missing (42P01)', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: null, error: { code: '42P01', message: 'table not found' } })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    // users table missing → skipped; other checks pass → eligible
    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('skips subscription check gracefully when subscriptions table is missing (42P01)', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: null, error: { code: '42P01', message: 'table not found' } })
      if (table === 'user_agreements')
        return buildChain({ data: { id: 'agr-1' }, error: null })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('skips compliance check gracefully when user_agreements table is missing (42P01)', async () => {
    mockGetMLMUser.mockResolvedValue(null)

    mockFrom.mockImplementation((table: string) => {
      if (table === 'users')
        return buildChain({ data: { status: 'active', is_verified: true }, error: null })
      if (table === 'subscriptions')
        return buildChain({ data: { id: 'sub-1', status: 'active' }, error: null })
      if (table === 'user_agreements')
        return buildChain({ data: null, error: { code: '42P01', message: 'table not found' } })
      return buildChain({ data: null, error: null })
    })

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('returns validation error on unexpected exception', async () => {
    mockGetMLMUser.mockRejectedValue(new Error('DB connection failed'))

    const result = await manager.validateUserEligibility('user-1')

    expect(result.eligible).toBe(false)
    expect(result.reasons).toContain('Validation error')
  })
})
