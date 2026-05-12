import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  return NextResponse.redirect(new URL('/email-test.html', 'https://placeholder.com'), {
    headers: { 'Location': '/email-test.html' },
    status: 302,
  })
}
