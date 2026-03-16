import { useState } from 'react'
import { SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

type ChatInputProps = {
  onSend: (content: string) => Promise<void>
  disabled?: boolean
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || isSending) return
    setIsSending(true)
    try {
      await onSend(trimmed)
      setContent('')
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex gap-2 p-4 border-t">
      <Textarea
        placeholder="Type your message..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isSending}
        className="min-h-[40px] max-h-[120px] resize-none"
        rows={1}
      />
      <Button
        size="icon"
        onClick={handleSend}
        disabled={disabled || isSending || !content.trim()}
      >
        <SendIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
