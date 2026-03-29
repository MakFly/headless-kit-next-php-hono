"use client"

import { useAuthStore } from "@/stores/auth-store"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ShoppingBagIcon,
  RocketIcon,
  HeadphonesIcon,
  ArrowRightIcon,
  LayoutDashboardIcon,
  ServerIcon,
  ShieldCheckIcon,
  ZapIcon,
  DatabaseIcon,
  BoxIcon,
  ChevronRightIcon,
} from "lucide-react"

const presets = [
  {
    id: "shop",
    name: "Ecommerce",
    slug: "/shop",
    icon: ShoppingBagIcon,
    accent: "from-emerald-500 to-teal-500",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentBorder: "border-emerald-500/20 hover:border-emerald-500/40",
    accentGlow: "hover:shadow-emerald-500/10",
    accentBg: "bg-emerald-500/10",
    description: "Product catalog, cart, checkout, orders. Admin dashboard with analytics, inventory, customer management, and reviews.",
    features: ["Product CRUD", "Cart & Checkout", "Order Management", "Admin Analytics"],
    tier: "Simple → Medium → High",
  },
  {
    id: "saas",
    name: "SaaS",
    slug: "/saas",
    icon: RocketIcon,
    accent: "from-blue-500 to-cyan-500",
    accentText: "text-blue-600 dark:text-blue-400",
    accentBorder: "border-blue-500/20 hover:border-blue-500/40",
    accentGlow: "hover:shadow-blue-500/10",
    accentBg: "bg-blue-500/10",
    description: "Multi-tenant dashboard with billing, team management, usage analytics, and organization settings.",
    features: ["Billing & Plans", "Team Invites", "Usage Quotas", "Org Settings"],
    tier: "Full-featured",
  },
  {
    id: "support",
    name: "Support",
    slug: "/support",
    icon: HeadphonesIcon,
    accent: "from-orange-500 to-amber-500",
    accentText: "text-orange-600 dark:text-orange-400",
    accentBorder: "border-orange-500/20 hover:border-orange-500/40",
    accentGlow: "hover:shadow-orange-500/10",
    accentBg: "bg-orange-500/10",
    description: "Real-time chat support with agent queue, canned responses, CSAT ratings, and conversation management.",
    features: ["Live Chat", "Agent Dashboard", "Canned Responses", "CSAT Ratings"],
    tier: "Full-featured",
  },
]

const backends = [
  { name: "Laravel", port: "8000", icon: DatabaseIcon, color: "text-red-600 dark:text-red-400" },
  { name: "Symfony", port: "8002", icon: ShieldCheckIcon, color: "text-violet-600 dark:text-violet-400" },
  { name: "Hono", port: "8003", icon: ZapIcon, color: "text-emerald-600 dark:text-emerald-400" },
]

const techStack = [
  "Next.js 16", "TanStack Start", "React 19", "TypeScript",
  "Tailwind CSS", "shadcn/ui", "Zustand", "Turborepo",
  "Laravel 12", "Symfony 8", "Hono + Bun", "Drizzle ORM",
]

export default function Home() {
  const { user, isHydrated } = useAuthStore()
  const isAuthenticated = !!user

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-6 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return <AuthenticatedHome userName={user.name} />
  }

  return <LandingPage />
}

