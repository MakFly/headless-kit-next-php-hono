import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Server, Zap, Shield, Database, LogIn, Info } from 'lucide-react';

/**
 * Demo home page
 *
 * Overview of available backend demos
 */
export default function DemoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Backend Demos</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Test different backend implementations independently. Each demo uses its own
            authentication adapter and API endpoints.
          </p>
        </div>

        {/* Auth Info Card */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              Authentification générique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              L'authentification est isolée par backend via
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">/laravel</code>,
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">/symfony</code> et
              <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs">/hono</code>.
            </p>
            <div className="flex gap-3">
              <Button asChild size="sm" variant="outline" className="border-blue-200 hover:bg-blue-100">
                <Link href="/laravel">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login Laravel
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-blue-200 hover:bg-blue-100">
                <Link href="/symfony">
                  Login Symfony
                </Link>
              </Button>
              <Button asChild size="sm" variant="outline" className="border-blue-200 hover:bg-blue-100">
                <Link href="/hono">Login Hono</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backend Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {/* Laravel Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-red-300 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-red-200 text-red-700">
                  Port 8000
                </Badge>
              </div>
              <div>
                <CardTitle className="text-xl">Laravel + Sanctum</CardTitle>
                <CardDescription className="mt-2">
                  Laravel backend with Sanctum authentication.
                  Uses HMAC signing and HttpOnly cookies.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Laravel 11</Badge>
                <Badge variant="secondary" className="text-xs">Sanctum</Badge>
                <Badge variant="secondary" className="text-xs">HMAC</Badge>
                <Badge variant="secondary" className="text-xs">RBAC</Badge>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full bg-red-600 hover:bg-red-700">
                  <Link href="/demo/laravel/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Symfony Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-violet-300 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-purple-500" />
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-violet-200 text-violet-700">
                  Port 8002
                </Badge>
              </div>
              <div>
                <CardTitle className="text-xl">Symfony + BetterAuth</CardTitle>
                <CardDescription className="mt-2">
                  Symfony 8 backend with BetterAuth bundle for authentication.
                  Uses Paseto V4 tokens and SQLite database.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Symfony 8</Badge>
                <Badge variant="secondary" className="text-xs">Paseto V4</Badge>
                <Badge variant="secondary" className="text-xs">SQLite</Badge>
                <Badge variant="secondary" className="text-xs">2FA Ready</Badge>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full bg-violet-600 hover:bg-violet-700">
                  <Link href="/demo/symfony/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hono Card */}
          <Card className="group relative overflow-hidden border-2 hover:border-emerald-300 transition-all duration-300">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="border-emerald-200 text-emerald-700">
                  Port 8003
                </Badge>
              </div>
              <div>
                <CardTitle className="text-xl">Hono + Bun</CardTitle>
                <CardDescription className="mt-2">
                  Ultra-fast Node.js backend with Hono framework.
                  Uses JWT tokens and Drizzle ORM with SQLite.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Hono</Badge>
                <Badge variant="secondary" className="text-xs">Bun Runtime</Badge>
                <Badge variant="secondary" className="text-xs">JWT</Badge>
                <Badge variant="secondary" className="text-xs">Drizzle ORM</Badge>
              </div>
              <div className="pt-4">
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/demo/hono/dashboard">
                    Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <Card className="mt-8 bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5" />
              Architecture BFF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ce projet utilise une architecture <strong>Backend For Frontend (BFF)</strong> où
              Next.js agit comme proxy entre le navigateur et les différents backends.
            </p>
            <div className="grid md:grid-cols-3 gap-4 pt-2">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Laravel (default)</p>
                  <p className="text-xs text-muted-foreground">Port 8000 - Sanctum + HMAC</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-violet-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Symfony</p>
                  <p className="text-xs text-muted-foreground">Port 8002 - BetterAuth</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Hono</p>
                  <p className="text-xs text-muted-foreground">Port 8003 - JWT + Bun</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
