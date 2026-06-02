'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BillingPaymentsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/admin/billing') }, [router])
  return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"/>
    </div>
  )
}