import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Mock @clack/prompts before importing scaffold so spinner calls are no-ops
mock.module('@clack/prompts', () => ({
  spinner: () => ({
    start: (_msg?: string) => {},
    stop: (_msg?: string) => {},
  }),
  cancel: (_msg?: string) => {},
  note: (_message?: string, _title?: string) => {},
}));

// Import after mock is set up
const { scaffold } = await import('../scaffold.js');
import type { ProjectOptions } from '../prompts.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createTempDir(): Promise<string> {
  const tmpDir = path.join(
    os.tmpdir(),
    `headless-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await fs.mkdir(tmpDir, { recursive: true });
  return tmpDir;
}

async function cleanTempDir(dir: string): Promise<void> {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf-8');
}

async function walkFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

const backends = [
  { backend: 'laravel' as const, apiPort: '8000', dbVar: 'DB_CONNECTION' },
  { backend: 'symfony' as const, apiPort: '8002', dbVar: 'DATABASE_URL' },
  { backend: 'hono' as const, apiPort: '8003', dbVar: 'JWT_SECRET' },
] as const;

for (const { backend, apiPort, dbVar } of backends) {
  describe(`scaffold with ${backend} backend`, () => {
    let tmpDir: string;
    let projectDir: string;
    const projectName = `test-${backend}`;

    beforeEach(async () => {
      tmpDir = await createTempDir();
      projectDir = path.join(tmpDir, projectName);

      const originalCwd = process.cwd();
      process.chdir(tmpDir);

      try {
        await scaffold({
          projectName,
          backend,
          frontend: 'nextjs',
          modules: [],
          database: 'sqlite',
          preset: 'none',
        } satisfies ProjectOptions);
      } finally {
        process.chdir(originalCwd);
      }
    });

    afterEach(async () => {
      await cleanTempDir(tmpDir);
    });

    // -----------------------------------------------------------------------
    // Project structure
    // -----------------------------------------------------------------------

    test('creates project directory', async () => {
      expect(await fileExists(projectDir)).toBe(true);
    });

    test('creates apps/web directory', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/web'))).toBe(true);
    });

    test('creates apps/api directory', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/api'))).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Root files
    // -----------------------------------------------------------------------

    test('generates root package.json with project name and workspaces', async () => {
      const pkgPath = path.join(projectDir, 'package.json');
      expect(await fileExists(pkgPath)).toBe(true);
      const pkg = JSON.parse(await readFile(pkgPath));
      expect(pkg.name).toBe(projectName);
      expect(pkg.workspaces).toBeDefined();
    });

    test('generates turbo.json', async () => {
      expect(await fileExists(path.join(projectDir, 'turbo.json'))).toBe(true);
    });

    test('generates .gitignore', async () => {
      expect(await fileExists(path.join(projectDir, '.gitignore'))).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Frontend files
    // -----------------------------------------------------------------------

    test('generates apps/web/package.json', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/package.json')),
      ).toBe(true);
    });

    test('generates BFF route handler', async () => {
      const routePath = path.join(
        projectDir,
        'apps/web/src/app/api/v1/[...path]/route.ts',
      );
      expect(await fileExists(routePath)).toBe(true);
    });

    test('generates middleware', async () => {
      const mwPath = path.join(projectDir, 'apps/web/src/middleware.ts');
      expect(await fileExists(mwPath)).toBe(true);
      const content = await readFile(mwPath);
      expect(content).toContain('middleware');
    });

    test('generates globals.css', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/app/globals.css')),
      ).toBe(true);
    });

    test('generates dashboard page', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/app/dashboard/page.tsx')),
      ).toBe(true);
    });

    test('generates register page', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/app/auth/register/page.tsx')),
      ).toBe(true);
    });

    test('generates auth store', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/stores/auth-store.ts')),
      ).toBe(true);
    });

    test('web package.json has no workspace:* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('workspace:');
    });

    test('backend has source files', async () => {
      if (backend === 'hono') {
        expect(await fileExists(path.join(projectDir, 'apps/api/src/index.ts'))).toBe(true);
        expect(await fileExists(path.join(projectDir, 'apps/api/package.json'))).toBe(true);
      } else if (backend === 'laravel') {
        expect(await fileExists(path.join(projectDir, 'apps/api/artisan'))).toBe(true);
        expect(await fileExists(path.join(projectDir, 'apps/api/composer.json'))).toBe(true);
      } else {
        expect(await fileExists(path.join(projectDir, 'apps/api/bin/console'))).toBe(true);
        expect(await fileExists(path.join(projectDir, 'apps/api/composer.json'))).toBe(true);
      }
    });

    // -----------------------------------------------------------------------
    // Frontend env
    // -----------------------------------------------------------------------

    test('generates .env.local with correct AUTH_BACKEND', async () => {
      const envPath = path.join(projectDir, 'apps/web/.env.local');
      expect(await fileExists(envPath)).toBe(true);
      const env = await readFile(envPath);
      expect(env).toContain(`AUTH_BACKEND=${backend}`);
    });

    test('generates .env.local with correct backend API URL variable', async () => {
      const env = await readFile(path.join(projectDir, 'apps/web/.env.local'));
      const urlVarMap = {
        laravel: 'LARAVEL_API_URL=',
        symfony: 'SYMFONY_API_URL=',
        hono: 'NODE_API_URL=',
      } as const;
      expect(env).toContain(urlVarMap[backend]);
    });

    // -----------------------------------------------------------------------
    // Backend env
    // -----------------------------------------------------------------------

    test('generates apps/api/.env with backend-specific variable', async () => {
      const envPath = path.join(projectDir, 'apps/api/.env');
      expect(await fileExists(envPath)).toBe(true);
      const env = await readFile(envPath);
      expect(env).toContain(dbVar);
    });

    test('generates apps/api/.env without unreplaced template variables', async () => {
      const env = await readFile(path.join(projectDir, 'apps/api/.env'));
      expect(env).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });

    // -----------------------------------------------------------------------
    // Docker files
    // -----------------------------------------------------------------------

    test('generates root compose.yml + compose.prod.yml with include of apps/api', async () => {
      const dev = path.join(projectDir, 'compose.yml');
      const prod = path.join(projectDir, 'compose.prod.yml');
      expect(await fileExists(dev)).toBe(true);
      expect(await fileExists(prod)).toBe(true);
      const devContent = await readFile(dev);
      expect(devContent).toContain('include:');
      expect(devContent).toContain('./apps/api/compose.yml');
    });

    test('generates apps/api/{Dockerfile,compose.yml,compose.prod.yml,.dockerignore}', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/api/Dockerfile'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/compose.yml'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/compose.prod.yml'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/.dockerignore'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/docker/entrypoint.sh'))).toBe(true);
    });

    test('generates apps/web/Dockerfile', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/Dockerfile')),
      ).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Variable replacement
    // -----------------------------------------------------------------------

    test('replaces all {{TEMPLATE_VARS}} in non-doc files', async () => {
      const allFiles = await walkFiles(projectDir);
      const violations: string[] = [];

      for (const file of allFiles) {
        const ext = path.extname(file);
        const isDoc =
          ext === '.md' || file.endsWith('.example') || ext === '.example';
        if (isDoc) continue;

        const content = await readFile(file);
        const unreplaced = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplaced) {
          violations.push(`${path.relative(projectDir, file)}: ${unreplaced.join(', ')}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test('apps/api/compose.yml has no unreplaced template variables', async () => {
      const compose = await readFile(path.join(projectDir, 'apps/api/compose.yml'));
      expect(compose).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });

    test('root package.json has no unreplaced template variables', async () => {
      const pkg = await readFile(path.join(projectDir, 'package.json'));
      expect(pkg).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });
  });
}

