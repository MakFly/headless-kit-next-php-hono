import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Headless Kit',
      description: 'Full-stack starter kit with Next.js BFF + PHP/Hono backends',
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/headless-kit/headless-kit' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'Project Structure', slug: 'getting-started/project-structure' },
            { label: 'Configuration', slug: 'getting-started/configuration' },
          ],
        },
        {
          label: 'Architecture',
          items: [
            { label: 'BFF Pattern', slug: 'architecture/bff-pattern' },
            { label: 'Auth Flow', slug: 'architecture/auth-flow' },
            { label: 'Adapter Pattern', slug: 'architecture/adapters' },
            { label: 'Vertical Slice Architecture', slug: 'architecture/vertical-slice' },
          ],
        },
        {
          label: 'Backends',
          items: [
            { label: 'Laravel', slug: 'backends/laravel' },
            { label: 'Symfony', slug: 'backends/symfony' },
            { label: 'Hono', slug: 'backends/hono' },
          ],
        },
        {
          label: 'Modules',
          items: [
            { label: 'Shop', slug: 'modules/shop' },
            { label: 'Admin', slug: 'modules/admin' },
            { label: 'SaaS', slug: 'modules/saas' },
            { label: 'Support', slug: 'modules/support' },
          ],
        },
        {
          label: 'CLI',
          items: [
            { label: 'Getting Started', slug: 'cli/getting-started' },
            { label: 'Presets', slug: 'cli/presets' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Authentication', slug: 'guides/authentication' },
            { label: 'TanStack Start', slug: 'guides/tanstack-start' },
            { label: 'RBAC', slug: 'guides/rbac' },
            { label: 'Two-Factor Auth', slug: 'guides/two-factor' },
            { label: 'OAuth', slug: 'guides/oauth' },
            { label: 'Custom Adapter', slug: 'guides/custom-adapter' },
          ],
        },
        {
          label: 'Deploy',
          items: [
            { label: 'Docker', slug: 'deploy/docker' },
            { label: 'Production', slug: 'deploy/production' },
          ],
        },
      ],
    }),
  ],
});
