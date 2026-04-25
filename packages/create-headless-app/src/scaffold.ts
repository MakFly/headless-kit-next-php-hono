import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import type { ProjectOptions } from './prompts.js';
import { generateEnvFiles } from './generators/env.js';
import { generatePackageJson } from './generators/package-json.js';
import { generateDockerCompose } from './generators/docker-compose.js';
import { generateMakefile } from './generators/makefile.js';
import { generateSecret } from './utils.js';
import { getModuleTemplatePaths, type ModuleId } from './modules.js';

/**
 * Additional npm dependencies required by each module.
 * Merged into apps/web/package.json after overlay.
 */
const MODULE_FRONTEND_DEPS: Partial<Record<ModuleId, Record<string, string>>> = {
  'ai-assistant': {
    'ai': '^4.0.0',
    '@ai-sdk/anthropic': '^3.0.0',
    '@ai-sdk/openai': '^3.0.0',
    '@ai-sdk/google': '^3.0.0',
    '@ai-sdk/mistral': '^3.0.0',
    '@ai-sdk/react': '^3.0.0',
    '@assistant-ui/react': '^0.12.0',
    '@assistant-ui/react-ai-sdk': '^1.3.0',
    '@assistant-ui/react-markdown': '^0.12.0',
    'remark-gfm': '^4.0.0',
  },
  'support-chat': {
    '@radix-ui/react-scroll-area': '^1.0.0',
    '@radix-ui/react-select': '^2.0.0',
    '@radix-ui/react-avatar': '^1.0.0',
  },
};

export type TemplateVars = {
  PROJECT_NAME: string;
  DATABASE_URL: string;
  BACKEND: string;
  FRONTEND: string;
  API_PORT: string;
  FRONTEND_PORT: string;
  HEADLESS_KIT_VERSION: string;
  // Docker-specific secrets (generated fresh per project)
  APP_KEY: string;
  APP_SECRET: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  BETTER_AUTH_SECRET: string;
  BFF_SECRET: string;
};