// ---------------------------------------------------------------------------
// TanStack Start frontend tests
// ---------------------------------------------------------------------------

for (const { backend, apiPort, dbVar } of backends) {
  describe(`scaffold with ${backend} backend + TanStack Start frontend`, () => {
    let tmpDir: string;
    let projectDir: string;
    const projectName = `test-tanstack-${backend}`;

    beforeEach(async () => {
      tmpDir = await createTempDir();
      projectDir = path.join(tmpDir, projectName);

      const originalCwd = process.cwd();
      process.chdir(tmpDir);

      try {
        await scaffold({
          projectName,
          backend,
          frontend: 'tanstack',
          modules: [],
          database: 'sqlite',
          preset: 'none',
        } satisfies ProjectOptions);
      } finally {
        process.chdir(originalCwd);
      }
    });

    afterEach(async () => {
      await cleanTempDir(tmpDir);
    });

    // -----------------------------------------------------------------------
    // Project structure
    // -----------------------------------------------------------------------

    test('creates project directory', async () => {
      expect(await fileExists(projectDir)).toBe(true);
    });

    test('creates apps/web directory', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/web'))).toBe(true);
    });

    test('creates apps/api directory', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/api'))).toBe(true);
    });

    // -----------------------------------------------------------------------
    // TanStack-specific frontend files
    // -----------------------------------------------------------------------

    test('generates apps/web/package.json', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/package.json')),
      ).toBe(true);
    });

    test('generates app.config.ts', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/app.config.ts')),
      ).toBe(true);
    });

    test('generates BFF proxy route (api/v1/$.tsx)', async () => {
      const routePath = path.join(
        projectDir,
        'apps/web/src/routes/api/v1/$.tsx',
      );
      expect(await fileExists(routePath)).toBe(true);
      const content = await readFile(routePath);
      expect(content).toContain('handleBffRequest');
    });

    test('generates root route (__root.tsx)', async () => {
      const rootPath = path.join(
        projectDir,
        'apps/web/src/routes/__root.tsx',
      );
      expect(await fileExists(rootPath)).toBe(true);
    });

    test('generates login page', async () => {
      const loginPath = path.join(
        projectDir,
        'apps/web/src/routes/_auth/login.tsx',
      );
      expect(await fileExists(loginPath)).toBe(true);
    });

    test('generates register page', async () => {
      const registerPath = path.join(
        projectDir,
        'apps/web/src/routes/_auth/register.tsx',
      );
      expect(await fileExists(registerPath)).toBe(true);
    });

    test('generates router.tsx entry', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/router.tsx')),
      ).toBe(true);
    });

    test('generates styles.css', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/styles.css')),
      ).toBe(true);
    });

    test('generates auth store', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/stores/auth-store.ts')),
      ).toBe(true);
    });

    test('generates dashboard route', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/routes/dashboard.tsx')),
      ).toBe(true);
    });

    test('web package.json has no workspace:* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('workspace:');
    });

    test('generates token service', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/lib/services/token-service.ts')),
      ).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Frontend env
    // -----------------------------------------------------------------------

    test('generates .env.local with VITE_APP_URL on port 3301', async () => {
      const envPath = path.join(projectDir, 'apps/web/.env.local');
      expect(await fileExists(envPath)).toBe(true);
      const env = await readFile(envPath);
      expect(env).toContain('VITE_APP_URL=http://localhost:3301');
    });

    test('generates .env.local with correct AUTH_BACKEND', async () => {
      const env = await readFile(path.join(projectDir, 'apps/web/.env.local'));
      expect(env).toContain(`AUTH_BACKEND=${backend}`);
    });

    // -----------------------------------------------------------------------
    // Backend env uses port 3301
    // -----------------------------------------------------------------------

    test('generates apps/api/.env with FRONTEND_URL on port 3301', async () => {
      const env = await readFile(path.join(projectDir, 'apps/api/.env'));
      expect(env).toContain('FRONTEND_URL=http://localhost:3301');
    });

    // -----------------------------------------------------------------------
    // Docker files
    // -----------------------------------------------------------------------

    test('generates root compose.yml + compose.prod.yml with include of apps/api', async () => {
      const dev = path.join(projectDir, 'compose.yml');
      const prod = path.join(projectDir, 'compose.prod.yml');
      expect(await fileExists(dev)).toBe(true);
      expect(await fileExists(prod)).toBe(true);
      const devContent = await readFile(dev);
      expect(devContent).toContain('include:');
      expect(devContent).toContain('./apps/api/compose.yml');
    });

    test('generates apps/web/Dockerfile for TanStack', async () => {
      const dockerfilePath = path.join(projectDir, 'apps/web/Dockerfile');
      expect(await fileExists(dockerfilePath)).toBe(true);
      const content = await readFile(dockerfilePath);
      expect(content).toContain('3003');
    });

    test('generates apps/api/{Dockerfile,compose.yml,compose.prod.yml,.dockerignore}', async () => {
      expect(await fileExists(path.join(projectDir, 'apps/api/Dockerfile'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/compose.yml'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/compose.prod.yml'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/.dockerignore'))).toBe(true);
      expect(await fileExists(path.join(projectDir, 'apps/api/docker/entrypoint.sh'))).toBe(true);
    });

    // -----------------------------------------------------------------------
    // Variable replacement
    // -----------------------------------------------------------------------

    test('replaces all {{TEMPLATE_VARS}} in non-doc files', async () => {
      const allFiles = await walkFiles(projectDir);
      const violations: string[] = [];

      for (const file of allFiles) {
        const ext = path.extname(file);
        const isDoc =
          ext === '.md' || file.endsWith('.example') || ext === '.example';
        if (isDoc) continue;

        const content = await readFile(file);
        const unreplaced = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplaced) {
          violations.push(`${path.relative(projectDir, file)}: ${unreplaced.join(', ')}`);
        }
      }

      expect(violations).toEqual([]);
    });

    test('apps/api/compose.yml has no unreplaced template variables', async () => {
      const compose = await readFile(path.join(projectDir, 'apps/api/compose.yml'));
      expect(compose).not.toMatch(/\{\{[A-Z_]+\}\}/);
    });
  });
}

