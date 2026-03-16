export type ModuleId = 'multi-tenant' | 'billing' | 'team' | 'org-rbac' | 'support-chat' | 'ai-assistant' | 'api-platform';

export type Module = {
  id: ModuleId;
  label: string;
  description: string;
  dependencies: ModuleId[];
};

export const MODULES: Module[] = [
  {
    id: 'multi-tenant',
    label: 'Multi-tenant orgs',
    description: 'Organization management with user switching',
    dependencies: [],
  },
  {
    id: 'billing',
    label: 'Billing & plans',
    description: 'Subscription plans, invoices, and billing management',
    dependencies: ['multi-tenant'],
  },
  {
    id: 'team',
    label: 'Team management',
    description: 'Team members, invitations, and role assignment',
    dependencies: ['multi-tenant'],
  },
  {
    id: 'org-rbac',
    label: 'Org-level RBAC',
    description: 'Role-based access control per organization',
    dependencies: ['multi-tenant', 'team'],
  },
  {
    id: 'support-chat',
    label: 'Support chat',
    description: 'Customer support conversations and agent queue',
    dependencies: [],
  },
  {
    id: 'ai-assistant',
    label: 'AI Assistant',
    description: 'AI chat with assistant-ui + Vercel AI SDK',
    dependencies: [],
  },
  {
    id: 'api-platform',
    label: 'API Platform CRUD',
    description: 'Replace CRUD controllers with API Platform (Symfony only)',
    dependencies: [],
  },
];

/**
 * Given a list of selected module IDs, resolve all dependencies
 * and return the full list of modules needed (including deps).
 */
export function resolveModuleDependencies(selected: ModuleId[]): ModuleId[] {
  const resolved = new Set<ModuleId>(selected);
  let changed = true;

  while (changed) {
    changed = false;
    for (const id of resolved) {
      const mod = MODULES.find((m) => m.id === id);
      if (!mod) continue;
      for (const dep of mod.dependencies) {
        if (!resolved.has(dep)) {
          resolved.add(dep);
          changed = true;
        }
      }
    }
  }

  // Return in dependency order (deps first)
  return MODULES.filter((m) => resolved.has(m.id)).map((m) => m.id);
}

/**
 * Get the template paths for a module, given the backend and frontend choice.
 */
export function getModuleTemplatePaths(
  moduleId: ModuleId,
  backend: string,
  frontend: string,
): { frontendPath: string; backendPath: string } {
  return {
    frontendPath: `modules/${moduleId}/frontend/${frontend}`,
    backendPath: `modules/${moduleId}/backend/${backend}`,
  };
}
