import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../chunks/dashboard_BH4PFK7W.mjs';
import { b as getStats, s as searchLicenses } from '../../../chunks/admin_B8uWt3Aj.mjs';
import { d as db, u as user } from '../../../chunks/db_CHRX6QwF.mjs';
import { inArray } from 'drizzle-orm';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Revenue = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Revenue;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const stats = await getStats();
  const proRevenue = stats.proLicenses * 79;
  const businessRevenue = stats.businessLicenses * 199;
  const totalRevenue = stats.revenue;
  const page = Number(Astro2.url.searchParams.get("page") ?? "1");
  const result = await searchLicenses("", {}, page, 20);
  const userIds = [...new Set(result.licenses.map((l) => l.userId))];
  const users = userIds.length > 0 ? await db.select().from(user).where(inArray(user.id, userIds)) : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  const now = /* @__PURE__ */ new Date();
  const licensesWithStatus = result.licenses.map((license) => {
    const isExpired = license.expiresAt ? new Date(license.expiresAt) <= now : false;
    const status = !license.active ? "revoked" : isExpired ? "expired" : "active";
    return { ...license, status, userEmail: userMap[license.userId]?.email ?? license.userId.slice(0, 8) };
  });
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Revenue", "currentPath": "/dashboard/admin/revenue" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> <div class="flex items-center justify-between"> <div> <h2 class="text-3xl font-bold tracking-tight">Revenue</h2> <p class="text-muted-foreground">Track earnings across license tiers.</p> </div> <a href="https://dashboard.stripe.com/test" target="_blank" rel="noopener noreferrer" class="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent">
Open Stripe Dashboard
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> </a> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Revenue</span> </div> <div class="px-6"> <div class="text-2xl font-bold">$${totalRevenue.toLocaleString()}</div> <p class="text-xs text-muted-foreground">Lifetime earnings</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Pro Revenue</span> </div> <div class="px-6"> <div class="text-2xl font-bold">$${proRevenue.toLocaleString()}</div> <p class="text-xs text-muted-foreground">${stats.proLicenses} x $79</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Business Revenue</span> </div> <div class="px-6"> <div class="text-2xl font-bold">$${businessRevenue.toLocaleString()}</div> <p class="text-xs text-muted-foreground">${stats.businessLicenses} x $199</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Active Licenses</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${stats.activeLicenses}</div> <p class="text-xs text-muted-foreground">Generating revenue</p> </div> </div> </div> <!-- Tier Breakdown --> <div class="grid gap-4 md:grid-cols-2"> <!-- Pro breakdown --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <div class="flex items-center gap-2"> <h3 class="text-lg font-semibold">Pro Tier</h3> <span class="inline-flex items-center rounded-full border border-apple-teal/30 px-2 py-0.5 text-xs font-medium text-apple-teal">$79/yr</span> </div> </div> <div class="px-6"> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">${stats.proLicenses} licenses</span> <span class="text-sm font-semibold text-apple-teal">$${proRevenue.toLocaleString()}</span> </div> <div class="mt-3 h-2 rounded-full bg-muted"> <div class="h-2 rounded-full bg-apple-teal"${addAttribute(`width: ${totalRevenue > 0 ? proRevenue / totalRevenue * 100 : 0}%`, "style")}></div> </div> <div class="mt-2 text-xs text-muted-foreground"> ${totalRevenue > 0 ? Math.round(proRevenue / totalRevenue * 100) : 0}% of total revenue
</div> </div> </div> <!-- Business breakdown --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <div class="flex items-center gap-2"> <h3 class="text-lg font-semibold">Business Tier</h3> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2 py-0.5 text-xs font-medium text-apple-purple">$199</span> </div> </div> <div class="px-6"> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">${stats.businessLicenses} licenses</span> <span class="text-sm font-semibold text-apple-purple">$${businessRevenue.toLocaleString()}</span> </div> <div class="mt-3 h-2 rounded-full bg-muted"> <div class="h-2 rounded-full bg-apple-purple"${addAttribute(`width: ${totalRevenue > 0 ? businessRevenue / totalRevenue * 100 : 0}%`, "style")}></div> </div> <div class="mt-2 text-xs text-muted-foreground"> ${totalRevenue > 0 ? Math.round(businessRevenue / totalRevenue * 100) : 0}% of total revenue
</div> </div> </div> </div> <!-- All Purchases table --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex items-center justify-between px-6"> <h3 class="text-lg font-semibold">All Purchases</h3> <span class="text-xs text-muted-foreground">${result.total} total</span> </div> <div class="px-6"> <div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tier</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Key</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Status</th> <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Date</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${licensesWithStatus.map((license) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle font-mono text-muted-foreground"> ${license.userEmail} </td> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier} </span> </td> <td class="p-4 align-middle font-mono text-muted-foreground"> ${license.licenseKey.slice(0, 16)}...
</td> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.status === "active" ? "border-emerald-200 text-emerald-600" : license.status === "expired" ? "border-amber-200 text-amber-600" : "border-destructive/30 text-destructive"
  ], "class:list")}> ${license.status} </span> </td> <td class="p-4 align-middle text-right text-xs text-muted-foreground"> ${new Date(license.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </td> </tr>`)} ${result.licenses.length === 0 && renderTemplate`<tr> <td colspan="5" class="p-4 text-center text-sm text-muted-foreground">No purchases yet.</td> </tr>`} </tbody> </table> </div> </div> <!-- Pagination --> ${result.totalPages > 1 && renderTemplate`<div class="flex items-center justify-between border-t px-6 pt-4"> <div class="text-xs text-muted-foreground">
Page ${result.page} of ${result.totalPages} </div> <div class="flex items-center gap-2"> ${page > 1 ? renderTemplate`<a${addAttribute(`/dashboard/admin/revenue?page=${page - 1}`, "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Previous
</a>` : renderTemplate`<span class="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium text-muted-foreground opacity-50">
Previous
</span>`} ${page < result.totalPages ? renderTemplate`<a${addAttribute(`/dashboard/admin/revenue?page=${page + 1}`, "href")} class="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
Next
</a>` : renderTemplate`<span class="inline-flex h-8 items-center rounded-md border border-input px-3 text-xs font-medium text-muted-foreground opacity-50">
Next
</span>`} </div> </div>`} </div> </div> ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/revenue.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/revenue.astro";
const $$url = "/dashboard/admin/revenue";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Revenue,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
