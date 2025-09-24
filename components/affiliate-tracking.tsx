"use client"

import { useEffect } from "react"

interface AffiliateTrackingProps {
  referralCode?: string
}

export function AffiliateTracking({ referralCode }: AffiliateTrackingProps) {
  useEffect(() => {
    // Track affiliate referral
    if (referralCode) {
      // Store referral code in localStorage or cookie
      localStorage.setItem("affiliateReferral", referralCode)

      // Track the referral visit
      fetch("/api/affiliate/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          referralCode,
          action: "visit",
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          referrer: document.referrer,
        }),
      }).catch(console.error)
    }
  }, [referralCode])

  return null // This component doesn't render anything
}

export function trackAffiliateConversion(userId: string, subscriptionTier: string, amount: number) {
  const referralCode = localStorage.getItem("affiliateReferral")

  if (referralCode) {
    fetch("/api/affiliate/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referralCode,
        action: "conversion",
        userId,
        subscriptionTier,
        amount,
        timestamp: new Date().toISOString(),
      }),
    }).catch(console.error)

    // Clear the referral code after conversion
    localStorage.removeItem("affiliateReferral")
  }
}
