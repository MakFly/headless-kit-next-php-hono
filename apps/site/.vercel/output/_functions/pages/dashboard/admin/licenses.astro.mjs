import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, e as addAttribute, F as Fragment, m as maybeRenderHead } from '../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../chunks/dashboard_BH4PFK7W.mjs';
import { s as searchLicenses } from '../../../chunks/admin_B8uWt3Aj.mjs';
import { d as db, u as user, l as licenses } from '../../../chunks/db_CHRX6QwF.mjs';
import { inArray, count, eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Licenses = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Licenses;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const q = Astro2.url.searchParams.get("q") || "";
  const tierFilter = Astro2.url.searchParams.get("tier") || "all";
  const statusFilter = Astro2.url.searchParams.get("status") || "all";
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const result = await searchLicenses(q, { tier: tierFilter, status: statusFilter }, page, 20);
  const userIds = [...new Set(result.licenses.map((l) => l.userId))];
  const users = userIds.length > 0 ? await db.select().from(user).where(inArray(user.id, userIds)) : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const [totalResult] = await db.select({ count: count() }).from(licenses);
  const [activeResult] = await db.select({ count: count() }).from(licenses).where(eq(licenses.active, true));
  const totalCount = totalResult?.count ?? 0;
  const activeCount = activeResult?.count ?? 0;
  const revokedCount = totalCount - activeCount;
  function filterUrl(key, value) {
    const params = new URLSearchParams(Astro2.url.search);
    params.set(key, value);
    params.delete("page");
    return `?${params.toString()}`;
  }
  function pageUrl(p) {
    const params = new URLSearchParams(Astro2.url.search);
    params.set("page", String(p));
    return `?${params.toString()}`;
  }
  const now = /* @__PURE__ */ new Date();
  const licensesWithStatus = result.licenses.map((license) => {
    const u = userMap[license.userId];
    const isExpired = license.active && license.expiresAt ? new Date(license.expiresAt) <= now : false;
    const status = !license.active ? "revoked" : isExpired ? "expired" : "active";
    return {
      ...license,
      status,
      userEmail: u?.email,
      userName: u?.email ?? license.userId.slice(0, 8) + "..."
    };
  });
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Licenses", "currentPath": "/dashboard/admin/licenses" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <div class="flex items-center justify-between"> <div> <h2 class="text-3xl font-bold tracking-tight">Licenses</h2> <p class="text-muted-foreground">', ' total licenses.</p> </div> <a href="/dashboard/admin/licenses/create" class="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">\n+ Create License\n</a> </div> <!-- Search + Filters --> <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <form method="GET" class="flex gap-2"> <input type="hidden" name="tier"', '> <input type="hidden" name="status"', '> <input type="text" name="q"', ' placeholder="Search by email or license key..." class="h-9 max-w-sm rounded-md border border-input bg-background px-3 text-sm"> <button type="submit" class="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">\nSearch\n</button> </form> <div class="flex items-center gap-2"> <!-- Tier filters --> <span class="mr-1 text-xs font-medium text-muted-foreground">Tier:</span> ', ' <span class="ml-2 mr-1 text-xs font-medium text-muted-foreground">Status:</span> ', ' </div> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Licenses</span> </div> <div class="px-6"> <div class="text-2xl font-bold">', '</div> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Active</span> </div> <div class="px-6"> <div class="text-2xl font-bold text-emerald-600">', '</div> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Revoked</span> </div> <div class="px-6"> <div class="text-2xl font-bold text-destructive">', '</div> </div> </div> </div> <!-- Licenses table --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">', '</h3> </div> <div class="px-6"> <div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tier</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Key</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Created</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Expires</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ', " ", " </tbody> </table> </div> </div> </div> <!-- Pagination --> ", ` </div> <script>
    // Copy license key
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-copy')
        if (key) {
          navigator.clipboard.writeText(key)
          btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
          setTimeout(() => {
            btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>'
          }, 2000)
        }
      })
    })

    // Action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const action = btn.getAttribute('data-action')
        const licenseId = btn.getAttribute('data-license-id')

        if (action === 'revoke' && !confirm('Revoke this license?')) return
        if (action === 'reactivate' && !confirm('Reactivate this license?')) return

        const endpoints = {
          revoke: '/api/admin/licenses/revoke',
          reactivate: '/api/admin/licenses/reactivate',
          extend: '/api/admin/licenses/extend',
        }

        const bodies = {
          revoke: { licenseId },
          reactivate: { licenseId },
          extend: { licenseId, months: 12 },
        }

        try {
          const res = await fetch(endpoints[action], {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bodies[action]),
          })
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            alert(data.error || 'Action failed')
            return
          }
          location.reload()
        } catch (err) {
          alert('Network error')
        }
      })
    })
  <\/script> `])), maybeRenderHead(), result.total, addAttribute(tierFilter, "value"), addAttribute(statusFilter, "value"), addAttribute(q, "value"), ["all", "pro", "business"].map((t) => renderTemplate`<a${addAttribute(filterUrl("tier", t), "href")}${addAttribute([
    "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors",
    tierFilter === t ? "border border-input bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  ], "class:list")}> ${t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)} </a>`), ["all", "active", "revoked", "expired"].map((s) => renderTemplate`<a${addAttribute(filterUrl("status", s), "href")}${addAttribute([
    "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors",
    statusFilter === s ? "border border-input bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  ], "class:list")}> ${s.charAt(0).toUpperCase() + s.slice(1)} </a>`), totalCount, activeCount, revokedCount, q ? `Results for "${q}"` : "All Licenses", licensesWithStatus.map((license) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle font-mono text-sm"> ${license.userEmail ? renderTemplate`<a${addAttribute(`/dashboard/admin/users/${license.userId}`, "href")} class="text-primary hover:underline"> ${license.userEmail} </a>` : renderTemplate`<span class="text-muted-foreground">${license.userId.slice(0, 8)}...</span>`} </td> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier.toUpperCase()} </span> </td> <td class="p-4 align-middle"> <div class="flex items-center gap-2"> <span class="font-mono text-xs text-muted-foreground"> ${license.licenseKey.slice(0, 8)}...${license.licenseKey.slice(-4)} </span> <button type="button"${addAttribute(license.licenseKey, "data-copy")} class="copy-btn inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground" title="Copy license key"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg> </button> </div> </td> <td class="p-4 align-middle"> ${license.status === "revoked" ? renderTemplate`<span class="inline-flex items-center rounded-full border border-destructive/30 px-2 py-0.5 text-xs font-medium text-destructive">
Revoked
</span>` : license.status === "expired" ? renderTemplate`<span class="inline-flex items-center rounded-full border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-600">
Expired
</span>` : renderTemplate`<span class="inline-flex items-center rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-600">
Active
</span>`} </td> <td class="p-4 align-middle text-xs text-muted-foreground"> ${new Date(license.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </td> <td class="p-4 align-middle text-xs text-muted-foreground"> ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "Lifetime"} </td> <td class="p-4 align-middle"> <div class="flex items-center gap-1"> ${license.active ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <button type="button" data-action="revoke"${addAttribute(license.id, "data-license-id")} class="action-btn inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-destructive hover:bg-accent">
Revoke
</button> <button type="button" data-action="extend"${addAttribute(license.id, "data-license-id")} class="action-btn inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-apple-teal hover:bg-accent">
Extend +1yr
</button> ` })}` : renderTemplate`<button type="button" data-action="reactivate"${addAttribute(license.id, "data-license-id")} class="action-btn inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-primary hover:bg-accent">
Reactivate
</button>`} </div> </td> </tr>`), result.licenses.length === 0 && renderTemplate`<tr> <td colspan="7" class="p-4 text-center text-sm text-muted-foreground">No licenses found.</td> </tr>`, result.totalPages > 1 && renderTemplate`<div class="flex items-center justify-between"> <div class="text-xs text-muted-foreground">
Page ${page} of ${result.totalPages} </div> <div class="flex items-center gap-2"> ${page > 1 && renderTemplate`<a${addAttribute(pageUrl(page - 1), "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Previous
</a>`} ${Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => renderTemplate`<a${addAttribute(pageUrl(p), "href")}${addAttribute([
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
    p === page ? "border border-input bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  ], "class:list")}> ${p} </a>`)} ${page < result.totalPages && renderTemplate`<a${addAttribute(pageUrl(page + 1), "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Next
</a>`} </div> </div>`) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/licenses.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/licenses.astro";
const $$url = "/dashboard/admin/licenses";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Licenses,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
