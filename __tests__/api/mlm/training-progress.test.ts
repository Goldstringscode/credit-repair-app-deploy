import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => {
  const maybeSingleMock = vi.fn().mockResolvedValue({ data: { id: 1, lesson_id: 'lesson-1' }, error: null })
  const selectAfterUpsertMock = vi.fn().mockReturnValue({ maybeSingle: maybeSingleMock })
  const upsertMock = vi.fn().mockReturnValue({ select: selectAfterUpsertMock })

  const eqMock2 = vi.fn().mockResolvedValue({ data: [], error: null })
  const eqMock1 = vi.fn().mockReturnValue({ eq: eqMock2 })
  const selectMock = vi.fn().mockReturnValue({ eq: eqMock1 })

  const fromMock = vi.fn(() => ({
    upsert: upsertMock,
    select: selectMock,
  }))

  return {
    createClient: vi.fn(() => ({
      from: fromMock,
    })),
  }
})

// Mock jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn((token: string) => {
      if (token === 'invalid') throw new Error('invalid token')
      return { userId: 'user-123' }
    }),
  },
}))

beforeEach(() => {
  process.env.JWT_SECRET = 'ci-dummy-jwt-secret-at-least-32-chars-long'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://placeholder.supabase.co'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'placeholder-service-role-key'
})

describe('POST /api/mlm/training/progress', () => {
  it('saves progress and returns success when authenticated', async () => {
    const { POST } = await import('../../../app/api/mlm/training/progress/route')

    const req = new NextRequest('http://localhost/api/mlm/training/progress', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Cookie: 'auth-token=valid-token',
      }),
      body: JSON.stringify({
        lesson_id: 'lesson-1',
        course_id: 'course-1',
        completed_at: new Date().toISOString(),
      }),
    })

    const res = await POST(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 401 when token is invalid', async () => {
    const { POST } = await import('../../../app/api/mlm/training/progress/route')

    const req = new NextRequest('http://localhost/api/mlm/training/progress', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Cookie: 'auth-token=invalid',
      }),
      body: JSON.stringify({
        lesson_id: 'lesson-1',
        course_id: 'course-1',
      }),
    })

    const res = await POST(req)
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body).toMatchObject({ success: false, error: 'Unauthorized' })
  })

  it('returns 400 when course_id is missing', async () => {
    const { POST } = await import('../../../app/api/mlm/training/progress/route')

    const req = new NextRequest('http://localhost/api/mlm/training/progress', {
      method: 'POST',
      headers: new Headers({
        'Content-Type': 'application/json',
        Cookie: 'auth-token=valid-token',
      }),
      body: JSON.stringify({ lesson_id: 'lesson-1' }),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})

describe('GET /api/mlm/training/progress', () => {
  it('returns progress array when authenticated', async () => {
    const { GET } = await import('../../../app/api/mlm/training/progress/route')

    const req = new NextRequest('http://localhost/api/mlm/training/progress?course_id=course-1', {
      method: 'GET',
      headers: new Headers({
        Cookie: 'auth-token=valid-token',
      }),
    })

    const res = await GET(req)
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body.success).toBe(true)
    expect(Array.isArray(body.data)).toBe(true)
  })

  it('returns 401 when not authenticated', async () => {
    const { GET } = await import('../../../app/api/mlm/training/progress/route')

    const req = new NextRequest('http://localhost/api/mlm/training/progress', {
      method: 'GET',
      headers: new Headers({
        Cookie: 'auth-token=invalid',
      }),
    })

    const res = await GET(req)
    expect(res.status).toBe(401)
  })
})
