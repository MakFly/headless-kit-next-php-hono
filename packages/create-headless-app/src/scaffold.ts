import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as p from '@clack/prompts';
import type { ProjectOptions } from './prompts.js';
import { generateEnvFiles } from './generators/env.js';
import { generatePackageJson } from './generators/package-json.js';
import { generateDockerCompose } from './generators/docker-compose.js';
import { generateSecret } from './utils.js';
import { getModuleTemplatePaths } from './modules.js';

export type TemplateVars = {
  PROJECT_NAME: string;
  DATABASE_URL: string;
  BACKEND: string;
  API_PORT: string;
  FRONTEND_PORT: string;
  // Docker-specific secrets (generated fresh per project)
  APP_KEY: string;
  APP_SECRET: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  BETTER_AUTH_SECRET: string;
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

    spinner.stop(`${options.modules.length} module(s) applied`);
  }

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
    API_PORT:
      options.backend === 'laravel'
        ? '8000'
        : options.backend === 'symfony'
          ? '8002'
          : '8003',
    FRONTEND_PORT: options.frontend === 'nextjs' ? '3001' : '3003',
    // Docker-specific secrets
    APP_KEY: `base64:${Buffer.from(generateSecret(32), 'hex').toString('base64')}`,
    APP_SECRET: generateSecret(32),
    DB_PASSWORD: generateSecret(16),
    JWT_SECRET: generateSecret(32),
    BETTER_AUTH_SECRET: generateSecret(32),
  };

  // Generate files first (before variable replacement so they are also processed)
  await generateEnvFiles(projectDir, options, vars);
  await generatePackageJson(projectDir, options);
  await generateDockerCompose(projectDir, options);

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
