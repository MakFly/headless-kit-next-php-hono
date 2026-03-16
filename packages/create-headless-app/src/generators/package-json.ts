import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectOptions } from '../prompts.js';

export async function generatePackageJson(
  projectDir: string,
  options: ProjectOptions,
): Promise<void> {
  const pkg = {
    name: options.projectName,
    private: true,
    workspaces: ['apps/*', 'packages/*'],
    scripts: {
      dev: 'turbo run dev',
      build: 'turbo run build',
      lint: 'turbo run lint',
    },
    devDependencies: {
      turbo: '^2.4.0',
    },
    packageManager: 'bun@1.3.9',
  };

  await fs.writeFile(
    path.join(projectDir, 'package.json'),
    JSON.stringify(pkg, null, 2) + '\n',
    'utf-8',
  );
}
