import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowRight } from 'lucide-react'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) setSubmitted(true)
  }

  return (
    <section className="bg-stone-100 py-20 sm:py-24 px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-3 text-[11px] tracking-[0.35em] uppercase text-stone-400">
          Stay in the know
        </p>
        <h2 className="mb-3 font-serif text-3xl text-stone-900 sm:text-4xl">
          Join the List
        </h2>
        <p className="mb-8 text-sm leading-relaxed text-stone-500">
          Be the first to discover new arrivals, exclusive offers, and curated
          styling inspiration.
        </p>
        {submitted ? (
          <p className="text-sm text-stone-600">Thank you for subscribing.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto flex max-w-sm gap-0">
            <Input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 rounded-none border-stone-300 bg-white text-sm placeholder:text-stone-400 focus-visible:ring-stone-400 focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              className="rounded-none bg-stone-900 hover:bg-stone-800 px-5"
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </section>
  )
}
