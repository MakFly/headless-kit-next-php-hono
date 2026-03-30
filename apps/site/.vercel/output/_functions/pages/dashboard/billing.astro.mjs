import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../chunks/dashboard_CZ5mJo0o.mjs';
import { g as getLicenseByUser } from '../../chunks/license_CP9fThp_.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Billing = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Billing;
  const user = Astro2.locals.user;
  const license = await getLicenseByUser(user.id);
  const planName = license?.tier === "pro" ? "Pro" : license?.tier === "business" ? "Business" : "Starter";
  const planPrice = license?.tier === "pro" ? "$79" : license?.tier === "business" ? "$199" : "$0";
  const planInterval = license?.tier === "pro" ? "/year" : license?.tier === "business" ? " one-time" : "";
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Billing", "currentPath": "/dashboard/billing" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Billing</h2> <p class="text-muted-foreground">Manage your subscription and payments.</p> </div> <!-- Stat cards --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> <!-- Current Plan --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Current Plan</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M6 3h12l4 6-10 13L2 9Z"></path></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${planName}</div> <p class="text-xs text-muted-foreground">Your active subscription</p> </div> </div> <!-- Price --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Price</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${planPrice}<span class="text-sm font-normal text-muted-foreground">${planInterval}</span></div> <p class="text-xs text-muted-foreground">Billing amount</p> </div> </div> <!-- Status --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="flex flex-row items-center justify-between space-y-0 px-6 pb-0"> <span class="text-sm font-medium">Status</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-4 text-muted-foreground"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> </div> <div class="px-6 pt-0"> <div class="text-2xl font-bold">${license?.active ? "Active" : "Free Tier"}</div> <p class="text-xs text-muted-foreground">Account billing status</p> </div> </div> </div> <!-- Stripe Portal / Upgrade --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6 pb-0"> <h3 class="text-base font-medium">Manage Subscription</h3> </div> <div class="px-6"> ${license?.stripeCustomerId ? renderTemplate`<a href="/api/billing/portal" class="inline-flex h-9 items-center rounded-lg border px-4 text-xs font-medium text-foreground transition-colors hover:bg-muted">
Open Stripe Customer Portal
</a>` : license ? renderTemplate`<p class="text-sm text-muted-foreground">
Your license was activated manually. Contact support for billing inquiries.
</p>` : renderTemplate`<div class="flex flex-col gap-3"> <p class="text-sm text-muted-foreground">Upgrade to access premium templates, Docker configs, and CI/CD pipelines.</p> <a href="/#pricing" class="inline-flex h-9 w-fit items-center rounded-lg bg-primary px-4 text-xs font-medium text-background transition-colors hover:bg-primary/90">
Upgrade Now
</a> </div>`} </div> </div> <!-- Purchase History --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6 pb-0"> <h3 class="text-base font-medium">Purchase History</h3> <p class="text-sm text-muted-foreground">Your past transactions.</p> </div> <div class="px-6"> ${license ? renderTemplate`<div class="rounded-md border"> <table class="w-full caption-bottom text-sm"> <thead class="[&_tr]:border-b"> <tr class="border-b"> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Date</th> <th class="h-10 px-4 text-left align-middle font-medium text-muted-foreground">Item</th> <th class="h-10 px-4 text-right align-middle font-medium text-muted-foreground">Amount</th> </tr> </thead> <tbody class="[&_tr:last-child]:border-0"> <tr class="border-b hover:bg-muted/50 transition-colors"> <td class="p-4 align-middle"> ${new Date(license.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} </td> <td class="p-4 align-middle">
Headless Kit ${license.tier === "pro" ? "Pro" : "Business"} License
</td> <td class="p-4 align-middle text-right font-mono text-primary">
$${license.tier === "pro" ? "79.00" : "199.00"} </td> </tr> </tbody> </table> </div>` : renderTemplate`<p class="text-sm text-muted-foreground">No purchases yet.</p>`} </div> </div> </div> ` })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/billing.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/billing.astro";
const $$url = "/dashboard/billing";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Billing,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
