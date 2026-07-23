'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'

/**
 * MLM checkout is gated off. The previous version of this page collected
 * raw card number/expiry/CVV into plain form state and posted it directly
 * to /api/mlm/checkout, which only simulated payment processing — a live
 * PCI-compliance risk with no corresponding real payment behind it. The
 * MLM program isn't currently accepting paid sign-ups, so this page no
 * longer renders any payment form at all rather than leaving that exposure
 * live. See app/api/mlm/checkout/route.ts, which is gated the same way.
 */
export default function MLMCheckoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            Sign-ups Currently Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This program isn't currently accepting new sign-ups. Please check back later.
          </p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
