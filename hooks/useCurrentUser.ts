"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: string
  subscriptionId?: string
  customerId?: string
  createdAt: string
  updatedAt: string
}

interface UseCurrentUserResult {
  user: CurrentUser | null
  isLoading: boolean
  initials: string
}

export function useCurrentUser(): UseCurrentUserResult {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" })
        if (res.status === 401) {
          if (!cancelled) {
            router.push("/login")
          }
          return
        }
        if (res.ok) {
          const json = await res.json() as { success: boolean; user?: CurrentUser }
          if (!cancelled && json.success && json.user) {
            setUser(json.user)
          }
        }
      } catch (err) {
        // Network error — leave user as null
        console.error('Failed to fetch current user:', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void fetchUser()
    return () => { cancelled = true }
  }, [router])

  const initials = user
    ? user.name
        .split(" ")
        .map((part) => part[0] ?? "")
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : ""

  return { user, isLoading, initials }
}
