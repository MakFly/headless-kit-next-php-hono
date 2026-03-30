import { b as createAstro, c as createComponent, a as renderTemplate, f as defineScriptVars, r as renderComponent, m as maybeRenderHead, e as addAttribute } from '../../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../../chunks/dashboard_CZ5mJo0o.mjs';
import { c as getUserWithLicense, e as getUserSessions } from '../../../../chunks/admin_B8uWt3Aj.mjs';
export { renderers } from '../../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$id = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$id;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const userId = Astro2.params.id;
  const userData = await getUserWithLicense(userId);
  if (!userData) return Astro2.redirect("/dashboard/admin/users");
  const sessions = await getUserSessions(userId);
  const dateFormat = { year: "numeric", month: "short", day: "numeric" };
  const dateTimeFormat = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
  return renderTemplate(_a || (_a = __template(["", " <script>(function(){", "\n  // Change Role\n  document.getElementById('btn-make-admin')?.addEventListener('click', function () {\n    if (!confirm('Promote this user to Admin?')) return;\n    fetch('/api/admin/users/role', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ userId, role: 'admin' })\n    }).then(r => r.json()).then(() => window.location.reload());\n  });\n\n  document.getElementById('btn-make-customer')?.addEventListener('click', function () {\n    if (!confirm('Demote this user to Customer?')) return;\n    fetch('/api/admin/users/role', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ userId, role: 'customer' })\n    }).then(r => r.json()).then(() => window.location.reload());\n  });\n\n  // Delete User\n  document.getElementById('btn-delete-user')?.addEventListener('click', function () {\n    if (!confirm('Delete this user? This cannot be undone.')) return;\n    fetch('/api/admin/users/delete', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({ userId })\n    }).then(r => r.json()).then(() => {\n      window.location.href = '/dashboard/admin/users';\n    });\n  });\n\n  // License actions\n  document.querySelectorAll('.btn-revoke-license').forEach(function (btn) {\n    btn.addEventListener('click', function () {\n      var licenseId = this.dataset.licenseId;\n      if (!confirm('Revoke this license?')) return;\n      fetch('/api/admin/licenses/revoke', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ licenseId })\n      }).then(r => r.json()).then(() => window.location.reload());\n    });\n  });\n\n  document.querySelectorAll('.btn-reactivate-license').forEach(function (btn) {\n    btn.addEventListener('click', function () {\n      var licenseId = this.dataset.licenseId;\n      if (!confirm('Reactivate this license?')) return;\n      fetch('/api/admin/licenses/reactivate', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ licenseId })\n      }).then(r => r.json()).then(() => window.location.reload());\n    });\n  });\n\n  document.querySelectorAll('.btn-extend-license').forEach(function (btn) {\n    btn.addEventListener('click', function () {\n      var licenseId = this.dataset.licenseId;\n      if (!confirm('Extend this license by 1 year?')) return;\n      fetch('/api/admin/licenses/extend', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ licenseId, months: 12 })\n      }).then(r => r.json()).then(() => window.location.reload());\n    });\n  });\n\n  // Session actions\n  document.querySelectorAll('.btn-kill-session').forEach(function (btn) {\n    btn.addEventListener('click', function () {\n      var sessionId = this.dataset.sessionId;\n      if (!confirm('Kill this session?')) return;\n      fetch('/api/admin/sessions/kill', {\n        method: 'POST',\n        headers: { 'Content-Type': 'application/json' },\n        body: JSON.stringify({ sessionId })\n      }).then(r => r.json()).then(() => window.location.reload());\n    });\n  });\n})();<\/script>"])), renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": userData.name, "currentPath": "/dashboard/admin/users" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> <!-- Back link --> <div> <a href="/dashboard/admin/users" class="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
&larr; Back to Users
</a> </div> <!-- User Header card --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex items-start gap-4 px-6"> ${userData.image && renderTemplate`<img${addAttribute(userData.image, "src")}${addAttribute(userData.name, "alt")} class="h-16 w-16 rounded-full border object-cover">`} <div class="flex-1"> <h2 class="text-3xl font-bold tracking-tight">${userData.name}</h2> <p class="mt-1 font-mono text-sm text-muted-foreground">${userData.email}</p> <div class="mt-3 flex flex-wrap items-center gap-2"> ${userData.role === "admin" ? renderTemplate`<span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2 py-0.5 text-xs font-medium text-apple-purple">
Admin
</span>` : renderTemplate`<span class="inline-flex items-center rounded-full border border-primary/30 px-2 py-0.5 text-xs font-medium text-primary">
Customer
</span>`} ${userData.emailVerified ? renderTemplate`<span class="inline-flex items-center rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-600">
Verified
</span>` : renderTemplate`<span class="inline-flex items-center rounded-full border border-destructive/30 px-2 py-0.5 text-xs font-medium text-destructive">
Not Verified
</span>`} <span class="text-xs text-muted-foreground">
Member since ${userData.createdAt ? new Date(userData.createdAt).toLocaleDateString("en-US", dateFormat) : "—"} </span> </div> </div> </div> </div> <!-- User Management card --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">User Management</h3> <p class="text-sm text-muted-foreground">Change role or delete this user.</p> </div> <div class="flex flex-wrap gap-3 px-6"> ${userData.role !== "admin" && renderTemplate`<button type="button" id="btn-make-admin" class="inline-flex h-9 items-center rounded-md border border-apple-purple/30 px-4 text-xs font-medium text-apple-purple transition-colors hover:bg-apple-purple/10">
Make Admin
</button>`} ${userData.role !== "customer" && renderTemplate`<button type="button" id="btn-make-customer" class="inline-flex h-9 items-center rounded-md border border-primary/30 px-4 text-xs font-medium text-primary transition-colors hover:bg-primary/10">
Make Customer
</button>`} <button type="button" id="btn-delete-user" class="inline-flex h-9 items-center rounded-md border border-destructive/30 px-4 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
Delete User
</button> </div> </div> <!-- Licenses card --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Licenses</h3> <p class="text-sm text-muted-foreground">Licenses owned by this user.</p> </div> <div class="px-6"> ${userData.licenses.length > 0 ? renderTemplate`<div class="flex flex-col gap-4"> ${userData.licenses.map((license) => renderTemplate`<div class="rounded-lg border bg-background p-4"> <div class="flex flex-wrap items-center gap-2"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier.toUpperCase()} </span> ${license.active ? renderTemplate`<span class="inline-flex items-center rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-600">
Active
</span>` : renderTemplate`<span class="inline-flex items-center rounded-full border border-destructive/30 px-2 py-0.5 text-xs font-medium text-destructive">
Revoked
</span>`} </div> <div class="mt-3 rounded-lg border bg-card px-3 py-2 font-mono text-xs text-muted-foreground select-all"> ${license.licenseKey} </div> <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground"> <span>Created: ${new Date(license.createdAt).toLocaleDateString("en-US", dateFormat)}</span> <span>Expires: ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString("en-US", dateFormat) : "Never (lifetime)"}</span> </div> <div class="mt-3 flex flex-wrap gap-2"> ${license.active ? renderTemplate`<button type="button" class="btn-revoke-license inline-flex h-8 items-center rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"${addAttribute(license.id, "data-license-id")}>
Revoke
</button>` : renderTemplate`<button type="button" class="btn-reactivate-license inline-flex h-8 items-center rounded-md border border-primary/30 px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10"${addAttribute(license.id, "data-license-id")}>
Reactivate
</button>`} <button type="button" class="btn-extend-license inline-flex h-8 items-center rounded-md border border-amber-200 px-3 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:hover:bg-amber-950/20"${addAttribute(license.id, "data-license-id")}>
Extend +1yr
</button> </div> </div>`)} </div>` : renderTemplate`<div> <p class="text-sm text-muted-foreground">No license found for this user.</p> <a${addAttribute(`/dashboard/admin/licenses/create?email=${encodeURIComponent(userData.email)}`, "href")} class="mt-3 inline-flex h-9 items-center rounded-md border border-apple-teal/30 px-4 text-xs font-medium text-apple-teal transition-colors hover:bg-apple-teal/10">
Create License
</a> </div>`} </div> </div> <!-- Sessions card --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Sessions (${sessions.length})</h3> <p class="text-sm text-muted-foreground">Active sessions for this user.</p> </div> <div class="px-6"> ${sessions.length > 0 ? renderTemplate`<div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Session ID</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">IP Address</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User Agent</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Created</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${sessions.map((s) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle font-mono text-xs text-muted-foreground"> ${s.id.slice(0, 12)}...
</td> <td class="p-4 align-middle font-mono text-xs text-muted-foreground"> ${s.ipAddress || "—"} </td> <td class="p-4 align-middle font-mono text-xs text-muted-foreground max-w-48 truncate"${addAttribute(s.userAgent || "", "title")}> ${s.userAgent ? s.userAgent.slice(0, 50) + (s.userAgent.length > 50 ? "..." : "") : "—"} </td> <td class="p-4 align-middle text-xs text-muted-foreground"> ${new Date(s.createdAt).toLocaleDateString("en-US", dateTimeFormat)} </td> <td class="p-4 align-middle text-xs text-muted-foreground"> ${new Date(s.expiresAt).toLocaleDateString("en-US", dateTimeFormat)} </td> <td class="p-4 align-middle"> <button type="button" class="btn-kill-session inline-flex h-8 items-center rounded-md border border-destructive/30 px-3 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"${addAttribute(s.id, "data-session-id")}>
Kill
</button> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<p class="text-sm text-muted-foreground">No active sessions.</p>`} </div> </div> </div> ` }), defineScriptVars({ userId }));
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/users/[id].astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/users/[id].astro";
const $$url = "/dashboard/admin/users/[id]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$id,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
