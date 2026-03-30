import { useEffect, useState } from "react"
import { getMessages, type Locale } from "@/i18n"

type Heading = {
  depth: number
  slug: string
  text: string
}

export function TableOfContents({ headings, locale }: { headings: Heading[]; locale: Locale }) {
  const t = getMessages(locale)
  const [activeId, setActiveId] = useState<string>("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "-80px 0px -80% 0px" }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.slug)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [headings])

  return (
    <nav aria-label="Table of contents">
      <p className="mb-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        {t.docs.onThisPage}
      </p>
      <ul className="space-y-1">
        {headings.map((heading) => (
          <li key={heading.slug}>
            <a
              href={`#${heading.slug}`}
              className={`block text-xs leading-relaxed transition-colors ${
                heading.depth === 3 ? "pl-3" : ""
              } ${
                activeId === heading.slug
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
