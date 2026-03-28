#!/usr/bin/env node
import { intro, outro } from '@clack/prompts';
import pc from 'picocolors';
import { runPrompts } from './prompts.js';
import { scaffold } from './scaffold.js';

const VERSION = '0.2.0';

async function main() {
  // Handle --version flag
  if (process.argv.includes('--version') || process.argv.includes('-v')) {
    console.log(`create-headless-app v${VERSION}`);
    return;
  }

  intro(pc.bgCyan(pc.black(` create-headless-app v${VERSION} `)));

  const options = await runPrompts();
  if (!options) return;

  await scaffold(options);

  outro(pc.green('Project created successfully!'));

  const backendInstructions: Record<string, string[]> = {
    laravel: [
      `  cd ${options.projectName}/apps/api`,
      '  composer install',
      '  php artisan key:generate',
      '  php artisan migrate',
      '  cd ../..',
    ],
    symfony: [
      `  cd ${options.projectName}/apps/api`,
      '  composer install',
      '  php bin/console doctrine:migrations:migrate --no-interaction',
      '  cd ../..',
    ],
    hono: [
      '  # Hono backend will be installed with bun install',
    ],
  };

  console.log(`\n${pc.bold('Next steps:')}`);
  console.log(`  cd ${options.projectName}`);
  console.log(`  bun install`);
  console.log('');
  if (options.backend !== 'hono') {
    console.log(`  ${pc.dim('# Setup ' + options.backend + ' backend:')}`);
    for (const line of backendInstructions[options.backend]) {
      console.log(line);
    }
    console.log('');
  }
  console.log(`  bun run dev`);
  console.log('');
  console.log(
    pc.dim(`  Preset:   ${options.preset}`),
  );
  if (options.modules.length > 0) {
    console.log(
      pc.dim(`  Modules:  ${options.modules.join(', ')}`),
    );
  }
  console.log(
    pc.dim(`  Frontend: http://localhost:${options.frontend === 'nextjs' ? '3300' : '3301'}`),
  );
  console.log(
    pc.dim(`  Backend:  http://localhost:${options.backend === 'laravel' ? '8002' : options.backend === 'symfony' ? '8001' : '3333'}`),
  );
  console.log('');
}

main().catch(console.error);
