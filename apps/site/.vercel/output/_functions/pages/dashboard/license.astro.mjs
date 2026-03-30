import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, F as Fragment, e as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../chunks/dashboard_CZ5mJo0o.mjs';
import { g as getLicenseByUser } from '../../chunks/license_CP9fThp_.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$License = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$License;
  const user = Astro2.locals.user;
  const license = await getLicenseByUser(user.id);
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "License", "currentPath": "/dashboard/license" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">License</h2> <p class="text-muted-foreground">Manage your license key.</p> </div> ', " </div> <script>\n    document.getElementById('copy-btn')?.addEventListener('click', function() {\n      const key = this.getAttribute('data-key');\n      navigator.clipboard.writeText(key).then(() => {\n        const original = this.textContent;\n        this.textContent = 'Copied!';\n        setTimeout(() => { this.textContent = original; }, 2000);\n      });\n    });\n  <\/script> "])), maybeRenderHead(), license ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate`  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4"> <!-- Tier --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Tier</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M6 3h12l4 6-10 13L2 9Z"></path></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${license.tier === "pro" ? "Pro" : "Business"}</div> <p class="text-xs text-muted-foreground">Current plan</p> </div> </div> <!-- Status --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Status</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${license.active ? "Active" : "Expired"}</div> <p class="text-xs text-muted-foreground">License is valid</p> </div> </div> <!-- Created --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Created</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${new Date(license.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div> <p class="text-xs text-muted-foreground">Date of purchase</p> </div> </div> <!-- Expires --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Expires</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${license.expiresAt ? new Date(license.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Lifetime"}</div> <p class="text-xs text-muted-foreground">License expiration</p> </div> </div> </div>  <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex items-center justify-between px-6 pb-0"> <h3 class="text-base font-medium">License Key</h3> <div class="flex items-center gap-2"> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
    license.tier === "pro" ? "border-apple-teal/30 text-apple-teal" : "border-apple-purple/30 text-apple-purple"
  ], "class:list")}> ${license.tier.toUpperCase()} </span> <span${addAttribute([
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
    license.active ? "border-emerald-200 text-emerald-600" : "border-destructive/30 text-destructive"
  ], "class:list")}> ${license.active ? "ACTIVE" : "EXPIRED"} </span> </div> </div> <div class="px-6"> <div class="rounded-lg border bg-muted p-4"> <div class="flex items-center justify-between gap-4"> <code class="flex-1 break-all font-mono text-sm text-primary">${license.licenseKey}</code> <button id="copy-btn"${addAttribute(license.licenseKey, "data-key")} class="shrink-0 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">
Copy
</button> </div> </div> <p class="mt-3 text-xs text-muted-foreground">
Add this key to your <code class="font-mono text-primary">.env</code> file as <code class="font-mono text-primary">HEADLESS_KIT_LICENSE</code> </p> </div> </div> ` })}` : renderTemplate`<!-- No license CTA -->
      <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6 text-center"> <h3 class="text-base font-medium">No Active License</h3> <p class="mt-3 text-sm text-muted-foreground">Get a Pro or Business license to access premium features.</p> <a href="/#pricing" class="mt-5 inline-flex h-9 items-center rounded-lg bg-primary px-6 text-xs font-medium text-background transition-colors hover:bg-primary/90">
View Plans
</a> </div> </div>`) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/license.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/license.astro";
const $$url = "/dashboard/license";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$License,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
