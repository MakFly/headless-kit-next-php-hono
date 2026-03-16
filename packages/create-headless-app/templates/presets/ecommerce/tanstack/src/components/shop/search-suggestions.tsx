import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search, X, ArrowRight, LoaderIcon } from 'lucide-react'
import { getProductsFn } from '@/lib/services/shop-service'
import type { Product } from '@/types/shop'

type SearchSuggestionsProps = {
  onClose: () => void
}

const quickLinks = [
  { label: 'New In', to: '/shop?sort=newest' },
  { label: 'Clothing', to: '/shop/categories/clothing' },
  { label: 'Beauty', to: '/shop/categories/beauty' },
  { label: 'Accessories', to: '/shop/categories/accessories' },
  { label: 'Sale', to: '/shop?sort=price_asc' },
]

const trendingSearches = ['Linen', 'Cashmere', 'Summer collection', 'Silk', 'Organic']

export function SearchSuggestions({ onClose }: SearchSuggestionsProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true))
    })
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(timer)
    }
  }, [mounted])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const response = await getProductsFn({ data: { filters: { search: query, perPage: '8' } } })
        setResults(response.data)
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleClose = useCallback(() => {
    setMounted(false)
    setTimeout(() => onClose(), 350)
  }, [onClose])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  const navigateAndClose = useCallback(
    (to: string) => {
      navigate({ to })
      handleClose()
    },
    [navigate, handleClose],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      navigateAndClose(`/shop?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const hasQuery = query.length >= 2
  const showResults = hasQuery && !isLoading && results.length > 0
  const showEmpty = hasQuery && !isLoading && results.length === 0

  return (
    <div className="fixed inset-0 z-[100] flex flex-col" role="dialog" aria-modal="true">
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-350 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-hidden="true"
      />
      <div
        className={`relative z-10 w-full bg-white transition-all duration-350 ease-out ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 sm:px-8">
          <span className="text-[10px] tracking-[0.25em] uppercase text-stone-400">Search</span>
          <button type="button" onClick={handleClose} className="flex h-8 w-8 items-center justify-center text-stone-400 transition-colors hover:text-stone-900">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-6 pt-4 sm:px-8">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-300" />
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border-0 border-b border-stone-200 bg-transparent py-3 pl-8 pr-4 text-lg font-light tracking-wide text-stone-900 outline-none placeholder:text-stone-300 transition-colors focus:border-stone-900 sm:text-xl"
                autoComplete="off"
              />
              {query && (
                <button type="button" onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-stone-300 transition-colors hover:text-stone-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="mx-auto max-w-3xl px-6 pb-10 sm:px-8">
          {!hasQuery && (
            <div>
              <div className="mb-8">
                <h3 className="mb-4 text-[10px] tracking-[0.2em] uppercase text-stone-400">Quick Links</h3>
                <div className="flex flex-wrap gap-2">
                  {quickLinks.map((link) => (
                    <button key={link.label} type="button" onClick={() => navigateAndClose(link.to)} className="group/pill flex items-center gap-1.5 border border-stone-200 px-4 py-2 text-xs tracking-[0.1em] uppercase text-stone-600 transition-all duration-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white">
                      {link.label}
                      <ArrowRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover/pill:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="mb-4 text-[10px] tracking-[0.2em] uppercase text-stone-400">Trending</h3>
                <ul className="space-y-0">
                  {trendingSearches.map((term) => (
                    <li key={term}>
                      <button type="button" onClick={() => { setQuery(term); inputRef.current?.focus() }} className="flex w-full items-center gap-3 py-2.5 text-left text-sm tracking-wide text-stone-500 hover:text-stone-900 transition-colors">
                        <Search className="h-3.5 w-3.5 shrink-0 text-stone-300" />
                        <span>{term}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {isLoading && hasQuery && (
            <div className="flex items-center gap-3 py-8">
              <LoaderIcon className="size-4 animate-spin text-stone-400" />
              <span className="text-xs tracking-[0.15em] uppercase text-stone-400">Searching</span>
            </div>
          )}

          {showResults && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone-400">Products</h3>
                <button type="button" onClick={() => navigateAndClose(`/shop?search=${encodeURIComponent(query)}`)} className="group/link flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-stone-400 transition-colors hover:text-stone-900">
                  View all
                  <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4">
                {results.map((product) => {
                  const imageUrl = product.imageUrl || `https://picsum.photos/seed/${product.slug}/320/400`
                  const price = (product.price / 100).toFixed(2)
                  return (
                    <button key={product.id} type="button" onClick={() => navigateAndClose(`/shop/${product.slug}`)} className="group/card shrink-0 text-left" style={{ width: 'clamp(140px, 30vw, 180px)' }}>
                      <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-2.5">
                        <img src={imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105" />
                      </div>
                      {product.category && <p className="text-[9px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">{product.category.name}</p>}
                      <p className="text-xs tracking-wide text-stone-900 truncate">{product.name}</p>
                      <span className="text-xs text-stone-600">${price}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {showEmpty && (
            <div className="py-12 text-center">
              <p className="text-sm tracking-wide text-stone-400">No results for &ldquo;<span className="text-stone-600">{query}</span>&rdquo;</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {quickLinks.map((link) => (
                  <button key={link.label} type="button" onClick={() => navigateAndClose(link.to)} className="border border-stone-200 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase text-stone-500 transition-all duration-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white">
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