function AuthenticatedHome({ userName }: { userName: string }) {
  const quickLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboardIcon, gradient: "from-violet-600 to-indigo-600" },
    { name: "Shop", href: "/shop", icon: ShoppingBagIcon, gradient: "from-emerald-600 to-teal-600" },
    { name: "SaaS", href: "/saas", icon: RocketIcon, gradient: "from-blue-600 to-cyan-600" },
    { name: "Support", href: "/support", icon: HeadphonesIcon, gradient: "from-orange-600 to-amber-600" },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,color-mix(in oklch,var(--primary) 4%,transparent),transparent_50%)]" />

      <div className="relative max-w-5xl mx-auto px-6 py-24">
        <div className="space-y-2 mb-12">
          <p className="text-sm font-mono text-muted-foreground uppercase tracking-widest">Welcome back</p>
          <h1 className="text-4xl font-bold tracking-tight">
            {userName.split(" ")[0]}
            <span className="text-muted-foreground/30">.</span>
          </h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Card className="group border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg cursor-pointer">
                <CardContent className="p-6 space-y-4">
                  <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-lg`}>
                    <link.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">{link.name}</span>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Subtle background pattern */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,color-mix(in oklch,var(--border) 30%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in oklch,var(--border) 30%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] opacity-50" />

      {/* Gradient orb */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,color-mix(in oklch,var(--primary) 6%,transparent),transparent_70%)]" />

      {/* Nav */}
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-md bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <BoxIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-mono text-sm font-bold tracking-tight">headless-kit</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <a href="#presets">Explore Presets</a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/shop">Browse Demo</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="max-w-3xl space-y-8">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            v1.0 — 3 backends, 3 presets, 2 frontends
          </Badge>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
            Ship faster with
            <br />
            <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              production presets
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            A headless starter kit with ecommerce, SaaS, and support modules — pre-wired to Laravel, Symfony, or Hono. Pick a preset, choose a backend, start building.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Button size="lg" className="shadow-lg" asChild>
              <a href="#presets">
                Choose a Preset
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/shop">Browse Shop Demo</Link>
            </Button>
          </div>
        </div>

        {/* Terminal decoration */}
        <div className="hidden lg:block absolute right-6 top-32 w-80">
          <Card className="overflow-hidden shadow-2xl border-border/50">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border">
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
              <span className="ml-3 text-xs text-muted-foreground font-mono">terminal</span>
            </div>
            <CardContent className="p-4 font-mono text-xs space-y-1.5">
              <p className="text-muted-foreground">$ bunx create-headless-app</p>
              <p className="text-muted-foreground">
                <span className="text-emerald-600 dark:text-emerald-400">?</span> Preset:{" "}
                <span className="text-foreground font-semibold">ecommerce</span>
              </p>
              <p className="text-muted-foreground">
                <span className="text-blue-600 dark:text-blue-400">?</span> Backend:{" "}
                <span className="text-foreground font-semibold">laravel</span>
              </p>
              <p className="text-muted-foreground">
                <span className="text-orange-600 dark:text-orange-400">?</span> Frontend:{" "}
                <span className="text-foreground font-semibold">nextjs</span>
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 pt-1">&#10003; Project created in ./my-shop</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Presets */}
      <section id="presets" className="max-w-6xl mx-auto px-6 py-20 md:py-28 scroll-mt-16">
        <div className="mb-14">
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Modules</p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Three presets, infinite possibilities
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {presets.map((preset, i) => (
            <Link key={preset.id} href={preset.slug} className="block h-full">
              <Card
                className={`group ${preset.accentBorder} transition-all duration-500 hover:shadow-xl ${preset.accentGlow} cursor-pointer h-full`}
              >
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-start justify-between">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${preset.accent} flex items-center justify-center shadow-lg`}>
                      <preset.icon className="h-5 w-5 text-white" />
                    </div>
                    <ChevronRightIcon className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-all group-hover:translate-x-0.5" />
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-1.5">{preset.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{preset.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {preset.features.map((f) => (
                      <span key={f} className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${preset.accentBg} ${preset.accentText}`}>
                        {f}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-[11px] font-mono text-muted-foreground/60">{preset.tier}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Architecture */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Architecture</p>
            <h2 className="text-3xl font-bold tracking-tight mb-6">
              One frontend, any backend
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              The BFF pattern proxies all requests through your frontend. Switch backends
              with a single environment variable — your UI code stays identical.
            </p>

            <div className="space-y-3">
              {backends.map((b) => (
                <div key={b.name} className="flex items-center gap-4 py-3 px-4 rounded-lg border border-border/50 bg-card/50">
                  <b.icon className={`h-5 w-5 ${b.color}`} />
                  <div className="flex-1">
                    <span className="font-medium text-sm">{b.name}</span>
                  </div>
                  <code className="text-xs font-mono text-muted-foreground/60">:{b.port}</code>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-3">Diagram</p>
            <Card className="border-border/50">
              <CardContent className="p-6 font-mono text-xs">
                <div className="space-y-3 text-muted-foreground">
                  <p className="text-foreground font-semibold">Browser</p>
                  <p className="text-muted-foreground/40 pl-4">│</p>
                  <p className="pl-4">
                    <span className="text-muted-foreground/40">├─</span>{" "}
                    <span className="text-violet-600 dark:text-violet-400">Next.js BFF</span>{" "}
                    <span className="text-muted-foreground/40">:3001</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-muted-foreground/40">├─</span>{" "}
                    <span className="text-cyan-600 dark:text-cyan-400">TanStack</span>{" "}
                    <span className="text-muted-foreground/40">:3003</span>
                  </p>
                  <p className="text-muted-foreground/40 pl-4">│</p>
                  <p className="pl-4">
                    <span className="text-muted-foreground/40">└─▸</span>{" "}
                    <span className="text-red-600 dark:text-red-400">Laravel</span>{" "}
                    <span className="text-muted-foreground/40">:8000</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-muted-foreground/40">└─▸</span>{" "}
                    <span className="text-violet-600 dark:text-violet-400">Symfony</span>{" "}
                    <span className="text-muted-foreground/40">:8002</span>
                  </p>
                  <p className="pl-4">
                    <span className="text-muted-foreground/40">└─▸</span>{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">Hono</span>{" "}
                    <span className="text-muted-foreground/40">:8003</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center gap-3 text-muted-foreground">
              <ServerIcon className="h-4 w-4" />
              <p className="text-xs">Same API contract across all backends</p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* Tech Stack */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest mb-6 text-center">Built with</p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="px-3 py-1.5 text-xs font-mono">
              {tech}
            </Badge>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <Card className="overflow-hidden border-border/50">
          <CardContent className="p-12 md:p-16 text-center relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in oklch,var(--primary) 4%,transparent),transparent_70%)]" />
            <div className="relative space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Ready to build?
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Clone the repo, pick your preset and backend, and have a production-ready app in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button size="lg" asChild>
                  <a href="#presets">
                    Explore Presets
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BoxIcon className="h-3.5 w-3.5" />
            <span className="font-mono">headless-kit</span>
          </div>
          <p>Open Source Starter Kit</p>
        </div>
      </footer>
    </div>
  )
}
