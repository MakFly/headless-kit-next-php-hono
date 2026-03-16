import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { UserRound } from 'lucide-react'
import { createConversationFn } from '@/lib/services/support-service'

export function EscalationBanner() {
  const navigate = useNavigate()
  const [isEscalating, setIsEscalating] = useState(false)

  const handleEscalate = async () => {
    setIsEscalating(true)
    try {
      const result = await createConversationFn({
        data: {
          subject: 'Escalated from AI Chat',
          message: 'User requested human agent assistance.',
          priority: 'medium',
        },
      })
      navigate({ to: `/support/c/${result.id}` })
    } catch {
      setIsEscalating(false)
    }
  }

  return (
    <div className="flex items-center justify-center gap-3 border-t bg-muted/50 px-4 py-3">
      <span className="text-sm text-muted-foreground">Can&apos;t find what you need?</span>
      <Button variant="outline" size="sm" onClick={handleEscalate} disabled={isEscalating}>
        <UserRound className="mr-2 h-4 w-4" />
        {isEscalating ? 'Connecting...' : 'Talk to a human agent'}
      </Button>
    </div>
  )
}
