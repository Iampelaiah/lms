'use client'

import { useState } from 'react'
import { updateEnrollmentStatus } from '@/app/actions/lms'
import { Check, X, Loader2 } from 'lucide-react'

export function ActionButtons({ enrollmentId }: { enrollmentId: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleAction = async (status: 'approved' | 'rejected') => {
    setIsPending(true)
    const result = await updateEnrollmentStatus(enrollmentId, status)
    setIsPending(false)
    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approved')}
        disabled={isPending}
        className="p-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-lg transition-colors disabled:opacity-50"
        title="Approve"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={isPending}
        className="p-2 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-lg transition-colors disabled:opacity-50"
        title="Reject"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
      </button>
    </div>
  )
}
