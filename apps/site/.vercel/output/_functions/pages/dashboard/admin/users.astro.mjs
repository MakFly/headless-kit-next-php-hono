import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../chunks/dashboard_CZ5mJo0o.mjs';
import { f as searchUsers } from '../../../chunks/admin_B8uWt3Aj.mjs';
import { d as db, u as user } from '../../../chunks/db_CHRX6QwF.mjs';
import { count, eq } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Users = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Users;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const q = Astro2.url.searchParams.get("q") || "";
  const roleFilter = Astro2.url.searchParams.get("role") || "all";
  const page = parseInt(Astro2.url.searchParams.get("page") || "1");
  const result = await searchUsers(q, { role: roleFilter }, page, 20);
  const [adminCountResult, customerCountResult] = await Promise.all([
    db.select({ count: count() }).from(user).where(eq(user.role, "admin")),
    db.select({ count: count() }).from(user).where(eq(user.role, "customer"))
  ]);
  const adminCount = adminCountResult[0]?.count ?? 0;
  const customerCount = customerCountResult[0]?.count ?? 0;
  const totalAllUsers = adminCount + customerCount;
  function roleFilterUrl(role) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role !== "all") params.set("role", role);
    return `/dashboard/admin/users${params.toString() ? `?${params}` : ""}`;
  }
  function pageUrl(p) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (roleFilter !== "all") params.set("role", roleFilter);
    if (p > 1) params.set("page", String(p));
    return `/dashboard/admin/users${params.toString() ? `?${params}` : ""}`;
  }
  const dateFormat = { year: "numeric", month: "short", day: "numeric" };
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Users", "currentPath": "/dashboard/admin/users" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Users</h2> <p class="text-muted-foreground"> ${result.total} users${q ? ` matching "${q}"` : ""}${roleFilter !== "all" ? ` (${roleFilter})` : ""} </p> </div> <!-- Search + Filter bar --> <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"> <form method="get" action="/dashboard/admin/users" class="flex gap-2"> <input type="text" name="q"${addAttribute(q, "value")} placeholder="Search by name or email..." class="h-9 max-w-sm rounded-md border border-input bg-background px-3 text-sm"> ${roleFilter !== "all" && renderTemplate`<input type="hidden" name="role"${addAttribute(roleFilter, "value")}>`} <button type="submit" class="inline-flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent">
Search
</button> </form> <div class="flex items-center gap-2"> ${[
    { label: "All", value: "all" },
    { label: "Admin", value: "admin" },
    { label: "Customer", value: "customer" }
  ].map((f) => renderTemplate`<a${addAttribute(roleFilterUrl(f.value), "href")}${addAttribute([
    "inline-flex h-8 items-center rounded-md px-3 text-xs font-medium transition-colors",
    roleFilter === f.value ? "border border-input bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
  ], "class:list")}> ${f.label} </a>`)} </div> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Users</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${totalAllUsers}</div> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Admins</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${adminCount}</div> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Customers</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${customerCount}</div> </div> </div> </div> <!-- Users table --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold"> ${roleFilter !== "all" ? `${roleFilter} users` : "All Users"} </h3> <p class="text-sm text-muted-foreground">Page ${result.page} of ${result.totalPages || 1}</p> </div> <div class="px-6"> <div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Role</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Verified</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Created</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${result.users.map((u) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle">${u.name || "—"}</td> <td class="p-4 align-middle font-mono text-muted-foreground">${u.email}</td> <td class="p-4 align-middle"> ${u.role === "admin" ? renderTemplate`<span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2 py-0.5 text-xs font-medium text-apple-purple">
Admin
</span>` : renderTemplate`<span class="inline-flex items-center rounded-full border border-primary/30 px-2 py-0.5 text-xs font-medium text-primary">
Customer
</span>`} </td> <td class="p-4 align-middle"> ${u.emailVerified ? renderTemplate`<span class="text-sm text-emerald-600">${"✓"}</span>` : renderTemplate`<span class="text-sm text-destructive">${"✕"}</span>`} </td> <td class="p-4 align-middle text-xs text-muted-foreground"> ${u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", dateFormat) : "—"} </td> <td class="p-4 align-middle"> <div class="flex items-center gap-1"> <a${addAttribute(`/dashboard/admin/users/${u.id}`, "href")} class="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium hover:bg-accent">
View
</a> <button type="button" class="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-amber-600 hover:bg-accent"${addAttribute(u.id, "data-user-id")}${addAttribute(u.role, "data-current-role")}${addAttribute(`
                          const btn = this;
                          const userId = btn.dataset.userId;
                          const currentRole = btn.dataset.currentRole;
                          const newRole = currentRole === 'admin' ? 'customer' : 'admin';
                          if (!confirm('Change role to ' + newRole + '?')) return;
                          fetch('/api/admin/users/role', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userId, role: newRole })
                          }).then(r => r.json()).then(() => window.location.reload());
                        `, "onclick")}> ${u.role === "admin" ? "Demote" : "Promote"} </button> </div> </td> </tr>`)} ${result.users.length === 0 && renderTemplate`<tr> <td colspan="6" class="p-4 text-center text-sm text-muted-foreground">No users found.</td> </tr>`} </tbody> </table> </div> </div> </div> <!-- Pagination --> ${result.totalPages > 1 && renderTemplate`<div class="flex items-center justify-between"> <div class="text-xs text-muted-foreground">
Showing ${(result.page - 1) * result.perPage + 1}–${Math.min(result.page * result.perPage, result.total)} of ${result.total} </div> <div class="flex gap-2"> ${result.page > 1 && renderTemplate`<a${addAttribute(pageUrl(result.page - 1), "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Previous
</a>`} ${result.page < result.totalPages && renderTemplate`<a${addAttribute(pageUrl(result.page + 1), "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Next
</a>`} </div> </div>`} </div> ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/users.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/users.astro";
const $$url = "/dashboard/admin/users";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Users,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
