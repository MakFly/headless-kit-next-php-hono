import { b as createAstro, c as createComponent, r as renderComponent, a as renderTemplate, e as addAttribute, m as maybeRenderHead } from '../../../chunks/astro/server_C6wb1U6_.mjs';
import { $ as $$Dashboard } from '../../../chunks/dashboard_BH4PFK7W.mjs';
export { renderers } from '../../../renderers.mjs';

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://headlesskit.dev");
const prerender = false;
const $$Settings = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Settings;
  if (Astro2.locals.user?.role !== "admin") return Astro2.redirect("/dashboard");
  const PLANS = {
    pro: { price: 7900 },
    business: { price: 19900 }
  };
  const siteUrl = "http://localhost:4321";
  return renderTemplate`${renderComponent($$result, "DashboardLayout", $$Dashboard, { "title": "Settings", "currentPath": "/dashboard/admin/settings" }, { "default": async ($$result2) => renderTemplate(_a || (_a = __template([" ", '<div class="flex flex-col gap-6"> <div> <h2 class="text-3xl font-bold tracking-tight">Settings</h2> <p class="text-muted-foreground">Manage plans, authentication, and environment.</p> </div> <div class="space-y-6"> <!-- Pricing Plans --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Pricing Plans</h3> <p class="text-sm text-muted-foreground">Current plan configuration.</p> </div> <div class="flex flex-col gap-4 px-6"> <div class="flex items-center justify-between"> <div class="flex items-center gap-3"> <span class="inline-flex items-center rounded-full border border-apple-teal/30 px-2 py-0.5 text-xs font-medium text-apple-teal">\nPRO\n</span> <span class="text-sm text-foreground">$', ' one-time</span> </div> <span class="text-xs text-muted-foreground">1 year updates</span> </div> <div class="flex items-center justify-between"> <div class="flex items-center gap-3"> <span class="inline-flex items-center rounded-full border border-apple-purple/30 px-2 py-0.5 text-xs font-medium text-apple-purple">\nBUSINESS\n</span> <span class="text-sm text-foreground">$', ' one-time</span> </div> <span class="text-xs text-muted-foreground">Lifetime updates</span> </div> <p class="text-xs text-muted-foreground">\nEdit pricing in <code class="rounded bg-muted px-1 py-0.5 font-mono">src/lib/stripe.ts</code> </p> </div> </div> <!-- Authentication --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Authentication</h3> <p class="text-sm text-muted-foreground">Auth providers and security settings.</p> </div> <div class="flex flex-col gap-4 px-6"> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Email + Password</span> <span class="inline-flex items-center rounded-full border border-emerald-200 px-2 py-0.5 text-xs font-medium text-emerald-600">\nEnabled\n</span> </div> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Google OAuth</span> ', ' </div> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Min password length</span> <span class="text-xs text-muted-foreground">8 characters</span> </div> </div> </div> <!-- Environment --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6"> <div class="px-6"> <h3 class="text-lg font-semibold">Environment</h3> <p class="text-sm text-muted-foreground">Runtime and infrastructure details.</p> </div> <div class="flex flex-col gap-4 px-6"> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Site URL</span> <span class="text-xs text-muted-foreground">', '</span> </div> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Mode</span> <span', "> ", ` </span> </div> <div class="flex items-center justify-between"> <span class="text-sm text-foreground">Database</span> <span class="text-xs text-muted-foreground">PostgreSQL</span> </div> </div> </div> <!-- Danger Zone --> <div class="overflow-hidden rounded-xl bg-card text-card-foreground shadow-xs ring-1 ring-foreground/10 flex flex-col gap-6 py-6 border-destructive/50"> <div class="px-6"> <h3 class="text-lg font-semibold text-destructive">Danger Zone</h3> <p class="text-sm text-muted-foreground">Irreversible actions. Proceed with caution.</p> </div> <div class="flex flex-col gap-4 px-6"> <div class="flex items-center justify-between"> <div> <div class="text-sm text-foreground">Kill All Sessions</div> <p class="mt-1 text-xs text-muted-foreground">This will log out all users including yourself.</p> </div> <button type="button" id="kill-sessions-btn" class="inline-flex h-8 items-center rounded-md border border-destructive/30 px-4 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10">
Kill All Sessions
</button> </div> </div> </div> </div> </div> <script>
    document.getElementById('kill-sessions-btn').addEventListener('click', async () => {
      if (!confirm('Are you sure? This will log out ALL users, including yourself.')) return

      const btn = document.getElementById('kill-sessions-btn')
      btn.textContent = 'Killing...'
      btn.disabled = true

      try {
        const res = await fetch('/api/admin/sessions/kill-all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })

        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          alert(data.error || 'Failed to kill sessions.')
          btn.textContent = 'Kill All Sessions'
          btn.disabled = false
          return
        }

        location.reload()
      } catch (err) {
        alert('Network error.')
        btn.textContent = 'Kill All Sessions'
        btn.disabled = false
      }
    })
  </script> `])), maybeRenderHead(), PLANS.pro.price / 100, PLANS.business.price / 100, renderTemplate`<span class="inline-flex items-center rounded-full border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-600">
Not configured
</span>`, siteUrl, addAttribute([
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    "border-emerald-200 text-emerald-600" 
  ], "class:list"), "Production" ) })}`;
}, "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/settings.astro", void 0);
const $$file = "/Users/kev/Documents/lab/sandbox/headless-kit-next-php-hono/apps/site/src/pages/dashboard/admin/settings.astro";
const $$url = "/dashboard/admin/settings";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Settings,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
