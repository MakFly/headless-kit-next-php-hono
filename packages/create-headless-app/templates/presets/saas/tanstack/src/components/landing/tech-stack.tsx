import { Badge } from '@/components/ui/badge'

const techs = [
  'TanStack Start',
  'React 19',
  'Vite 7',
  'TypeScript',
  'Tailwind CSS v4',
  'shadcn/ui',
  'Zustand',
]

export function TechStack() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <h2 className="mb-8 text-center font-mono text-2xl font-bold tracking-tight">
        Tech Stack
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {techs.map((tech, i) => (
          <div key={tech} className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-[var(--neon-muted)]/30 bg-[var(--neon)]/5 px-3 py-1 text-sm"
            >
              {tech}
            </Badge>
            {i < techs.length - 1 && (
              <span className="text-[var(--neon)]/40 text-xs">&#x2022;</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
