import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
import { middleware } from '../../middleware'

const JWT_SECRET = 'ci-dummy-jwt-secret-at-least-32-chars-long'

function makeRequest(path: string, cookieHeader?: string): NextRequest {
  const url = new URL(path, 'http://localhost').toString()
  const headers = new Headers()
  if (cookieHeader) {
    headers.set('Cookie', cookieHeader)
  }
  return new NextRequest(url, { headers })
}

function makeToken(payload: object, expiresIn = '1h'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any)
}

beforeEach(() => {
  process.env.JWT_SECRET = JWT_SECRET
})

describe('middleware', () => {
  describe('public routes', () => {
    it('allows /login through without auth', () => {
      const req = makeRequest('/login')
      const res = middleware(req)
      expect(res.status).not.toBe(307)
      expect(res.status).not.toBe(302)
    })

    it('allows /api/auth/login through without auth', () => {
      const req = makeRequest('/api/auth/login')
      const res = middleware(req)
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(307)
    })

    it('allows /signup through without auth', () => {
      const req = makeRequest('/signup')
      const res = middleware(req)
      expect(res.status).not.toBe(307)
      expect(res.status).not.toBe(302)
    })
  })

  describe('protected page routes', () => {
    it('redirects /dashboard to /login when no token', () => {
      const req = makeRequest('/dashboard')
      const res = middleware(req)
      expect([302, 307]).toContain(res.status)
      const location = res.headers.get('location') ?? ''
      expect(location).toContain('/login')
    })

    it('allows /dashboard through with a valid auth-token cookie', () => {
      const token = makeToken({ userId: 'user-1', email: 'test@test.com', role: 'user' })
      const req = makeRequest('/dashboard', `auth-token=${token}`)
      const res = middleware(req)
      expect([302, 307]).not.toContain(res.status)
    })
  })

  describe('protected API routes', () => {
    it('returns 401 for /api/mlm/payouts with no token', async () => {
      const req = makeRequest('/api/mlm/payouts')
      const res = middleware(req)
      expect(res.status).toBe(401)
      const body = await res.json()
      expect(body).toMatchObject({ success: false, error: 'Unauthorized' })
    })

    it('returns 403 for /api/admin/users with non-admin role', async () => {
      const token = makeToken({ userId: 'user-1', email: 'test@test.com', role: 'user' })
      const req = makeRequest('/api/admin/users', `auth-token=${token}`)
      const res = middleware(req)
      expect(res.status).toBe(403)
    })

    it('allows /api/admin/users through with admin role', () => {
      const token = makeToken({ userId: 'admin-1', email: 'admin@test.com', role: 'admin' })
      const req = makeRequest('/api/admin/users', `auth-token=${token}`)
      const res = middleware(req)
      expect(res.status).not.toBe(401)
      expect(res.status).not.toBe(403)
    })
  })

  describe('debug/test routes', () => {
    it('returns 404 for /api/stripe/test/connection', async () => {
      const req = makeRequest('/api/stripe/test/connection')
      const res = middleware(req)
      expect(res.status).toBe(404)
    })

    it('returns 404 for /api/test/anything', async () => {
      const req = makeRequest('/api/test/anything')
      const res = middleware(req)
      expect(res.status).toBe(404)
    })
  })

  describe('identity headers', () => {
    it('sets x-user-id header on authenticated requests', () => {
      const token = makeToken({ userId: 'user-abc', email: 'test@test.com', role: 'user' })
      const req = makeRequest('/dashboard', `auth-token=${token}`)
      const res = middleware(req)
      expect(res.headers.get('x-user-id')).toBe('user-abc')
    })
  })
})
