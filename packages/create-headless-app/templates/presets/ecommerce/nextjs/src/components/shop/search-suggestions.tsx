'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, ArrowRight, LoaderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getProductsAction } from '@/lib/actions/shop/products';
import type { Product } from '@/types/shop';

type SearchSuggestionsProps = {
  onClose: () => void;
};

const quickLinks = [
  { label: 'New In', href: '/shop?sort=newest' },
  { label: 'Clothing', href: '/shop/categories/clothing' },
  { label: 'Beauty', href: '/shop/categories/beauty' },
  { label: 'Accessories', href: '/shop/categories/accessories' },
  { label: 'Sale', href: '/shop?sort=price_asc' },
];

const trendingSearches = [
  'Linen',
  'Cashmere',
  'Summer collection',
  'Silk',
  'Organic',
];

export function SearchSuggestions({ onClose }: SearchSuggestionsProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Animation mount
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Auto-focus after animation
  useEffect(() => {
    if (mounted) {
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [mounted]);

  // Debounced search — set loading immediately to avoid "No results" flash
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await getProductsAction({ search: query, perPage: 8 });
        setResults(response.data);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close with animation
  const handleClose = useCallback(() => {
    setMounted(false);
    setTimeout(() => onClose(), 350);
  }, [onClose]);

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const navigateAndClose = useCallback(
    (href: string) => {
      router.push(href);
      handleClose();
    },
    [router, handleClose],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigateAndClose(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  // Build navigable items for keyboard
  const navItems: { label: string; href: string }[] = [];
  if (query.length >= 2 && results.length > 0) {
    results.forEach((p) =>
      navItems.push({ label: p.name, href: `/shop/${p.slug}` }),
    );
  } else if (query.length < 2) {
    trendingSearches.forEach((t) =>
      navItems.push({
        label: t,
        href: `/shop?search=${encodeURIComponent(t)}`,
      }),
    );
  }

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (navItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < navItems.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : navItems.length - 1,
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const item = navItems[activeIndex];
      if (item) navigateAndClose(item.href);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement | undefined;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  const highlightMatch = (text: string, q: string) => {
    if (!q || q.length < 2) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-stone-900 font-medium">
          {text.slice(idx, idx + q.length)}
        </span>
        {text.slice(idx + q.length)}
      </>
    );
  };

  const hasQuery = query.length >= 2;
  const showResults = hasQuery && !isLoading && results.length > 0;
  const showEmpty = hasQuery && !isLoading && results.length === 0;

  // Split results: first 4 as suggestion list, rest as product cards
  const suggestionResults = results.slice(0, 4);
  const productResults = results;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-350',
          mounted ? 'opacity-100' : 'opacity-0'
        )}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Search panel */}
      <div
        className={cn(
          'relative z-10 w-full bg-white transition-all duration-350 ease-out',
          mounted
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
        )}
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        {/* Top bar with close */}
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 pt-6 sm:px-8">
          <span className="text-[10px] tracking-[0.25em] uppercase text-stone-400">
            Search
          </span>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center text-stone-400 transition-colors hover:text-stone-900"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="mx-auto max-w-3xl px-6 pb-6 pt-4 sm:px-8">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Search className="absolute left-0 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-300" />
              <input
                ref={inputRef}
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleInputKeyDown}
                className="w-full border-0 border-b border-stone-200 bg-transparent py-3 pl-8 pr-4 text-lg font-light tracking-wide text-stone-900 outline-none placeholder:text-stone-300 transition-colors focus:border-stone-900 sm:text-xl"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setActiveIndex(-1);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-stone-300 transition-colors hover:text-stone-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Content area with transitions */}
        <div className="mx-auto max-w-3xl px-6 pb-10 sm:px-8">
          {/* Idle state: Quick Links + Trending */}
          <div
            className={cn(
              'transition-all duration-300',
              !hasQuery
                ? 'translate-y-0 opacity-100'
                : 'pointer-events-none absolute translate-y-2 opacity-0'
            )}
          >
            {/* Quick Links */}
            <div className="mb-8">
              <h3 className="mb-4 text-[10px] tracking-[0.2em] uppercase text-stone-400">
                Quick Links
              </h3>
              <div className="flex flex-wrap gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => navigateAndClose(link.href)}
                    className="group/pill flex items-center gap-1.5 border border-stone-200 px-4 py-2 text-xs tracking-[0.1em] uppercase text-stone-600 transition-all duration-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  >
                    {link.label}
                    <ArrowRight className="h-3 w-3 opacity-0 transition-all duration-200 group-hover/pill:opacity-100" />
                  </button>
                ))}
              </div>
            </div>

            {/* Trending searches */}
            <div>
              <h3 className="mb-4 text-[10px] tracking-[0.2em] uppercase text-stone-400">
                Trending
              </h3>
              <ul ref={!hasQuery ? listRef : undefined} className="space-y-0">
                {trendingSearches.map((term, i) => (
                  <li key={term}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(term);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 py-2.5 text-left text-sm tracking-wide transition-colors',
                        activeIndex === i
                          ? 'text-stone-900'
                          : 'text-stone-500 hover:text-stone-900'
                      )}
                    >
                      <Search className="h-3.5 w-3.5 shrink-0 text-stone-300" />
                      <span>{term}</span>
                      {activeIndex === i && (
                        <ArrowRight className="ml-auto h-3.5 w-3.5 text-stone-400" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && hasQuery && (
            <div className="flex items-center gap-3 py-8">
              <LoaderIcon
                role="status"
                aria-label="Loading"
                className="size-4 animate-spin text-stone-400"
              />
              <span className="text-xs tracking-[0.15em] uppercase text-stone-400">
                Searching
              </span>
            </div>
          )}

          {/* Results state */}
          {showResults && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Suggestion list */}
              <div className="mb-8">
                <h3 className="mb-3 text-[10px] tracking-[0.2em] uppercase text-stone-400">
                  Suggestions
                </h3>
                <ul ref={hasQuery ? listRef : undefined} className="space-y-0">
                  {suggestionResults.map((product, i) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        onClick={() =>
                          navigateAndClose(`/shop/${product.slug}`)
                        }
                        className={cn(
                          'flex w-full items-center gap-3 py-2.5 text-left text-sm tracking-wide transition-all duration-150',
                          activeIndex === i
                            ? 'bg-stone-50 text-stone-900 -mx-3 px-3'
                            : 'text-stone-500 hover:text-stone-900'
                        )}
                      >
                        <Search className="h-3.5 w-3.5 shrink-0 text-stone-300" />
                        <span>
                          {highlightMatch(product.name, query)}
                        </span>
                        {product.category && (
                          <span className="ml-auto text-[10px] tracking-[0.15em] uppercase text-stone-300">
                            {product.category.name}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Product cards — horizontal scroll */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] tracking-[0.2em] uppercase text-stone-400">
                    Products
                  </h3>
                  <button
                    type="button"
                    onClick={() =>
                      navigateAndClose(
                        `/shop?search=${encodeURIComponent(query)}`,
                      )
                    }
                    className="group/link flex items-center gap-1 text-[10px] tracking-[0.15em] uppercase text-stone-400 transition-colors hover:text-stone-900"
                  >
                    View all
                    <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
                  </button>
                </div>

                <div className="-mx-6 px-6 sm:-mx-8 sm:px-8">
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                    {productResults.map((product, i) => {
                      const imageUrl =
                        product.imageUrl ||
                        `https://picsum.photos/seed/${product.slug}/320/400`;
                      const price = (product.price / 100).toFixed(2);
                      const comparePrice = product.compareAtPrice
                        ? (product.compareAtPrice / 100).toFixed(2)
                        : null;

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() =>
                            navigateAndClose(`/shop/${product.slug}`)
                          }
                          className="group/card shrink-0 text-left transition-opacity duration-300"
                          style={{
                            width: 'clamp(140px, 30vw, 180px)',
                            animationDelay: `${i * 60}ms`,
                          }}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 mb-2.5">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/card:scale-105"
                            />
                            {product.compareAtPrice &&
                              product.compareAtPrice > product.price && (
                                <span className="absolute left-2 top-2 bg-stone-900 px-2 py-0.5 text-[8px] tracking-[0.15em] uppercase text-white">
                                  Sale
                                </span>
                              )}
                          </div>
                          {product.category && (
                            <p className="text-[9px] tracking-[0.15em] uppercase text-stone-400 mb-0.5">
                              {product.category.name}
                            </p>
                          )}
                          <p className="text-xs tracking-wide text-stone-900 truncate leading-snug">
                            {product.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <span
                              className={`text-xs ${comparePrice ? 'text-red-700' : 'text-stone-600'}`}
                            >
                              ${price}
                            </span>
                            {comparePrice && (
                              <span className="text-[10px] text-stone-400 line-through">
                                ${comparePrice}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {showEmpty && (
            <div className="py-12 text-center">
              <p className="text-sm tracking-wide text-stone-400">
                No results for &ldquo;
                <span className="text-stone-600">{query}</span>
                &rdquo;
              </p>
              <p className="mt-2 text-xs tracking-wide text-stone-300">
                Try a different search or browse our collections
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {quickLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => navigateAndClose(link.href)}
                    className="border border-stone-200 px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase text-stone-500 transition-all duration-200 hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
