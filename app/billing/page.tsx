import { redirect } from "next/navigation"

/**
 * This page used to be a separate, older billing view with its own copy of
 * subscription status logic (a fabricated 30-day period-end date instead of
 * the real one from Stripe, no real Customer Portal integration) and a
 * broken "View Plans" button (`<a href="#plans">` with no matching #plans
 * element anywhere on the page — clicking it did nothing). It also imported
 * a components/UserBillingEnhancements.tsx that no longer exists in the repo.
 *
 * /dashboard/billing is the real, fully wired version — same underlying
 * users.subscription_tier data, but with the real Stripe Customer Portal
 * for plan changes, cancellation, and payment methods, and no dead links.
 * Redirecting here instead of maintaining two competing billing pages.
 */
export default function BillingPage() {
  redirect("/dashboard/billing")
}
