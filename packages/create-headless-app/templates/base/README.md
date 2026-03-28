# {{PROJECT_NAME}}

> Scaffolded with [Headless Kit](https://headlesskit.dev) v{{HEADLESS_KIT_VERSION}}
> Backend: **{{BACKEND}}** · Frontend: **{{FRONTEND}}**

## Quick Start

```bash
bun install
bun run dev
```

Frontend: http://localhost:{{FRONTEND_PORT}}
Backend: http://localhost:{{API_PORT}}

## Architecture

```
Browser → Frontend BFF (port {{FRONTEND_PORT}}) → Backend API (port {{API_PORT}})
```

The frontend never contacts the backend directly. All requests go through BFF Route Handlers that forward auth cookies securely.

## Project Structure

```
├── apps/
│   ├── web/     # Frontend BFF (port {{FRONTEND_PORT}})
│   └── api/     # Backend API (port {{API_PORT}})
├── turbo.json
└── package.json
```

## Commands

```bash
bun run dev       # Start all services
bun run build     # Build for production
bun run lint      # Lint all packages
```

## Updating

Check the [Headless Kit changelog](https://headlesskit.dev/changelog) for upgrade instructions between versions.

Your current version: **v{{HEADLESS_KIT_VERSION}}**
