import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectOptions } from '../prompts.js';

const TEMPLATES_DIR = path.resolve(import.meta.dirname, '..', '..', 'templates', 'docker');

/**
 * Copy a file from the docker templates directory to the project.
 * Variable substitution is handled by the global replaceVariables pass in scaffold.ts.
 */
async function copyDockerFile(src: string, dest: string): Promise<void> {
  await fs.copyFile(src, dest);
}

export async function generateDockerCompose(
  projectDir: string,
  options: ProjectOptions,
): Promise<void> {
  // 1. docker-compose.yml at project root (vars substituted later by scaffold.ts)
  await copyDockerFile(
    path.join(TEMPLATES_DIR, `docker-compose.${options.backend}.yml`),
    path.join(projectDir, 'docker-compose.yml'),
  );

  // 2. Frontend Dockerfile + .dockerignore (apps/web already created by scaffold)
  const webDir = path.join(projectDir, 'apps', 'web');
  await fs.mkdir(webDir, { recursive: true });
  const frontendDockerType = options.frontend === 'nextjs' ? 'nextjs' : 'tanstack';
  await copyDockerFile(
    path.join(TEMPLATES_DIR, `Dockerfile.${frontendDockerType}`),
    path.join(webDir, 'Dockerfile'),
  );
  await copyDockerFile(
    path.join(TEMPLATES_DIR, `.dockerignore.${frontendDockerType}`),
    path.join(webDir, '.dockerignore'),
  );

  // 3. Backend Dockerfile + .dockerignore (apps/api already created by scaffold)
  const apiDir = path.join(projectDir, 'apps', 'api');
  await fs.mkdir(apiDir, { recursive: true });
  await copyDockerFile(
    path.join(TEMPLATES_DIR, `Dockerfile.${options.backend}`),
    path.join(apiDir, 'Dockerfile'),
  );
  await copyDockerFile(
    path.join(TEMPLATES_DIR, `.dockerignore.${options.backend}`),
    path.join(apiDir, '.dockerignore'),
  );

  // 4. Entrypoint script for PHP backends
  if (options.backend === 'laravel' || options.backend === 'symfony') {
    const entrypointDest = path.join(apiDir, 'docker-entrypoint.sh');
    await copyDockerFile(
      path.join(TEMPLATES_DIR, `docker-entrypoint.${options.backend}.sh`),
      entrypointDest,
    );
    await fs.chmod(entrypointDest, 0o755);
  }
}
