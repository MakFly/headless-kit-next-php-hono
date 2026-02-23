# Proactive Token Refresh — Architecture

## Overview

Token refresh uses an **in-memory `expiresIn` pattern**: the server returns `expires_in` (seconds) on login/register/refresh, the client stores it in Zustand and schedules a `setTimeout` at 75% of the TTL.

No server calls are made to check token status — the timer is purely client-side.

## Flow

```
Login/Register → Server returns { user, expiresIn }
                        ↓
              Zustand stores expiresIn
                        ↓
              useTokenRefresh schedules setTimeout(refresh, expiresIn * 0.75)
                        ↓
              Timer fires → calls refreshTokenFn → returns { user, expiresIn }
                        ↓
              Zustand updates → useEffect re-fires → new timer scheduled
```

### SSR First Load

`beforeLoad` calls `getCurrentUserFn` which reads the `TOKEN_EXPIRES_AT` cookie and computes the remaining `expiresIn`. This is passed to the route context, then hydrated into Zustand — so the timer is scheduled even without a login action.

### Visibility Change

When the user switches back to the tab (`visibilitychange`), the hook re-reads `expiresIn` from Zustand and reschedules the timer (or triggers an immediate refresh if expired).

## Files

| File | Role |
|------|------|
| `src/lib/server/auth.ts` | Server functions — return `{ user, expiresIn }` |
| `src/stores/auth-store.ts` | Zustand store — holds `expiresIn` in state |
| `src/components/auth/use-token-refresh.ts` | Hook — schedules `setTimeout` at 75% TTL |
| `src/components/auth/token-status.tsx` | UI — countdown from Zustand `expiresIn` |
| `src/routes/__root.tsx` | Root — hydrates store with SSR context |
| `src/types/router.ts` | Types — `expiresIn` in `RouterContext` |

## Key Design Decisions

- **75% TTL**: refresh fires at 75% of the token lifetime (e.g., 45min for a 1h token), leaving a comfortable margin
- **10s cooldown**: prevents double-refresh from concurrent triggers (visibility + timer)
- **No polling**: no `setInterval` to check status, no server function to read cookies — pure timer-based
- **`onExpired` via `useRef`**: avoids recreating the timer when the callback reference changes
- **Zustand as single source of truth**: both `useTokenRefresh` and `TokenStatus` read from the same store
