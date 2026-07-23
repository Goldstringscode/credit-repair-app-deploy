import { type NextRequest, NextResponse } from "next/server"

/**
 * MLM checkout is gated off.
 *
 * The previous version of this route accepted raw cardNumber/expiryDate/cvv
 * fields directly in the request body and only simulated payment processing
 * ("In production, you would integrate with Stripe here") — meaning a real
 * frontend form was collecting and transmitting raw cardholder data to this
 * server with no real charge ever happening behind it. That's a PCI-DSS
 * violation independent of whether a charge succeeds. The MLM program isn't
 * currently accepting paid sign-ups (see app/mlm/checkout/page.tsx, gated
 * the same way), so this endpoint now does nothing but decline the request
 * — it never reads or logs a request body, so no card data can reach it.
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: "MLM sign-ups are not currently available" },
    { status: 410 }
  )
}
