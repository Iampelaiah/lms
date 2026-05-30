'use client'

import { useState } from 'react'
import { enrollInSubject } from '@/app/actions/lms'
import { Loader2 } from 'lucide-react'

export function EnrollButton({ subjectId }: { subjectId: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleEnroll = async () => {
    setIsPending(true)
    const result = await enrollInSubject(subjectId)
    setIsPending(false)
    if (result.error) {
      alert(result.error)
    }
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={isPending}
      className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isPending ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Enrolling...
        </>
      ) : (
        'Enroll'
      )}
    </button>
  )
}
