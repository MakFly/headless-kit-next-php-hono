import { Badge } from '@/components/ui/badge'

const techs = [
  'Next.js 16',
  'TanStack Start',
  'React 19',
  'TypeScript',
  'Tailwind CSS',
  'shadcn/ui',
  'Zustand',
  'Turborepo',
  'Laravel 12',
  'Symfony 8',
  'Hono + Bun',
  'Drizzle ORM',
]

export function TechStack() {
  return (
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <p className="mb-6 text-center font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">
        Built with
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {techs.map((tech) => (
          <Badge
            key={tech}
            variant="outline"
            className="border-[var(--neon-muted)]/20 bg-[var(--neon)]/5 px-3 py-1.5 text-xs font-mono hover:border-[var(--neon-muted)]/40 transition-colors"
          >
            {tech}
          </Badge>
        ))}
      </div>
    </section>
  )
}
