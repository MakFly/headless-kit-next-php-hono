---
name: verify
description: Run project health check — validates structure, env, ports, deps, TypeScript, and backend tests.
---

# Verify Project Health

Run the health check script:

```bash
bash scripts/verify.sh
```

If any checks fail:
1. Read the failure message
2. Fix the issue (missing env vars, wrong ports, TypeScript errors)
3. Re-run `bash scripts/verify.sh` to confirm

The script checks:
- Project structure (apps/web, apps/api)
- Environment files (.env.local, .env)
- Template variables (no unreplaced {{VAR}})
- Dependencies installed
- Adapter cleanup (only selected backend)
- Port consistency across .env and package.json
- TypeScript compilation
- Backend test suite
