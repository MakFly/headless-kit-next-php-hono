import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectOptions } from '../prompts.js';

const TEMPLATES_DIR = path.resolve(import.meta.dirname, '..', '..', 'templates', 'docker');

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

/**
 * Generate Docker config:
 *   - apps/api/{Dockerfile, compose.yml, compose.prod.yml, .dockerignore, docker/entrypoint.sh, scripts/migrate.ts (hono)}
 *   - apps/web/{Dockerfile, .dockerignore}                 (frontend, legacy single-file templates)
 *   - <root>/{compose.yml, compose.prod.yml}               (include: apps/api/*)
 *
 * Skips entirely if `options.docker === false`.
 */
export async function generateDockerCompose(
  projectDir: string,
  options: ProjectOptions,
): Promise<void> {
  if (options.docker === false) return;

  const apiDir = path.join(projectDir, 'apps', 'api');
  const webDir = path.join(projectDir, 'apps', 'web');

  // 1. Backend: copy whole per-stack folder into apps/api (Dockerfile, compose.*.yml,
  //    .dockerignore, docker/entrypoint.sh, scripts/migrate.ts for hono).
  const backendSrc = path.join(TEMPLATES_DIR, 'backend', options.backend);
  await copyDir(backendSrc, apiDir);

  const entrypoint = path.join(apiDir, 'docker', 'entrypoint.sh');
  try { await fs.chmod(entrypoint, 0o755); } catch { /* ignore */ }

  if (options.backend === 'hono') {
    const migrate = path.join(apiDir, 'scripts', 'migrate.ts');
    try { await fs.chmod(migrate, 0o644); } catch { /* ignore */ }
  }

  // 2. Frontend: legacy flat templates (Dockerfile.{nextjs|tanstack}). No compose yet.
  await fs.mkdir(webDir, { recursive: true });
  const frontendKind = options.frontend === 'nextjs' ? 'nextjs' : 'tanstack';
  const frontendDockerfileSrc = path.join(TEMPLATES_DIR, `Dockerfile.${frontendKind}`);
  try {
    await fs.access(frontendDockerfileSrc);
    await fs.copyFile(frontendDockerfileSrc, path.join(webDir, 'Dockerfile'));
  } catch {
    // Frontend Dockerfile not yet refreshed for this stack — skip silently.
  }

  // 3. Root orchestration files.
  await fs.copyFile(
    path.join(TEMPLATES_DIR, 'root', 'compose.yml'),
    path.join(projectDir, 'compose.yml'),
  );
  await fs.copyFile(
    path.join(TEMPLATES_DIR, 'root', 'compose.prod.yml'),
    path.join(projectDir, 'compose.prod.yml'),
  );
}
