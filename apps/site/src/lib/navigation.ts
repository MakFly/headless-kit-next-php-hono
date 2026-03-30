export type NavSection = {
  slug: string
  label: string
  color: string
  items: NavItem[]
}

export type NavItem = {
  slug: string
  label: string
}

export const navigation: NavSection[] = [
  {
    slug: "getting-started",
    label: "Getting Started",
    color: "cyber-green",
    items: [
      { slug: "getting-started/installation", label: "Installation" },
      { slug: "getting-started/project-structure", label: "Project Structure" },
      { slug: "getting-started/configuration", label: "Configuration" },
    ],
  },
  {
    slug: "architecture",
    label: "Architecture",
    color: "cyber-cyan",
    items: [
      { slug: "architecture/bff-pattern", label: "BFF Pattern" },
      { slug: "architecture/auth-flow", label: "Auth Flow" },
      { slug: "architecture/adapters", label: "Adapters" },
      { slug: "architecture/vertical-slice", label: "Vertical Slice" },
    ],
  },
  {
    slug: "backends",
    label: "Backends",
    color: "cyber-magenta",
    items: [
      { slug: "backends/laravel", label: "Laravel" },
      { slug: "backends/symfony", label: "Symfony" },
      { slug: "backends/hono", label: "Hono" },
    ],
  },
  {
    slug: "modules",
    label: "Modules",
    color: "cyber-amber",
    items: [
      { slug: "modules/shop", label: "Shop" },
      { slug: "modules/admin", label: "Admin" },
      { slug: "modules/saas", label: "SaaS" },
      { slug: "modules/support", label: "Support" },
    ],
  },
  {
    slug: "cli",
    label: "CLI",
    color: "cyber-green",
    items: [
      { slug: "cli/getting-started", label: "Getting Started" },
      { slug: "cli/presets", label: "Presets" },
    ],
  },
  {
    slug: "guides",
    label: "Guides",
    color: "cyber-cyan",
    items: [
      { slug: "guides/authentication", label: "Authentication" },
      { slug: "guides/tanstack-start", label: "TanStack Start" },
      { slug: "guides/rbac", label: "RBAC" },
      { slug: "guides/two-factor", label: "Two-Factor Auth" },
      { slug: "guides/oauth", label: "OAuth" },
      { slug: "guides/custom-adapter", label: "Custom Adapter" },
    ],
  },
  {
    slug: "deploy",
    label: "Deploy",
    color: "cyber-magenta",
    items: [
      { slug: "deploy/docker", label: "Docker" },
      { slug: "deploy/production", label: "Production" },
    ],
  },
]

export function getFlatNav(): NavItem[] {
  return navigation.flatMap((s) => s.items)
}

export function getPrevNext(slug: string) {
  const flat = getFlatNav()
  const idx = flat.findIndex((item) => item.slug === slug)
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  }
}

export function getSectionForSlug(slug: string): NavSection | undefined {
  return navigation.find((s) => slug.startsWith(s.slug))
}
