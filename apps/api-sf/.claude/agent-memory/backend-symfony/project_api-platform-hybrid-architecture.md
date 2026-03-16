---
name: api-platform-hybrid-architecture
description: Current architecture state after API Platform migration — which features use AP vs invokable controllers, total controller counts
type: project
---

The Symfony API now uses a hybrid approach: API Platform 4 handles 34 CRUD operations across 13 resources, while 42 invokable controllers handle business logic, analytics, and multi-step mutations.

**Rule of thumb:**
- API Platform = standard CRUD (list, show, create, update, delete) with Groups serialization
- Invokable controllers = side-effects, analytics, multi-step flows (subscribe, invite, assign)

**Controller counts per feature (as of 2026-03-16):**
- Auth: 11 (Register, Login, Login2fa, Me, Refresh, Logout, RevokeAll, TestAccounts, ForgotPassword, ResetPassword, VerifyResetToken)
- Cart: 4 (ShowCart, AddItem, UpdateItem, RemoveItem)
- Orders: 1 (CreateOrder) — List/Show via API Platform
- Admin/Rbac: 6
- Admin/Shop: 8 (Dashboard, RevenueAnalytics, TopProducts, Inventory, UpdateInventory, UpdateOrderStatus, BulkApproveReviews, BulkRejectReviews)
- Saas: 10 (Dashboard, GetSubscription, Subscribe, Cancel, InviteTeamMember, ChangeTeamRole, RemoveTeamMember, GetUsage, GetSettings, UpdateSettings)
- Support: 8 (CreateConversation, SendMessage, Rate, AgentQueue, AgentAssigned, Assign, UpdateStatus, RatingStats)
- Shop: 0 controllers — fully served by API Platform

**AP resources:**
Products (5), Categories (2), Reviews (3), Orders read (2), Plan (2), Organization (3), Subscription (1), Invoice (1), TeamMember (4), UsageRecord (1), Conversation (3), ChatMessage (2), CannedResponse (5) = 34 ops

**Key infrastructure:**
- `src/Shared/ApiPlatform/` holds Serializer, Doctrine extensions, State providers/processors
- `EnvelopeSubscriber` wraps all AP responses in the standard `{success, data, status, request_id}` envelope
- `/api/v1` prefix applied via `config/routes/api_platform.yaml` — entity `uriTemplate` values are relative

**Why:** Migration from pure invokable controllers to hybrid model to reduce boilerplate for standard CRUD while keeping business logic controllers explicit.

**How to apply:** When adding new resources, default to API Platform for CRUD and add invokable controllers only for operations that cannot be expressed as standard REST resource operations.
