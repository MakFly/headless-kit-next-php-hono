import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { ProjectOptions } from '../prompts.js';
import type { TemplateVars } from '../scaffold.js';
import { generateSecret } from '../utils.js';

export async function generateEnvFiles(
  projectDir: string,
  options: ProjectOptions,
  vars: TemplateVars,
): Promise<void> {
  const hasAi = options.modules?.includes('ai-assistant') ?? false;
  // Frontend .env.local
  const backendUrlLines = {
    laravel: 'LARAVEL_API_URL=http://localhost:8000',
    symfony: 'SYMFONY_API_URL=http://localhost:8002',
    hono: 'NODE_API_URL=http://localhost:8003',
  };

  const frontendPort = options.frontend === 'nextjs' ? '3001' : '3003';

  let frontendEnv: string;
  const aiEnvLines = hasAi
    ? `
# AI (assistant-ui + Vercel AI SDK)
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
`
    : '';

  if (options.frontend === 'nextjs') {
    frontendEnv = `# Frontend (Next.js BFF)
NEXT_PUBLIC_APP_URL=http://localhost:3001
AUTH_BACKEND=${options.backend}
${backendUrlLines[options.backend]}
${aiEnvLines}`;
  } else {
    frontendEnv = `# Frontend (TanStack Start BFF)
VITE_APP_URL=http://localhost:3003
AUTH_BACKEND=${options.backend}
${backendUrlLines[options.backend]}
${aiEnvLines}`;
  }

  const frontendUrl = `http://localhost:${frontendPort}`;

  // Backend .env
  let backendEnv = '';

  if (options.backend === 'laravel') {
    const dbLines =
      options.database === 'postgresql'
        ? `DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=${vars.PROJECT_NAME}
DB_USERNAME=postgres
DB_PASSWORD=postgres`
        : '';

    backendEnv = `APP_NAME=${vars.PROJECT_NAME}
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8000
FRONTEND_URL=${frontendUrl}
DB_CONNECTION=${options.database === 'sqlite' ? 'sqlite' : 'pgsql'}
${dbLines}
`;
  } else if (options.backend === 'symfony') {
    const dbUrl =
      options.database === 'sqlite'
        ? 'sqlite:///%kernel.project_dir%/var/data.db'
        : `postgresql://postgres:postgres@localhost:5432/${vars.PROJECT_NAME}`;

    backendEnv = `APP_ENV=dev
APP_SECRET=${generateSecret(16)}
DATABASE_URL="${dbUrl}"
BETTER_AUTH_SECRET=${generateSecret(32)}
FRONTEND_URL=${frontendUrl}
MAILER_DSN=null://null
`;
  } else {
    backendEnv = `PORT=8003
NODE_ENV=development
DATABASE_URL=./data.db
JWT_SECRET=${generateSecret(32)}
FRONTEND_URL=${frontendUrl}
`;
  }

  await fs.mkdir(path.join(projectDir, 'apps/web'), { recursive: true });
  await fs.mkdir(path.join(projectDir, 'apps/api'), { recursive: true });

  await fs.writeFile(
    path.join(projectDir, 'apps/web/.env.local'),
    frontendEnv,
    'utf-8',
  );
  await fs.writeFile(
    path.join(projectDir, 'apps/api/.env'),
    backendEnv,
    'utf-8',
  );
}
