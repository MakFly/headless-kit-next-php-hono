# Security & Firewalls

## Token type

This project uses **Paseto V4** tokens (not JWT). Never import JWT libraries.

## Firewall configuration

Defined in `config/packages/security.yaml`:
- Public routes: auth endpoints (register, login, refresh, forgot-password)
- Protected routes: require `IS_AUTHENTICATED_FULLY`
- Admin routes: require `ROLE_ADMIN` via voter

## Auth conventions

- Refresh token body expects `refreshToken` (camelCase), not `refresh_token`
- Login response includes `access_token`, `refresh_token`, `expires_in`, `token_type`
- 2FA flow: login returns `requires_2fa: true` → client sends `POST /api/v1/auth/2fa/verify` with `{ code }`

## Password hashing

Argon2id (auto via Symfony hasher). Never manually hash passwords.

## CORS

Handled by NelmioBundle — configured in `config/packages/nelmio_cors.yaml`. Never add manual CORS headers.
