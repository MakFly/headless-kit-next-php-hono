import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, e as addAttribute, m as maybeRenderHead } from '../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../chunks/dashboard_CZ5mJo0o.mjs';
import { g as getLicenseByUser } from '../../chunks/license_CP9fThp_.mjs';
export { renderers } from '../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Downloads = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Downloads;
  const user = Astro2.locals.user;
  const license = await getLicenseByUser(user.id);
  const tier = license?.tier || null;
  const hasPro = tier === "pro" || tier === "business";
  const hasBusiness = tier === "business";
  const templates = [
    { name: "SaaS Starter", desc: "Multi-tenant SaaS boilerplate with billing", version: "v2.1.0" },
    { name: "E-Commerce Kit", desc: "Full shop module with Stripe integration", version: "v1.4.0" },
    { name: "Admin Dashboard", desc: "Pre-built admin panel with RBAC", version: "v1.2.0" }
  ];
  const dockerConfigs = [
    { name: "Production Docker Compose", desc: "Nginx, PHP-FPM, PostgreSQL, Redis", version: "v1.0.0" },
    { name: "Kubernetes Manifests", desc: "Helm charts for all backends", version: "v1.0.0" }
  ];
  const cicdTemplates = [
    { name: "GitHub Actions Workflows", desc: "CI/CD for all 3 backends + Next.js", version: "v1.1.0" },
    { name: "GitLab CI Pipelines", desc: "Full pipeline with staging & production", version: "v1.0.0" }
  ];
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Downloads", "currentPath": "/dashboard/downloads" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Downloads</h2> <p class="text-muted-foreground">CLI tools and premium resources.</p> </div> <!-- CLI Install card --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6 pb-0"> <div class="flex items-center gap-2"> <h3 class="text-base font-medium">CLI — Create Headless App</h3> <span class="inline-flex items-center rounded-full border border-emerald-200 px-2.5 py-0.5 text-xs font-medium text-emerald-600">Free</span> </div> <p class="mt-1 text-sm text-muted-foreground">Scaffold a new Headless Kit project in seconds.</p> </div> <div class="px-6"> <div class="rounded-lg border bg-muted p-4"> <div class="flex items-center justify-between gap-4"> <code class="font-mono text-sm text-primary"> <span class="text-muted-foreground">$</span> bunx create-headless-app\n</code> <button id="copy-cli" class="shrink-0 rounded-lg border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary">\nCopy\n</button> </div> </div> </div> </div> <!-- Download cards grid --> <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"> <!-- Premium Templates --> <div', '> <div class="flex flex-col gap-1 px-6 py-6"> <div class="flex items-center justify-between"> <span class="text-sm font-medium text-apple-teal">Premium Templates</span> <span class="inline-flex items-center rounded-full border border-apple-teal/30 px-2.5 py-0.5 text-xs font-medium text-apple-teal">Pro+</span> </div> <p class="text-xs text-muted-foreground">SaaS, e-commerce, and admin templates</p> </div> <div class="flex-1 border-t border-foreground/10 px-6 py-4"> ', " </div> </div> <!-- Docker Configs --> <div", '> <div class="flex flex-col gap-1 px-6 py-6"> <div class="flex items-center justify-between"> <span class="text-sm font-medium text-apple-purple">Docker Configs</span> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2.5 py-0.5 text-xs font-medium text-apple-purple">Business</span> </div> <p class="text-xs text-muted-foreground">Production-ready container orchestration</p> </div> <div class="flex-1 border-t border-foreground/10 px-6 py-4"> ', " </div> </div> <!-- CI/CD Pipelines --> <div", '> <div class="flex flex-col gap-1 px-6 py-6"> <div class="flex items-center justify-between"> <span class="text-sm font-medium text-apple-purple">CI/CD Pipelines</span> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2.5 py-0.5 text-xs font-medium text-apple-purple">Business</span> </div> <p class="text-xs text-muted-foreground">GitHub Actions & GitLab CI templates</p> </div> <div class="flex-1 border-t border-foreground/10 px-6 py-4"> ', " </div> </div> </div> </div> <script>\n    document.getElementById('copy-cli')?.addEventListener('click', function() {\n      navigator.clipboard.writeText('bunx create-headless-app').then(() => {\n        const original = this.textContent;\n        this.textContent = 'Copied!';\n        setTimeout(() => { this.textContent = original; }, 2000);\n      });\n    });\n  <\/script> "])), maybeRenderHead(), addAttribute([
    "overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col",
    !hasPro && "opacity-50"
  ], "class:list"), hasPro ? renderTemplate`<div class="space-y-2"> ${templates.map((t) => renderTemplate`<div class="flex items-center justify-between rounded-lg border p-3"> <div> <div class="text-sm text-foreground">${t.name}</div> <div class="text-xs text-muted-foreground">${t.desc}</div> </div> <span class="inline-flex items-center rounded-full border border-apple-teal/30 px-2.5 py-0.5 text-xs font-medium text-apple-teal">${t.version}</span> </div>`)} </div>` : renderTemplate`<div class="flex flex-col items-center gap-3 py-4 text-center"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-8 text-muted-foreground/50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <p class="text-xs text-muted-foreground">Requires Pro license</p> <a href="/#pricing" class="inline-flex h-7 items-center rounded-lg bg-apple-teal px-3 text-xs font-medium text-background hover:bg-apple-teal/80">
Upgrade
</a> </div>`, addAttribute([
    "overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col",
    !hasBusiness && "opacity-50"
  ], "class:list"), hasBusiness ? renderTemplate`<div class="space-y-2"> ${dockerConfigs.map((d) => renderTemplate`<div class="flex items-center justify-between rounded-lg border p-3"> <div> <div class="text-sm text-foreground">${d.name}</div> <div class="text-xs text-muted-foreground">${d.desc}</div> </div> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2.5 py-0.5 text-xs font-medium text-apple-purple">${d.version}</span> </div>`)} </div>` : renderTemplate`<div class="flex flex-col items-center gap-3 py-4 text-center"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-8 text-muted-foreground/50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <p class="text-xs text-muted-foreground">Requires Business license</p> <a href="/#pricing" class="inline-flex h-7 items-center rounded-lg bg-apple-purple px-3 text-xs font-medium text-background hover:bg-apple-purple/80">
Upgrade
</a> </div>`, addAttribute([
    "overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col",
    !hasBusiness && "opacity-50"
  ], "class:list"), hasBusiness ? renderTemplate`<div class="space-y-2"> ${cicdTemplates.map((c) => renderTemplate`<div class="flex items-center justify-between rounded-lg border p-3"> <div> <div class="text-sm text-foreground">${c.name}</div> <div class="text-xs text-muted-foreground">${c.desc}</div> </div> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2.5 py-0.5 text-xs font-medium text-apple-purple">${c.version}</span> </div>`)} </div>` : renderTemplate`<div class="flex flex-col items-center gap-3 py-4 text-center"> <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="size-8 text-muted-foreground/50"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> <p class="text-xs text-muted-foreground">Requires Business license</p> <a href="/#pricing" class="inline-flex h-7 items-center rounded-lg bg-apple-purple px-3 text-xs font-medium text-background hover:bg-apple-purple/80">
Upgrade
</a> </div>`) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/downloads.astro", void 0);

const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/downloads.astro";
const $$url = "/dashboard/downloads";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Downloads,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
