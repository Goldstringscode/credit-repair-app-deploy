"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, Menu, X } from "lucide-react"

// Shared header for public/pre-login pages (front page, pricing, login,
// signup, support, etc). Previously each of these pages either had its
// own ad-hoc header or none at all, and the one nav that did exist (on
// the front page) was wrapped in "hidden md:flex" with no mobile
// fallback at all, so mobile visitors had no way to reach pages like
// /pricing except by typing the URL directly. This component fixes
// that everywhere it is used: desktop keeps the full inline nav, and
// mobile gets an always-visible Pricing link plus a hamburger menu for
// the rest.
//
// "Billing" is intentionally not in this nav - it is a signed-in,
// per-user feature and lives in the dashboard sidebar instead, not in
// the public marketing nav a logged-out visitor sees.
const PUBLIC_NAV = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Pricing", href: "/pricing" },
  { name: "Support", href: "/support" },
]

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="flex items-center">
            <Shield className="h-8 w-8 text-blue-600 mr-3" />
            <span className="text-2xl font-bold text-gray-900">Merit Point AI</span>
          </Link>
          <nav className="hidden md:flex space-x-8">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.name} href={item.href} className="text-gray-600 hover:text-gray-900">
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            {/* Always visible on mobile, no menu tap required - pricing
                should be the single easiest thing to reach on this page. */}
            <Link href="/pricing" className="md:hidden text-sm font-semibold text-blue-600 hover:text-blue-700">
              Pricing
            </Link>
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 space-y-1">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={
                  item.name === "Pricing"
                    ? "block px-3 py-2 rounded-md text-blue-600 font-medium hover:bg-blue-50"
                    : "block px-3 py-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}
