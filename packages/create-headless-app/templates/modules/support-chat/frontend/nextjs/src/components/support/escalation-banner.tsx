'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { UserRound } from 'lucide-react'
import { escalateToHumanAction } from '@/lib/actions/support/ai'

export function EscalationBanner() {
  const router = useRouter()
  const [isEscalating, setIsEscalating] = useState(false)

  const handleEscalate = async () => {
    setIsEscalating(true)
    try {
      const result = await escalateToHumanAction({
        subject: 'Escalated from AI Chat',
        messages: [],
        priority: 'medium',
      })
      router.push(`/support/${result.id}`)
    } catch {
      setIsEscalating(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 border-t bg-muted/50 px-4 py-3">
      <span className="text-sm text-muted-foreground">Can&apos;t find what you need?</span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleEscalate}
        disabled={isEscalating}
      >
        <UserRound className="mr-2 h-4 w-4" />
        {isEscalating ? 'Connecting...' : 'Talk to a human agent'}
      </Button>
    </div>
  )
}
