import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, e as addAttribute, m as maybeRenderHead } from '../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../chunks/dashboard_CZ5mJo0o.mjs';
import { g as getLicenseByUser } from '../chunks/license_CP9fThp_.mjs';
export { renderers } from '../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  const user = Astro2.locals.user;
  const license = await getLicenseByUser(user.id);
  const tierLabel = license?.tier === "pro" ? "Pro" : license?.tier === "business" ? "Business" : "Starter";
  const statusLabel = license?.active ? "Active" : license ? "Expired" : "Free";
  const expiryLabel = license?.expiresAt ? new Date(license.expiresAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : license ? "Lifetime" : "—";
  const quickLinks = [
    { href: "/dashboard/license", label: "License Key", desc: "View and copy your license key", color: "primary" },
    { href: "/dashboard/downloads", label: "Downloads", desc: "CLI tools & premium templates", color: "apple-teal" },
    { href: "/dashboard/billing", label: "Billing", desc: "Manage plan & payments", color: "apple-orange" },
    { href: "/docs", label: "Documentation", desc: "Guides and API reference", color: "apple-purple" }
  ];
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Dashboard", "currentPath": "/dashboard" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2> <p class="text-muted-foreground">Welcome back, ', '.</p> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> <!-- Tier --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">License Tier</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M6 3h12l4 6-10 13L2 9Z"></path></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">', '</div> <p class="text-xs text-muted-foreground">Current plan level</p> </div> </div> <!-- Status --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Status</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">', '</div> <p class="text-xs text-muted-foreground">License status</p> </div> </div> <!-- Expiry --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Expires</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">', '</div> <p class="text-xs text-muted-foreground">License expiration date</p> </div> </div> <!-- Downloads --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Downloads</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">', '</div> <p class="text-xs text-muted-foreground">Available resources</p> </div> </div> </div> <!-- License summary card --> ', ' <!-- Quick links grid --> <div> <h3 class="mb-3 text-base font-medium">Quick Links</h3> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> ', " </div> </div> </div> <script>\n    document.getElementById('copy-key')?.addEventListener('click', function() {\n      const key = this.getAttribute('data-key');\n      navigator.clipboard.writeText(key).then(() => {\n        const original = this.textContent;\n        this.textContent = 'Copied!';\n        setTimeout(() => { this.textContent = original; }, 2000);\n      });\n    });\n  <\/script> "])), maybeRenderHead(), user.name || user.email.split("@")[0], tierLabel, statusLabel, expiryLabel, license?.tier === "business" ? "5" : license?.tier === "pro" ? "3" : "1", license ? renderTemplate`<div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex items-center justify-between px-6 pb-0"> <h3 class="text-base font-medium">License Key</h3> <div class="flex items-center gap-2"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier.toUpperCase()} </span> <span class="inline-flex items-center rounded-full border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-600">
ACTIVE
</span> </div> </div> <div class="px-6"> <div class="flex items-center gap-3 rounded-lg border bg-muted p-4"> <code class="flex-1 break-all font-mono text-sm text-primary"> ${license.licenseKey.slice(0, 12)}...${license.licenseKey.slice(-8)} </code> <button id="copy-key"${addAttribute(license.licenseKey, "data-key")} class="shrink-0 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
Copy
</button> </div> </div> </div>` : renderTemplate`<div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-base font-medium">No License</h3> <p class="mt-2 text-sm text-muted-foreground">Upgrade to Pro or Business to unlock premium features.</p> <a href="/#pricing" class="mt-4 inline-flex h-9 items-center rounded-lg bg-primary px-4 text-xs font-medium text-background transition-colors hover:bg-primary/90">
Upgrade Now
</a> </div> </div>`, quickLinks.map((link) => renderTemplate`<a${addAttribute(link.href, "href")} class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-4 py-6 transition-colors hover:bg-muted/50"> <div class="px-6"> <div${addAttribute(`text-sm font-semibold text-${link.color}`, "class")}>${link.label}</div> <div class="mt-1 text-xs text-muted-foreground">${link.desc}</div> </div> </a>`)) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/index.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