// ---------------------------------------------------------------------------
// Behaviour: refuses to overwrite an existing directory
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Preset tests — Next.js
// ---------------------------------------------------------------------------

const presets = ['admin', 'landing', 'saas', 'ecommerce'] as const;

for (const preset of presets) {
  describe(`scaffold with ${preset} preset + nextjs`, () => {
    let tmpDir: string;
    let projectDir: string;
    const projectName = `test-preset-${preset}-nextjs`;

    beforeEach(async () => {
      tmpDir = await createTempDir();
      projectDir = path.join(tmpDir, projectName);

      const originalCwd = process.cwd();
      process.chdir(tmpDir);

      try {
        await scaffold({
          projectName,
          backend: 'laravel',
          frontend: 'nextjs',
          modules: [],
          database: 'sqlite',
          preset,
        } satisfies ProjectOptions);
      } finally {
        process.chdir(originalCwd);
      }
    });

    afterEach(async () => {
      await cleanTempDir(tmpDir);
    });

    test('creates project directory', async () => {
      expect(await fileExists(projectDir)).toBe(true);
    });

    test('has shadcn button component', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/components/ui/button.tsx')),
      ).toBe(true);
    });

    test('has components.json', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/components.json')),
      ).toBe(true);
    });

    test('web package.json has no workspace:* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('workspace:');
    });

    test('web package.json has no @headless/* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('@headless/');
    });

    test('BFF route handler still exists (from base template)', async () => {
      expect(
        await fileExists(
          path.join(projectDir, 'apps/web/src/app/api/v1/[...path]/route.ts'),
        ),
      ).toBe(true);
    });

    test('replaces all {{TEMPLATE_VARS}} in non-doc files', async () => {
      const allFiles = await walkFiles(projectDir);
      const violations: string[] = [];

      for (const file of allFiles) {
        const ext = path.extname(file);
        const isDoc =
          ext === '.md' || file.endsWith('.example') || ext === '.example';
        if (isDoc) continue;

        const content = await readFile(file);
        const unreplaced = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplaced) {
          violations.push(
            `${path.relative(projectDir, file)}: ${unreplaced.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    test('no source files contain @headless/ imports', async () => {
      const allFiles = await walkFiles(
        path.join(projectDir, 'apps/web/src'),
      );
      const violations: string[] = [];

      for (const file of allFiles) {
        const content = await readFile(file);
        if (content.includes('@headless/')) {
          violations.push(path.relative(projectDir, file));
        }
      }

      expect(violations).toEqual([]);
    });
  });
}

// ---------------------------------------------------------------------------
// Preset tests — TanStack
// ---------------------------------------------------------------------------

for (const preset of presets) {
  describe(`scaffold with ${preset} preset + tanstack`, () => {
    let tmpDir: string;
    let projectDir: string;
    const projectName = `test-preset-${preset}-tanstack`;

    beforeEach(async () => {
      tmpDir = await createTempDir();
      projectDir = path.join(tmpDir, projectName);

      const originalCwd = process.cwd();
      process.chdir(tmpDir);

      try {
        await scaffold({
          projectName,
          backend: 'hono',
          frontend: 'tanstack',
          modules: [],
          database: 'sqlite',
          preset,
        } satisfies ProjectOptions);
      } finally {
        process.chdir(originalCwd);
      }
    });

    afterEach(async () => {
      await cleanTempDir(tmpDir);
    });

    test('creates project directory', async () => {
      expect(await fileExists(projectDir)).toBe(true);
    });

    test('has shadcn button component', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/src/components/ui/button.tsx')),
      ).toBe(true);
    });

    test('has components.json', async () => {
      expect(
        await fileExists(path.join(projectDir, 'apps/web/components.json')),
      ).toBe(true);
    });

    test('web package.json has no workspace:* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('workspace:');
    });

    test('web package.json has no @headless/* references', async () => {
      const pkg = await readFile(path.join(projectDir, 'apps/web/package.json'));
      expect(pkg).not.toContain('@headless/');
    });

    test('BFF proxy route still exists (from base template)', async () => {
      expect(
        await fileExists(
          path.join(projectDir, 'apps/web/src/routes/api/v1/$.tsx'),
        ),
      ).toBe(true);
    });

    test('replaces all {{TEMPLATE_VARS}} in non-doc files', async () => {
      const allFiles = await walkFiles(projectDir);
      const violations: string[] = [];

      for (const file of allFiles) {
        const ext = path.extname(file);
        const isDoc =
          ext === '.md' || file.endsWith('.example') || ext === '.example';
        if (isDoc) continue;

        const content = await readFile(file);
        const unreplaced = content.match(/\{\{[A-Z_]+\}\}/g);
        if (unreplaced) {
          violations.push(
            `${path.relative(projectDir, file)}: ${unreplaced.join(', ')}`,
          );
        }
      }

      expect(violations).toEqual([]);
    });

    test('no source files contain @headless/ imports', async () => {
      const allFiles = await walkFiles(
        path.join(projectDir, 'apps/web/src'),
      );
      const violations: string[] = [];

      for (const file of allFiles) {
        const content = await readFile(file);
        if (content.includes('@headless/')) {
          violations.push(path.relative(projectDir, file));
        }
      }

      expect(violations).toEqual([]);
    });
  });
}

// ---------------------------------------------------------------------------
// Preset 'none' — no UI components
// ---------------------------------------------------------------------------

describe('scaffold with preset none', () => {
  let tmpDir: string;
  let projectDir: string;
  const projectName = 'test-preset-none';

  beforeEach(async () => {
    tmpDir = await createTempDir();
    projectDir = path.join(tmpDir, projectName);

    const originalCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      await scaffold({
        projectName,
        backend: 'hono',
        frontend: 'nextjs',
        modules: [],
        database: 'sqlite',
        preset: 'none',
      } satisfies ProjectOptions);
    } finally {
      process.chdir(originalCwd);
    }
  });

  afterEach(async () => {
    await cleanTempDir(tmpDir);
  });

  test('has base components/ui directory with sidebar', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/components/ui/sidebar.tsx')),
    ).toBe(true);
  });

  test('has basic auth pages from base template', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/app/auth/login/page.tsx')),
    ).toBe(true);
  });

  test('has dashboard page from base template', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/app/dashboard/page.tsx')),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Preset-specific feature tests
// ---------------------------------------------------------------------------

describe('admin preset specific features', () => {
  let tmpDir: string;
  let projectDir: string;
  const projectName = 'test-admin-features';

  beforeEach(async () => {
    tmpDir = await createTempDir();
    projectDir = path.join(tmpDir, projectName);

    const originalCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      await scaffold({
        projectName,
        backend: 'laravel',
        frontend: 'nextjs',
        modules: [],
        database: 'sqlite',
        preset: 'admin',
      } satisfies ProjectOptions);
    } finally {
      process.chdir(originalCwd);
    }
  });

  afterEach(async () => {
    await cleanTempDir(tmpDir);
  });

  test('has sidebar component', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/components/app-sidebar.tsx')),
    ).toBe(true);
  });

  test('has dashboard users page', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/app/dashboard/users/page.tsx')),
    ).toBe(true);
  });

  test('has dashboard roles page', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/app/dashboard/roles/page.tsx')),
    ).toBe(true);
  });
});

describe('ecommerce preset specific features', () => {
  let tmpDir: string;
  let projectDir: string;
  const projectName = 'test-ecommerce-features';

  beforeEach(async () => {
    tmpDir = await createTempDir();
    projectDir = path.join(tmpDir, projectName);

    const originalCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      await scaffold({
        projectName,
        backend: 'laravel',
        frontend: 'nextjs',
        modules: [],
        database: 'sqlite',
        preset: 'ecommerce',
      } satisfies ProjectOptions);
    } finally {
      process.chdir(originalCwd);
    }
  });

  afterEach(async () => {
    await cleanTempDir(tmpDir);
  });

  test('has cart store', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/stores/cart-store.ts')),
    ).toBe(true);
  });

  test('has products data', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/lib/data/products.ts')),
    ).toBe(true);
  });

  test('has storefront navbar', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/components/storefront/storefront-navbar.tsx')),
    ).toBe(true);
  });

  test('has admin products page', async () => {
    expect(
      await fileExists(path.join(projectDir, 'apps/web/src/app/dashboard/products/page.tsx')),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Behaviour: refuses to overwrite an existing directory
// ---------------------------------------------------------------------------

describe('scaffold error handling', () => {
  test('exits if target directory already exists', async () => {
    const tmpDir = await createTempDir();
    const projectName = 'already-exists';
    const projectDir = path.join(tmpDir, projectName);

    // Pre-create the directory
    await fs.mkdir(projectDir, { recursive: true });

    const originalCwd = process.cwd();
    process.chdir(tmpDir);

    try {
      // scaffold calls process.exit(1) — catch the thrown process.exit
      let exited = false;
      const originalExit = process.exit;
      (process as NodeJS.Process & { exit: typeof process.exit }).exit = (
        code?: number,
      ) => {
        exited = true;
        throw new Error(`process.exit(${code})`);
      };

      try {
        await scaffold({
          projectName,
          backend: 'hono',
          frontend: 'nextjs',
          modules: [],
          database: 'sqlite',
          preset: 'none',
        });
      } catch (e) {
        // Expected — process.exit throws in test
      } finally {
        (process as NodeJS.Process & { exit: typeof process.exit }).exit =
          originalExit;
      }

      expect(exited).toBe(true);
    } finally {
      process.chdir(originalCwd);
      await cleanTempDir(tmpDir);
    }
  });
});