export async function scaffold(options: ProjectOptions): Promise<void> {
  const spinner = p.spinner();
  const projectDir = path.resolve(process.cwd(), options.projectName);
  const templatesDir = path.resolve(import.meta.dirname, '..', 'templates');

  // Check if directory exists
  try {
    await fs.access(projectDir);
    p.cancel(`Directory ${options.projectName} already exists`);
    process.exit(1);
  } catch {
    // Directory doesn't exist, good
  }

  spinner.start('Creating project structure...');

  // Create project dir
  await fs.mkdir(projectDir, { recursive: true });

  // Copy base template
  await copyDir(path.join(templatesDir, 'base'), projectDir);

  // Copy frontend template
  await copyDir(
    path.join(templatesDir, 'frontend', options.frontend),
    path.join(projectDir, 'apps/web'),
  );

  // Copy backend template
  await copyDir(
    path.join(templatesDir, 'backend', options.backend),
    path.join(projectDir, 'apps/api'),
  );

  spinner.stop('Project structure created');

  // Apply UI preset overlay
  if (options.preset !== 'none') {
    spinner.start(`Applying ${options.preset} preset...`);
    await copyDir(
      path.join(templatesDir, 'presets', options.preset, options.frontend),
      path.join(projectDir, 'apps/web'),
    );
    spinner.stop(`${options.preset} preset applied`);
  }

  // Apply module overlays
  if (options.modules && options.modules.length > 0) {
    spinner.start('Applying module overlays...');

    for (const moduleId of options.modules) {
      const paths = getModuleTemplatePaths(moduleId, options.backend, options.frontend);

      // Frontend overlay
      const frontendSrc = path.join(templatesDir, paths.frontendPath);
      try {
        await fs.access(frontendSrc);
        await copyDir(frontendSrc, path.join(projectDir, 'apps/web'));

        // Process __remove__.json if present (delete files replaced by this module)
        const frontendRemoveManifest = path.join(frontendSrc, '__remove__.json');
        try {
          const removeList: string[] = JSON.parse(await fs.readFile(frontendRemoveManifest, 'utf-8'));
          for (const file of removeList) {
            try { await fs.unlink(path.join(projectDir, 'apps/web', file)); } catch {}
          }
          try { await fs.unlink(path.join(projectDir, 'apps/web', '__remove__.json')); } catch {}
        } catch {
          // No __remove__.json for this module
        }
      } catch {
        // Template not yet available for this module/frontend combo
      }

      // Backend overlay
      const backendSrc = path.join(templatesDir, paths.backendPath);
      try {
        await fs.access(backendSrc);
        await copyDir(backendSrc, path.join(projectDir, 'apps/api'));

        // Process __remove__.json if present (delete files replaced by this module)
        const removeManifest = path.join(backendSrc, '__remove__.json');
        try {
          const removeList: string[] = JSON.parse(await fs.readFile(removeManifest, 'utf-8'));
          for (const file of removeList) {
            try { await fs.unlink(path.join(projectDir, 'apps/api', file)); } catch {}
          }
          try { await fs.unlink(path.join(projectDir, 'apps/api', '__remove__.json')); } catch {}
        } catch {
          // No __remove__.json for this module
        }
      } catch {
        // Template not yet available for this module/backend combo
      }
    }

    // Merge module frontend dependencies into apps/web/package.json
    await mergeModuleDeps(path.join(projectDir, 'apps/web/package.json'), options.modules as ModuleId[]);

    spinner.stop(`${options.modules.length} module(s) applied`);
  }

  // Clean up unused backend adapters from frontend
  spinner.start('Cleaning up unused backends...');
  await cleanupUnusedBackends(path.join(projectDir, 'apps/web'), options.backend);
  spinner.stop('Unused backends removed');

  // Generate config files
  spinner.start('Generating configuration...');

  const dbUrl =
    options.database === 'sqlite'
      ? 'sqlite:///./data.db'
      : `postgresql://postgres:postgres@localhost:5432/${options.projectName}`;

  const vars: TemplateVars = {
    PROJECT_NAME: options.projectName,
    DATABASE_URL: dbUrl,
    BACKEND: options.backend,
    FRONTEND: options.frontend,
    API_PORT:
      options.backend === 'laravel'
        ? '8002'
        : options.backend === 'symfony'
          ? '8001'
          : '3333',
    FRONTEND_PORT: options.frontend === 'nextjs' ? '3300' : '3301',
    HEADLESS_KIT_VERSION: '0.2.0',
    // Docker-specific secrets
    APP_KEY: `base64:${Buffer.from(generateSecret(32), 'hex').toString('base64')}`,
    APP_SECRET: generateSecret(32),
    DB_PASSWORD: generateSecret(16),
    JWT_SECRET: generateSecret(32),
    BETTER_AUTH_SECRET: generateSecret(32),
    BFF_SECRET: generateSecret(32),
  };

  // Generate files first (before variable replacement so they are also processed)
  await generateEnvFiles(projectDir, options, vars);
  await generatePackageJson(projectDir, options);
  await generateDockerCompose(projectDir, options);
  await generateMakefile(projectDir, options);

  // Replace variables in all files (runs after all files are in place)
  await replaceVariables(projectDir, vars);

  spinner.stop('Configuration generated');
}

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function replaceVariables(
  dir: string,
  vars: Record<string, string>,
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (
      entry.name === 'node_modules' ||
      entry.name === '.git' ||
      entry.name === 'vendor'
    )
      continue;
    if (entry.isDirectory()) {
      await replaceVariables(fullPath, vars);
    } else {
      const ext = path.extname(entry.name);
      const textExts = [
        '.ts',
        '.tsx',
        '.js',
        '.json',
        '.yml',
        '.yaml',
        '.env',
        '.md',
        '.php',
        '.xml',
        '.toml',
        '',
      ];
      if (textExts.includes(ext) || entry.name.startsWith('.')) {
        try {
          let content = await fs.readFile(fullPath, 'utf-8');
          let modified = false;
          for (const [key, value] of Object.entries(vars)) {
            const pattern = `{{${key}}}`;
            if (content.includes(pattern)) {
              content = content.replaceAll(pattern, value);
              modified = true;
            }
          }
          if (modified) {
            await fs.writeFile(fullPath, content, 'utf-8');
          }
        } catch {
          // Skip binary files
        }
      }
    }
  }
}

/**
 * Merge additional module dependencies into the frontend package.json.
 */
async function mergeModuleDeps(pkgPath: string, modules: ModuleId[]): Promise<void> {
  const depsToAdd: Record<string, string> = {};
  for (const mod of modules) {
    const extra = MODULE_FRONTEND_DEPS[mod];
    if (extra) {
      Object.assign(depsToAdd, extra);
    }
  }
  if (Object.keys(depsToAdd).length === 0) return;

  try {
    const raw = await fs.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(raw);
    pkg.dependencies = { ...pkg.dependencies, ...depsToAdd };
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
  } catch {
    // package.json not yet present — will be created by preset overlay
  }
}

/**
 * Backend adapter directory names mapping
 */
