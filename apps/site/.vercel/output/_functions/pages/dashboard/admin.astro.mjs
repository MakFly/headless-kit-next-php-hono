import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead, e as addAttribute } from '../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../chunks/dashboard_BH4PFK7W.mjs';
import { b as getStats, h as getRecentSignups, i as getExpiringLicenses, j as getRecentLicenses } from '../../chunks/admin_B8uWt3Aj.mjs';
import { d as db, u as user } from '../../chunks/db_CHRX6QwF.mjs';
import { eq } from 'drizzle-orm';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const stats = await getStats();
  const recentSignups = await getRecentSignups(5);
  const expiringLicenses = await getExpiringLicenses(30);
  const recentLicenses = await getRecentLicenses(5);
  const expiringWithUsers = await Promise.all(
    expiringLicenses.map(async (license) => {
      const [u] = await db.select().from(user).where(eq(user.id, license.userId));
      return { ...license, userEmail: u?.email ?? license.userId.slice(0, 8) };
    })
  );
  const recentWithUsers = await Promise.all(
    recentLicenses.map(async (license) => {
      const [u] = await db.select().from(user).where(eq(user.id, license.userId));
      return { ...license, userEmail: u?.email ?? license.userId.slice(0, 8) };
    })
  );
  const inactiveCount = stats.totalLicenses - stats.activeLicenses;
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Admin Overview", "currentPath": "/dashboard/admin" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Admin Overview</h2> <p class="text-muted-foreground">Monitor users, licenses, and revenue at a glance.</p> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Users</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${stats.totalUsers}</div> <p class="text-xs text-muted-foreground">Registered accounts</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Licenses</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${stats.totalLicenses}</div> <p class="text-xs text-muted-foreground">${stats.proLicenses} pro, ${stats.businessLicenses} business</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Total Revenue</span> </div> <div class="px-6"> <div class="text-2xl font-bold">$${stats.revenue.toLocaleString()}</div> <p class="text-xs text-muted-foreground">Lifetime earnings</p> </div> </div> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6"> <span class="text-sm font-medium">Active Licenses</span> </div> <div class="px-6"> <div class="text-2xl font-bold">${stats.activeLicenses}</div> <p class="text-xs text-muted-foreground">${inactiveCount} expired / revoked</p> </div> </div> </div> <!-- Recent Signups --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Recent Signups</h3> <p class="text-sm text-muted-foreground">Last 5 registered users.</p> </div> <div class="px-6"> <div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Name</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Email</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Role</th> <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Date</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${recentSignups.map((u) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle">${u.name}</td> <td class="p-4 align-middle font-mono text-muted-foreground">${u.email}</td> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    u.role === "admin" ? "border-apple-purple/30 text-apple-purple" : "border-apple-teal/30 text-apple-teal"
  ], "class:list")}> ${u.role} </span> </td> <td class="p-4 align-middle text-right text-xs text-muted-foreground"> ${new Date(u.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </td> </tr>`)} </tbody> </table> </div> </div> </div> <!-- Expiring Soon --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Expiring Soon</h3> <p class="text-sm text-muted-foreground">Licenses expiring within 30 days.</p> </div> <div class="px-6"> ${expiringWithUsers.length > 0 ? renderTemplate`<div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">User</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tier</th> <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Expires</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${expiringWithUsers.map((license) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle font-mono text-muted-foreground">${license.userEmail}</td> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier} </span> </td> <td class="p-4 align-middle text-right"> <span class="text-xs text-amber-600"> ${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—"} </span> </td> </tr>`)} </tbody> </table> </div>` : renderTemplate`<p class="text-sm text-emerald-600">No licenses expiring soon.</p>`} </div> </div> <!-- Recent Licenses --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Recent Licenses</h3> <p class="text-sm text-muted-foreground">Last 5 licenses issued.</p> </div> <div class="px-6"> <div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Tier</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Key</th> <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Date</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> ${recentWithUsers.map((license) => renderTemplate`<tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier} </span> </td> <td class="p-4 align-middle font-mono text-muted-foreground"> ${license.licenseKey.slice(0, 16)}...
</td> <td class="p-4 align-middle text-right text-xs text-muted-foreground"> ${new Date(license.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </td> </tr>`)} ${recentWithUsers.length === 0 && renderTemplate`<tr> <td colspan="3" class="p-4 text-center text-sm text-muted-foreground">No licenses yet.</td> </tr>`} </tbody> </table> </div> </div> </div> </div> ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/index.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/index.astro";
const $$url = "/dashboard/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
