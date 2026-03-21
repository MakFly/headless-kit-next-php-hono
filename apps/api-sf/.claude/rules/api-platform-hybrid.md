# API Platform vs Invokable Controllers

## Decision matrix

| Use API Platform | Use invokable controller |
|-----------------|--------------------------|
| Standard CRUD (list, show, create, update, delete) | Business logic (subscribe, invite, assign) |
| Filtering + pagination via query params | Multi-step operations with side-effects |
| Resource serialization with Groups | Aggregations, analytics, dashboards |
| Read-only public resources | Custom response shapes |

## Guardrails

- Never put `#[ApiResource]` on entities used only by invokable controllers
- Always use relative `uriTemplate` — the `/api/v1` prefix is applied by `config/routes/api_platform.yaml`
- Put `#[Groups]` on **properties**, never on getters
- `EnvelopeSubscriber` wraps all API Platform responses automatically — do not manually wrap
- Do not mix API Platform operations and controller endpoints for the same resource

## Pitfalls

- Forgetting to add serialization groups → returns empty objects
- Using absolute paths in `uriTemplate` → double `/api/v1/api/v1/...`
- Creating custom providers/processors when a simple controller would suffice