const BACKEND_ADAPTER_DIRS: Record<string, string> = {
  laravel: 'laravel',
  symfony: 'symfony',
  hono: 'node',
};

/**
 * Remove unused backend adapters, simplify proxy-config and env.ts
 * to only reference the selected backend.
 */
async function cleanupUnusedBackends(webDir: string, selectedBackend: string): Promise<void> {
  const adaptersDir = path.join(webDir, 'src/lib/adapters');
  const selectedDir = BACKEND_ADAPTER_DIRS[selectedBackend];

  // 1. Delete unused adapter directories
  for (const [backend, dirName] of Object.entries(BACKEND_ADAPTER_DIRS)) {
    if (backend !== selectedBackend) {
      await fs.rm(path.join(adaptersDir, dirName), { recursive: true, force: true });
    }
  }

  // Detect template type: Next.js has proxy-config.ts, TanStack does not
  const proxyPath = path.join(adaptersDir, 'proxy-config.ts');
  const isTanStack = await fs.access(proxyPath).then(() => false).catch(() => true);

  // 2. Rewrite adapters/index.ts to only import the selected backend
  const indexPath = path.join(adaptersDir, 'index.ts');
  try {
    const adapterClass = selectedBackend === 'laravel' ? 'LaravelAdapter'
      : selectedBackend === 'symfony' ? 'SymfonyAdapter'
      : 'NodeAdapter';
    const envVar = selectedBackend === 'laravel' ? 'LARAVEL_API_URL'
      : selectedBackend === 'symfony' ? 'SYMFONY_API_URL'
      : 'NODE_API_URL';
    const defaultUrl = selectedBackend === 'laravel' ? 'http://localhost:8002'
      : selectedBackend === 'symfony' ? 'http://localhost:8001'
      : 'http://localhost:3333';
    const authPrefix = selectedBackend === 'symfony' ? '/api/v1/auth'
      : selectedBackend === 'hono' ? '/api/v1/auth'
      : undefined;

    if (isTanStack) {
      // TanStack: imports use explicit `./${selectedDir}/adapter` path, no proxy-config exports
      const importPath = `./${selectedDir}/adapter`;
      const newIndex = `import type { AuthAdapter, BackendType, AdapterConfig } from './types'
import { ${adapterClass} } from '${importPath}'

export type { AuthAdapter, BackendType, AdapterConfig } from './types'
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
  TokenStorage,
} from './types'
export { toUser } from './types'
export { ${adapterClass} } from '${importPath}'
export { AdapterError } from './errors'
export { COOKIE_NAMES } from './base-adapter'

export function getBackendType(): BackendType {
  return '${selectedBackend === 'hono' ? 'node' : selectedBackend}'
}

export function getAdapterConfig(): Partial<AdapterConfig> {
  return {
    baseUrl: process.env.${envVar} || '${defaultUrl}',${authPrefix ? `\n    authPrefix: process.env.${selectedBackend === 'symfony' ? 'SYMFONY_AUTH_PREFIX' : 'NODE_AUTH_PREFIX'} || '${authPrefix}',` : ''}
  }
}

let adapterInstance: AuthAdapter | null = null

export function getAuthAdapter(): AuthAdapter {
  if (adapterInstance) return adapterInstance
  adapterInstance = new ${adapterClass}(getAdapterConfig())
  return adapterInstance
}

export function resetAdapter(): void {
  adapterInstance = null
}
`;
      await fs.writeFile(indexPath, newIndex, 'utf-8');
    } else {
      // Next.js: imports use `./${selectedDir}` (directory index), includes proxy-config exports
      const newIndex = `/**
 * Auth adapter factory — configured for ${selectedBackend} backend
 */

import type { AuthAdapter, BackendType, AdapterConfig } from './types';
import { ${adapterClass} } from './${selectedDir}';

export type { AuthAdapter, BackendType, AdapterConfig } from './types';
export type {
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  AuthResponse,
  NormalizedUser,
  TokenStorage,
} from './types';
export { toUser } from './types';
export { ${adapterClass} } from './${selectedDir}';
export { AdapterError } from './errors';
export { COOKIE_NAMES } from './base-adapter';
export {
  getProxyConfig,
  isPublicRoute,
  buildBackendUrl,
  type ProxyConfig,
} from './proxy-config';

export function getBackendType(): BackendType {
  return '${selectedBackend === 'hono' ? 'node' : selectedBackend}';
}

export function getAdapterConfig(): Partial<AdapterConfig> {
  return {
    baseUrl: process.env.${envVar} || '${defaultUrl}',
  };
}

const cachedAdapter: { instance?: AuthAdapter } = {};

export function getAuthAdapter(): AuthAdapter {
  if (cachedAdapter.instance) return cachedAdapter.instance;
  cachedAdapter.instance = new ${adapterClass}(getAdapterConfig());
  return cachedAdapter.instance;
}

export function createAdapter(
  _backend?: BackendType,
  config?: Partial<AdapterConfig>,
): AuthAdapter {
  return new ${adapterClass}({ ...getAdapterConfig(), ...config });
}

export function resetAdapter(): void {
  delete cachedAdapter.instance;
}
`;
      await fs.writeFile(indexPath, newIndex, 'utf-8');
    }
  } catch {
    // index.ts not present
  }

  // 3. Rewrite proxy-config.ts to only have the selected backend (Next.js only)
  if (!isTanStack) {
    try {
      await fs.access(proxyPath);
      let content = await fs.readFile(proxyPath, 'utf-8');

      // Replace getProxyConfig switch with direct return
      const configFn = selectedBackend === 'laravel' ? 'getLaravelConfig'
        : selectedBackend === 'symfony' ? 'getSymfonyConfig'
        : 'getNodeConfig';

      // Simple approach: replace the switch body
      content = content.replace(
        /export function getProxyConfig\([^)]*\): ProxyConfig \{[\s\S]*?\n\}/,
        `export function getProxyConfig(): ProxyConfig {\n  return ${configFn}();\n}`,
      );

      // Remove imports of getBackendType if present
      content = content.replace(/import \{ getBackendType \} from '\.\/index';\n?/, '');
      content = content.replace(/import type \{ BackendType \} from '\.\/types';\n?/, '');

      await fs.writeFile(proxyPath, content, 'utf-8');
    } catch {
      // proxy-config.ts not accessible
    }
  }

  // 4. Simplify env.ts to only reference the selected backend URL
  const envTsPath = path.join(webDir, 'src/lib/config/env.ts');
  try {
    let envContent = await fs.readFile(envTsPath, 'utf-8');

    // Replace AuthBackend type with single value
    envContent = envContent.replace(
      /export type AuthBackend = .*?;/,
      `export type AuthBackend = '${selectedBackend === 'hono' ? 'node' : selectedBackend}';`,
    );

    if (isTanStack) {
      // TanStack env.ts has no comments — match bare property lines
      // e.g. "  LARAVEL_API_URL: process.env.LARAVEL_API_URL || 'http://localhost:8002',"
      const urlEntries: Record<string, RegExp> = {
        laravel: /\n\s*LARAVEL_API_URL:.*,/,
        symfony: /\n\s*SYMFONY_API_URL:.*,\n\s*SYMFONY_AUTH_PREFIX:.*,/,
        hono: /\n\s*NODE_API_URL:.*,\n\s*NODE_AUTH_PREFIX:.*,/,
      };
      for (const [backend, regex] of Object.entries(urlEntries)) {
        if (backend !== selectedBackend) {
          envContent = envContent.replace(regex, '');
        }
      }
      // Also fix AuthBackend type — TanStack uses `type AuthBackend = ...` without export keyword
      envContent = envContent.replace(
        /^(export )?type AuthBackend = .*$/m,
        `export type AuthBackend = '${selectedBackend === 'hono' ? 'node' : selectedBackend}'`,
      );
      // Fix AUTH_BACKEND cast to match narrowed type
      envContent = envContent.replace(
        /AUTH_BACKEND: \(process\.env\.AUTH_BACKEND \|\| '[^']*'\) as AuthBackend,/,
        `AUTH_BACKEND: '${selectedBackend === 'hono' ? 'node' : selectedBackend}' as AuthBackend,`,
      );
    } else {
      // Next.js env.ts has section comments to anchor the regex
      const urlEntries: Record<string, RegExp> = {
        laravel: /\s*\/\/ Laravel API Configuration\n\s*LARAVEL_API_URL:.*\n/,
        symfony: /\s*\/\/ Symfony API Configuration\n\s*SYMFONY_API_URL:.*\n\s*SYMFONY_AUTH_PREFIX:.*\n/,
        hono: /\s*\/\/ Node\.js API Configuration\n\s*NODE_API_URL:.*\n\s*NODE_AUTH_PREFIX:.*\n/,
      };
      for (const [backend, regex] of Object.entries(urlEntries)) {
        if (backend !== selectedBackend) {
          envContent = envContent.replace(regex, '\n');
        }
      }
    }

    await fs.writeFile(envTsPath, envContent, 'utf-8');
  } catch {
    // env.ts not present
  }
}
