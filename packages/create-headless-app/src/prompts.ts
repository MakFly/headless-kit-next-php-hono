import * as p from '@clack/prompts';
import { MODULES, resolveModuleDependencies, type ModuleId } from './modules.js';

export type PresetType = 'admin' | 'landing' | 'saas' | 'ecommerce' | 'none';

export type ProjectOptions = {
  projectName: string;
  backend: 'laravel' | 'symfony' | 'hono';
  frontend: 'nextjs' | 'tanstack';
  modules: ModuleId[];
  database: 'sqlite' | 'postgresql';
  preset: PresetType;
  docker: boolean;
};

export async function runPrompts(): Promise<ProjectOptions | null> {
  const project = await p.group(
    {
      projectName: () =>
        p.text({
          message: 'Project name',
          placeholder: 'my-app',
          validate: (value) => {
            if (!value) return 'Project name is required';
            if (!/^[a-z0-9-]+$/.test(value))
              return 'Use lowercase, numbers, and hyphens only';
          },
        }),
      backend: () =>
        p.select({
          message: 'Backend',
          options: [
            {
              value: 'laravel' as const,
              label: 'Laravel',
              hint: 'PHP 8.3 + BetterAuth + RBAC',
            },
            {
              value: 'symfony' as const,
              label: 'Symfony',
              hint: 'PHP 8.3 + BetterAuth + RBAC',
            },
            {
              value: 'hono' as const,
              label: 'Hono',
              hint: 'Bun + Drizzle (lightweight)',
            },
          ],
        }),
      frontend: () =>
        p.select({
          message: 'Frontend',
          options: [
            {
              value: 'nextjs' as const,
              label: 'Next.js',
              hint: 'App Router + shadcn/ui (recommended)',
            },
            {
              value: 'tanstack' as const,
              label: 'TanStack Start',
              hint: 'Vite + TanStack Router + Zustand',
            },
          ],
        }),
      preset: () =>
        p.select({
          message: 'UI Preset',
          options: [
            {
              value: 'saas' as const,
              label: 'SaaS (Recommended)',
              hint: 'Landing page + Admin dashboard',
            },
            {
              value: 'admin' as const,
              label: 'Admin',
              hint: 'Dashboard + sidebar + RBAC tables',
            },
            {
              value: 'landing' as const,
              label: 'Landing',
              hint: 'Marketing page + styled auth',
            },
            {
              value: 'ecommerce' as const,
              label: 'Ecommerce',
              hint: 'Store + cart + checkout + admin',
            },
            {
              value: 'none' as const,
              label: 'Minimal',
              hint: 'BFF infrastructure only, no UI kit',
            },
          ],
        }),
      modules: ({ results }) =>
        p.multiselect({
          message: 'Modules (auth is always included)',
          options: MODULES
            .filter((m) => m.id !== 'api-platform' || results.backend === 'symfony')
            .map((m) => ({
              value: m.id,
              label: m.label,
              hint: m.description,
            })),
          required: false,
        }),
      database: () =>
        p.select({
          message: 'Database',
          options: [
            {
              value: 'sqlite' as const,
              label: 'SQLite',
              hint: 'Zero config, great for dev',
            },
            {
              value: 'postgresql' as const,
              label: 'PostgreSQL',
              hint: 'Production-ready',
            },
          ],
        }),
      docker: () =>
        p.confirm({
          message: 'Include Docker (Dockerfile + compose.yml + compose.prod.yml)?',
          initialValue: true,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Operation cancelled.');
        process.exit(0);
      },
    },
  );

  // Resolve module dependencies
  const rawModules = (project.modules || []) as ModuleId[];
  const resolvedModules = resolveModuleDependencies(rawModules);

  // Inform user about auto-included dependencies
  const autoIncluded = resolvedModules.filter((m) => !rawModules.includes(m));
  if (autoIncluded.length > 0) {
    const labels = autoIncluded
      .map((id) => MODULES.find((m) => m.id === id)?.label || id)
      .join(', ');
    p.note(`Auto-included dependencies: ${labels}`);
  }

  return { ...project, modules: resolvedModules } as ProjectOptions;
}
