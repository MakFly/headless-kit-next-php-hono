# {{PROJECT_NAME}}

Created with [create-headless-app](https://github.com/kevinmusic/headless-kit).

## Getting Started

```bash
bun install
bun run dev
```

## Architecture

This project uses the **Headless Kit BFF pattern**:

```
Browser -> Next.js BFF (port 3001) -> Backend API (port {{API_PORT}})
```

The frontend never contacts the backend directly. All requests go through BFF Route Handlers that forward auth cookies securely.
