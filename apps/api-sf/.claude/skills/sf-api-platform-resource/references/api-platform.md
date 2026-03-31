# API Platform resource on entity

## Workflow

1. Add `#[ApiResource]` + operations on `src/Shared/Entity/{Entity}.php`
2. Add `#[Groups]` on **properties** (`entity:read`, `entity:write`) — not on getters
3. `php bin/console debug:router | grep {entity}`
4. Responses are wrapped by `EnvelopeSubscriber` — do not double-wrap

## Guardrails

- `uriTemplate` is relative (no `/api/v1` prefix — see `config/routes/api_platform.yaml`)
- Standard CRUD → API Platform; custom business flows → invokable controllers in `Feature/`

## Output

- Entity carries `#[ApiResource]` + groups
- Routes visible in router debug
- Envelope unchanged project-wide
