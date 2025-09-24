'use client'

import { AuthWrapper } from '@/components/billing/AuthWrapper'

export default function TestAuthPage() {
  return (
    <div>
      <h1>Test Auth Page</h1>
      <AuthWrapper>
        <div>
          <h2>This content should only show when authenticated</h2>
          <p>If you can see this, the AuthWrapper is working correctly!</p>
        </div>
      </AuthWrapper>
    </div>
  )
}
